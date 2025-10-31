import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { StatusType } from '../enums/status_enums';
import { RobotMode } from '../enums/robot_mode_enums';

@Entity('robot_status')
export class RobotStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: StatusType, nullable: true })
  status: StatusType;

  @Column({ length: 50, nullable: true })
  message: string;

  @Column({ type: 'enum', enum: RobotMode })
  mode: RobotMode;

  @Column({ type: 'datetime' })
  timestamp: Date;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
