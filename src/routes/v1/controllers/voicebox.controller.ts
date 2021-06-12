import { Request, Response } from "express";
import fs from "fs";
import { FragmentSet } from "../../../database/schemas";
import LogService from "../../../services/log.service";
import voiceboxService from "../../../services/voicebox.service";

const request = require("request");

export class VoiceBoxController {
  constructor() {}

  async tts(req: Request, res: Response) {
    try {
      if (req.query.origin == "slack") {
        const tts = (await voiceboxService.tts(req.body.text)) as any;

        res.status(200);

        const formData = {
          file: fs.createReadStream(tts.filepath),
          channels: req.body.channel_id,
        };
        request.post(
          {
            url:
              "https://slack.com/api/files.upload?token=[redacted]&title=" +
              req.body.text,
            formData: formData,
          },
          function optionalCallback(err: any, httpResponse: any, body: any) {
            if (err) {
              return LogService.fatal(err.message);
            }

            LogService.info("Upload successful! Server responded with:", body);
          }
        );
      } else {
        let format = "mp3";
        if (req.query && req.query.format == "opus") {
          format = "opus";
        }

        const tts = (await voiceboxService.tts(req.body.text, format)) as any;
        delete tts.filepath;
        res.json(tts);
      }
    } catch (err) {
      LogService.fatal(err.message);
      console.error(err);
      res
        .status(500)
        .json({
          message: "Something went wrong with converting text to speech.",
        });
    }
  }

  async generate(req: Request, res: Response) {
    // Remove any file format at the end. This way we can trick clients into downloading an mp3 fixing some other shits
    const hash = req.params.id.replace(/\.(mp3|opus|mp2|wav|wma)/g, "");
    let extension = req.params.id.replace(hash, "").replace(".", "");
    let contentType = "audio/mpeg3";
    const start = process.hrtime();

    if (extension == "opus") {
      contentType = "audio/opus";
    } else {
      extension = "mp3";
    }

    const fragmentSet = await FragmentSet.findOne({ hash: hash });

    if (fragmentSet) {
      // Do the file magic (in memory)
      // __trace.file_magic = process.hrtime();
      res = res.status(200).contentType(contentType);
      voiceboxService
        .fileMagic(fragmentSet.fragments, extension)
        .then((data: any) => {
          res.contentType(contentType);
          const stream = fs.createReadStream(data.filepath).pipe(res);
          stream.on("finish", () => {
            const elapsed = process.hrtime(start);
            LogService.debug(
              "File magic took",
              elapsed[0],
              "s",
              "and",
              elapsed[1] / 1000000,
              "ms"
            );
          });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).end();
        });
    } else {
      res.status(404).send(null);
    }
  }
}
