import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertLog } from './entities/alert-logs.entity';
import { AlertLogService } from './alert-logs.service';
import { AlertLogsController } from './alert-logs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlertLog])],
  providers: [AlertLogService],
  controllers: [AlertLogsController],
  exports: [AlertLogService],
})
export class AlertLogModule {}