import { Test, TestingModule } from '@nestjs/testing';
import { SpeechController } from './speech.controller';

describe('SpeechController', () => {
  let controller: SpeechController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpeechController],
    }).compile();

    controller = module.get<SpeechController>(SpeechController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
