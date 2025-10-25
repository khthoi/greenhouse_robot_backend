import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('robot_status')
export class RobotStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, nullable: true })
  error: string;

  @Column({ length: 10 })
  mode: string;

  @Column({ type: 'datetime' })
  timestamp: Date;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
