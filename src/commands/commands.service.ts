import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Command } from './entities/commands.entity';
import { CreateCommandDto } from './commands.dto';

@Injectable()
export class CommandsService {
  constructor(
    @InjectRepository(Command)
    private readonly commandRepo: Repository<Command>,
  ) {}

  /**
   * 🟢 Tạo mới một lệnh điều khiển robot
   */
  async create(dto: CreateCommandDto): Promise<Command> {
    const newCommand = this.commandRepo.create({
      command: dto.command,
      timestamp: new Date(dto.timestamp),
    });
    return await this.commandRepo.save(newCommand); 
  }

  /**
   * 🟢 Lấy toàn bộ danh sách lệnh
   */
  async findAll(): Promise<Command[]> {
    return await this.commandRepo.find({
      order: { id: 'DESC' },
    });
  }

  /**
   * 🟢 Lấy chi tiết 1 lệnh theo ID
   */
  async findOne(id: number): Promise<Command> {
    const command = await this.commandRepo.findOne({ where: { id } });
    if (!command) {
      throw new NotFoundException(`Không tìm thấy lệnh điều khiển với ID ${id}`);
    }
    return command;
  }

  /**
   * 🟢 Cập nhật thông tin lệnh
   */
  async update(id: number, partial: Partial<Command>): Promise<Command> {
    const command = await this.commandRepo.findOne({ where: { id } });
    if (!command) {
      throw new NotFoundException(`Không tìm thấy lệnh điều khiển với ID ${id}`);
    }

    Object.assign(command, partial);
    return await this.commandRepo.save(command);
  }

  /**
   * 🟢 Xóa lệnh theo ID
   */
  async remove(id: number): Promise<void> {
    const result = await this.commandRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy lệnh điều khiển với ID ${id}`);
    }
  }
}
