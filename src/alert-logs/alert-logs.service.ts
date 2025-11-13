import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AlertLog } from './entities/alert-logs.entity';
import { CreateAlertLogDto } from './alert-logs.dto';
import { AlertLogResponseDto, AlertLogTreeDto } from './alert-logs-response.dto';
import { WorkPlan } from 'src/work-plan/entities/work-plans.entity';

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
      order: { updated_at: 'DESC' },
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

  async getAllGroupedByPlanPaginated(
    page: number = 1,
    limit: number = 15,
  ): Promise<{
    data: AlertLogTreeDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // 1️⃣ Lấy tất cả workPlan trước — phân trang theo WorkPlan entity
    const workPlanRepo = this.alertLogRepository.manager.getRepository(WorkPlan);

    const [plans, totalPlans] = await workPlanRepo
      .createQueryBuilder('wp')
      .orderBy('wp.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    if (plans.length === 0) {
      return {
        data: [],
        total: totalPlans,
        page,
        limit,
        totalPages: Math.ceil(totalPlans / limit),
      };
    }

    const planIds = plans.map(p => p.id);

    // 2️⃣ Lấy tất cả alert_logs thuộc các work_plan này
    const alerts = await this.alertLogRepository.find({
      relations: ['workPlan', 'rfidTag'],
      where: { work_plan_id: In(planIds) },
      order: {
        workPlan: { id: 'ASC' },
        rfidTag: { id: 'ASC' },
        created_at: 'ASC',
      },
    });

    // 3️⃣ Nhóm dữ liệu theo work_plan_id → RFID → alert
    const planMap = new Map<number, AlertLogTreeDto>();

    for (const alert of alerts) {
      const planId = alert.workPlan.id;

      if (!planMap.has(planId)) {
        planMap.set(planId, {
          work_plan: {
            work_plan_id: alert.workPlan.id,
            description: alert.workPlan.description,
            status: alert.workPlan.status,
            temp_threshold: alert.workPlan.temp_threshold,
            hum_threshold: alert.workPlan.hum_threshold,
            violation_count: alert.workPlan.violation_count,
            created_at: alert.workPlan.created_at?.toISOString(),
          },
          rfid_tags: [],
        });
      }

      const planEntry = planMap.get(planId)!;
      const rfidId = alert.rfidTag.id;

      let rfidGroup = planEntry.rfid_tags.find(
        g => g.rfid_tag.rfid_tag_id === rfidId,
      );

      if (!rfidGroup) {
        rfidGroup = {
          rfid_tag: {
            rfid_tag_id: alert.rfidTag.id,
            uid: alert.rfidTag.uid,
            location_name: alert.rfidTag.location_name,
            reference_temperature: alert.rfidTag.reference_temperature,
            reference_humidity: alert.rfidTag.reference_humidity,
          },
          alerts: [],
        };
        planEntry.rfid_tags.push(rfidGroup);
      }

      rfidGroup.alerts.push({
        alert_id: alert.id,
        alert_type: alert.alert_type,
        measured_value: alert.measured_value,
        reference_value: alert.reference_value,
        threshold: alert.threshold,
        message: alert.message,
        measurement_number: alert.measurement_number ?? undefined,
        created_at: alert.created_at.toISOString(),
      });
    }

    const data = Array.from(planMap.values());

    return {
      data,
      total: totalPlans,
      page,
      limit,
      totalPages: Math.ceil(totalPlans / limit),
    };
  }
}