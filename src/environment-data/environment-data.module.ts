import { Module } from '@nestjs/common';
import { EnvironmentDataService } from './environment-data.service';
import { EnvironmentDataController } from './environment-data.controller';
import { EnvironmentData } from './entities/environment-data.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RfidTag } from 'src/rfid-tags/entities/rfid-tags.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EnvironmentData, RfidTag])],
  providers: [EnvironmentDataService],
  controllers: [EnvironmentDataController]
})
export class EnvironmentDataModule {}
