import q from 'q';
import ffmpeg from 'fluent-ffmpeg';
import guid from 'guid';
import { Word, IWord } from '../database/schemas/word';
import { IFragment, Fragment } from '../database/schemas/fragment';
import fs from 'fs';
import path from 'path';
import { Source } from '../database/schemas/source';

// ...
require('colors');
let audioconcat = require('audioconcat');

class VoiceBox {

    public constructor() {

        if (!fs.existsSync('audio')) { fs.mkdirSync('audio') };
        if (!fs.existsSync('audio/youtube')) { fs.mkdirSync('audio/youtube') };
        if (!fs.existsSync('audio/fragments')) { fs.mkdirSync('audio/fragments') };
        if (!fs.existsSync('audio/temp')) { fs.mkdirSync('audio/temp') };

        //this.tts("please let this work");
    }

    public async tts(text: string) {

        let deferred = q.defer();

        let input = text.toLowerCase().split(' ');

        console.log('[VoiceBox]', 'starting new asyncmagic for:', input.toString());

        let combinations = new Array();

        for (var start = 0; start < input.length; start++) {
            var phrase = "";
            for (var i = start; i < input.length; i++) {
                phrase = phrase + input[i] + " ";
                combinations.push(phrase.substring(0, phrase.length - 1));
            }
        }

        console.log('[VoiceBox]', "combinations:", combinations.toString());

        let words = await Word.find({ text: combinations }).populate({ path: 'fragments', model: 'Fragment', populate: { path: 'word', model: 'Word' } }).populate({ path: 'fragments', model: 'Fragment', populate: { path: 'source', model: 'Source' } });
        console.log('[VoiceBox]', "found", words.length, "/", input.length, 'words');

        if (words.length == 0) {
            // deferred.reject({ status: 422, message: 'Could not find any matching words in the database' });
            console.log('words not found:', combinations)
            deferred.resolve({ wordsNotFound: input });
            return deferred.promise;
        }

        // Database results are not ordered, let's order them
        let orderedWords = new Array<IWord>();
        for (let word of combinations) {
            let w = words.find(function (w) { return word == w.text; });
            if (w) { orderedWords.push(w); }
        }

        // FYI: Traces are fragments
        let traces = await this.trace(orderedWords);
        // console.log('[VoiceBox]', 'traces:'.toString());
        for (let trace of traces) {
            //console.log(trace[0].word.text, '->', trace[trace.length - 1].word.text);
        }

        // Shuffle the traces to gain some randomness
        this.shuffle(traces);

        // Sort them by length, highest length first
        traces.sort(function (a, b) {
            return b.length - a.length;
        });

        let randomTraces = traces;

        let inputToProcess = input;
        let fragments = new Array<any>();

        for (let traces of randomTraces) {

            if (inputToProcess.length == 0) { break; }

            // Build array of words from this specific trace so we can match it with the input
            let wordsFromTrace = new Array();
            for (let trace of traces) {
                wordsFromTrace.push(trace.word.text);
            }

            // console.log('[VoiceBox]', 'trying to remove:', wordsFromTrace, 'from', inputToProcess);

            if (wordsFromTrace.length > 0) {
                // Find the first word
                let start = 0;
                let index = -1;
                while (inputToProcess.indexOf(wordsFromTrace[0], start) >= 0) {
                    let ind = inputToProcess.indexOf(wordsFromTrace[0], start);
                    // Sanity check
                    if (inputToProcess.length >= (ind + wordsFromTrace.length)) {
                        let br = false;
                        let indx = ind;
                        for (let word of wordsFromTrace) {
                            if (inputToProcess[indx] == word) {
                                indx = indx + 1;
                            }
                            else {
                                br = true;
                                break;
                            }
                        }
                        if (!br) {
                            start = ind + 1;
                            index = ind;
                        }
                        start = ind + 1;
                    }
                    else {
                        // Break the while loop
                        start = ind + 1;
                    }
                }

                if (index >= 0) {

                    // Set end time of the first fragment to the end time of the last fragment in this trace
                    // It is a bit cheaty, but it works.
                    for (var i = 0; i < traces.length; i++) {
                        var fragment = traces[i];

                        // console.log('[VoiceBox]'.bgYellow.black, 'traces:'.red, traces);

                        if (!fragments[index]) {
                            fragments[index] = {
                                order: index,
                                start: fragment.start,
                                end: fragment.end,
                                id: fragment.id,
                                source: fragment.source,
                                endFragment: fragment
                            }
                        }
                        else {
                            fragments[index].end = fragment.end;
                            fragments[index].endFragment = fragment;
                        }
                    }

                    // Replace words with fragments in inputToProcess
                    inputToProcess.splice(index, wordsFromTrace.length);
                    for (var trace of traces.reverse()) {
                        inputToProcess.splice(index, 0, trace);
                    }

                }
            }
        }

        // console.log('[VoiceBox]'.bgYellow.black, 'fragments:'.red, fragments)

        fragments = fragments.filter(val => { return !(typeof (val) == "string") });

        this.fileMagic(fragments).then((data: any) => {
            //console.log(data);
            data.wordsNotFound = inputToProcess.filter(val => { return (typeof (val) == "string") });
            deferred.resolve(data);
        });

        return deferred.promise;
    }

