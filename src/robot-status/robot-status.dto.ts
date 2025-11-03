import { IsEnum, IsISO8601, IsNotEmpty, IsString } from 'class-validator';
import { StatusType } from './enums/status_enums';
import { RobotMode } from './enums/robot_mode_enums';

export class CreateRobotStatus {
    @IsEnum(StatusType, { message: 'Giá trị của Status không hợp lệ' })
    status: StatusType;

    @IsEnum(RobotMode, { message: 'Chế độ của robot phải thuộc 1 trong 2: MANUAL hoặc AUTO' })
    mode: RobotMode;

    @IsString()
    @IsNotEmpty({ message: 'Thông báo phải được bao gồm' })
    message: string;
}