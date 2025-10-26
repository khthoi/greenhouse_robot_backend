import { IsString, IsNumber, IsISO8601, IsNotEmpty, Length } from 'class-validator';

export class CreateEnvironmentDataDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 20, { message: 'UID phải có độ dài từ 4 đến 20 ký tự' })
  uid: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Nhiệt độ phải là số, tối đa 2 chữ số thập phân' })
  @IsNotEmpty()
  temp: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Độ ẩm phải là số, tối đa 2 chữ số thập phân' })
  @IsNotEmpty()
  hum: number;

  @IsISO8601({ strict: true }, { message: 'timestamp phải có định dạng ISO8601, ví dụ: 2025-10-25T11:42:00' })
  @IsNotEmpty()
  timestamp: string;
}
