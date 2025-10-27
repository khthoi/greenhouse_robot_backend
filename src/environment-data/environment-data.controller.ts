import { 
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { EnvironmentDataService } from './environment-data.service';
import { CreateEnvironmentDataDto } from './environment-data.dto';
import { EnvironmentData } from './entities/environment-data.entity';

@Controller('environment-data')
export class EnvironmentDataController {
  constructor(private readonly envDataService: EnvironmentDataService) {}

  /**
   * 🟢 Tạo mới bản ghi dữ liệu môi trường
   * POST /environment-data
   */
  @Post()
  async create(@Body() dto: CreateEnvironmentDataDto): Promise<EnvironmentData> {
    return await this.envDataService.create(dto);
  }

  /**
   * 🟡 Lấy toàn bộ dữ liệu môi trường
   * GET /environment-data
   */
  @Get()
  async findAll(): Promise<EnvironmentData[]> {
    return await this.envDataService.findAll();
  }

  /**
   * 🟢 Lấy dữ liệu theo ID
   * GET /environment-data/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<EnvironmentData> {
    return await this.envDataService.findOne(id);
  }

  /**
   * 🟣 Lấy dữ liệu theo RFID Tag ID
   * GET /environment-data/by-rfid/:rfid_tag_id
   */
  @Get('by-rfid/:rfid_tag_id')
  async findByRfidTag(@Param('rfid_tag_id') rfid_tag_id: string): Promise<EnvironmentData[]> {
    return await this.envDataService.findByRfidTagId(rfid_tag_id);
  }

  /**
   * 🟠 Cập nhật bản ghi môi trường
   * PATCH /environment-data/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() partial: Partial<EnvironmentData>,
  ): Promise<EnvironmentData> {
    return await this.envDataService.update(id, partial);
  }

  /**
   * 🔴 Xóa bản ghi môi trường
   * DELETE /environment-data/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<{ message: string }> {
    await this.envDataService.remove(id);
    return { message: 'Xóa dữ liệu môi trường thành công' };
  }
}
