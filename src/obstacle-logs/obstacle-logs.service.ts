import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObstacleLog } from './entities/obstacle-logs.entity';
import { CreateObstacleLogDto } from './obstacle-logs.dto';

@Injectable()
export class ObstacleLogsService {
  async save(entity: ObstacleLog) {
    return this.obstacleLogRepository.save(entity);
  }

  constructor(
    @InjectRepository(ObstacleLog)
    private readonly obstacleLogRepository: Repository<ObstacleLog>,
  ) { }

  // 🟩 Tạo mới log chướng ngại vật
  async create(createObstacleLogDto: CreateObstacleLogDto): Promise<ObstacleLog> {
    const newLog = this.obstacleLogRepository.create({
      center_distance: createObstacleLogDto.center_dist,
      left_distance: createObstacleLogDto.left_dist,
      right_distance: createObstacleLogDto.right_dist,
      suggestion: createObstacleLogDto.suggestion,
      action_taken: createObstacleLogDto.action_taken, // ✅ lấy từ request
    });

    return await this.obstacleLogRepository.save(newLog);
  }

  // 🟦 Lấy toàn bộ log
  async findAll(): Promise<ObstacleLog[]> {
    return await this.obstacleLogRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 15
  ): Promise<{
    data: ObstacleLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.obstacleLogRepository.findAndCount({
      order: { id: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }


  // 🟨 Lấy 1 log theo id
  async findOne(id: number): Promise<ObstacleLog> {
    const log = await this.obstacleLogRepository.findOne({ where: { id } });
    if (!log) throw new NotFoundException(`Không tìm thấy log với id ${id}`);
    return log;
  }

  // 🟧 Cập nhật log
  async update(id: number, updateData: Partial<CreateObstacleLogDto>): Promise<ObstacleLog> {
    const log = await this.findOne(id);

    if (updateData.center_dist !== undefined) log.center_distance = updateData.center_dist;
    if (updateData.left_dist !== undefined) log.left_distance = updateData.left_dist;
    if (updateData.right_dist !== undefined) log.right_distance = updateData.right_dist;
    if (updateData.suggestion !== undefined) log.suggestion = updateData.suggestion;

    return await this.obstacleLogRepository.save(log);
  }

  // 🟥 Xóa log
  async remove(id: number): Promise<void> {
    const log = await this.findOne(id);
    await this.obstacleLogRepository.remove(log);
  }
}
