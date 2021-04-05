import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { StorageService } from './services/storage/storage.service';
import { VoiceboxService } from './services/voicebox/voicebox.service';

@Module({
	imports: [DatabaseModule],
  providers: [StorageService, VoiceboxService],
  exports: [StorageService, VoiceboxService]
})
export class CoreModule {}
