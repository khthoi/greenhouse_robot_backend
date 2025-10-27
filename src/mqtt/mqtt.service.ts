import { Injectable, Logger } from '@nestjs/common';
import { MqttClient, connect } from 'mqtt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommandsService } from '../commands/commands.service';
import { EnvironmentDataService } from '../environment-data/environment-data.service';
import { ObstacleLogsService } from '../obstacle-logs/obstacle-logs.service';
import { RobotStatusService } from '../robot-status/robot-status.service';
import { RfidTagsService } from '../rfid-tags/rfid-tags.service';
import { AlertConfigService } from '../alert-config/alert-config.service';
import { AlertLogService } from 'src/alert-logs/alert-logs.service';
import { WorkPlanService } from '../work-plan/work-plan.service';
import { CommandType } from '../commands/enums/commandtype';
import { AlertType } from 'src/alert-logs/enums/AlertType';
import { WorkPlanStatus } from 'src/work-plan/enums/work-plan-status';
import { WorkPlan } from 'src/work-plan/entities/work-plans.entity';

@Injectable()
export class MqttService {
  private readonly logger = new Logger(MqttService.name);
  private client: MqttClient;
  private obstacleTimeouts: Map<number, NodeJS.Timeout> = new Map();
  private violationCounts: Map<number, { temp: number; hum: number }> = new Map();
  private measurementCounts: Map<number, number> = new Map();

  constructor(
    private readonly commandsService: CommandsService,
    private readonly envDataService: EnvironmentDataService,
    private readonly obstacleLogsService: ObstacleLogsService,
    private readonly robotStatusService: RobotStatusService,
    private readonly rfidTagsService: RfidTagsService,
    private readonly alertConfigService: AlertConfigService,
    private readonly alertLogService: AlertLogService,
    private readonly workPlanService: WorkPlanService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.connect();
  }

  private connect() {
    this.client = connect('mqtt://localhost:1883', {
      clientId: 'nestjs_server',
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASSWORD,
      reconnectPeriod: 5000,
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to MQTT broker');
      this.subscribeToTopics();
    });

    this.client.on('error', (error) => {
      this.logger.error(`MQTT error: ${error.message}`);
    });

    this.client.on('close', () => {
      this.logger.warn('MQTT disconnected, attempting to reconnect...');
    });

    this.client.on('message', (topic, message) => {
      this.handleMessage(topic, message);
    });
  }

  private subscribeToTopics() {
    const topics = [
      'greenhouse/robot/env_data',
      'greenhouse/robot/obstacle',
      'greenhouse/robot/status',
      'greenhouse/robot/work_plan_status',
      'greenhouse/robot/work_plan_progress',
    ];
    this.client.subscribe(topics, (err) => {
      if (err) {
        this.logger.error(`Failed to subscribe: ${err.message}`);
      } else {
        this.logger.log(`Subscribed to topics: ${topics.join(', ')}`);
      }
    });
  }

  private async handleMessage(topic: string, message: Buffer) {
    try {
      const payload = JSON.parse(message.toString());
      this.logger.log(`Received message on ${topic}: ${JSON.stringify(payload)}`);

      switch (topic) {
        case 'greenhouse/robot/env_data':
          await this.handleEnvData(payload);
          break;
        case 'greenhouse/robot/obstacle':
          await this.handleObstacle(payload);
          break;
        case 'greenhouse/robot/status':
          await this.handleStatus(payload);
          break;
        case 'greenhouse/robot/work_plan_status':
          await this.handleWorkPlanStatus(payload);
          break;
        case 'greenhouse/robot/work_plan_progress':
          await this.handleWorkPlanProgress(payload);
          break;
      }
    } catch (error) {
      this.logger.error(`Error processing message on ${topic}: ${error.message}`);
    }
  }

