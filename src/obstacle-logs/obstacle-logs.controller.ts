import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ObstacleLogsService } from './obstacle-logs.service';
import { CreateObstacleLogDto } from './obstacle-logs.dto';
import { ObstacleLog } from './entities/obstacle-logs.entity';

@Controller('obstacle-logs')
export class ObstacleLogsController {
  constructor(private readonly obstacleLogsService: ObstacleLogsService) {}

  /**
   * 🟩 Tạo mới log chướng ngại vật
   * POST /obstacle-logs
   */
  @Post()
  async create(@Body() dto: CreateObstacleLogDto): Promise<ObstacleLog> {
    return await this.obstacleLogsService.create(dto);
  }

  /**
   * 🟦 Lấy tất cả log
   * GET /obstacle-logs
   */
  @Get()
  async findAll(): Promise<ObstacleLog[]> {
    return await this.obstacleLogsService.findAll();
  }

  /**
   * 🟨 Lấy log theo ID
   * GET /obstacle-logs/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ObstacleLog> {
    return await this.obstacleLogsService.findOne(id);
  }

  /**
   * 🟧 Cập nhật log theo ID
   * PATCH /obstacle-logs/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateData: Partial<CreateObstacleLogDto>,
  ): Promise<ObstacleLog> {
    return await this.obstacleLogsService.update(id, updateData);
  }

  /**
   * 🟥 Xóa log theo ID
   * DELETE /obstacle-logs/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<{ message: string }> {
    await this.obstacleLogsService.remove(id);
    return { message: `Đã xóa log chướng ngại vật có ID ${id}` };
  }
}
