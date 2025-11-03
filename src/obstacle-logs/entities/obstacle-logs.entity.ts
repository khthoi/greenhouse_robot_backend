import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { CommandType } from 'src/commands/enums/commandtype';
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

  @Column({ type: 'enum', enum: CommandType})
  suggestion: CommandType;

  @Column({ type: 'enum', enum: CommandType})
  action_taken: CommandType;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
