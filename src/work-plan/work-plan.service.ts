import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkPlan } from './entities/work-plans.entity';
import { WorkPlanItem } from './entities/work-plan-items.entity';
import { CreateWorkPlanDto, UpdateWorkPlanDto } from './work-plan.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkPlanItemMeasurement } from './entities/work-plan-item-measurement.entity';

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

    async findAll(): Promise<WorkPlan[]> {
        return await this.workPlanRepository.find({ relations: ['items', 'items.rfidTag'] });
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

}