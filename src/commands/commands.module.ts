import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandsService } from './commands.service';
import { CommandsController } from './commands.controller';
import { Command } from './entities/commands.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Command])], 
  providers: [CommandsService],
  controllers: [CommandsController],
})
export class CommandsModule {}
