import { Test, TestingModule } from '@nestjs/testing';
import { VoiceboxService } from './voicebox.service';

describe('VoiceboxService', () => {
  let service: VoiceboxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VoiceboxService],
    }).compile();

    service = module.get<VoiceboxService>(VoiceboxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
