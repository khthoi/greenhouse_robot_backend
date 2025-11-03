import { Test, TestingModule } from '@nestjs/testing';
import { ConnectRobotController } from './connect-robot.controller';

describe('ConnectRobotController', () => {
  let controller: ConnectRobotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectRobotController],
    }).compile();

    controller = module.get<ConnectRobotController>(ConnectRobotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
