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

  @Column({ type: 'int' })
  rfid_tag_id: number;

  @ManyToOne(() => RfidTag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rfid_tag_id' })
  rfidTag: RfidTag;

  @Column({ type: 'int' })
  measurement_frequency: number;

  @Column({ type: 'int', default: 0 })
  current_measurements: number;

  @Column({ type: 'float', nullable: true })
  temperature: number;

  @Column({ type: 'float', nullable: true })
  humidity: number;

  @Column({ type: 'varchar', nullable: true })
  timestamp: string;
}