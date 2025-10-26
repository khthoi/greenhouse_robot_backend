import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { RobotStatus } from './entities/robot-status.entity';
import { CreateRobotStatus } from './robot-status.dto';
import { StatusType } from './enums/status_enums';
import { RobotMode } from './enums/robot_mode_enums';
import { CommandType } from 'src/commands/enums/commandtype';

@Injectable()
export class RobotStatusService {
  constructor(
    @InjectRepository(RobotStatus)
    private readonly robotStatusRepository: Repository<RobotStatus>,
  ) { }

  // 🟢 Tạo bản ghi trạng thái mới
  async create(dto: CreateRobotStatus): Promise<RobotStatus> {
    const newStatus = this.robotStatusRepository.create({
      status: dto.status,
      command_excuted: dto.command_excuted,
      mode: dto.mode,
      message: dto.message,
      timestamp: new Date(dto.timestamp),
    });
    return await this.robotStatusRepository.save(newStatus);
  }

  // 🟡 Lấy tất cả trạng thái robot
  async findAll(): Promise<RobotStatus[]> {
    return await this.robotStatusRepository.find({
      order: { id: 'DESC' },
    });
  }

  // 🟣 Lấy 1 bản ghi trạng thái cụ thể
  async findOne(id: number): Promise<RobotStatus> {
    const status = await this.robotStatusRepository.findOne({ where: { id } });
    if (!status) {
      throw new NotFoundException(`Không tìm thấy trạng thái robot có id = ${id}`);
    }
    return status;
  }

  // 🔍 Tìm theo RobotMode (AUTO hoặc MANUAL)
  async findByMode(mode: RobotMode): Promise<RobotStatus[]> {
    const records = await this.robotStatusRepository.find({
      where: { mode },
      order: { timestamp: 'DESC' },
    });

    if (records.length === 0) {
      throw new NotFoundException(`Không tìm thấy trạng thái nào với mode = ${mode}`);
    }

    return records;
  }

  // 🔍 Tìm theo StatusType (OK, ERROR, WARNING, v.v.)
  async findByStatusType(status: StatusType): Promise<RobotStatus[]> {
    const records = await this.robotStatusRepository.find({
      where: { status: status },
      order: { timestamp: 'DESC' },
    });

    if (records.length === 0) {
      throw new NotFoundException(`Không tìm thấy trạng thái nào với status = ${status}`);
    }

    return records;
  }


  // 🟠 Cập nhật trạng thái robot
  async update(id: number, dto: Partial<CreateRobotStatus>): Promise<RobotStatus> {
    const status = await this.robotStatusRepository.findOne({ where: { id } });
    if (!status) {
      throw new NotFoundException(`Không tìm thấy trạng thái robot có id = ${id}`);
    }

    // Cập nhật các trường được truyền trong DTO
    if (dto.status) status.status = dto.status as StatusType;
    if (dto.mode) status.mode = dto.mode as RobotMode;
    if (dto.message) status.message = dto.message;
    if (dto.timestamp) status.timestamp = new Date(dto.timestamp);

    return await this.robotStatusRepository.save(status);
  }

  // 🔴 Xóa 1 bản ghi trạng thái
  async remove(id: number): Promise<void> {
    const result = await this.robotStatusRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy trạng thái robot có id = ${id}`);
    }
  }

  // 🟤 Lấy bản ghi mới nhất
  async findLatest(): Promise<RobotStatus | null> {
    const latest = await this.robotStatusRepository.find({
      order: { timestamp: 'DESC' },
      take: 1, // chỉ lấy 1 bản ghi mới nhất
    });

    return latest.length > 0 ? latest[0] : null;
  }

  // robot-status.service.ts
  async findHistory(hours: number) {
    const fromDate = new Date();
    fromDate.setHours(fromDate.getHours() - hours);
    return await this.robotStatusRepository.find({
      where: { timestamp: MoreThanOrEqual(fromDate) },
      order: { timestamp: 'DESC' },
    });
  }
}
