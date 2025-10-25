import { Module } from '@nestjs/common';
import { RobotStatusService } from './robot-status.service';
import { RobotStatusController } from './robot-status.controller';
import { RobotStatus } from './entities/robot-status.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([RobotStatus])],
  providers: [RobotStatusService],
  controllers: [RobotStatusController]
})
export class RobotStatusModule {}
