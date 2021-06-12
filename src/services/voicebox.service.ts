import q from "q";
import ffmpeg from "fluent-ffmpeg";
import { Word, IWord, IFragment, Fragment } from "../database/schemas";
import fs from "fs";
import path from "path";
import process from "process";
import LogService from "./log.service";
import { FragmentSet } from "../database/schemas/fragmentSet.schema";
import * as streambuffer from "stream-buffers";
import * as crypto from "crypto";

require("colors");

class VoiceBox {
  private basePath: string;
  private tempPath: string;
  private fragmentsBasePath: string;
  private youtubeBasePath: string;

  public constructor() {
    if (!fs.existsSync("audio")) {
      fs.mkdirSync("audio");
    }
    if (!fs.existsSync("audio/youtube")) {
      fs.mkdirSync("audio/youtube");
    }
    if (!fs.existsSync("audio/fragments")) {
      fs.mkdirSync("audio/fragments");
    }
    if (!fs.existsSync("audio/temp")) {
      fs.mkdirSync("audio/temp");
    }

    this.basePath = path.join(__dirname, "../audio/");
    this.tempPath = path.join(this.basePath, "/temp/");
    this.fragmentsBasePath = path.join(this.basePath, "/fragments/");
    this.youtubeBasePath = path.join(this.basePath, "/youtube/");
  }

