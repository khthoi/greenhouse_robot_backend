// src/work-plan/dto/work-plan-measurement.dto.ts
import { IsInt, IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { WorkPlanStatus } from './enums/work-plan-status';

export class RfidTagInfoDto {
  @IsInt()
  rfid_tag_id: number;

  @IsString()
  uid: string;

  @IsString()
  location_name: string;
}

export class MeasurementDetailDto {
  @IsInt()
  measurement_number: number;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  humidity?: number;

  @IsString()
  timestamp: string;

  @IsString()
  created_at: string;
}

export class WorkPlanMeasurementItemDto {
  rfid_tag: RfidTagInfoDto;
  measurement_frequency: number;
  measurements: MeasurementDetailDto[];
}

export class WorkPlanMeasurementDto {
  @IsInt()
  work_plan_id: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(WorkPlanStatus)
  status: WorkPlanStatus;

  @IsNumber()
  progress: number;

  @IsNumber()
  temp_threshold: number;

  @IsNumber()
  hum_threshold: number;

  @IsInt()
  violation_count: number;

  items: WorkPlanMeasurementItemDto[];
}