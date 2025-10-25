import { Test, TestingModule } from '@nestjs/testing';
import { RobotStatusService } from './robot-status.service';

describe('RobotStatusService', () => {
  let service: RobotStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RobotStatusService],
    }).compile();

    service = module.get<RobotStatusService>(RobotStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
