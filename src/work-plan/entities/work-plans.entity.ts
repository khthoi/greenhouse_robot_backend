import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { WorkPlanItem } from './work-plan-items.entity';
import { WorkPlanStatus } from '../enums/work-plan-status';

@Entity('work_plans')
export class WorkPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: WorkPlanStatus, default: WorkPlanStatus.NOT_RECEIVED })
  status: WorkPlanStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number;

  // ---------- CẤU HÌNH CẢNH BÁO ----------
  @Column({ type: 'float', default: 5.0 })
  temp_threshold: number;

  @Column({ type: 'float', default: 10.0 })
  hum_threshold: number;

  @Column({ type: 'int', default: 3 })
  violation_count: number;
  // -------------------------------------

  @OneToMany(() => WorkPlanItem, (item) => item.workPlan, { cascade: true })
  items: WorkPlanItem[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}