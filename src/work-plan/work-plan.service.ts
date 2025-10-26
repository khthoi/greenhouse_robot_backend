import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkPlan } from './entities/work-plans.entity';
import { WorkPlanItem } from './entities/work-plan-items.entity';
import { CreateWorkPlanDto, UpdateWorkPlanDto } from './work-plan.dto';
import { WorkPlanStatus } from './enums/work-plan-status';

@Injectable()
export class WorkPlanService {
    constructor(
        @InjectRepository(WorkPlan)
        private readonly workPlanRepository: Repository<WorkPlan>,
        @InjectRepository(WorkPlanItem)
        private readonly workPlanItemRepository: Repository<WorkPlanItem>,
    ) { }

    async create(dto: CreateWorkPlanDto): Promise<WorkPlan> {
        const workPlan = this.workPlanRepository.create({
            description: dto.description,
            status: WorkPlanStatus.NOT_RECEIVED,
            progress: 0.0,
        });
        const savedPlan = await this.workPlanRepository.save(workPlan);

        const items = dto.items.map((item) =>
            this.workPlanItemRepository.create({
                work_plan_id: savedPlan.id,
                rfid_tag_id: item.rfid_tag_id,
                measurement_frequency: item.measurement_frequency,
                current_measurements: 0,
            }),
        );
        await this.workPlanItemRepository.save(items);

        return await this.workPlanRepository.findOneOrFail({
            where: { id: savedPlan.id },
            relations: ['items', 'items.rfidTag'],
        });

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

    async updateItemProgress(itemId: number, current_measurements: number): Promise<WorkPlanItem> {
        await this.workPlanItemRepository.update(itemId, { current_measurements });
        return await this.workPlanItemRepository.findOneOrFail({ where: { id: itemId } });
    }

    async calculateProgress(id: number): Promise<number> {
        const plan = await this.findOne(id);
        const totalMeasurements = plan.items.reduce((sum, item) => sum + item.measurement_frequency, 0);
        const completedMeasurements = plan.items.reduce((sum, item) => sum + item.current_measurements, 0);
        const progress = totalMeasurements > 0 ? (completedMeasurements / totalMeasurements) * 100 : 0;
        await this.workPlanRepository.update(id, { progress });
        return progress;
    }
}