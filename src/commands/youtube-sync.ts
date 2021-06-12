import App from "../app";
import JobService from "../services/audio/job.service";

App.boot().then(async () => {
  await JobService.handleMissingYoutubeFiles();
  process.exit();
});
