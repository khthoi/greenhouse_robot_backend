import { Test, TestingModule } from '@nestjs/testing';
import { EnvironmentDataController } from './environment-data.controller';

describe('EnvironmentDataController', () => {
  let controller: EnvironmentDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnvironmentDataController],
    }).compile();

    controller = module.get<EnvironmentDataController>(EnvironmentDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
