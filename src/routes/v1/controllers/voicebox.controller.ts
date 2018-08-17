import { Request, Response } from 'express';
import voiceboxService from '../../../services/voicebox.service';

export class VoiceBoxController {

	constructor() { }

	async tts(req: Request, res: Response) {
		try {
			res.json(await voiceboxService.tts(req.body.text));
		}
		catch(err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong with converting text to speech." });
		}
	}
}