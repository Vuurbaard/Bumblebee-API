import { Controller, Get, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VoiceboxService } from 'src/core/services/voicebox/voicebox.service';
import { Fragment, FragmentDocument } from 'src/database/schemas/fragment.schema';


@Controller('speech')
export class SpeechController {


	constructor(@InjectModel(Fragment.name) private fragmentModel: Model<FragmentDocument>, private voicebox: VoiceboxService){

	}
	/**
	 * tts
	 */
	@Post('tts')
	async tts(): Promise<string> {
		await this.voicebox.tts('ik ga konijnen schieten met mijn vijf pizza tafel drie nu ophalen please let this work');

		return 'ok';
	}

}
