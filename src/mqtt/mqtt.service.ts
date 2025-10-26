import { Injectable, Logger } from '@nestjs/common';
import { MqttClient, connect } from 'mqtt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CommandType } from '../commands/enums/commandtype';

@Injectable()
export class MqttService {
  private readonly logger = new Logger(MqttService.name);
  private client: MqttClient;
  private obstacleTimeouts: Map<number, NodeJS.Timeout> = new Map();
  private readonly baseUrl = 'http://localhost:3000'; // Địa chỉ API của ứng dụng

  constructor(
    private readonly httpService: HttpService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.connect();
  }

  private connect() {
    this.client = connect('mqtt://localhost:1883', {
      clientId: 'nestjs_server',
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASSWORD,
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to MQTT broker');
      this.subscribeToTopics();
    });

    this.client.on('error', (error) => {
      this.logger.error(`MQTT error: ${error.message}`);
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
      }
    } catch (error) {
      this.logger.error(`Error processing message on ${topic}: ${error.message}`);
    }
  }

  private async handleEnvData(payload: any) {
    const { uid, temp, hum } = payload;
    if (!uid || temp === undefined || hum === undefined) {
      this.logger.warn('Invalid env_data payload');
      return;
    }

    // Kiểm tra RFID tag qua API
    const rfidTag = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/rfid-tags/${uid}`),
    ).then((res) => res.data);

    if (!rfidTag) {
      this.logger.warn(`RFID tag ${uid} not found`);
      return;
    }

    const envData = {
      uid,
      temp,
      hum,
      timestamp: new Date().toISOString(),
    };

    // Gọi API để tạo bản ghi môi trường
    await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/environment-data`, envData),
    );

    this.eventEmitter.emit('env_data.received', envData);
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

    const obstacleData = {
      center_dist,
      left_dist,
      right_dist,
      suggestion,
      action_taken: suggestion,
      timestamp: new Date().toISOString(),
    };

    // Gọi API để tạo log chướng ngại vật
    const obstacleLog = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/obstacle-logs`, obstacleData),
    ).then((res) => res.data);

    this.eventEmitter.emit('obstacle.received', { id: obstacleLog.id, ...payload });

    const timeout = setTimeout(async () => {
      const updatedLog = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/obstacle-logs/${obstacleLog.id}`),
      ).then((res) => res.data);

      if (updatedLog.action_taken === suggestion) {
        await this.publishCommand({ command: suggestion, timestamp: new Date().toISOString() });
        this.logger.log(`No action_taken chosen, sent ${suggestion} to robot`);
      }
      this.obstacleTimeouts.delete(obstacleLog.id);
    }, 10000);

    this.obstacleTimeouts.set(obstacleLog.id, timeout);
  }

  private async handleStatus(payload: any) {
    const { error, mode, message } = payload;
    if (!mode || !message) {
      this.logger.warn('Invalid status payload');
      return;
    }

    const statusData = {
      status: error || null,
      mode,
      message,
      timestamp: new Date().toISOString(),
    };

    // Gọi API để tạo bản ghi trạng thái robot
    await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/robot-status`, statusData),
    );

    this.eventEmitter.emit('status.received', statusData);
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

    // Gọi API để tạo lệnh
    await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/commands`, command),
    );
  }

  async setObstacleActionTaken(obstacleId: number, action_taken: CommandType) {
    // Kiểm tra log chướng ngại vật qua API
    const obstacleLog = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/obstacle-logs/${obstacleId}`),
    ).then((res) => res.data);

    if (!obstacleLog) {
      this.logger.warn(`Obstacle log ${obstacleId} not found`);
      return;
    }

    // Cập nhật action_taken qua API
    await firstValueFrom(
      this.httpService.patch(`${this.baseUrl}/obstacle-logs/${obstacleId}`, { action_taken }),
    );

    // Hủy timeout
    const timeout = this.obstacleTimeouts.get(obstacleId);
    if (timeout) {
      clearTimeout(timeout);
      this.obstacleTimeouts.delete(obstacleId);
    }

    // Gửi lệnh qua API commands/send
    await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/commands/send`, { command: action_taken }),
    );
  }
}