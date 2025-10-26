import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { AlertConfigService } from './alert-config.service';
import { CreateAlertConfigDto, UpdateAlertConfigDto } from './alert-config.dto';

@Controller('alert-configs')
export class AlertConfigController {
  constructor(private readonly alertConfigService: AlertConfigService) {}

  @Post()
  async create(@Body() dto: CreateAlertConfigDto) {
    return await this.alertConfigService.create(dto);
  }

  @Get()
  async findAll() {
    return await this.alertConfigService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.alertConfigService.findOne(id);
  }

  @Get('rfid/:rfid_tag_id')
  async findByRfidTagId(@Param('rfid_tag_id', ParseIntPipe) rfid_tag_id: number) {
    return await this.alertConfigService.findByRfidTagId(rfid_tag_id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAlertConfigDto) {
    return await this.alertConfigService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.alertConfigService.remove(id);
    return { message: `Deleted alert config with ID ${id}` };
  }
}