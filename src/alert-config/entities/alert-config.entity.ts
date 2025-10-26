import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RfidTag } from 'src/rfid-tags/entities/rfid-tags.entity';

@Entity('alert_configs')
export class AlertConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rfid_tag_id: number;

  @ManyToOne(() => RfidTag, (tag) => tag.environmentData, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rfid_tag_id' })
  rfidTag: RfidTag;

  @Column({ type: 'float', default: 5.0 })
  temp_threshold: number; // Ngưỡng chênh lệch nhiệt độ (°C)

  @Column({ type: 'float', default: 10.0 })
  hum_threshold: number; // Ngưỡng chênh lệch độ ẩm (%)

  @Column({ type: 'int', default: 3 })
  violation_count: number; // Số lần vượt ngưỡng để kích hoạt cảnh báo

  @Column({ type: 'boolean', default: true })
  is_active: boolean; // Trạng thái kích hoạt cảnh báo

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}