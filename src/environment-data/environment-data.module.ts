import { Module } from '@nestjs/common';
import { EnvironmentDataService } from './environment-data.service';
import { EnvironmentDataController } from './environment-data.controller';
import { EnvironmentData } from './entities/environment-data.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([EnvironmentData])],
  providers: [EnvironmentDataService],
  controllers: [EnvironmentDataController]
})
export class EnvironmentDataModule {}
