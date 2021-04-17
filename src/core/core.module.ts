import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { StorageService } from './services/storage/storage.service';
import { DefaultStrategy } from './services/voicebox/strategies/DefaultStrategy';
import { VoiceboxService } from './services/voicebox/voicebox.service';
import { FragmentsetService } from './services/fragmentset/fragmentset.service';
import { AudioService } from './services/audio/audio.service';

@Module({
	imports: [DatabaseModule],
  providers: [StorageService, VoiceboxService, DefaultStrategy, FragmentsetService, AudioService],
  exports: [StorageService, VoiceboxService, FragmentsetService, AudioService]
})
export class CoreModule {}
