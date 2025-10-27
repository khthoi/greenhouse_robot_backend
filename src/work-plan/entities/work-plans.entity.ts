import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { WorkPlanItem } from './work-plan-items.entity';
import { WorkPlanStatus } from '../enums/work-plan-status';

@Entity('work_plans')
export class WorkPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: WorkPlanStatus, default: WorkPlanStatus.NOT_RECEIVED })
  status: WorkPlanStatus;

  @Column({ type: 'float', default: 0.0 })
  progress: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => WorkPlanItem, (item) => item.workPlan, { cascade: true })
  items: WorkPlanItem[];
}