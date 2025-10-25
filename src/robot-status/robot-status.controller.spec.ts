import { Test, TestingModule } from '@nestjs/testing';
import { RobotStatusController } from './robot-status.controller';

describe('RobotStatusController', () => {
  let controller: RobotStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RobotStatusController],
    }).compile();

    controller = module.get<RobotStatusController>(RobotStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
