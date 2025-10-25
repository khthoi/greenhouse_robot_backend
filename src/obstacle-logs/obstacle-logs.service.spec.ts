import { Test, TestingModule } from '@nestjs/testing';
import { ObstacleLogsService } from './obstacle-logs.service';

describe('ObstacleLogsService', () => {
  let service: ObstacleLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObstacleLogsService],
    }).compile();

    service = module.get<ObstacleLogsService>(ObstacleLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
