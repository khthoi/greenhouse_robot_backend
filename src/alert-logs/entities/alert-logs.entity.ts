import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RfidTag } from 'src/rfid-tags/entities/rfid-tags.entity';
import { AlertType } from '../enums/AlertType';

@Entity('alert_logs')
export class AlertLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' }) 
  rfid_tag_id: number;

  @ManyToOne(() => RfidTag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rfid_tag_id' })
  rfidTag: RfidTag;

  @Column({ type: 'enum', enum: AlertType })
  alert_type: AlertType; // Loại cảnh báo (TEMP_HIGH, TEMP_LOW, HUM_HIGH, HUM_LOW)

  @Column({ type: 'float' })
  measured_value: number; // Giá trị đo được (nhiệt độ hoặc độ ẩm)

  @Column({ type: 'float' })
  reference_value: number; // Giá trị cố định (nhiệt độ hoặc độ ẩm)

  @Column({ type: 'float' })
  threshold: number; // Ngưỡng chênh lệch

  @Column({ type: 'text' })
  message: string; // Thông điệp cảnh báo

  @Column({ type: 'datetime' })
  timestamp: Date;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}