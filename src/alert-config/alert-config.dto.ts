import { IsString, IsNumber, IsBoolean, IsOptional, IsInt } from 'class-validator';

export class CreateAlertConfigDto {
  @IsString()
  rfid_tag_id: number;

  @IsNumber()
  temp_threshold: number;

  @IsNumber()
  hum_threshold: number;

  @IsInt()
  violation_count: number;

  @IsBoolean()
  is_active: boolean;
}

export class UpdateAlertConfigDto {
  @IsOptional()
  @IsNumber()
  temp_threshold?: number;

  @IsOptional()
  @IsNumber()
  hum_threshold?: number;

  @IsOptional()
  @IsInt()
  violation_count?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}