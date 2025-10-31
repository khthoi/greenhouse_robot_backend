import { IsString, IsNotEmpty, Length, IsOptional, IsNumber } from 'class-validator';

export class CreateRfidTagDto {
  @IsString()
  @IsNotEmpty({ message: 'UID không được để trống' })
  @Length(4, 20, { message: 'UID phải có độ dài từ 4 đến 20 ký tự' })
  uid: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên vị trí không được để trống' })
  @Length(2, 50, { message: 'Tên vị trí phải có độ dài từ 2 đến 50 ký tự' })
  location_name: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Nhiệt độ tham chiếu không được để trống' })
  reference_temperature: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Độ ẩm tham chiếu không được để trống' })
  reference_humidity: number;

  @IsString()
  @IsOptional()
  description?: string;
}
