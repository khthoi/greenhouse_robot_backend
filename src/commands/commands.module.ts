import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandsService } from './commands.service';
import { CommandsController } from './commands.controller';
import { Command } from './entities/commands.entity';
import { MqttModule } from 'src/mqtt/mqtt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Command]),
    forwardRef(() => MqttModule),
  ],
  providers: [CommandsService],
  controllers: [CommandsController],
  exports: [CommandsService]
})
export class CommandsModule { }
