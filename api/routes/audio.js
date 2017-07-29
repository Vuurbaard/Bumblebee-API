const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');
const Fragment = require('../models/fragment');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const audioconcat = require('audioconcat');
const path = require('path');
const fs = require('fs');
const guid = require('guid');

router.post('/youtube', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    
    let url = req.body.url;
    let id = url.replace('https://www.youtube.com/watch?v=', '');
    let filename = id + '.mp3'
    let filepath = path.resolve(__dirname, '../youtube/' + filename);
    let publicfilepath = '/youtube/' + filename;

    fs.exists(filepath, (exists) => {
        if(!exists) {
            ffmpeg()
                .input(ytdl(url))
                .noVideo()
                .audioBitrate(64)
                .save(filepath)
                .on('error', console.error)
                .on('progress', function (progress) {
                    process.stdout.cursorTo(0);
                    process.stdout.clearLine(1);
                    process.stdout.write(progress.timemark);
                }).on('end', function () {
                    console.log("\r\nDone converting audio file", id);
                    res.json({url: publicfilepath});
                });
        }
        else {

            // TODO: Error handling

            Fragment.find({
                'id' : id,
                'wordCount': 1
            }, function(err, fragments){
                console.log(fragments);
                res.json({url: publicfilepath, fragments: fragments}); // TODO: Don't return whole db object?
            });

            


        }
    });
});

router.get('/fragments', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    let id = req.body.id;

    console.log('Get fragments for id:', id);

    res.json({ success: false });
});

router.post('/fragments', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    
    let id = req.body.id;
    let fragments = req.body.fragments;

    console.log('Saving fragments for id:', id);

    let phrases = new Array();

	for (var start = 0; start < fragments.length; start++) {
        let phrase = "";
        let wordCount = 0;
		let startFragment = fragments[start];

		for (let i = start; i < fragments.length; i++) {
            let fragment = fragments[i];
            
            phrase = phrase + fragment.word.toLowerCase() + " ";
            wordCount++;

			phrases.push(new Fragment({
                id: id,
				start: startFragment.start,
				end: fragment.end,
                phrase: phrase.substring(0, phrase.length - 1),
                reviewed: false,
                wordCount: wordCount
			}));
		}
	}

	// console.log('All possible phrases:');
    console.log(phrases);
    
    Fragment.insertMany(phrases)
		.then(function (mongooseDocuments) {
			res.json({ success: true });
		})
		.catch(function (err) {
            console.log(err);
			res.json({ success: false, error: err });
		});

    //res.json({success: false});
});

router.post('/tts', (req, res, next) => {

    let text = req.body.text.toLowerCase();
    console.log('tts:', text);

    // Split the given phrase into words and make all possible combinations of these words
    let words = text.toLowerCase().split(' ');
	let combinations = new Array();

	for (var start = 0; start < words.length; start++) {
		var phrase = "";
		for (var i = start; i < words.length; i++) {
			phrase = phrase + words[i] + " ";
			combinations.push(phrase.substring(0, phrase.length - 1));
		}
	}

    // Prepare database query 
    let results = new Array();
	let promises = combinations.map(function (phrase) {
		return new Promise(function (resolve, reject) {
			// Do query here and resolve or reject when done
			Fragment.findOne({ 'phrase': phrase }, (err, fragment) => {
				if (!err) {
					// console.log(err, fragment);
					if(fragment) {
						results.push(fragment);
					}
				}
				resolve();
			});
		});
	});

    // Execute database query
	Promise.all(promises).then(function () {

        // Sort on amount of words in one result first
        function compare(a, b) {
            if (a.phrase.split(' ').length > b.phrase.split(' ').length)
                return -1;
            if (a.phrase.split(' ').length < b.phrase.split(' ').length)
                return 1;
            return 0;
        }

        results.sort(compare);
        console.log('All matching results:', results);

        if(results.length == 0) {
            res.json({success: false, err: "No results found"});
            return;
        }

        // 
        let fragmentsToProcess = new Array();
        let textToProcess = text;

        for(let result of results) {
            console.log('Trying to match', result.phrase, 'on string', textToProcess);

            if(textToProcess.indexOf(result.phrase) != -1) {
                // console.log(result.phrase, 'is STILL part of string', textToProcess);
                console.log('Found start of phrase at position', textToProcess.indexOf(result.phrase));
                textToProcess = textToProcess.replace(result.phrase, '');

                // Always find last already found match so we can use that index
                let processedResultIndex = -1;
                for(let i = 0; i < fragmentsToProcess.length; i++) {
                    let processedResult = fragmentsToProcess[i];

                    if(processedResult.result.phrase == result.phrase && processedResultIndex < processedResult.order) {
                        processedResultIndex = processedResult.order + processedResult.result.phrase.length;
                    }
                }

                fragmentsToProcess.push({order: text.indexOf(result.phrase, processedResultIndex), result: result });
                
                console.log('String that is left over to parse is', textToProcess);
            }

            if(textToProcess == "") { 
                console.log('Done trying to find the best phrase match from database result!');
            }
        }

        console.log('Fragments to process:', fragmentsToProcess);

        let processedFragments = new Array();
		let promises = fragmentsToProcess.map(function (fragment) {
            return new Promise(function (resolve, reject) {

                // console.log("F:", fragment.result);

                let filepath = __dirname  + '/../youtube/' + fragment.result.id + '.mp3';

                ffmpeg(filepath)
                    .setStartTime(fragment.result.start)
                    .setDuration(fragment.result.end - fragment.result.start)
                    .output(__dirname  + '/../temp/' + fragment.result.phrase + '.mp3')
                    .on('end', function(err) {
                        if(!err)
                        {
                            processedFragments.push({order: fragment.order, phrase: fragment.result.phrase, file: '/temp/' + fragment.result.phrase + '.mp3'})
                            resolve();
                            //console.log('conversion Done');
                        }
                    })
                    .on('error', function(err){
                        console.log('ffmpeg error:', err);
                        // Intel keeps breaking it
                        resolve();
                    }).run();

            });
        });

        Promise.all(promises).then(function () {

            // Sort on order
            function compare(a, b) {
                if (a.order < b.order)
                    return -1;
                if (a.order > b.order)
                    return 1;
                return 0;
            }

            processedFragments.sort(compare);

            let tempFiles = new Array();
            processedFragments.forEach(function(fragment) {
                tempFiles.push(__dirname + "/.." + fragment.file);
            });

            console.log('Concatting tempfiles into one file:', tempFiles);

            // concat all the temp fragment files into one
            let outputfilename = guid.create() + '.mp3';
            audioconcat(tempFiles)
                .concat(__dirname + "/../fragments/" + outputfilename)
                .on('start', function (command) {
                    console.log('ffmpeg process started:', command)
                })
                .on('error', function (err, stdout, stderr) {
                    console.error('Error:', err)
                    console.error('ffmpeg stderr:', stderr)
                })
                .on('end', function () {

                    tempFiles.forEach(function(file) {
                        console.log('Deleting temp fragment file', file);
                        fs.unlink(file, function() {});
                    });

                    console.log('Audio created in:', "/fragments/" + outputfilename)
                    res.json({file: "/fragments/" + outputfilename});
                })

            //res.json(responses);
        }).catch(console.error);
	});
});


module.exports = router;