  public async tts(text: string, format = "mp3") {
    const __trace = {} as any;

    const deferred = q.defer();

    __trace.preperation = process.hrtime();

    let input = text.toLowerCase().split(" ");
    input = input.filter((word) => word != " ");
    input = input.filter((word) => word != "");

    LogService.debug("Input: ", input.toString());

    const textInput = input.toString();

    LogService.info(
      "[VoiceBox]",
      "starting new asyncmagic for:",
      input.toString()
    );

    const combinations = [];

    for (let start = 0; start < input.length; start++) {
      let phrase = "";
      for (let i = start; i < input.length; i++) {
        phrase = phrase + input[i] + " ";
        combinations.push(phrase.substring(0, phrase.length - 1));
      }
    }

    __trace.preperation = process.hrtime(__trace.preperation);

    __trace.word_find_query = process.hrtime();
    // LogService.info('[VoiceBox]', "combinations:", combinations.toString());

    const words = await Word.find({ text: { $in: combinations } })
      .populate({
        path: "fragments",
        model: "Fragment",
        populate: { path: "word", model: "Word" },
      })
      .populate({
        path: "fragments",
        model: "Fragment",
        populate: { path: "source", model: "Source" },
      });
    LogService.info("[VoiceBox]", "found", words.length, "words in database.");

    __trace.word_find_query = process.hrtime(__trace.word_find_query);

    // We have not found anything to do so let's just exit the function
    if (words.length == 0) {
      LogService.info("[VoiceBox]", "words not found:", input);
      const notFound = input.map((word) => {
        return { text: word, found: false };
      });
      deferred.resolve({ fragments: notFound });
      return deferred.promise;
    }

    __trace.order_words = process.hrtime();
    // Database results are not ordered, let's order them
    const orderedWords = new Array<IWord>();
    for (const word of combinations) {
      const w = words.find(function (w: IWord) {
        return word == w.text;
      });
      if (w) {
        orderedWords.push(w);
      }
    }

    __trace.order_words = process.hrtime(__trace.order_words);

    // FYI: Traces are fragments
    __trace.tracing = process.hrtime();
    const traces = await this.trace(orderedWords);
    __trace.tracing = process.hrtime(__trace.tracing);
    // LogService.info('[VoiceBox]', 'traces:'.toString());
    //for (let trace of traces) {
    //LogService.info(trace[0].word.text, '->', trace[trace.length - 1].word.text);
    //}

    __trace.order_words = process.hrtime();
    // Shuffle the traces to gain some randomness
    this.shuffle(traces);

    // Sort them by length, highest length first
    traces.sort(function (a, b) {
      return b.length - a.length;
    });

    __trace.order_words = process.hrtime(__trace.order_words);

    const randomTraces = traces;

    const inputToProcess = input;
    let fragments = new Array<any>();

    __trace.trace_words = process.hrtime();
    for (const traces of randomTraces) {
      if (inputToProcess.length == 0) {
        break;
      }

      // Build array of words from this specific trace so we can match it with the input
      const wordsFromTrace = [];
      for (const trace of traces) {
        wordsFromTrace.push(trace.word.text);
      }

      // LogService.info('[VoiceBox]', 'trying to remove:', wordsFromTrace, 'from', inputToProcess);

      if (wordsFromTrace.length > 0) {
        // Find the first word
        let start = 0;
        let index = -1;
        while (inputToProcess.indexOf(wordsFromTrace[0], start) >= 0) {
          const ind = inputToProcess.indexOf(wordsFromTrace[0], start);
          // Sanity check
          if (inputToProcess.length >= ind + wordsFromTrace.length) {
            let br = false;
            let indx = ind;
            for (const word of wordsFromTrace) {
              if (inputToProcess[indx] == word) {
                indx = indx + 1;
              } else {
                br = true;
                break;
              }
            }
            if (!br) {
              start = ind + 1;
              index = ind;
            }
            start = ind + 1;
          } else {
            // Break the while loop
            start = ind + 1;
          }
        }

        if (index >= 0) {
          // Set end time of the first fragment to the end time of the last fragment in this trace
          // It is a bit cheaty, but it works.
          for (let i = 0; i < traces.length; i++) {
            const fragment = traces[i];

            // LogService.info('[VoiceBox]'.bgYellow.black, 'traces:'.red, traces);

            if (!fragments[index]) {
              fragments[index] = {
                order: index,
                start: fragment.start,
                end: fragment.end,
                id: fragment.id,
                source: fragment.source,
                word: fragment.word,
                endFragment: fragment,
              };
            } else {
              fragments[index].end = fragment.end;
              fragments[index].endFragment = fragment;
            }
          }

          // Replace words with fragments in inputToProcess
          inputToProcess.splice(index, wordsFromTrace.length);
          for (const trace of traces.reverse()) {
            inputToProcess.splice(index, 0, trace);
          }
        }
      }
    }

    __trace.trace_words = process.hrtime(__trace.trace_words);

    // LogService.info('[VoiceBox]'.bgYellow.black, 'fragments:'.red, fragments)

    // fragments = fragments.filter(val => { return !(typeof (val) == "string") });

    // Replace left over words that could not be parsed into a more consistent object format
    let fragmentsToReturn = inputToProcess as Array<any>;
    fragmentsToReturn = fragmentsToReturn.map((fragment) => {
      if (typeof fragment == "string") {
        fragment = { text: fragment, found: false };
      }

      return fragment;
    });

    // Generate structure

    // Generate Fragment set based on current stuff ( and generate a hash )
    const fragmentHash = this.generateHash(fragments);

    // Find a fragmentSet for this combination
    let fragmentSet = await FragmentSet.findOne({ hash: fragmentHash });

    if (fragmentSet == null) {
      fragments = fragments.filter((el) => {
        return el != null;
      });
      fragmentSet = new FragmentSet({
        hash: fragmentHash,
        text: textInput,
        fragments: JSON.parse(JSON.stringify(fragments)),
      });

      fragmentSet = await fragmentSet.save();
    }

    const data = {
      file: "/v1/audio/generate/" + fragmentSet.hash + "." + format,
      fragments: fragmentsToReturn,
    };

    deferred.resolve(data);

    return deferred.promise;
  }

