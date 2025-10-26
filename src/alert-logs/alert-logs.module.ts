import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertLog } from './entities/alert-logs.entity';
import { AlertLogService } from './alert-logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([AlertLog])],
  providers: [AlertLogService],
  exports: [AlertLogService],
})
export class AlertLogModule {}