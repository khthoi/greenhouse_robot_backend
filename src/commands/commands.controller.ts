import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Patch,
    Query,
    DefaultValuePipe,
    ParseIntPipe,
} from '@nestjs/common';
import { CommandsService } from './commands.service';
import { CreateCommandDto } from './commands.dto';
import { Command } from './entities/commands.entity';
import { CommandType } from './enums/commandtype';
import { MqttService } from 'src/mqtt/mqtt.service';

@Controller('commands')
export class CommandsController {
    constructor(
        private readonly commandsService: CommandsService,
        private readonly mqttService: MqttService, // ← Thêm dòng này
    ) { }

    /**
     * 🟢 POST /commands
     * → Tạo mới một lệnh điều khiển robot
     */
    @Post()
    async create(@Body() createCommandDto: CreateCommandDto): Promise<Command> {
        return await this.commandsService.create(createCommandDto);
    }

    /**
     * 🟡 GET /commands
     * → Lấy toàn bộ danh sách lệnh
     */
    @Get()
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
    ): Promise<{
        data: Command[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        return await this.commandsService.findAllPaginated(page, limit);
    }

    @Get('latest')
    async findLatest(): Promise<Command> {
        return await this.commandsService.findLatest();
    }

    /**
     * 🟣 GET /commands/:id
     * → Lấy thông tin chi tiết của một lệnh điều khiển
     */
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<Command> {
        return await this.commandsService.findOne(id);
    }

    /**
     * 🟠 PUT /commands/:id
     * → Cập nhật thông tin một lệnh điều khiển
     */
    // 🟠 Cập nhật command
    @Patch(':id')
    async update(
        @Param('id') id: number,
        @Body() partial: Partial<Command>,
    ): Promise<Command> {
        return await this.commandsService.update(id, partial);
    }

    /**
     * 🔴 DELETE /commands/:id
     * → Xóa một lệnh điều khiển theo ID
     */
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
        await this.commandsService.remove(id);
        return { message: `Đã xóa thành công lệnh điều khiển có ID = ${id}` };
    }

    @Post('send')
    async sendCommand(@Body('command') command: CommandType) {
        const now = new Date();
        const isoTimestamp = now.toISOString();
        await this.mqttService.publishCommand({ command, timestamp: isoTimestamp });
        return { message: `Sent command ${command}` };
    }
}
