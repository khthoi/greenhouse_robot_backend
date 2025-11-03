import { Test, TestingModule } from '@nestjs/testing';
import { ConnectRobotService } from './connect-robot.service';

describe('ConnectRobotService', () => {
  let service: ConnectRobotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectRobotService],
    }).compile();

    service = module.get<ConnectRobotService>(ConnectRobotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
