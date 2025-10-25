import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommandsModule } from './commands/commands.module';
import { EnvironmentDataModule } from './environment-data/environment-data.module';
import { ObstacleLogsModule } from './obstacle-logs/obstacle-logs.module';
import { RfidTagsModule } from './rfid-tags/rfid-tags.module';
import { RobotStatusModule } from './robot-status/robot-status.module';

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
    EnvironmentDataModule,
    ObstacleLogsModule,
    RfidTagsModule,
    RobotStatusModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
