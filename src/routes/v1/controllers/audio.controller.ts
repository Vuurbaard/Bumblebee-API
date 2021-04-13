import { Request, Response } from 'express';
import audioService from '../../../services/audio/audio.service';
import fragmentService from '../../../services/fragment.service';
import LogService from '../../../services/log.service';

export class AudioController {

	constructor() { }

	async download(req: Request, res: Response) {

		const url: string = req.body.url;
		const userId = req.user!._id;

		LogService.info('Received request to download: ', url);

		try {
			const source = await audioService.download(url, userId);
			LogService.info('Finished downloading audio file: ', source);

			const fragments = await fragmentService.all({ 'source': source._id });

			res.json({
				url: audioService.sourceUrl(source),
				sourceId: source._id,
				fragments: fragments
			});
		}
		catch (err) {
			LogService.fatal('Failed to download audio file.', err);
			res.status(500).json({ "message": "Something went wrong downloading the audio." });
		}
	}
}