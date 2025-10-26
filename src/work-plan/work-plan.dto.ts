import { IsInt, IsString, IsNumber, IsOptional, IsEnum, Min, IsArray } from 'class-validator';
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
  items: CreateWorkPlanItemDto[];
}

export class UpdateWorkPlanDto {
  @IsOptional()
  @IsEnum(WorkPlanStatus)
  status?: WorkPlanStatus;

  @IsOptional()
  @IsNumber()
  progress?: number;
}