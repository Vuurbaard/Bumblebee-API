import { Request, Response } from 'express';
import audioService from '../../../services/audio/audio.service';
import fragmentService from '../../../services/fragment.service';

export class AudioController {

	constructor() { }

	async download(req: Request, res: Response) {

		let url: string = req.body.url;
		let userId = req.user!._id;

		console.log('wanting to download:', url);

		try {
			let source = await audioService.download(url, userId);
			console.log('done downloading audio file:', source);

			let fragments = await fragmentService.all({ 'source': source._id });
			
			res.json({
				url: audioService.sourceUrl(source),
				sourceId: source._id,
				fragments: fragments
			});
		}
		catch (err) {
			debugger;
			res.status(500).json({ "message": "Something went wrong downloading the audio." });
		}
	}
}