import { IsString, IsNumber, IsISO8601, IsNotEmpty, IsEnum } from 'class-validator';
import { CommandType } from 'src/commands/enums/commandtype';

export class CreateObstacleLogDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  center_dist: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  left_dist: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  right_dist: number;

  @IsEnum(CommandType, { message: 'suggestion phải thuộc 1 lệnh hợp lệ' })
  @IsNotEmpty()
  suggestion: CommandType;

  @IsEnum(CommandType, { message: 'action_taken phải thuộc 1 lệnh hợp lệ' })
  @IsNotEmpty()
  action_taken: CommandType;
}
