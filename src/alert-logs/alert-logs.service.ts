import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertLog } from './entities/alert-logs.entity';
import { CreateAlertLogDto } from './alert-logs.dto';

@Injectable()
export class AlertLogService {
  constructor(
    @InjectRepository(AlertLog)
    private readonly alertLogRepository: Repository<AlertLog>,
  ) {}

  async create(dto: CreateAlertLogDto): Promise<AlertLog> {
    const alertLog = this.alertLogRepository.create(dto);
    return await this.alertLogRepository.save(alertLog);
  }

  async findAll(): Promise<AlertLog[]> {
    return await this.alertLogRepository.find({ relations: ['rfidTag'] });
  }

  async findByRfidTagId(rfid_tag_id: number): Promise<AlertLog[]> {
    return await this.alertLogRepository.find({
      where: { rfid_tag_id },
      relations: ['rfidTag'],
      order: { timestamp: 'DESC' },
    });
  }
}