    private async trace(words: IWord[]) {
        let traces = new Array();

        for (let i = 0; i < words.length; i++) {
            let word = words[i];
            let nextWord = words[i + 1];
            console.log('[VoiceBox]', 'starting new trace for word', word.text);

            for (let fragment of word.fragments) {
                let fragmentTraces = await this.traceFragments(i, words, fragment);
                //console.log('fragmentTraces:', fragmentTraces);
                traces.push(fragmentTraces);
            }
        }

        // We want the ones with the most entries at the top of the array, so let's sort on length.
        traces.sort(function (a, b) {
            return b.length - a.length;
        });

        return traces;
    }

    private async traceFragments(index: number, words: IWord[], fragment: IFragment, traces?: IFragment[]) {
        // index = current word index
        // words = the word array
        // fragment = the current fragment we need to start a trace for
        // traces = array containing all the fragments we've traced

        var word = words[index];
        var nextWord = words[index + 1];
        if (!traces) {
            traces = new Array();
            traces.push(fragment);
        }

        // console.log('[VoiceBox]', 'tracing fragment', fragment.id);

        if (nextWord) {
            for (var nextFragment of nextWord.fragments) {
                if (nextFragment.source.equals(fragment.source) && Number(nextFragment.start) > Number(fragment.start) && traces.filter(trace => (trace.id == nextFragment.id)).length == 0) {

                    var fragmentsInBetween = await Fragment.count({
                        start: { $gt: fragment.start, $lt: nextFragment.start },
                        source: fragment.source
                    });

                    //console.log('fragmentsInBetween:'.red, fragmentsInBetween);

                    if (fragmentsInBetween == 0) {
                        console.log('[VoiceBox]', fragment.id, '(' + fragment.word.text + " " + fragment.start + ')', 'source is same as', nextFragment.id, '(' + nextFragment.word.text + " " + nextFragment.start + ')');
                        traces.push(nextFragment);
                        await this.traceFragments(index + 1, words, nextFragment, traces);
                    }
                }
            }
        }

        return traces;
    }

    private shuffle(a: Array<any>) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
    }

    private async fileMagic(fragments: Array<any>) {
        // Generate temp files from fragments
        let tempFiles = new Array();
		let promises = new Array();
		
		let audioFolder = path.join(__dirname, '../audio/');

        for (var fragment of fragments) {

            (function (fragment) {
                var promise = new Promise(function (resolve, reject) {

                    let filepath = path.join(audioFolder, '/youtube/', fragment.source.id.toString() + '.mp3');
                    let outputpath = path.join(audioFolder, '/fragments/', fragment.id + '-' + fragment.endFragment.id + '.mp3');

                    ffmpeg(filepath)
                        .setStartTime(fragment.start)
                        .setDuration(fragment.end - fragment.start)
                        .audioBitrate(128)
                        .audioFilter('loudnorm')
                        .output(outputpath)
                        .on('end', function (err) {
                            if (!err) {
                                tempFiles.push({ order: fragment.order, file: fragment.id + '-' + fragment.endFragment.id + '.mp3' });
                                resolve();
                            }
                        })
                        .on('error', function (err) {
                            console.log('ffmpeg error:', err);
                            resolve();
                        }).run();
                });
                promises.push(promise);
            })(fragment);
        }

        return Promise.all(promises).then(function () {

            function compare(a: any, b: any) {
                if (a.order < b.order)
                    return -1;
                if (a.order > b.order)
                    return 1;
                return 0;
            }
            tempFiles.sort(compare);

            // Audioconcat needs a non relative path. 
            let files = new Array();
            tempFiles.forEach(function (fragment) {
                
                files.push(path.join(audioFolder, "/fragments/", fragment.file));
            });

            // Concatenate the temp fragment files into one big one
			let outputfilename = guid.create() + '.mp3';
			console.log("Sweet testing");
			console.log(files);
			console.log(tempFiles);
			console.log(path.join(audioFolder, "/temp/", outputfilename));
            return new Promise((resolve, reject) => {
                audioconcat(files)
                    .concat(path.join(audioFolder, "/temp/", outputfilename))
                    .on('start', function (command: any) {
                        console.log('ffmpeg process started:', command)
                    })
                    .on('error', function (err: any, stdout: any, stderr: any) {
                        console.error('Error:', err)
                        console.error('ffmpeg stderr:', stderr)
                        resolve({ error: 'FFMpeg failed to process file(s): ' + err });
                    })
                    .on('end', function () {
                        console.log('Audio created in:', path.join(audioFolder, "/temp/", outputfilename));
                        resolve({ file: "/audio/temp/" + outputfilename });
                    })

            });
        });
    }
}

export default new VoiceBox();