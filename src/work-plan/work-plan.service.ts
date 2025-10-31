import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkPlan } from './entities/work-plans.entity';
import { WorkPlanItem } from './entities/work-plan-items.entity';
import { CreateWorkPlanDto, UpdateWorkPlanDto } from './work-plan.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkPlanItemMeasurement } from './entities/work-plan-item-measurement.entity';
import { WorkPlanDetailDto } from './work-plan-details.dto';
import { WorkPlanMeasurementDto } from './work-plan-measurement-detail.dto';

@Injectable()
export class WorkPlanService {
    workPlanRepo: any;
    itemRepo: any;
    constructor(
        @InjectRepository(WorkPlan)
        private readonly workPlanRepository: Repository<WorkPlan>,
        @InjectRepository(WorkPlanItem)
        private readonly workPlanItemRepository: Repository<WorkPlanItem>,
        @InjectRepository(WorkPlanItemMeasurement)
        private readonly measurementRepository: Repository<WorkPlanItemMeasurement>,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async create(dto: CreateWorkPlanDto): Promise<WorkPlan> {
        const plan = this.workPlanRepository.create({
            description: dto.description,
            temp_threshold: dto.temp_threshold,
            hum_threshold: dto.hum_threshold,
            violation_count: dto.violation_count,
        });

        const saved = await this.workPlanRepository.save(plan);

        const items = dto.items.map(i =>
            this.workPlanItemRepository.create({
                work_plan_id: saved.id,
                rfid_tag_id: i.rfid_tag_id,
                measurement_frequency: i.measurement_frequency,
            })
        );

        await this.workPlanItemRepository.save(items);
        const fullPlan = await this.findOne(saved.id);

        // Phát sự kiện
        this.eventEmitter.emit('work_plan.created', fullPlan);

        return fullPlan;
    }

    async findAllPaginated(
        page: number = 1,
        limit: number = 15,
    ): Promise<{
        data: WorkPlan[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const skip = (page - 1) * limit;

        const [data, total] = await this.workPlanRepository.findAndCount({
            relations: ['items', 'items.rfidTag'],
            order: { id: 'DESC' },
            skip,
            take: limit,
        });

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number): Promise<WorkPlan> {
        const plan = await this.workPlanRepository.findOne({
            where: { id },
            relations: ['items', 'items.rfidTag'],
        });
        if (!plan) throw new NotFoundException(`WorkPlan with ID ${id} not found`);
        return plan;
    }

    async update(id: number, dto: UpdateWorkPlanDto): Promise<WorkPlan> {
        await this.workPlanRepository.update(id, dto);
        return await this.findOne(id);
    }

    async calculateProgress(id: number): Promise<number> {
        const plan = await this.findOne(id);
        const total = plan.items.reduce((sum, i) => sum + i.measurement_frequency, 0);

        const completed = await this.measurementRepository.count({
            where: { work_plan_id: id },
        });

        const progress = total > 0 ? (completed / total) * 100 : 0;
        await this.workPlanRepository.update(id, { progress });
        return progress;
    }

    public async findMeasurement(planId: number, tagId: number, measureNo: number) {
        return await this.measurementRepository.findOne({
            where: {
                work_plan_id: planId,
                rfid_tag_id: tagId,
                measurement_number: measureNo,
            },
        });
    }

    public async findMeasurementsByPlan(planId: number): Promise<WorkPlanItemMeasurement[]> {
        return await this.measurementRepository.find({
            where: { work_plan_id: planId },
            relations: ['rfidTag'],
            order: { measurement_number: 'ASC' },
        });
    }

    public async createMeasurement(data: Partial<WorkPlanItemMeasurement>) {
        const measurement = this.measurementRepository.create(data);
        return await this.measurementRepository.save(measurement);
    }

    async getDetail(id: number): Promise<WorkPlanDetailDto> {
        const plan = await this.workPlanRepository.findOne({
            where: { id },
            relations: ['items', 'items.rfidTag'],
        });

        if (!plan) {
            throw new NotFoundException(`WorkPlan with ID ${id} not found`);
        }

        const items = plan.items || [];

        const itemDetails = await Promise.all(
            items.map(async (item) => {
                // Đếm số lần đo đã thực hiện
                const currentCount = await this.measurementRepository.count({
                    where: {
                        work_plan_id: plan.id,
                        rfid_tag_id: item.rfid_tag_id,
                    },
                });

                // Lấy lần đo mới nhất
                const latest = await this.measurementRepository.findOne({
                    where: {
                        work_plan_id: plan.id,
                        rfid_tag_id: item.rfid_tag_id,
                    },
                    order: { measurement_number: 'DESC' },
                });

                return {
                    rfid_tag_id: item.rfid_tag_id,
                    uid: item.rfidTag.uid,
                    location_name: item.rfidTag.location_name,
                    measurement_frequency: item.measurement_frequency,
                    current_measurements: currentCount,
                    latest_temperature: latest?.temperature ?? undefined,
                    latest_humidity: latest?.humidity ?? undefined,
                    latest_timestamp: latest?.timestamp ?? undefined,
                };
            }),
        );

        return {
            id: plan.id,
            description: plan.description,
            status: plan.status,
            progress: plan.progress,
            temp_threshold: plan.temp_threshold,
            hum_threshold: plan.hum_threshold,
            violation_count: plan.violation_count,
            items: itemDetails,
        };
    }

    async getAllMeasurementsPaginated(
        page: number = 1,
        limit: number = 15,
    ): Promise<{
        data: WorkPlanMeasurementDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const skip = (page - 1) * limit;

        // 1. Lấy danh sách work plans (có phân trang)
        const [plans, totalPlans] = await this.workPlanRepository.findAndCount({
            relations: ['items', 'items.rfidTag'],
            order: { id: 'ASC' },
            skip,
            take: limit,
        });

        const result: WorkPlanMeasurementDto[] = [];

        // 2. Với mỗi plan → lấy measurements
        for (const plan of plans) {
            const planDto: WorkPlanMeasurementDto = {
                work_plan_id: plan.id,
                description: plan.description,
                status: plan.status,
                progress: plan.progress,
                temp_threshold: plan.temp_threshold,
                hum_threshold: plan.hum_threshold,
                violation_count: plan.violation_count,
                items: [],
            };

            for (const item of plan.items || []) {
                const measurements = await this.measurementRepository.find({
                    where: {
                        work_plan_id: plan.id,
                        rfid_tag_id: item.rfid_tag_id,
                    },
                    order: { measurement_number: 'ASC' },
                });

                planDto.items.push({
                    rfid_tag: {
                        rfid_tag_id: item.rfid_tag_id,
                        uid: item.rfidTag.uid,
                        location_name: item.rfidTag.location_name,
                    },
                    measurements: measurements.map(m => ({
                        measurement_number: m.measurement_number,
                        temperature: m.temperature ?? null,
                        humidity: m.humidity ?? null,
                        timestamp: m.timestamp,
                        created_at: m.created_at.toISOString(),
                    })),
                    measurement_frequency: item.measurement_frequency,
                });
            }

            result.push(planDto);
        }

        return {
            data: result,
            total: totalPlans,
            page,
            limit,
            totalPages: Math.ceil(totalPlans / limit),
        };
    }
}