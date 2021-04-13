import { Source, ISource } from '../../database/schemas';
import YouTubeService from './youtube.service';
import LogService from '../log.service';
import fs from 'fs';

class JobService {

	extension = ".mp3";
	sourceQueue: ISource[];
	finishedQueue = false;
	crons: Array<any> = [];
	private yt_api: any;

	public constructor() {
		this.sourceQueue = [];
		// Make a runner that runs every minute and checks which tasks are due
		
		// Crons are { cron, func }
		//this.crons.push([ "* * * * *" , this.updateYoutubeSourceInformation ]);
		// All crontasks defined
		// Start runner
	}

	public async updateYoutubeSourceInformation(){
	
	}

	public async handleMissingYoutubeFiles() {
		LogService.info("Handling missing YouTube files");
		
		// Retrieve all sources
		Source.find({ origin: 'YouTube', $or : [ { 'deletedAt' : { $exists : false } }  ]}).then((sources: ISource[]) => {
			this.sourceQueue = sources;
			// const threads = 6;
			// 5 runners
			// this.parseItem();
		});

	}

	private parseItem() {
		const vm = this;

		if (this.sourceQueue != null && this.sourceQueue.length > 0) {
			if (this.sourceQueue.length % 10 == 0) {
				LogService.info("Parsing item " + this.sourceQueue.length + " left");
			}
			// Can cause async issues due it not being locked
			const source = this.sourceQueue.pop() as ISource;

			// Check if we can download the video. Otherwise remove it.

			const yturl = "https://www.youtube.com/watch?v=" + source.id.toString();
			const creator = source.createdBy ? source.createdBy.toString() : '';

			// First check if we need to update the video information (e.g. missing name)
			const promises = [
				new Promise((res,rej) => {
					const ytPath = YouTubeService.basepath(true) + '/' + source.id.toString() + '.mp3';
					fs.exists(ytPath, (exists) => {
						// Should we do something with it
						// If it exists, we don't have to. But if it doesn't we should!
						res(!exists);
					})
				}),
				new Promise((res,rej) => {
					res(source.name == '');
				})
			];

			Promise.all(promises).then((result) => {
				// If any item is false we have to do something
				const doTask = !result.every((val) => {return val == false});
				
				if(doTask && yturl != null){
					LogService.debug(`Process task for ${source.id}`);
					YouTubeService.download(yturl, creator).then(() => {
						if(source.name == '' || source.name == null){
							// Get more information about the video
							YouTubeService.info(yturl).then((info : any) => {
								source.name = info.title || '';
								source.save().then(() => {
									LogService.debug("YouTube video", yturl , "updated");
									vm.parseItem();
								})
							})
						}else{
							LogService.debug("YouTube video", yturl , "already has info");
							vm.parseItem();
						}

					}, err => {
						LogService.warn("Failed to download: ", err.message);
						source.deletedAt = new Date();
						source.save();
						vm.parseItem();
					});
				} else {
					if(source.name == '' || source.name == null){
						// Get more information about the video
						YouTubeService.info(yturl).then((info : any) => {
							source.name = info.title || '';
							source.save().then(() => {
								LogService.debug("YouTube video", yturl , "updated");
								vm.parseItem();
							})
						}).catch((e) => {
							vm.parseItem();
						})
					}else{
						LogService.debug(`Skipping task for ${source.id}`);
						LogService.debug("YouTube video", yturl , "already has info");
						vm.parseItem();
					}
				}

			})
		}
		else {
			if (!this.finishedQueue) {
				this.finishedQueue = true;
				LogService.info("Finished queue");
			}
		}
	}
}

export default new JobService();
