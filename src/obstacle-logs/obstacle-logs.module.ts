import { Module } from '@nestjs/common';
import { ObstacleLogsService } from './obstacle-logs.service';
import { ObstacleLogsController } from './obstacle-logs.controller';
import { ObstacleLog } from './entities/obstacle-logs.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ObstacleLog])],
  providers: [ObstacleLogsService],
  controllers: [ObstacleLogsController],
  exports: [ObstacleLogsService]
})
export class ObstacleLogsModule { }
