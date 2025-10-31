import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { AlertLogResponseDto } from './alert-logs-response.dto';
import { AlertLogService } from './alert-logs.service';

@Controller('alert-logs')
export class AlertLogsController {
  constructor(private readonly alertLogsService: AlertLogService) { }

  @Get()
  async getAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
  ): Promise<{
    data: AlertLogResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.alertLogsService.getAllGroupedByPlanAndTagPaginated(page, limit);
  }
}