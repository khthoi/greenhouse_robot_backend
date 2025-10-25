import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('obstacle_logs')
export class ObstacleLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  center_distance: number;

  @Column({ type: 'float' })
  left_distance: number;

  @Column({ type: 'float' })
  right_distance: number;

  @Column({ length: 20 })
  suggestion: string;

  @Column({ length: 20 })
  action_taken: string;

  @Column({ type: 'datetime' })
  timestamp: Date;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
