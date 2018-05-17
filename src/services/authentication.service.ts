import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';

class AuthenticationService {

	constructor() { }

	async hashPassword(password: string) {

		let hash = await new Promise(function (resolve, reject) {
			bcrypt.genSalt(10, (err, salt) => {
				if (err) { throw err; }
				bcrypt.hash(password, salt, (err, hash) => {
					if (err) { throw err; }
					resolve(hash);
				});
			});
		});

		return hash;
	}
}

export default new AuthenticationService();