import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ytdl, { videoInfo } from 'ytdl-core';
import { ISource, Source } from '../../database/schemas';
import { ISourceProvider } from './ISourceProvider';
import LogService from '../log.service';

class YouTubeService implements ISourceProvider {

	private extension = ".mp3";

	public constructor() {
		const filepath = path.resolve(__dirname, '../..' + this.basepath());

		fs.mkdirSync(filepath, { recursive : true });
	}

	public basepath(resolve : boolean = false): string {
		return resolve ? path.resolve(__dirname, '../..' + this.basepath()) : "/audio/youtube/";
	};

	public sourceUrl(source: ISource) {
		return '/v1' + this.basepath() + source.id.toString() + this.extension;
	}

	public async info(url : string): Promise<videoInfo>{
		return ytdl.getInfo(url);	
	}

	public async download(url: string, userId?: string): Promise<ISource> {
		const vm = this;
		userId = userId ? userId : '';

		const id = this.identifier(url);
		
		return new Promise(async (resolve, reject) => {
			const filepath = await vm.downloadYouTube(id);

			// Check if we already have a source file
			let source = await vm.source(id);

			if(!source || (source && source.name == '')){
				LogService.info('Retrieving info about ', id, ' from youtube');
				let info = await vm.info(id);
				source = new Source({ id: id, name: info.videoDetails.title, origin: 'YouTube', createdBy: userId });
				await source.save();
			}

			resolve(source);
		});
	}

	private async downloadYouTube(id: string): Promise<string>{
		const vm = this;
		const filename = id + this.extension;
		const filepath = path.resolve(__dirname, '../..' + this.basepath() + filename);
		let yturl = "https://www.youtube.com/watch?v=" + id;
		LogService.info('Download of youtube video', id, 'requested...');

		return new Promise((resolve, reject) => {
			ffmpeg()
				.input(ytdl(yturl, {'quality' : 'highestaudio'}))
				.noVideo()
				.audioFrequency(44100)
				.save(filepath)
				.on('error', err => {
					reject(err);
				})
				.on('end', function () {
					resolve(filepath);
				})
			
		});
	}

	/* Helper functions */

    /**
     * 
     * @param url YouTube url
     * @returns Identifier based on YouTube url
     */
	private identifier(url: string) {
		let regex = /v=([A-z0-9_-]*)/g;
		let matches = regex.exec(url);

		if (matches != null && matches['index'] > 0) {
			return matches[1];
		}

		return '';
	}

	private source(id: string) {
		return Source.findOne({ 'id': id, 'origin': 'YouTube' });
	}

	public canHandle(url: string): boolean {
		return (url.indexOf('youtube.com') != -1 && this.identifier(url) != '');
	}

	public sourceIdentifier(): string {
		return "YouTube";
	}

}

export default new YouTubeService();