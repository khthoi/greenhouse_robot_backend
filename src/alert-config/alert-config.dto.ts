import { IsNumber, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateAlertConfigDto {
  @IsInt()
  rfid_tag_id: number;

  @IsNumber()
  @Min(0)
  temp_threshold: number;

  @IsNumber()
  @Min(0)
  hum_threshold: number;

  @IsInt()
  @Min(1)
  violation_count: number;

  @IsBoolean()
  is_active: boolean;
}

export class UpdateAlertConfigDto {
  @IsNumber()
  @Min(0)
  temp_threshold?: number;

  @IsNumber()
  @Min(0)
  hum_threshold?: number;

  @IsInt()
  @Min(1)
  violation_count?: number;

  @IsBoolean()
  is_active?: boolean;
}