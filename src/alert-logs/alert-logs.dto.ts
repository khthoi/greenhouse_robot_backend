import { IsEnum, IsNumber, IsString, IsDateString, IsInt } from 'class-validator';
import { AlertType } from './enums/AlertType';

export class CreateAlertLogDto {
  @IsInt()
  rfid_tag_id: number;

  @IsEnum(AlertType)
  alert_type: AlertType;

  @IsNumber()
  measured_value: number;

  @IsNumber()
  reference_value: number;

  @IsNumber()
  threshold: number;

  @IsString()
  message: string;

  @IsDateString()
  timestamp: string;
}