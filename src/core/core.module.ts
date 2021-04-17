import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { StorageService } from './services/storage/storage.service';
import { DefaultStrategy } from './services/voicebox/strategies/DefaultStrategy';
import { VoiceboxService } from './services/voicebox/voicebox.service';

@Module({
	imports: [DatabaseModule],
  providers: [StorageService, VoiceboxService, DefaultStrategy],
  exports: [StorageService, VoiceboxService]
})
export class CoreModule {}
