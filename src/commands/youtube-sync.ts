import App from '../app';
import JobService from '../services/audio/job.service';


App.boot();

JobService.handleMissingYoutubeFiles();