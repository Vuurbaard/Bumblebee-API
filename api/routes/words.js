const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Word = require('../models/word');

router.get('/words', passport.authenticate('jwt', {session: false}), (req, res, next) => {
	Word.find({}).then(words => {
		res.json({ words: words });
	});
});

module.exports = router;