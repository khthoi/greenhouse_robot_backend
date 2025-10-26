import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertConfig } from './entities/alert-config.entity';
import { CreateAlertConfigDto, UpdateAlertConfigDto } from './alert-config.dto';

@Injectable()
export class AlertConfigService {
  constructor(
    @InjectRepository(AlertConfig)
    private readonly alertConfigRepository: Repository<AlertConfig>,
  ) {}

  async create(dto: CreateAlertConfigDto): Promise<AlertConfig> {
    const config = this.alertConfigRepository.create(dto);
    return await this.alertConfigRepository.save(config);
  }

  async findAll(): Promise<AlertConfig[]> {
    return await this.alertConfigRepository.find({ relations: ['rfidTag'] });
  }

  async findOne(id: number): Promise<AlertConfig> {
    const config = await this.alertConfigRepository.findOne({
      where: { id },
      relations: ['rfidTag'],
    });
    if (!config) throw new NotFoundException(`AlertConfig with ID ${id} not found`);
    return config;
  }

  async findByRfidTagId(rfid_tag_id: number): Promise<AlertConfig> {
    const config = await this.alertConfigRepository.findOne({
      where: { rfid_tag_id },
      relations: ['rfidTag'],
    });
    if (!config) throw new NotFoundException(`AlertConfig for RFID tag ${rfid_tag_id} not found`);
    return config;
  }

  async update(id: number, dto: UpdateAlertConfigDto): Promise<AlertConfig> {
    await this.alertConfigRepository.update(id, dto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.alertConfigRepository.delete(id);
  }
}