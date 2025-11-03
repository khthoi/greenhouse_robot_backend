import { Module } from '@nestjs/common';
import { ConnectRobotService } from './connect-robot.service';
import { ConnectRobotController } from './connect-robot.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,           // ✅ add this
  ],
  providers: [ConnectRobotService],
  controllers: [ConnectRobotController]
})
export class ConnectRobotModule {}
