import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { RfidTagsService } from './rfid-tags.service';
import { CreateRfidTagDto } from './dtos/create-rfid-tags.dto';
import { UpdateRfidTagDto } from './dtos/update-rfid-tags.dto';

@Controller('rfid-tags')
export class RfidTagsController {
  constructor(private readonly rfidTagsService: RfidTagsService) { }

  // 🟢 Tạo mới thẻ RFID
  @Post()
  async create(@Body() createRfidTagDto: CreateRfidTagDto) {
    return await this.rfidTagsService.create(createRfidTagDto);
  }

  // 🟡 Lấy tất cả thẻ RFID
  @Get()
  async findAll() {
    return await this.rfidTagsService.findAll();
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
