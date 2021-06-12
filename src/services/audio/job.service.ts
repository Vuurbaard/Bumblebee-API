import { Source, ISource } from "../../database/schemas";
import YouTubeService from "./youtube.service";
import LogService from "../log.service";
import fs from "fs";
import cacheService from "../../services/cache.service";

class JobService {
  extension = ".mp3";
  sourceQueue: ISource[];
  public finishedQueue = false;
  public queueStarted = true;
  crons: Array<any> = [];
  private yt_api: any;
  private threadsDone = 0;
  private maxThreads = 8;
  private queueStartSize = 0;
  private intervalMessage: any;

  public constructor() {
    this.sourceQueue = [];
  }

  checkQueueStatus() {
    if (this.queueStarted && !this.finishedQueue) {
      LogService.info(
        "There are ",
        this.sourceQueue.length,
        "/",
        this.queueStartSize,
        " YouTube sources left to process"
      );
    }
  }

  ensureQueueIsDone() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return new Promise(function (resolve, reject) {
      (function waitForFoo() {
        if (self.finishedQueue) return resolve(true);
        setTimeout(waitForFoo, 30);
      })();
    });
  }

  public async handleMissingYoutubeFiles() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    LogService.info("Handling missing YouTube files");

    this.sourceQueue = await Source.find({
      origin: "YouTube",
    });

    LogService.info("There are ", this.sourceQueue.length, " YouTube sources");

    this.queueStartSize = this.sourceQueue.length;
    this.queueStarted = true;
    this.intervalMessage = setInterval(function () {
      self.checkQueueStatus();
    }, 2500);

    LogService.info("Starting ", this.maxThreads, " threads to process data");
    for (let i = 0; i <= this.maxThreads; i++) {
      this.parseQueue();
    }

    // Wait till queue is done
    await this.ensureQueueIsDone();

    LogService.info("Clearing cache for fragments");
    await cacheService.clear("all-fragments");

    return true;
  }

  private async parseQueue() {
    if (this.sourceQueue.length > 0) {
      const source = this.sourceQueue.shift();
      try {
        if (source) {
          await this.parseSource(source);
        }
      } catch (e) {
        LogService.warn("Thread failed", e);
      }
    }

    if (this.sourceQueue.length == 0) {
      this.threadsDone = this.threadsDone + 1;
    }

    if (this.threadsDone == this.maxThreads && this.sourceQueue.length == 0) {
      LogService.info("All threads are done....");
      this.finishedQueue = true;
    }

    if (this.sourceQueue.length > 0) {
      this.parseQueue();
    }
  }

  private async parseSource(source: ISource) {
    const yturl = "https://www.youtube.com/watch?v=" + source.id.toString();
    const identifier = YouTubeService.identifier(yturl);

    // Clean up garbled stuff
    if (identifier != source.id) {
      LogService.info("Updating garbled identifier");

      // Check if there is already a source with the same Id

      // const secondSource = await Source.findOne({ id: identifier });
      //
      // if ((secondSource._id.toString() != source._id.toString())) {
      //   source.id = identifier;
      //   source.save();
      //   yturl = "https://www.youtube.com/watch?v=" + source.id.toString();
      // }
    }

    const creator = source.createdBy ? source.createdBy.toString() : "";
    const sourceFile =
      YouTubeService.basepath(true) + `/${source.id.toString()}.mp3`;

    let exists = false;

    try {
      await fs.promises.access(sourceFile, fs.constants.F_OK);
      exists = true;
    } catch (e) {
      // console.warn(e);
    }

    if (!exists) {
      LogService.info("No source file for YouTube clip ", source.id);
      try {
        await YouTubeService.download(yturl, creator);
      } catch (e) {
        LogService.warn("Failed to download youtube video", e);
      }
    }

    let info = null;
    let videoAvailable = true;
    // Get info
    try {
      info = await YouTubeService.info(yturl);
    } catch (e) {
      const msg = e.message.toLowerCase();
      if (
        msg.includes("video unavailable") ||
        msg.includes("private video") ||
        msg.includes("video has been removed")
      ) {
        videoAvailable = false;
      }
      LogService.warn("Failed to retrieve youtube video info", e);
    }

    if (info) {
      let title = source.name;

      if (
        info.videoDetails &&
        info.videoDetails.title &&
        info.videoDetails.title.length > 0
      ) {
        title = info.videoDetails.title;
      }

      if (title != source.name) {
        LogService.debug("Saving new video title");
        source.name = title;
        await source.save();
      }
    }

    if (!exists && !videoAvailable) {
      LogService.fatal(
        "Removing source with id ",
        source._id.toString(),
        "yt",
        source.id
      );
      //
      await Source.findByIdAndDelete(source._id);
    }
  }
}

export default new JobService();
