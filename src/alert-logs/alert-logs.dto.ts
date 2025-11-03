import { IsEnum, IsNumber, IsString, IsDateString, IsInt } from 'class-validator';
import { AlertType } from './enums/AlertType';

export class CreateAlertLogDto {
  @IsInt()
  rfid_tag_id: number;

  @IsNumber()
  work_plan_id: number;

  @IsEnum(AlertType)
  alert_type: AlertType;

  @IsNumber()
  measured_value: number;

  @IsInt()
  measurement_number: number;

  @IsNumber()
  reference_value: number;

  @IsNumber()
  threshold: number;

  @IsString()
  message: string;
}