import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { WorkPlanService } from './work-plan.service';
import { CreateWorkPlanDto, UpdateWorkPlanDto } from './work-plan.dto';

@Controller('work-plans')
export class WorkPlanController {
  constructor(private readonly workPlanService: WorkPlanService) { }

  @Post()
  async create(@Body() dto: CreateWorkPlanDto) {
    return await this.workPlanService.create(dto);
  }

  @Get()
  async findAll() {
    return await this.workPlanService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.workPlanService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWorkPlanDto) {
    return await this.workPlanService.update(id, dto);
  }

  @Get(':id/measurements')
  async getMeasurements(@Param('id', ParseIntPipe) id: number) {
    return await this.workPlanService.findMeasurementsByPlan(id);
  }
}