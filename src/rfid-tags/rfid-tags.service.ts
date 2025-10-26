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
      relations: ['environmentData'], // load quan hệ để xem dữ liệu cảm biến tại vị trí này
    });
  }

  // 🟣 Lấy thông tin một thẻ RFID theo id
  async findOne(id: number): Promise<RfidTag> {
    const tag = await this.rfidTagRepository.findOne({
      where: { id },
      relations: ['environmentData'],
    });

    if (!tag) {
      throw new NotFoundException(`Không tìm thấy thẻ RFID có id = ${id}`);
    }

    return tag;
  }

  // 🟢 Tìm thẻ RFID theo UID
  async findByUid(uid: string): Promise<RfidTag> {
    const tag = await this.rfidTagRepository.findOne({
      where: { uid },
      relations: ['environmentData'],
    });

    if (!tag) {
      throw new NotFoundException(`Không tìm thấy thẻ RFID có UID = ${uid}`);
    }

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

  async findWithLatestData() {
    return await this.rfidTagRepository.find({
      relations: ['environmentData'],
      loadEagerRelations: false,
      select: {
        id: true,
        uid: true,
        location_name: true,
        environmentData: { id: true, temperature: true, humidity: true, timestamp: true },
      },
      order: { environmentData: { timestamp: 'DESC' } },
      take: 1,
    });
  }
}
