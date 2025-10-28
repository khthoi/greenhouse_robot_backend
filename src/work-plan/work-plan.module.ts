import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkPlan } from './entities/work-plans.entity';
import { WorkPlanItem } from './entities/work-plan-items.entity';
import { WorkPlanService } from './work-plan.service';
import { WorkPlanController } from './work-plan.controller';
import { RfidTagsModule } from '../rfid-tags/rfid-tags.module';
import { WorkPlanItemMeasurement } from './entities/work-plan-item-measurement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkPlan, WorkPlanItem, WorkPlanItemMeasurement]), RfidTagsModule],
  providers: [WorkPlanService],
  controllers: [WorkPlanController],
  exports: [WorkPlanService],
})
export class WorkPlanModule {}