import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RfidTag } from './entities/rfid-tags.entity';
import { CreateRfidTagDto } from './dtos/create-rfid-tags.dto';
import { UpdateRfidTagDto } from './dtos/update-rfid-tags.dto';

@Injectable()
export class RfidTagsService {
  constructor(
    @InjectRepository(RfidTag)
    private readonly rfidTagRepository: Repository<RfidTag>,
  ) { }

  // 🟢 Tạo mới thẻ RFID
  async create(createRfidTagDto: CreateRfidTagDto): Promise<RfidTag> {
    const rfidTag = this.rfidTagRepository.create(createRfidTagDto);
    return await this.rfidTagRepository.save(rfidTag);
  }

  // 🟡 Lấy danh sách tất cả thẻ RFID
  async findAll(): Promise<RfidTag[]> {
    return await this.rfidTagRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 15,
  ): Promise<{
    data: RfidTag[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.rfidTagRepository.findAndCount({
      order: { id: 'ASC' },
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

  async findOne(id: number): Promise<RfidTag> {
    const tag = await this.rfidTagRepository.findOne({ where: { id } });
    if (!tag) throw new NotFoundException(`RFID tag with ID ${id} not found`);
    return tag;
  }

  async findByUid(uid: string): Promise<RfidTag> {
    const tag = await this.rfidTagRepository.findOne({ where: { uid } });
    if (!tag) throw new NotFoundException(`RFID tag with UID ${uid} not found`);
    return tag;
  }


  // 🟠 Cập nhật thông tin thẻ RFID
  async update(id: number, updateDto: UpdateRfidTagDto): Promise<RfidTag> {
    const tag = await this.rfidTagRepository.preload({
      id,
      ...updateDto,
    });

    if (!tag) {
      throw new NotFoundException(`Không tìm thấy thẻ RFID có id = ${id}`);
    }

    return await this.rfidTagRepository.save(tag);
  }

  // 🔴 Xóa thẻ RFID
  async remove(id: number): Promise<void> {
    const result = await this.rfidTagRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy thẻ RFID có id = ${id}`);
    }
  }
}
