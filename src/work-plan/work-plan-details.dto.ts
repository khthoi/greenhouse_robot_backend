// src/work-plan/dto/work-plan-detail.dto.ts
import { IsString, IsInt, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { WorkPlanStatus } from './enums/work-plan-status';

export class WorkPlanItemDetailDto {
    @IsInt()
    rfid_tag_id: number;

    @IsString()
    uid: string;

    @IsString()
    location_name: string;

    @IsInt()
    measurement_frequency: number;

    @IsInt()
    current_measurements: number;

    @IsOptional()
    @IsNumber()
    latest_temperature?: number;

    @IsOptional()
    @IsNumber()
    latest_humidity?: number;

    @IsOptional()
    @IsString()
    latest_created_at?: string;
}

export class WorkPlanDetailDto {
    @IsInt()
    id: number;

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
    violation_count_limit: number;

    @IsString()
    created_at: string;

    items: WorkPlanItemDetailDto[];
}