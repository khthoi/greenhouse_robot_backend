import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkPlan } from './entities/work-plans.entity';
import { WorkPlanItem } from './entities/work-plan-items.entity';
import { WorkPlanService } from './work-plan.service';
import { WorkPlanController } from './work-plan.controller';
import { RfidTagsModule } from '../rfid-tags/rfid-tags.module';
import { WorkPlanItemMeasurement } from './entities/work-plan-item-measurement.entity';
import { AlertLog } from 'src/alert-logs/entities/alert-logs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkPlan, WorkPlanItem, WorkPlanItemMeasurement, AlertLog]), RfidTagsModule],
  providers: [WorkPlanService],
  controllers: [WorkPlanController],
  exports: [WorkPlanService],
})
export class WorkPlanModule {}