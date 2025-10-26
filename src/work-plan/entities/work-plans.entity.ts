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
  progress: number; // Tiến độ hoàn thành (%)

  @Column({ type: 'text', nullable: true })
  description: string; // Mô tả kế hoạch (tùy chọn)

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => WorkPlanItem, (item) => item.workPlan, { cascade: true })
  items: WorkPlanItem[]; // Danh sách các thẻ RFID trong kế hoạch
}