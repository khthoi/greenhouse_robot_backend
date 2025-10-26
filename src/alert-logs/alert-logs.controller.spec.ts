import { Test, TestingModule } from '@nestjs/testing';
import { AlertLogsController } from './alert-logs.controller';

describe('AlertLogsController', () => {
  let controller: AlertLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertLogsController],
    }).compile();

    controller = module.get<AlertLogsController>(AlertLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
