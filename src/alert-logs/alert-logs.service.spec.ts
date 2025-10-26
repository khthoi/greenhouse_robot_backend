import { Test, TestingModule } from '@nestjs/testing';
import { AlertLogsService } from './alert-logs.service';

describe('AlertLogsService', () => {
  let service: AlertLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertLogsService],
    }).compile();

    service = module.get<AlertLogsService>(AlertLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
