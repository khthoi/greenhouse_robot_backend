import { Controller, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { CommandType } from '../commands/enums/commandtype';

@Controller('mqtt')
export class MqttController {
  constructor(private readonly mqttService: MqttService) {}

  @Post('obstacle/:id/action')
  async setObstacleAction(
    @Param('id', ParseIntPipe) id: number,
    @Body('action_taken') action_taken: CommandType,
  ) {
    await this.mqttService.setObstacleActionTaken(id, action_taken);
    return { message: `Action ${action_taken} set for obstacle log ${id}` };
  }
}