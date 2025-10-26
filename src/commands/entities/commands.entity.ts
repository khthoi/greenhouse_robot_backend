import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { CommandType } from '../enums/commandtype';

@Entity('commands')
export class Command {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: CommandType
  })
  command: CommandType; 

  @Column({ type: 'datetime' })
  timestamp: Date;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
