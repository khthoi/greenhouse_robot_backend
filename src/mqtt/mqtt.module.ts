import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { MqttController } from './mqtt.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentData } from '../environment-data/entities/environment-data.entity';
import { ObstacleLog } from '../obstacle-logs/entities/obstacle-logs.entity';
import { RobotStatus } from '../robot-status/entities/robot-status.entity';
import { CommandsModule } from '../commands/commands.module';
import { EnvironmentDataModule } from '../environment-data/environment-data.module';
import { ObstacleLogsModule } from '../obstacle-logs/obstacle-logs.module';
import { RobotStatusModule } from '../robot-status/robot-status.module';
import { RfidTagsModule } from '../rfid-tags/rfid-tags.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnvironmentData, ObstacleLog, RobotStatus]),
    CommandsModule,
    EnvironmentDataModule,
    ObstacleLogsModule,
    RobotStatusModule,
    RfidTagsModule,
  ],
  providers: [MqttService],
  controllers: [MqttController],
  exports: [MqttService],
})
export class MqttModule {}