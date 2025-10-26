import { IsEnum, IsISO8601, IsNotEmpty } from 'class-validator';
import { CommandType } from './enums/commandtype';

export class CreateCommandDto {
  @IsEnum(CommandType, { message: 'Command phải là một trong các giá trị: TURN_LEFT, TURN_RIGHT, STOP, MANUAL, AUTO' })
  command: CommandType;

  @IsISO8601({ strict: true }, { message: 'timestamp phải có định dạng ISO8601, ví dụ: 2025-10-25T11:42:00' })
  @IsNotEmpty()
  timestamp: string;
}