  private async trace(words: IWord[]) {
    const traces: Array<any> = [];

    const promises = [] as any[];

    words.forEach((word, i) => {
      LogService.info("[VoiceBox]", "starting new trace for word", word.text);

      word.fragments.forEach((fragment) => {
        promises.push(this.traceFragments(i, words, fragment));
      });
    });

    await Promise.all(promises).then((values) => {
      for (const item of values) {
        traces.push(item);
      }
    });

    // We want the ones with the most entries at the top of the array, so let's sort on length.
    traces.sort(function (a, b) {
      return b.length - a.length;
    });

    return traces;
  }

  private generateHash(fragments: Array<any>) {
    function compare(a: any, b: any) {
      if (a.order < b.order) return -1;
      if (a.order > b.order) return 1;
      return 0;
    }

    fragments.sort(compare);

    // We only need id's for the hash (we will concat them together)
    const content = fragments
      .map(function (item: any) {
        return item["id"] + item["start"] + item["end"];
      })
      .join(":");

    return crypto.createHash("sha1").update(content).digest("hex");
  }

  private async traceFragments(
    index: number,
    words: IWord[],
    fragment: IFragment,
    traces?: IFragment[]
  ) {
    // index = current word index
    // words = the word array
    // fragment = the current fragment we need to start a trace for
    // traces = array containing all the fragments we've traced

    const nextWord = words[index + 1];
    if (!traces) {
      traces = [];
      traces.push(fragment);
    }

    // LogService.info('[VoiceBox]', 'tracing fragment', fragment.id);

    if (nextWord) {
      for (const nextFragment of nextWord.fragments) {
        if (
          nextFragment.source != null &&
          nextFragment.source.equals(fragment.source) &&
          Number(nextFragment.start) > Number(fragment.start) &&
          traces.filter((trace) => trace.id == nextFragment.id).length == 0
        ) {
          const fragmentsInBetween = await Fragment.countDocuments({
            start: { $gt: fragment.start, $lt: nextFragment.start },
            source: fragment.source,
          });

          //LogService.info('fragmentsInBetween:'.red, fragmentsInBetween);

          if (fragmentsInBetween == 0) {
            //LogService.info('[VoiceBox]', fragment.id, '(' + fragment.word.text + " " + fragment.start + ')', 'source is same as', nextFragment.id, '(' + nextFragment.word.text + " " + nextFragment.start + ')');
            traces.push(nextFragment);
            await this.traceFragments(index + 1, words, nextFragment, traces);
          }
        }
      }
    }

    return traces;
  }

