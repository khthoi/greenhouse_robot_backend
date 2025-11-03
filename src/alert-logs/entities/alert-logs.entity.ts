import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { RfidTag } from 'src/rfid-tags/entities/rfid-tags.entity';
import { AlertType } from '../enums/AlertType';
import { WorkPlan } from 'src/work-plan/entities/work-plans.entity';

@Entity('alert_logs')
export class AlertLog {
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

  @Column({ type: 'enum', enum: AlertType })
  alert_type: AlertType;

  @Column({ type: 'float' })
  measured_value: number;

  @Column({ type: 'float' })
  reference_value: number;

  @Column({ type: 'float' })
  threshold: number;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'int', nullable: true })
  measurement_number?: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}