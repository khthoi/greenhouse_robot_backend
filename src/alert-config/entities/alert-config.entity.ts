import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RfidTag } from 'src/rfid-tags/entities/rfid-tags.entity';

@Entity('alert_configs')
export class AlertConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int'})
  rfid_tag_id: number;

  @ManyToOne(() => RfidTag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rfid_tag_id' })
  rfidTag: RfidTag;

  @Column({ type: 'float', default: 5.0 })
  temp_threshold: number;

  @Column({ type: 'float', default: 10.0 })
  hum_threshold: number;

  @Column({ type: 'int', default: 3 })
  violation_count: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}