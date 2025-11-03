import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, Query, DefaultValuePipe, Delete } from '@nestjs/common';
import { WorkPlanService } from './work-plan.service';
import { CreateWorkPlanDto, UpdateWorkPlanDto } from './work-plan.dto';
import { WorkPlanDetailDto } from './work-plan-details.dto';
import { WorkPlanMeasurementDto } from './work-plan-measurement-detail.dto';

@Controller('work-plans')
export class WorkPlanController {
  constructor(private readonly workPlanService: WorkPlanService) { }

  @Post()
  async create(@Body() dto: CreateWorkPlanDto) {
    return await this.workPlanService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
  ) {
    return this.workPlanService.findAllPaginated(page, limit);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWorkPlanDto) {
    return await this.workPlanService.update(id, dto);
  }

  @Get(':id/measurements')
  async getMeasurements(@Param('id', ParseIntPipe) id: number) {
    return await this.workPlanService.findMeasurementsByPlan(id);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.workPlanService.delete(id);
  }

  // API MỚI: Chi tiết kế hoạch + số lần đo hiện tại
  @Get('details/:id')
  async getDetail(@Param('id', ParseIntPipe) id: number): Promise<WorkPlanDetailDto> {
    return this.workPlanService.getDetail(id);
  }
  // API MỚI: Dữ liệu đo lường của tất cả kế hoạch (phân trang)
  @Get('measurements')
  async getAllMeasurements(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
  ) {
    return this.workPlanService.getAllMeasurementsPaginated(page, limit);
  }
}