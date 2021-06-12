import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ytdl, { videoInfo } from "ytdl-core";
import { ISource, Source, User } from "../../database/schemas";
import { ISourceProvider } from "./ISourceProvider";
import LogService from "../log.service";

class YouTubeService implements ISourceProvider {
  private extension = ".mp3";

  public constructor() {
    const filepath = path.resolve(__dirname, "../.." + this.basepath());

    fs.mkdirSync(filepath, { recursive: true });
  }

  public basepath(resolve = false): string {
    return resolve
      ? path.resolve(__dirname, "../.." + this.basepath())
      : "/audio/youtube/";
  }

  public sourceUrl(source: ISource) {
    return "/v1" + this.basepath() + source.id.toString() + this.extension;
  }

  public async info(url: string): Promise<videoInfo> {
    return await ytdl.getInfo(url);
  }

  public async download(url: string, userId?: string): Promise<ISource> {
    userId = userId ? userId : "";
    let user = null;

    if (userId.length > 0) {
      user = await User.findById(userId);
    }

    const id = this.identifier(url);

    // Check if we already have a source file
    const source = (await this.source(id)) ?? new Source();
    const ytVideoInfo = await this.info(id);
    const videoTitle = ytVideoInfo.videoDetails.title || "";
    source.id = id;
    source.name = videoTitle;
    source.origin = "YouTube";

    if (!source.createdBy && user) {
      source.createdBy = user;
    }

    await this.downloadYouTube(source.id);

    return await source.save();
  }

  private async downloadYouTube(id: string): Promise<string> {
    const vm = this;
    const filename = id + this.extension;
    const filepath = path.resolve(
      __dirname,
      "../.." + this.basepath() + filename
    );
    const yturl = "https://www.youtube.com/watch?v=" + id;
    LogService.info("Download of youtube video", id, "requested...");

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(ytdl(yturl, { quality: "highestaudio" }))
        .noVideo()
        .audioFrequency(44100)
        .save(filepath)
        .on("error", (err) => {
          reject(err);
        })
        .on("end", function () {
          resolve(filepath);
        });
    });
  }

  /* Helper functions */

  /**
   *
   * @param url YouTube url
   * @returns Identifier based on YouTube url
   */
  public identifier(url: string) {
    const regex = /v=([A-z0-9_-]*)/g;
    const matches = regex.exec(url);

    if (matches != null && matches["index"] > 0) {
      return matches[1];
    }

    return "";
  }

  private source(id: string) {
    return Source.findOne({ id: id, origin: "YouTube" });
  }

  public canHandle(url: string): boolean {
    return url.indexOf("youtube.com") != -1 && this.identifier(url) != "";
  }

  public sourceIdentifier(): string {
    return "YouTube";
  }
}

export default new YouTubeService();
