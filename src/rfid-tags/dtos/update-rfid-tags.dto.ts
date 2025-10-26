import { IsString, Length, IsOptional } from 'class-validator';

export class UpdateRfidTagDto {
  @IsString()
  @IsOptional()
  @Length(2, 50, { message: 'Tên vị trí phải có độ dài từ 2 đến 50 ký tự' })
  location_name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
