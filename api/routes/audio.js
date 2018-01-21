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
const process = require('process');

const Audio = require('../services/audio');
const Fragments = require('../services/fragments');
const Engine = require('../services/engine');

router.post('/download', passport.authenticate('jwt', { session: false }), (req, res, next) => {

	let url = req.body.url;

	Audio.download(url).then(result => {
		Audio.saveSource(result.file.id, result.origin).then(source => {

			Fragments.getFragmentsBySource(source).then(function (fragments) {

				res.json({
					url: result.file.publicpath,
					sourceId: source._id,
					fragments: fragments
				});
			});

		});
	});

});

router.post('/fragments', passport.authenticate('jwt', { session: false }), (req, res, next) => {

	let sourceId = req.body.sourceId;
	let fragments = req.body.fragments;

	Fragments.submit(sourceId, fragments).then(() => {
		res.json({ success: true });
	}).catch(err => {
		res.json({ success: false, error: err });
	});

});

router.get('/fragments', passport.authenticate('jwt', { session: false }), (req, res, next) => {
	res.json({ success: false });
});

router.post('/tts', (req, res, next) => {

	let text = req.body.text.toLowerCase();

	Engine.asyncmagic(text).then((result) => {

		console.log('asyncmagic result:', result);
		res.json(result);

	}).catch(error => {

		if (error.stack) {
			console.log(error.stack.toString().red);
		}
		else {
			console.log(error.toString().red);
		}

		if (error.status) {
			res.status(error.status).json(error);
		}
		else {
			res.status(500);
		}
	});

});


module.exports = router;