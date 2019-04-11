import { Source, ISource } from '../../database/schemas';
import AudioService from './audio.service';
import YouTubeService from './youtube.service';
import LogService from '../log.service';

class JobService {

	extension: string = ".mp3";
	sourceQueue: ISource[];
	finishedQueue: boolean = false;

	public constructor() {
		this.sourceQueue = [];
	}

	public async handleMissingYoutubeFiles() {
		LogService.info("Handling missing YouTube files");

		// Retrieve all sources
		Source.find({ origin: 'YouTube' }).then((sources: ISource[]) => {
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

			// TODO Make it switch based on what service is there
			let yturl = "https://www.youtube.com/watch?v=" + source.id.toString();
			let creator = source.createdBy ? source.createdBy.toString() : '';

			YouTubeService.download(yturl, creator).then(() => {
				vm.parseItem();
			}, err => {
				LogService.warn("Failed to download: ", err.message);
				// TODO: Remove Source from database + fragments? (It's not redownloadable, meaning it's harder to reproduce or recreate the youtube source thing.)

				vm.parseItem();
			});
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
