import { Test, TestingModule } from '@nestjs/testing';
import { WorkPlanService } from './work-plan.service';

describe('WorkPlanService', () => {
  let service: WorkPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkPlanService],
    }).compile();

    service = module.get<WorkPlanService>(WorkPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
