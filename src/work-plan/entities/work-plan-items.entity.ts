import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { WorkPlan } from './work-plans.entity';
import { RfidTag } from 'src/rfid-tags/entities/rfid-tags.entity';

@Entity('work_plan_items')
export class WorkPlanItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  work_plan_id: number;

  @ManyToOne(() => WorkPlan, (plan) => plan.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'work_plan_id' })
  workPlan: WorkPlan;

  @Column()
  rfid_tag_id: number;

  @ManyToOne(() => RfidTag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rfid_tag_id' })
  rfidTag: RfidTag;

  @Column({ type: 'int' })
  measurement_frequency: number;
}