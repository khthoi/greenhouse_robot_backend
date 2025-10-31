import { forwardRef, Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { MqttController } from './mqtt.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObstacleLog } from '../obstacle-logs/entities/obstacle-logs.entity';
import { RobotStatus } from '../robot-status/entities/robot-status.entity';
import { CommandsModule } from '../commands/commands.module';
import { ObstacleLogsModule } from '../obstacle-logs/obstacle-logs.module';
import { RobotStatusModule } from '../robot-status/robot-status.module';
import { RfidTagsModule } from '../rfid-tags/rfid-tags.module';
import { HttpModule } from '@nestjs/axios';
import { AlertLogModule } from 'src/alert-logs/alert-logs.module';
import { WorkPlanModule } from 'src/work-plan/work-plan.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ObstacleLog, RobotStatus]),
    forwardRef(() => CommandsModule),
    ObstacleLogsModule,
    RobotStatusModule,
    RfidTagsModule,
    AlertLogModule,
    WorkPlanModule,
    HttpModule,
  ],
  providers: [MqttService],
  controllers: [MqttController],
  exports: [MqttService],
})
export class MqttModule { }