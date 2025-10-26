import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertConfig } from './entities/alert-config.entity';
import { AlertConfigService } from './alert-config.service';
import { AlertConfigController } from './alert-config.controller';
import { RfidTagsModule } from '../rfid-tags/rfid-tags.module';

@Module({
  imports: [TypeOrmModule.forFeature([AlertConfig]), RfidTagsModule],
  providers: [AlertConfigService],
  controllers: [AlertConfigController],
  exports: [AlertConfigService],
})
export class AlertConfigModule {}