import { Test, TestingModule } from '@nestjs/testing';
import { EnvironmentDataService } from './environment-data.service';

describe('EnvironmentDataService', () => {
  let service: EnvironmentDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnvironmentDataService],
    }).compile();

    service = module.get<EnvironmentDataService>(EnvironmentDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
