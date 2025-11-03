// entities/work-plan-item-measurement.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { WorkPlan } from './work-plans.entity';
import { RfidTag } from 'src/rfid-tags/entities/rfid-tags.entity';

@Entity('work_plan_item_measurements')
export class WorkPlanItemMeasurement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  work_plan_id: number;

  @ManyToOne(() => WorkPlan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'work_plan_id' })
  workPlan: WorkPlan;

  @Column()
  rfid_tag_id: number;

  @ManyToOne(() => RfidTag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rfid_tag_id' })
  rfidTag: RfidTag;

  @Column({ type: 'int' })
  measurement_number: number;

  @Column({ type: 'float', nullable: true })
  temperature: number;

  @Column({ type: 'float', nullable: true })
  humidity: number;

  @CreateDateColumn()
  created_at: Date;
}