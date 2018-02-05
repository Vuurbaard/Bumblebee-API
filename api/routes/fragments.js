const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Fragment = require('../models/fragment');
const FragmentsService = require('../services/fragments');

router.post('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {

	let sourceId = req.body.sourceId;
	let fragments = req.body.fragments;

	FragmentsService.submit(sourceId, fragments).then(() => {
		res.json({ success: true });
	}).catch(err => {
		res.json({ success: false, error: err });
	});

});

router.get('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {
	res.json({ success: false });
});

module.exports = router;