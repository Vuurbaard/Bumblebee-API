const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Source = require('../models/source');

router.get('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {

	// TODO: Move to service?

	Source.find({}).populate('fragments').populate({path: 'fragments', populate: { path: 'word'}}).then(function (sources) {
		res.json(sources);
	});

});

module.exports = router;