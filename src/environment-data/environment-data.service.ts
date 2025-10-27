import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnvironmentData } from './entities/environment-data.entity';
import { CreateEnvironmentDataDto } from './environment-data.dto';
import { RfidTag } from 'src/rfid-tags/entities/rfid-tags.entity';

@Injectable()
export class EnvironmentDataService {
  constructor(
    @InjectRepository(EnvironmentData)
    private readonly envDataRepo: Repository<EnvironmentData>,

    @InjectRepository(RfidTag)
    private readonly rfidRepo: Repository<RfidTag>,
  ) { }

  /**
   * Tạo mới bản ghi dữ liệu môi trường (nhiệt độ, độ ẩm, vị trí RFID)
   */
  async create(dto: CreateEnvironmentDataDto): Promise<EnvironmentData> {
    // Tìm thẻ RFID theo UID
    const tag = await this.rfidRepo.findOne({ where: { uid: dto.uid } });
    if (!tag) {
      throw new NotFoundException(`Không tìm thấy thẻ RFID với UID: ${dto.uid}`);
    }

    // Tạo đối tượng EnvironmentData mới
    const newData = this.envDataRepo.create({
      rfid_tag_id: tag.id.toString(),
      temperature: dto.temp,
      humidity: dto.hum,
      timestamp: new Date(dto.timestamp),
    });

    return await this.envDataRepo.save(newData);
  }

  /**
   * Lấy tất cả dữ liệu môi trường
   */
  async findAll(): Promise<EnvironmentData[]> {
    return await this.envDataRepo.find({
      relations: ['rfid_tag'],
      order: { id: 'DESC' },
    });
  }

  /**
   * Lấy dữ liệu theo ID
   */
  async findOne(id: number): Promise<EnvironmentData> {
    const data = await this.envDataRepo.findOne({
      where: { id },
      relations: ['rfid_tag'],
    });

    if (!data) {
      throw new NotFoundException(`Không tìm thấy dữ liệu môi trường với ID ${id}`);
    }

    return data;
  }

  /**
   * Lấy danh sách dữ liệu môi trường theo RFID Tag ID
   */
  async findByRfidTagId(rfid_tag_id: string): Promise<EnvironmentData[]> {
    const dataList = await this.envDataRepo.find({
      where: { rfid_tag_id },
      relations: ['rfid_tag'],
      order: { id: 'DESC' },
    });

    if (!dataList || dataList.length === 0) {
      throw new NotFoundException(`Không có dữ liệu môi trường nào với RFID Tag ID ${rfid_tag_id}`);
    }

    return dataList;
  }

  /**
   * Cập nhật dữ liệu môi trường
   */
  async update(id: number, partial: Partial<EnvironmentData>): Promise<EnvironmentData> {
    const data = await this.envDataRepo.findOne({ where: { id } });
    if (!data) {
      throw new NotFoundException(`Không tìm thấy dữ liệu môi trường với ID ${id}`);
    }

    Object.assign(data, partial);
    return await this.envDataRepo.save(data);
  }

  /**
   * Xóa bản ghi dữ liệu môi trường
   */
  async remove(id: number): Promise<void> {
    const result = await this.envDataRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy dữ liệu môi trường với ID ${id}`);
    }
  }
}