  private async handleEnvData(payload: any) {
    const { uid, temp, hum, timestamp } = payload;
    if (!uid || temp === undefined || hum === undefined || !timestamp) {
      this.logger.warn('Invalid env_data payload');
      return;
    }

    const rfidTag = await this.rfidTagsService.findByUid(uid);
    if (!rfidTag) {
      this.logger.warn(`RFID tag ${uid} not found`);
      return;
    }

    // Lưu dữ liệu môi trường
    const envData = await this.envDataService.create({
      uid: uid,
      temp: temp,
      hum: hum,
      timestamp: new Date(timestamp).toISOString(),
    });

    this.eventEmitter.emit('env_data.received', { id: envData.id, uid, temp, hum, timestamp });
    // Kiểm tra cảnh báo
    await this.checkAndTriggerAlert(rfidTag.id, temp, hum, timestamp);
  }

  private async checkAndTriggerAlert(rfid_tag_id: number, temp: number, hum: number, timestamp: string) {
    const config = await this.alertConfigService.findByRfidTagId(rfid_tag_id);
    if (!config || !config.is_active) return;

    const rfidTag = await this.rfidTagsService.findOne(rfid_tag_id);
    if (!rfidTag.reference_temperature || !rfidTag.reference_humidity) return;

    const violations = this.violationCounts.get(rfid_tag_id) || { temp: 0, hum: 0 };

    const tempDiff = Math.abs(temp - rfidTag.reference_temperature);
    if (tempDiff > config.temp_threshold) {
      violations.temp += 1;
    } else {
      violations.temp = 0;
    }

    const humDiff = Math.abs(hum - rfidTag.reference_humidity);
    if (humDiff > config.hum_threshold) {
      violations.hum += 1;
    } else {
      violations.hum = 0;
    }

    this.violationCounts.set(rfid_tag_id, violations);

    if (violations.temp >= config.violation_count) {
      const alertType = temp > rfidTag.reference_temperature ? AlertType.TEMP_HIGH : AlertType.TEMP_LOW;
      const message = `Temperature at ${rfidTag.location_name} ${alertType} (${temp}°C, reference: ${rfidTag.reference_temperature}°C)`;
      await this.alertLogService.create({
        rfid_tag_id,
        alert_type: alertType,
        measured_value: temp,
        reference_value: rfidTag.reference_temperature,
        threshold: config.temp_threshold,
        message,
        timestamp,
      });
      this.eventEmitter.emit('alert.triggered', {
        rfid_tag_id,
        alert_type: alertType,
        measured_value: temp,
        reference_value: rfidTag.reference_temperature,
        message,
        timestamp,
      });
      violations.temp = 0;
    }

    if (violations.hum >= config.violation_count) {
      const alertType = hum > rfidTag.reference_humidity ? AlertType.HUM_HIGH : AlertType.HUM_LOW;
      const message = `Humidity at ${rfidTag.location_name} ${alertType} (${hum}%, reference: ${rfidTag.reference_humidity}%)`;
      await this.alertLogService.create({
        rfid_tag_id,
        alert_type: alertType,
        measured_value: hum,
        reference_value: rfidTag.reference_humidity,
        threshold: config.hum_threshold,
        message,
        timestamp,
      });
      this.eventEmitter.emit('alert.triggered', {
        rfid_tag_id,
        alert_type: alertType,
        measured_value: hum,
        reference_value: rfidTag.reference_humidity,
        message,
        timestamp,
      });
      violations.hum = 0;
    }

    this.violationCounts.set(rfid_tag_id, violations);
  }

  private async handleObstacle(payload: any) {
    const { center_dist, left_dist, right_dist, suggestion, timestamp } = payload;
    if (
      center_dist === undefined ||
      left_dist === undefined ||
      right_dist === undefined ||
      !suggestion ||
      !timestamp
    ) {
      this.logger.warn('Invalid obstacle payload');
      return;
    }

    const obstacleLog = await this.obstacleLogsService.create({
      center_dist: center_dist,
      left_dist: left_dist,
      right_dist: right_dist,
      suggestion,
      action_taken: suggestion,
      timestamp: new Date(timestamp).toISOString(),
    });

    this.eventEmitter.emit('obstacle.received', { id: obstacleLog.id, ...payload });

    const timeout = setTimeout(async () => {
      const updatedLog = await this.obstacleLogsService.findOne(obstacleLog.id);
      if (updatedLog.action_taken === updatedLog.suggestion) {
        await this.publishCommand({ command: suggestion, timestamp: new Date().toISOString() });
        this.logger.log(`No action_taken chosen, sent ${suggestion} to robot`);
      }
      this.obstacleTimeouts.delete(obstacleLog.id);
    }, 10000);

    this.obstacleTimeouts.set(obstacleLog.id, timeout);
  }

