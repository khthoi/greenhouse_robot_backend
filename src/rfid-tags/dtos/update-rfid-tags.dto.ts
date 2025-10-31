import { IsString, Length, IsOptional, IsNumber } from 'class-validator';

export class UpdateRfidTagDto {

  @IsString()
  @IsOptional()
  @Length(4, 20, { message: 'UID phải có độ dài từ 4 đến 20 ký tự' })
  uid?: string;

  @IsString()
  @IsOptional()
  @Length(2, 50, { message: 'Tên vị trí phải có độ dài từ 2 đến 50 ký tự' })
  location_name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  reference_temperature?: number;

  @IsNumber()
  @IsOptional()
  reference_humidity?: number;

}
