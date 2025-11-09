import { Controller, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { CommandType } from '../commands/enums/commandtype';
import { WorkPlanService } from 'src/work-plan/work-plan.service';

@Controller('mqtt')
export class MqttController {
  constructor(
    private readonly mqttService: MqttService,
    private readonly workPlanService: WorkPlanService,) { }

  @Post('obstacle/:id/action')
  async setObstacleAction(
    @Param('id', ParseIntPipe) id: number,
    @Body('action_taken') action_taken: CommandType,
  ) {
    await this.mqttService.setObstacleActionTaken(id, action_taken);
    return { message: `Action ${action_taken} set for obstacle log ${id}` };
  }

  @Post('publish/work-plan/:id')
  async publishWorkPlan(@Param('id', ParseIntPipe) id: number) {
    // Lấy thông tin WorkPlan từ DB qua service
    const plan = await this.workPlanService.findOne(id);

    if (!plan) {
      return { message: `Work plan with ID ${id} not found` };
    }

    // Gọi sang MQTT Service để publish
    await this.mqttService.publishWorkPlan(plan);

    return { message: `Work plan ${id} published successfully.` };
  }
}