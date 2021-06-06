import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FragmentsetService } from 'src/core/services/fragmentset/fragmentset.service';
import { VoiceboxService } from 'src/core/services/voicebox/voicebox.service';
import { Fragment, FragmentDocument } from 'src/database/schemas/fragment.schema';
import { NotFoundException } from 'src/http/exceptions/not-found-exception';


@Controller('speech')
export class SpeechController {


	constructor(private voicebox: VoiceboxService, private fragmentSetService: FragmentsetService){

	}
	/**
	 * tts
	 */
	@Post('tts')
	async tts(@Body() postParams): Promise<any> {
		let message = postParams['text'] ?? '';
		let tts = await this.voicebox.tts(message);

		// console.log(tts);
		return {
			'link' : `/speech/set/${tts.fragmentSet.hash}.mp3`,
			'missing': tts.missing
		};
	}

	@Get('set/:hash\.:format')
	async download(@Param() params): Promise<any> {
		// Check if hash exists
		let fragmentSet = await this.fragmentSetService.byHash(params.hash ?? '');

		if(fragmentSet){
			let file = await this.voicebox.getAudio(fragmentSet, params.format);
		} else {
			// Throw not found exception
			throw new NotFoundException();
		}
	}

}

