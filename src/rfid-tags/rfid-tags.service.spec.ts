import { Test, TestingModule } from '@nestjs/testing';
import { RfidTagsService } from './rfid-tags.service';

describe('RfidTagsService', () => {
  let service: RfidTagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RfidTagsService],
    }).compile();

    service = module.get<RfidTagsService>(RfidTagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
