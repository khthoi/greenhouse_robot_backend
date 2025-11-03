import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ConnectRobotService } from './connect-robot.service';
import os from 'os';
import { IsNotEmpty } from 'class-validator';

class ConnectRobotDto {
    @IsNotEmpty()
    esp32_ip: string;
}

@Controller('connect-robot')
export class ConnectRobotController {
    constructor(private readonly service: ConnectRobotService) { }

    @Post()
    async connect(@Body() dto: ConnectRobotDto) {
        if (!dto.esp32_ip || !/^(\d{1,3}\.){3}\d{1,3}$/.test(dto.esp32_ip)) {
            throw new BadRequestException('IP ESP32 không hợp lệ');
        }

        const backendIp = this.getLocalIp();
        this.service.sendBackendIpToEsp32(dto.esp32_ip, backendIp);

        return { message: 'Yêu cầu đã được gửi đến robot' };
    }

    @Post('connect-response')
    async handleResponse(@Body() body: { IP: string }) {
        if (!body.IP || !/^(\d{1,3}\.){3}\d{1,3}$/.test(body.IP)) {
            throw new BadRequestException('IP ESP32 không hợp lệ');
        }

        await this.service.handleEsp32Response(body.IP);
        return { success: true };
    }

    private getLocalIp(): string {
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]!) {
                if (iface.family === 'IPv4' && !iface.internal && iface.address.startsWith('192.168.')) {
                    return iface.address;
                }
            }
        }
        return '127.0.0.1';
    }
}