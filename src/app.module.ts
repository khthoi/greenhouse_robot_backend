import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommandsModule } from './commands/commands.module';
import { ObstacleLogsModule } from './obstacle-logs/obstacle-logs.module';
import { RfidTagsModule } from './rfid-tags/rfid-tags.module';
import { RobotStatusModule } from './robot-status/robot-status.module';
import { MqttModule } from './mqtt/mqtt.module';
import { WebsocketModule } from './websocket/websocket.module';
import { AlertLogModule } from './alert-logs/alert-logs.module';
import { WorkPlanModule } from './work-plan/work-plan.module';
import { ConnectRobotModule } from './connect-robot/connect-robot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, 
    }),

    CommandsModule,
    ObstacleLogsModule,
    RfidTagsModule,
    RobotStatusModule,
    MqttModule,
    WebsocketModule,
    AlertLogModule,
    WorkPlanModule,
    ConnectRobotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
