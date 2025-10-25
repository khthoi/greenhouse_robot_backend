import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { EnvironmentData } from '../../environment-data/entities/environment-data.entity';

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

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => EnvironmentData, (env) => env.rfidTag)
  environmentData: EnvironmentData[];
}
