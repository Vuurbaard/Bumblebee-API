import { Source, ISource } from '../../database/schemas';
import AudioService from './audio.service';
import YouTubeService from './youtube.service';
import LogService from '../log.service';
class JobService {

	extension: string = ".mp3";
	sourceQueue: ISource[];
	finishedQueue: boolean = false;
	crons: Array<any> = new Array();
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
		Source.find({ origin: 'YouTube', $or : [ { 'deletedAt' : null }, { 'deletedAt' : { $exists : true } }  ]}).then((sources: ISource[]) => {

			this.sourceQueue = sources;
			// 5 runners
			this.parseItem();
			this.parseItem();
			this.parseItem();
			this.parseItem();
			this.parseItem();
		});

	}

	private parseItem() {
		let vm = this;

		if (this.sourceQueue != null && this.sourceQueue.length > 0) {
			if (this.sourceQueue.length % 10 == 0) {
				LogService.info("Parsing item " + this.sourceQueue.length + " left");
			}
			let source = this.sourceQueue.pop() as ISource;

			// Check if we can download the video. Otherwise remove it.

			let yturl = "https://www.youtube.com/watch?v=" + source.id.toString();
			let creator = source.createdBy ? source.createdBy.toString() : '';

			YouTubeService.download(yturl, creator).then(() => {
				// Get more information about the video
				YouTubeService.info(yturl).then((info : any) => {
					source.name = info.title || '';
					source.save().then(() => {
						LogService.info("YouTube video ", yturl , " updated");
						vm.parseItem();
					})
				})

				
			}, err => {
				LogService.warn("Failed to download: ", err.message);
				// TODO: Remove Source from database + fragments? (It's not redownloadable, meaning it's harder to reproduce or recreate the youtube source thing.)
				source.deletedAt = new Date();
				source.save().then(() => {
					// source.fragments.forEach((fragment) => {
					// 	fragment.deletedAt = new Date();
					// 	fragment.save(() => {
					// 		LogService.info("Deleted fragment for " + fragment.id);
					// 	});
					// })
					LogService.warn("YouTube video ", yturl , " flagged as removed");
					vm.parseItem();
				})
			});

			// // Check with youtube api if video still is available
			// this.yt_api.searchVideo( source.id.toString() ).then(( video: any ) => {
			// 	if(video.items.length > 0){
			// 		let videoData = video.items[0];
			// 		let name = videoData.snippet.title;
			// 		// Update name of source
			// 		source.name = name;
			// 		source.save().then(() => {
			// 			let yturl = "https://www.youtube.com/watch?v=" + source.id.toString();
			// 			let creator = source.createdBy ? source.createdBy.toString() : '';
			
			// 			YouTubeService.download(yturl, creator).then(() => {
			// 				setTimeout(() => {vm.parseItem()}, 1000);
			// 			}, err => {
			// 				LogService.warn("Failed to download: ", err.message);
			// 				// TODO: Remove Source from database + fragments? (It's not redownloadable, meaning it's harder to reproduce or recreate the youtube source thing.)
			
			// 				setTimeout(() => {vm.parseItem()}, 1000);
			// 			});
			// 		})
			// 	}else{
			// 		source.deletedAt = new Date();
			// 		source.save().then(() => {
			// 			setTimeout(() => {vm.parseItem()}, 1000);
			// 		});
			// 		// Video down :(
			// 	}
			// }, ( err : any ) => {
			// 	console.log("Failed to retrieve video stuff");
			// 	setTimeout(() => {vm.parseItem()}, 5000);
			// }) ;
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
