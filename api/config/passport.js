const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
const config = require('../config/database');

module.exports = function (passport) {

	let opts = {};
	opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("JWT");
	opts.secretOrKey = config.secret;

	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

	passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
		User.getUserById(jwt_payload._id, (err, user) => {
			if (err) { return done(err, false); }
			if (user) {
				return done(null, user);
			}
			else {
				return done(null, false);
			}
		});
	}));

}