  private shuffle(a: Array<any>) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
  }

  public async fileMagic(fragments: Array<any>, format = "mp3") {
    // Generate temp files from fragments
    const tempFiles: Array<any> = [];
    const promises: Array<Promise<any>> = [];

    const self = this;

    for (const fragment of fragments) {
      (function (fragment) {
        const promise = new Promise(function (resolve, reject) {
          const prefixDir = fragment.id.substr(0, 2);
          const fragmentsDir = path.join(
            self.fragmentsBasePath,
            prefixDir,
            "/"
          );

          const filepath = path.join(
            self.youtubeBasePath,
            fragment.source.id.toString() + ".mp3"
          );

          if (!fs.existsSync(fragmentsDir)) {
            fs.mkdirSync(fragmentsDir);
          }

          const outputpath = path.join(
            fragmentsDir,
            `${fragment.id}-${fragment.endFragment._id}.mp3`
          );

          fs.exists(outputpath, (exists) => {
            if (!exists) {
              ffmpeg(filepath)
                .setStartTime(fragment.start)
                .setDuration(fragment.end - fragment.start)
                .audioBitrate(256)
                .output(outputpath)
                .on("end", function (err) {
                  if (!err) {
                    LogService.info(
                      "[VoiceBox]",
                      "Created cached version for " +
                        fragment.id +
                        "-" +
                        fragment.endFragment._id
                    );
                    tempFiles.push({
                      id: fragment.id,
                      order: fragment.order,
                      file:
                        fragment.id + "-" + fragment.endFragment._id + ".mp3",
                    });
                    resolve(true);
                  }
                })
                .on("error", function (err) {
                  LogService.info("[VoiceBox]", "ffmpeg error:", err);
                  reject();
                })
                .run();
            } else {
              LogService.info(
                "[VoiceBox]",
                "Using cached version for " +
                  fragment.id +
                  "-" +
                  fragment.endFragment._id
              );
              tempFiles.push({
                id: fragment.id,
                order: fragment.order,
                file: fragment.id + "-" + fragment.endFragment._id + ".mp3",
              });
              resolve(true);
            }
          });
        });
        promises.push(promise);
      })(fragment);
    }

    const obj = this;
    return Promise.all(promises).then(function () {
      function compare(a: any, b: any) {
        if (a.order < b.order) return -1;
        if (a.order > b.order) return 1;
        return 0;
      }

      tempFiles.sort(compare);

      // Audioconcat needs a non relative path.
      const files: Array<any> = [];

      tempFiles.forEach((fragment) => {
        const prefixDir = fragment.id.substr(0, 2);
        files.push(
          path.join(obj.fragmentsBasePath, prefixDir, "/", fragment.file)
        );
      });

      const fileName = obj.generateHash(fragments);

      // Concatenate the temp fragment files into one big one
      const outputfilename = fileName + "." + format;
      const preaudionorm = fileName + "-prenorm.mp3";

      const prenormPath = path.join(obj.tempPath, preaudionorm);
      const outputPath = path.join(obj.tempPath, outputfilename);

      return new Promise((resolve, reject) => {
        // Check if we have have a cached file. Otherwise rerun all steps
        if (!fs.existsSync(outputPath)) {
          LogService.debug("No file found at", outputPath, "generating file");

          // Create stream buffer for concatting files
          const myWritableStreamBuffer = new streambuffer.WritableStreamBuffer({
            initialSize: 100 * 1024, // start at 100 kilobytes.
            incrementAmount: 10 * 1024, // grow by 10 kilobytes each time buffer overflows.
          });

          ffmpeg()
            .input("concat:" + files.join("|"))
            .outputOptions("-c:v copy")
            .on("error", function (err: any, stdout: any, stderr: any) {
              console.error("[VoiceBox]", "Error:", err);
              console.error("[VoiceBox]", "ffmpeg stderr:", stderr);
              resolve({ error: "FFMpeg failed to process file(s): " + err });
            })
            .on("end", function () {
              LogService.info(
                "[VoiceBox]",
                "Audio non-normalized created in:",
                prenormPath
              );
              const myReadAbleStream = new streambuffer.ReadableStreamBuffer();
              const streamContents =
                myWritableStreamBuffer.getContents() as Buffer;
              myReadAbleStream.put(streamContents);
              myWritableStreamBuffer.end();
              myReadAbleStream.stop();

              ffmpeg(myReadAbleStream)
                .audioFilter([
                  {
                    filter: "dynaudnorm",
                    options: "f=25:g=15",
                  },
                ])
                .save(outputPath)
                .on("error", function (err: any, stdout: any, stderr: any) {
                  console.error("[VoiceBox]", "Error:", err);
                  console.error("[VoiceBox]", "ffmpeg stderr:", stderr);
                  resolve({
                    error: "FFMpeg failed to process file(s): " + err,
                  });
                })
                .on("end", function () {
                  LogService.info(
                    "[VoiceBox]",
                    "Audio normalized created in:",
                    outputPath
                  );
                  resolve({
                    file: "/v1/audio/temp/" + outputfilename,
                    filepath: outputPath,
                  });
                });
            })
            .toFormat("mp3")
            .writeToStream(myWritableStreamBuffer);
        } else {
          LogService.info("[VoiceBox]", "Using cached fragmentset");
          resolve({
            file: "/v1/audio/temp/" + outputfilename,
            filepath: outputPath,
          });
        }
      });
    });
  }
}

export default new VoiceBox();
