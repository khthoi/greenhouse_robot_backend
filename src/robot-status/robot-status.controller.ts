import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { RobotStatusService } from './robot-status.service';
import { CreateRobotStatus } from './robot-status.dto';
import { RobotMode } from './enums/robot_mode_enums';
import { StatusType } from './enums/status_enums';
import { RobotStatus } from './entities/robot-status.entity';

@Controller('robot-status')
export class RobotStatusController {
  constructor(private readonly robotStatusService: RobotStatusService) { }

  // 🟢 Tạo mới bản ghi trạng thái robot
  @Post()
  async create(@Body() dto: CreateRobotStatus) {
    return await this.robotStatusService.create(dto);
  }

  // 🟡 Lấy tất cả trạng thái robot với phân trang
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
  ): Promise<{
    data: RobotStatus[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await this.robotStatusService.findAllPaginated(page, limit);
  }
  // 🟤 Lấy bản ghi mới nhất
  @Get('latest')
  async findLatest() {
    return await this.robotStatusService.findLatest();
  }

  // 🔵 Tìm theo chế độ robot (AUTO hoặc MANUAL)
  @Get('mode/:mode')
  async findByMode(@Param('mode') mode: RobotMode) {
    return await this.robotStatusService.findByMode(mode);
  }

  // 🟣 Tìm theo trạng thái lỗi (StatusType)
  @Get('status/:status')
  async findByStatus(@Param('status') status: StatusType) {
    return await this.robotStatusService.findByStatusType(status);
  }

  // 🟠 Cập nhật bản ghi
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateRobotStatus>,
  ) {
    return await this.robotStatusService.update(id, dto);
  }

  // 🔴 Xóa bản ghi
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.robotStatusService.remove(id);
    return { message: `Đã xóa trạng thái robot có id = ${id}` };
  }

  @Get('history/:hours')
  async findHistory(@Param('hours', ParseIntPipe) hours: number) {
    return await this.robotStatusService.findHistory(hours);
  }
}
