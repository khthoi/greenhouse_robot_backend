import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { RfidTag } from 'src/rfid-tags/entities/rfid-tags.entity';

@Entity('environment_data')
export class EnvironmentData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rfid_tag_id: number;

  @ManyToOne(() => RfidTag, (tag) => tag.environmentData, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rfid_tag_id' })
  rfidTag: RfidTag;

  @Column({ type: 'float' })
  temperature: number;

  @Column({ type: 'float' })
  humidity: number;

  @Column({ type: 'datetime' })
  timestamp: Date;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
