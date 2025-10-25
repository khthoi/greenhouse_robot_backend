import { Test, TestingModule } from '@nestjs/testing';
import { RfidTagsController } from './rfid-tags.controller';

describe('RfidTagsController', () => {
  let controller: RfidTagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RfidTagsController],
    }).compile();

    controller = module.get<RfidTagsController>(RfidTagsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
