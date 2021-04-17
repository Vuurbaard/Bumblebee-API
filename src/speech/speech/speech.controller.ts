import { Body, Controller, Get, Post } from '@nestjs/common';
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
	async tts(@Body() postParams): Promise<string> {
		let message = postParams['text'] ?? '';
		await this.voicebox.tts(message);

		return 'ok';
	}

}
