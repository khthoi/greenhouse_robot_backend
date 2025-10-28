import { IsInt, IsString, IsNumber, IsOptional, IsEnum, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkPlanStatus } from './enums/work-plan-status';

export class CreateWorkPlanItemDto {
  @IsInt()
  rfid_tag_id: number;

  @IsInt()
  @Min(1)
  measurement_frequency: number;
}

export class CreateWorkPlanDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkPlanItemDto)
  items: CreateWorkPlanItemDto[];

  // Cấu hình cảnh báo cho toàn bộ kế hoạch
  @IsNumber()
  temp_threshold: number = 5.0;

  @IsNumber()
  hum_threshold: number = 10.0;

  @IsInt()
  @Min(1)
  violation_count: number = 3;
}

export class UpdateWorkPlanDto {
  @IsOptional()
  @IsEnum(WorkPlanStatus)
  status?: WorkPlanStatus;

  @IsOptional()
  @IsNumber()
  progress?: number;
}
