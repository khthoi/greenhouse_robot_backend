import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  DefaultValuePipe,
  Query,
} from '@nestjs/common';
import { RfidTagsService } from './rfid-tags.service';
import { CreateRfidTagDto } from './dtos/create-rfid-tags.dto';
import { UpdateRfidTagDto } from './dtos/update-rfid-tags.dto';
import { RfidTag } from './entities/rfid-tags.entity';

@Controller('rfid-tags')
export class RfidTagsController {
  constructor(private readonly rfidTagsService: RfidTagsService) { }

  // 🟢 Tạo mới thẻ RFID
  @Post()
  async create(@Body() createRfidTagDto: CreateRfidTagDto) {
    return await this.rfidTagsService.create(createRfidTagDto);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
  ): Promise<{
    data: RfidTag[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await this.rfidTagsService.findAllPaginated(page, limit);
  }

  // 🟣 Lấy theo UID
  @Get(':uid')
  async findByUid(@Param('uid') uid: string) {
    return await this.rfidTagsService.findByUid(uid);
  }

  // 🟠 Cập nhật thông tin thẻ RFID
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRfidTagDto: UpdateRfidTagDto,
  ) {
    return await this.rfidTagsService.update(id, updateRfidTagDto);
  }

  // 🔴 Xóa thẻ RFID
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.rfidTagsService.remove(id);
    return { message: `Đã xóa thẻ RFID có id = ${id}` };
  }
}
