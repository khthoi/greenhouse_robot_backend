import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertLog } from './entities/alert-logs.entity';
import { CreateAlertLogDto } from './alert-logs.dto';
import { AlertLogResponseDto } from './alert-logs-response.dto';

@Injectable()
export class AlertLogService {
  constructor(
    @InjectRepository(AlertLog)
    private readonly alertLogRepository: Repository<AlertLog>,
  ) { }

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
  async getAllGroupedByPlanAndTagPaginated(
    page: number = 1,
    limit: number = 15,
  ): Promise<{
    data: AlertLogResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    // 1. Lấy dữ liệu thô với phân trang
    const [alerts, total] = await this.alertLogRepository.findAndCount({
      relations: ['workPlan', 'rfidTag'],
      order: {
        workPlan: { id: 'ASC' },
        rfidTag: { id: 'ASC' },
        created_at: 'ASC',
      },
      skip,
      take: limit,
    });

    // 2. Nhóm dữ liệu
    const grouped = new Map<string, AlertLogResponseDto>();

    for (const alert of alerts) {
      const key = `${alert.work_plan_id}-${alert.rfid_tag_id}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          work_plan: {
            work_plan_id: alert.workPlan.id,
            description: alert.workPlan.description,
            status: alert.workPlan.status,
            temp_threshold: alert.workPlan.temp_threshold,
            hum_threshold: alert.workPlan.hum_threshold,
            violation_count: alert.workPlan.violation_count,
          },
          rfid_tag: {
            rfid_tag_id: alert.rfidTag.id,
            uid: alert.rfidTag.uid,
            location_name: alert.rfidTag.location_name,
            reference_temperature: alert.rfidTag.reference_temperature,
            reference_humidity: alert.rfidTag.reference_humidity,
          },
          alerts: [],
        });
      }

      const group = grouped.get(key)!;
      group.alerts.push({
        alert_id: alert.id,
        alert_type: alert.alert_type,
        measured_value: alert.measured_value,
        reference_value: alert.reference_value,
        threshold: alert.threshold,
        message: alert.message,
        timestamp: alert.timestamp,
        measurement_number: alert.measurement_number ?? undefined,
        created_at: alert.created_at.toISOString(),
      });
    }

    const data = Array.from(grouped.values());
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }
}