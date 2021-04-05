import { Module } from '@nestjs/common';
import { CoreModule } from 'src/core/core.module';
import { DatabaseModule } from 'src/database/database.module';
import { SpeechController } from './speech/speech.controller';

@Module({
	
  imports: [DatabaseModule, CoreModule],
  controllers: [SpeechController]
})
export class SpeechModule {}
