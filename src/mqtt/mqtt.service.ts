import { Injectable, Logger } from '@nestjs/common';
import { MqttClient, connect } from 'mqtt';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CommandsService } from '../commands/commands.service';
import { ObstacleLogsService } from '../obstacle-logs/obstacle-logs.service';
import { RobotStatusService } from '../robot-status/robot-status.service';
import { RfidTagsService } from '../rfid-tags/rfid-tags.service';
import { AlertLogService } from 'src/alert-logs/alert-logs.service';
import { WorkPlanService } from '../work-plan/work-plan.service';
import { CommandType } from '../commands/enums/commandtype';
import { AlertType } from 'src/alert-logs/enums/AlertType';
import { WorkPlanStatus } from 'src/work-plan/enums/work-plan-status';
import { WorkPlan } from 'src/work-plan/entities/work-plans.entity';
import { RfidTag } from 'src/rfid-tags/entities/rfid-tags.entity';

@Injectable()
export class MqttService {
  private readonly logger = new Logger(MqttService.name);
  private client: MqttClient;
  private obstacleTimeouts: Map<number, NodeJS.Timeout> = new Map();
  private violationCounts: Map<string, { temp: number; hum: number }> = new Map();

  constructor(
    private readonly commandsService: CommandsService,
    private readonly obstacleLogsService: ObstacleLogsService,
    private readonly robotStatusService: RobotStatusService,
    private readonly rfidTagsService: RfidTagsService,
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
      'greenhouse/robot/obstacle',
      'greenhouse/robot/status',
      'greenhouse/robot/work_plan_status',
      'greenhouse/robot/work_plan_progress',
      'greenhouse/robot/manual_command_responses',
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
        case 'greenhouse/robot/manual_command_responses':
          await this.handleManualCommandResponses(payload);
          break;
      }
    } catch (error) {
      this.logger.error(`Error processing message on ${topic}: ${error.message}`);
    }
  }

  private async checkAndTriggerAlert(
    plan_id: number,
    rfid_tag_id: number,
    temp: number,
    hum: number,
    cfg: { temp_threshold: number; hum_threshold: number; violation_count: number },
    rfidTag: RfidTag,
    measurement_number: number,
  ) {
    if (!rfidTag.reference_temperature || !rfidTag.reference_humidity) return;

    const key = `${plan_id}:${rfid_tag_id}`;
    const violations = this.violationCounts.get(key) ?? { temp: 0, hum: 0 };

    const tempDiff = Math.abs(temp - rfidTag.reference_temperature);
    const humDiff = Math.abs(hum - rfidTag.reference_humidity);

    if (tempDiff > cfg.temp_threshold) violations.temp++;
    else violations.temp = 0;

    if (humDiff > cfg.hum_threshold) violations.hum++;
    else violations.hum = 0;

    this.violationCounts.set(key, violations);

    // GHI LOG CẢNH BÁO
    if (violations.temp >= cfg.violation_count) {
      const type = temp > rfidTag.reference_temperature ? AlertType.TEMP_HIGH : AlertType.TEMP_LOW;
      await this.saveAlert(plan_id, rfid_tag_id, type, temp, rfidTag.reference_temperature, cfg.temp_threshold, rfidTag, measurement_number);
      violations.temp = 0;
    }
    if (violations.hum >= cfg.violation_count) {
      const type = hum > rfidTag.reference_humidity ? AlertType.HUM_HIGH : AlertType.HUM_LOW;
      await this.saveAlert(plan_id, rfid_tag_id, type, hum, rfidTag.reference_humidity, cfg.hum_threshold, rfidTag, measurement_number);
      violations.hum = 0;
    }
  }

  private async saveAlert(
    plan_id: number,
    rfid_tag_id: number,
    type: AlertType,
    measured: number,
    reference: number,
    threshold: number,
    tag: RfidTag,
    measurement_number: number,
  ) {
    const msg = `${type} tại ${tag.location_name} (lần ${measurement_number})`;

    // ✅ Lấy thông tin WorkPlan để thêm description
    const workPlan = await this.workPlanService.findOne(plan_id);

    await this.alertLogService.create({
      work_plan_id: plan_id,
      rfid_tag_id,
      alert_type: type,
      measured_value: measured,
      reference_value: reference,
      threshold,
      message: msg,
      measurement_number,
    });

    this.eventEmitter.emit('alert.triggered', {
      plan_id,
      plan_description: workPlan?.description ?? null, // ✅ thêm mô tả vào event
      rfid_tag_id,
      alert_type: type,
      measured_value: measured,
      reference_value: reference,
      threshold,
      measurement_number,
      message: msg,
      location_name: tag.location_name, // ✅ thêm vị trí đọc
    });
  }


  private async handleObstacle(payload: any) {
    const { center_dist, left_dist, right_dist, suggestion } = payload;

    if (
      center_dist === undefined ||
      left_dist === undefined ||
      right_dist === undefined ||
      !suggestion
    ) {
      this.logger.warn('Invalid obstacle payload');
      return;
    }

    // ✅ Tạo log ban đầu, KHÔNG gán action_taken
    const obstacleLog = await this.obstacleLogsService.create({
      center_dist,
      left_dist,
      right_dist,
      suggestion,
      action_taken: CommandType.AWAIT, // hoặc bỏ hẳn trường này
    });

    // ✅ Lấy bản ghi đầy đủ (có created_at, id,...)
    const fullLog = await this.obstacleLogsService.findOne(obstacleLog.id);

    // ✅ Emit sự kiện với action_taken = null
    this.eventEmitter.emit('obstacle.received', fullLog);

    let actionTaken: CommandType | null = null;

    // ⏳ Timeout 1 phút – nếu không có command nội bộ thì gửi suggestion
    const timeout = setTimeout(async () => {
      if (!actionTaken) {
        await this.publishCommand({
          command: suggestion,
          timestamp: new Date().toISOString(),
        });

        this.logger.log(`No internal action, sent suggestion: ${suggestion}`);
      }

      this.eventEmitter.removeListener('command_sended', commandListener);
      this.obstacleTimeouts.delete(obstacleLog.id);
    }, 4000);

    this.obstacleTimeouts.set(obstacleLog.id, timeout);

    const commandListener = async (cmd: { command: string }) => {
      if (!Object.values(CommandType).includes(cmd.command as CommandType)) {
        return;
      }

      actionTaken = cmd.command as CommandType;

      // ✅ Cập nhật action_taken khi có command nội bộ
      obstacleLog.action_taken = actionTaken;
      await this.obstacleLogsService.save(obstacleLog);

      this.logger.log(`Action chosen internally: ${actionTaken}`);

      // ✅ Dừng timeout
      clearTimeout(timeout);

      // ✅ Remove listener
      this.eventEmitter.removeListener('command_sended', commandListener);
      this.obstacleTimeouts.delete(obstacleLog.id);

      // ✅ Kiểm tra lại bản ghi sau cập nhật
      const updated = await this.obstacleLogsService.findOne(obstacleLog.id);
      this.logger.debug(`DB saved action_taken: ${updated.action_taken}`);
    };

    // ✅ Lắng nghe đúng 1 lần duy nhất
    this.eventEmitter.once('command_sended', commandListener);
  }


  private async handleStatus(payload: any) {
    const { status, mode, message } = payload;
    if (!mode) {
      this.logger.warn('Invalid status payload');
      return;
    }

    const statusData = await this.robotStatusService.create({
      status: status,
      mode,
      message,
    });

    this.eventEmitter.emit('status.received', { id: statusData.id, ...payload });
  }

  private async handleWorkPlanStatus(payload: any) {
    const { plan_id, status } = payload;
    if (!plan_id || !status) {
      this.logger.warn('Invalid work_plan_status payload');
      return;
    }

    // Lấy kế hoạch trước khi update
    const plan = await this.workPlanService.findOne(plan_id);
    if (!plan) {
      this.logger.warn(`WorkPlan with ID ${plan_id} not found`);
      return;
    }

    // Cập nhật status kế hoạch
    await this.workPlanService.update(plan_id, { status });

    // Lấy data chi tiết sau khi cập nhật
    const workPlanDetail = await this.workPlanService.getDetail(plan_id);

    // Emit event kèm data chi tiết
    this.eventEmitter.emit('work_plan_status.updated', {
      plan_id,
      status,
      data: workPlanDetail
    });
  }

  private async handleWorkPlanProgress(payload: any) {
    const { plan_id, items } = payload;
    if (!plan_id || !Array.isArray(items)) return;

    const plan = await this.workPlanService.findOne(plan_id);
    if (!plan || plan.status !== WorkPlanStatus.IN_PROGRESS) return;

    const { temp_threshold, hum_threshold, violation_count } = plan;

    let progress = 0; // lưu tiến độ cuối cùng

    for (const item of items) {
      const { uid, current_measurements, temperature, humidity } = item;
      if (!uid || current_measurements === undefined) continue;

      const rfidTag = await this.rfidTagsService.findByUid(uid);
      if (!rfidTag) continue;

      const planItem = plan.items.find(i => i.rfid_tag_id === rfidTag.id);
      if (!planItem) continue;

      if (current_measurements > planItem.measurement_frequency) {
        this.logger.warn(
          `Measurement ${current_measurements} exceeds frequency ${planItem.measurement_frequency}`
        );
        continue;
      }

      const exists = await this.workPlanService.findMeasurement(
        plan_id,
        rfidTag.id,
        current_measurements
      );

      if (exists) {
        this.logger.warn(
          `Measurement ${current_measurements} already exists for tag ${uid}`
        );
        continue;
      }

      // ✅ Tạo measurement
      await this.workPlanService.createMeasurement({
        work_plan_id: plan_id,
        rfid_tag_id: rfidTag.id,
        measurement_number: current_measurements,
        temperature: temperature ?? null,
        humidity: humidity ?? null,
      });

      // ✅ Kiểm tra alert
      if (temperature !== undefined && humidity !== undefined) {
        await this.checkAndTriggerAlert(
          plan_id,
          rfidTag.id,
          temperature,
          humidity,
          { temp_threshold, hum_threshold, violation_count },
          rfidTag,
          current_measurements
        );
      }
    }

    // ✅ Tính tiến độ sau khi đã xử lý hết items
    progress = await this.workPlanService.calculateProgress(plan_id);

    if (progress >= 100) {
      await this.workPlanService.update(plan_id, { status: WorkPlanStatus.COMPLETED });

      const workPlanDetail = await this.workPlanService.getDetail(plan_id);

      this.eventEmitter.emit('work_plan_progress.updated', { data: workPlanDetail });
      this.eventEmitter.emit('work_plan_status.updated', { data: workPlanDetail });
    } else {
      const workPlanDetail = await this.workPlanService.getDetail(plan_id);
      this.eventEmitter.emit('work_plan_progress.updated', { data: workPlanDetail });
    }
  }


  // Thêm phương thức xử lý responses từ topic manual_command_responses
  private async handleManualCommandResponses(payload: any) {
    const { type, responses } = payload;

    // Kiểm tra tính hợp lệ của payload
    if (!type || !responses) {
      this.logger.warn('Invalid manual_command_responses payload');
      return;
    }
    // Phát sự kiện nội bộ với dữ liệu payload
    this.eventEmitter.emit('manual_command_response.received', {
      type,
      responses,
    });
  }

  async publishCommand(command: { command: CommandType; timestamp: string }) {
    const payload = JSON.stringify(command);

    // ✅ Publish MQTT
    this.client.publish('greenhouse/robot/command', payload, (err) => {
      if (err) {
        this.logger.error(`Failed to publish command: ${err.message}`);
      } else {
        this.logger.log(`Published command: ${payload}`);

        // ✅ Emit event command_sended (sau khi publish thành công)
        this.eventEmitter.emit('command_sended', {
          command: command.command,
          timestamp: command.timestamp,
        });
      }
    });

    // ✅ Lưu database
    await this.commandsService.create({
      command: command.command,
      timestamp: new Date(command.timestamp).toISOString(),
    });
  }

  async publishWorkPlan(plan: WorkPlan) {
    const itemsWithCurrent = await Promise.all(
      plan.items.map(async (item) => {
        const rfidTag = item.rfidTag;
        if (!rfidTag) {
          this.logger.warn(`RFID tag entity missing in plan item ${item.id}`);
          return null;
        }

        const current_measurement = await this.workPlanService.countMeasurements(
          plan.id,
          rfidTag.id
        );

        return {
          rfid_tag_id: rfidTag.uid,
          measurement_frequency: item.measurement_frequency,
          current_measurement,
        };
      })
    );

    const validItems = itemsWithCurrent.filter((i) => i !== null);

    const payload = JSON.stringify({
      plan_id: plan.id,
      items: validItems,
    });

    this.client.publish('greenhouse/robot/work_plan', payload, (err) => {
      if (err) {
        this.logger.error(`Failed to publish work plan: ${err.message}`);
      } else {
        this.logger.log(`Published work plan: ${payload}`);
      }
    });
  }

  @OnEvent('work_plan.created')
  async handleWorkPlanCreated(plan: WorkPlan) {
    await this.publishWorkPlan(plan);
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