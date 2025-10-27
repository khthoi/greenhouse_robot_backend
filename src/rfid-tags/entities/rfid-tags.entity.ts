import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('rfid_tags')
export class RfidTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  uid: string;

  @Column({ length: 50 })
  location_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'float', nullable: true })
  reference_temperature: number; // Nhiệt độ cố định cho vị trí

  @Column({ type: 'float', nullable: true })
  reference_humidity: number; // Độ ẩm cố định cho vị trí

  @Column({ type: 'int', default: 1 })
  measurement_frequency: number; // Số lần cần đo tại vị trí này

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