  private async handleStatus(payload: any) {
    const { status, mode, command_excuted, message, timestamp } = payload;
    if (!mode || !timestamp) {
      this.logger.warn('Invalid status payload');
      return;
    }

    const statusData = await this.robotStatusService.create({
      status: status,
      mode,
      command_excuted,
      message,
      timestamp: new Date(timestamp).toISOString(),
    });

    this.eventEmitter.emit('status.received', { id: statusData.id, ...payload });
  }

  private async handleWorkPlanStatus(payload: any) {
    const { plan_id, status, timestamp } = payload;
    if (!plan_id || !status || !timestamp) {
      this.logger.warn('Invalid work_plan_status payload');
      return;
    }

    const plan = await this.workPlanService.findOne(plan_id);
    if (!plan) {
      this.logger.warn(`WorkPlan with ID ${plan_id} not found`);
      return;
    }

    await this.workPlanService.update(plan_id, { status });
    this.eventEmitter.emit('work_plan_status.updated', { plan_id, status, timestamp });
  }

  private async handleWorkPlanProgress(payload: any) {
    const { plan_id, items, timestamp } = payload;
    if (!plan_id || !Array.isArray(items) || !timestamp) {
      this.logger.warn('Invalid work_plan_progress payload');
      return;
    }

    const plan = await this.workPlanService.findOne(plan_id);
    if (!plan) {
      this.logger.warn(`WorkPlan with ID ${plan_id} not found`);
      return;
    }

    for (const item of items) {
      const { rfid_tag_id, current_measurements } = item;
      const planItem = plan.items.find((i) => i.rfid_tag_id === rfid_tag_id);
      if (planItem) {
        await this.workPlanService.updateItemProgress(planItem.id, current_measurements);
      }
    }

    const progress = await this.workPlanService.calculateProgress(plan_id);
    this.eventEmitter.emit('work_plan_progress.updated', { plan_id, progress, items: plan.items, timestamp });

    if (progress === 100) {
      await this.workPlanService.update(plan_id, { status: WorkPlanStatus.COMPLETED });
      this.eventEmitter.emit('work_plan_status.updated', { plan_id, status: WorkPlanStatus.COMPLETED, timestamp });
    }
  }

  async publishCommand(command: { command: CommandType; timestamp: string }) {
    const payload = JSON.stringify(command);
    this.client.publish('greenhouse/robot/command', payload, (err) => {
      if (err) {
        this.logger.error(`Failed to publish command: ${err.message}`);
      } else {
        this.logger.log(`Published command: ${payload}`);
      }
    });

    await this.commandsService.create({
      command: command.command,
      timestamp: new Date(command.timestamp).toISOString(),
    });
  }

  async publishWorkPlan(plan: WorkPlan) {
    const payload = JSON.stringify({
      plan_id: plan.id,
      items: plan.items.map((item) => ({
        rfid_tag_id: item.rfid_tag_id,
        measurement_frequency: item.measurement_frequency,
      })),
      timestamp: new Date().toISOString(),
    });
    this.client.publish('greenhouse/robot/work_plan', payload, (err) => {
      if (err) {
        this.logger.error(`Failed to publish work plan: ${err.message}`);
      } else {
        this.logger.log(`Published work plan: ${payload}`);
      }
    });
  }

  async setObstacleActionTaken(obstacleId: number, action_taken: CommandType) {
    const obstacleLog = await this.obstacleLogsService.findOne(obstacleId);
    if (!obstacleLog) {
      this.logger.warn(`Obstacle log ${obstacleId} not found`);
      return;
    }

    await this.obstacleLogsService.update(obstacleId, { action_taken });

    const timeout = this.obstacleTimeouts.get(obstacleId);
    if (timeout) {
      clearTimeout(timeout);
      this.obstacleTimeouts.delete(obstacleId);
    }

    await this.publishCommand({
      command: action_taken,
      timestamp: new Date().toISOString(),
    });
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}