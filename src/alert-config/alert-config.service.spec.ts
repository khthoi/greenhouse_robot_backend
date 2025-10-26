import { Test, TestingModule } from '@nestjs/testing';
import { AlertConfigService } from './alert-config.service';

describe('AlertConfigService', () => {
  let service: AlertConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertConfigService],
    }).compile();

    service = module.get<AlertConfigService>(AlertConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
