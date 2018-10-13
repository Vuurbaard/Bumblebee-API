import { PassportStatic } from 'passport';
import * as passportjwt from "passport-jwt";
import { User } from './schemas/user.schema';

module.exports = function (passport: PassportStatic) {

	let opts: any = {};
	opts.jwtFromRequest = passportjwt.ExtractJwt.fromAuthHeaderWithScheme("JWT");
	opts.secretOrKey = "SomethingVerySecret";

	passport.serializeUser((user: any, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => {
			done(err, user as any);
		});
	});

	passport.use(new passportjwt.Strategy(opts, (jwt_payload, done) => {
		User.findById(jwt_payload._id, { password: 0 }, (err, user) => { // exclude hashed password
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