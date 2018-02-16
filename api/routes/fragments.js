const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Fragment = require('../models/fragment');
const FragmentsService = require('../services/fragments');

router.post('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {

	let sourceId = req.body.sourceId;
	let fragments = req.body.fragments;

	try {
		FragmentsService.submit(sourceId, fragments, req.user._id).then(fragments => {
			res.json({ success: true });
		});
		
	}
	catch(err) {
		console.log(err);
		res.json({ success: false, error: err });
	}

});

router.get('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {
	res.json({ success: false });
});

module.exports = router;