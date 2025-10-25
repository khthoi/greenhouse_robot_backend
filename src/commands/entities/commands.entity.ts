import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('commands')
export class Command {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  command: string;

  @Column({ type: 'datetime' })
  timestamp: Date;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
