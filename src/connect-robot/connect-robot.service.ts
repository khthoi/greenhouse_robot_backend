import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ConnectRobotService {
    private readonly logger = new Logger(ConnectRobotService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async sendBackendIpToEsp32(esp32Ip: string, backendIp: string): Promise<void> {
        const url = `http://${esp32Ip}:5000`;
        try {
            await firstValueFrom(
                this.httpService.post(
                    url,
                    { IP: backendIp },
                    {
                        timeout: 10000,
                        headers: { Connection: 'close' },
                    }
                )
            );
            this.logger.log(`Đã gửi IP backend đến ESP32 (${esp32Ip})`);
        } catch (error: any) {
            // BỎ QUA LỖI KẾT NỐI - ESP32 không cần nhận!
            if (error.code === 'ECONNRESET' || error.message.includes('socket hang up')) {
                this.logger.verbose(`ESP32 ngắt kết nối: ${esp32Ip}`);
            } else {
                this.logger.warn(`Lỗi gửi đến ESP32: ${error.message}`);
            }
        }
    }

    async handleEsp32Response(esp32Ip: string): Promise<void> {
        this.logger.log(`ESP32 phản hồi: ${esp32Ip}`);
        this.eventEmitter.emit('robot.connected', {
            success: true,
            esp32_ip: esp32Ip,
        });
    }
}