import { Module } from '@nestjs/common';
import { RfidTagsService } from './rfid-tags.service';
import { RfidTagsController } from './rfid-tags.controller';
import { RfidTag } from './entities/rfid-tags.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([RfidTag])],
  providers: [RfidTagsService],
  controllers: [RfidTagsController],
  exports: [RfidTagsService]
})
export class RfidTagsModule { }
