import bcrypt from 'bcryptjs';

class AuthenticationService {

	constructor() { }

	async hashPassword(password: string) {

		const hash = await new Promise(function (resolve, reject) {
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