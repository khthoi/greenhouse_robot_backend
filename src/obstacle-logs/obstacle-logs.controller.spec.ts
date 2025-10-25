import { Test, TestingModule } from '@nestjs/testing';
import { ObstacleLogsController } from './obstacle-logs.controller';

describe('ObstacleLogsController', () => {
  let controller: ObstacleLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObstacleLogsController],
    }).compile();

    controller = module.get<ObstacleLogsController>(ObstacleLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
