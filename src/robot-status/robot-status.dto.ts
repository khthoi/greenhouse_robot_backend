import { IsEnum, IsISO8601, IsNotEmpty, IsString } from 'class-validator';
import { StatusType } from './enums/status_enums';
import { RobotMode } from './enums/robot_mode_enums';

export class CreateRobotStatus {
    @IsEnum(StatusType, { message: 'Giá trị của Status không hợp lệ' })
    status: StatusType;

    @IsEnum(RobotMode, { message: 'Chế độ của robot phải thuộc 1 trong 2: MANUAL hoặc AUTO' })
    mode: RobotMode;

    @IsString()
    @IsNotEmpty({message: 'Thông báo phải được bao gồm'})
    message: string;

    @IsISO8601({ strict: true }, { message: 'timestamp phải có định dạng ISO8601, ví dụ: 2025-10-25T11:42:00' })
    @IsNotEmpty()
    timestamp: string;
}