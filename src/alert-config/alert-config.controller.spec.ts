import { Test, TestingModule } from '@nestjs/testing';
import { AlertConfigController } from './alert-config.controller';

describe('AlertConfigController', () => {
  let controller: AlertConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertConfigController],
    }).compile();

    controller = module.get<AlertConfigController>(AlertConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
