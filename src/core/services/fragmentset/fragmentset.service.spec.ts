import { Test, TestingModule } from '@nestjs/testing';
import { FragmentsetService } from './fragmentset.service';

describe('FragmentsetService', () => {
  let service: FragmentsetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FragmentsetService],
    }).compile();

    service = module.get<FragmentsetService>(FragmentsetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
