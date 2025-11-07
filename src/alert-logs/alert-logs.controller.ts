import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { AlertLogResponseDto, AlertLogTreeDto } from './alert-logs-response.dto';
import { AlertLogService } from './alert-logs.service';

@Controller('alert-logs')
export class AlertLogsController {
  constructor(private readonly alertLogsService: AlertLogService) { }

  // alert-logs.controller.ts
  @Get()
  async getAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
  ): Promise<{
    data: AlertLogTreeDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.alertLogsService.getAllGroupedByPlanPaginated(page, limit);
  }
}