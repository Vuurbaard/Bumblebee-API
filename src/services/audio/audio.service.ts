import q from 'q';
import YouTubeService from './youtube.service';
import { ISource } from '../../database/schemas';
import { ISourceProvider } from './ISourceProvider';

class AudioService {

	handlers: Array<ISourceProvider> = [];

	public constructor() {
		this.handlers.push(YouTubeService);
	}
	
    // Returns the service based on the given url
	private service(url: string): ISourceProvider | null {
		let rc = null;
		for (let i = 0; i < this.handlers.length; i++) {
			let handler: ISourceProvider = this.handlers[i];
			if (handler.canHandle(url)) {
				rc = handler;
				break;
			};
		}

		return rc;
	}

	public sourceUrl(source: ISource) {
		let service = null;

		for (let i = 0; i < this.handlers.length; i++) {
			let handler: ISourceProvider = this.handlers[i];
			if (source.origin.toString() == handler.sourceIdentifier()) {
				service = handler;
				break;
			};
		}

		if (service != null) {
			return service.sourceUrl(source);
		}

		return "";
	}

	public download(url: string, userId: string): q.Promise<ISource> {
		let deferred = q.defer<ISource>();

		if (!url || !userId) { deferred.reject(); }

		let service: ISourceProvider | null = this.service(url);

		if (service != null) {
			service.download(url, userId).then(source => {
				deferred.resolve(source);
			}, err => {
				deferred.reject(err);
			});
		}
		else {
			deferred.reject('No audio service found for url: ' + url);
		}

		return deferred.promise;
	}
}

export default new AudioService();