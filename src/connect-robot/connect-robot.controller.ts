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

        function isPrivateIPv4(addr: string): boolean {
            if (!addr) return false;

            if (addr.startsWith('10.')) return true;
            if (addr.startsWith('192.168.')) return true;

            // 172.16.0.0 - 172.31.255.255
            if (addr.startsWith('172.')) {
                const parts = addr.split('.');
                if (parts.length === 4) {
                    const second = Number(parts[1]);
                    if (second >= 16 && second <= 31) return true;
                }
            }
            return false;
        }

        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]!) {
                const family = (iface as any).family;
                const isV4 = family === 'IPv4' || family === 4 || family === '4';

                if (isV4 && !iface.internal && isPrivateIPv4(iface.address)) {
                    return iface.address;
                }
            }
        }

        return '127.0.0.1';
    }
}