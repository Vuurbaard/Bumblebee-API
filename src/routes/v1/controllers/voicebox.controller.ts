import { Request, Response } from 'express';
import voiceboxService from '../../../services/voicebox.service';
import LogService from '../../../services/log.service';

var request = require('request');
import fs from 'fs';

export class VoiceBoxController {

	constructor() { }

	async tts(req: Request, res: Response) {

		try {
			if (req.query.origin == "slack") {

				let tts = await voiceboxService.tts(req.body.text) as any;

				res.status(200);

				var formData = {
					file: fs.createReadStream(tts.filepath),
					channels: req.body.channel_id
				};
				request.post({ url: "https://slack.com/api/files.upload?token=xoxp-373381421525-374134851238-425422950628-403c1a73f2e98418f74e1264e5e361b4&title=" + req.body.text, formData: formData }, function optionalCallback(err: any, httpResponse: any, body: any) {
					if (err) {
						return LogService.fatal(err.message);
					}
					
					LogService.info('Upload successful! Server responded with:', body);
				});
			}
			else {
				let tts = await voiceboxService.tts(req.body.text) as any;
				delete tts.filepath;
				res.json(tts);
			}
		}
		catch (err) {
			LogService.fatal(err.message);
			res.status(500).json({ "message": "Something went wrong with converting text to speech." });
		}
	}
}