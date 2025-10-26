import { Test, TestingModule } from '@nestjs/testing';
import { WorkPlanController } from './work-plan.controller';

describe('WorkPlanController', () => {
  let controller: WorkPlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkPlanController],
    }).compile();

    controller = module.get<WorkPlanController>(WorkPlanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
