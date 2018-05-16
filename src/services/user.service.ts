import { User, IUser } from "../database/schemas";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';

class UserService {

	constructor() { }

	async all() {
		return User.find({}, { password: 0 });
	}

	async getByID(id: string) {
		return User.findById(id, { password: 0 });
	}

	async create(username: string, password: string, email?: string, name?: string, externalId?: string, avatar?: string) {

		if (!username) { throw new Error('Username is required.'); }
		if (!password) { throw new Error('Password is required.'); }

		let newUser = new User({
			username: username,
			password: password,
			email: email,
			name: name,
			externalId: externalId,
			avatar: avatar,
		});

		// Throw error if the user already exists by username
		let existingUser = await User.findOne({ username: newUser.username });
		if (existingUser) { throw new Error('Username already taken.'); }

		let user = await new Promise(function (resolve, reject) {
			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(newUser.password, salt, (err, hash) => {
					if (err) { throw err; }

					newUser.password = hash;
					newUser.save((err: any, user: IUser) => {
						if (err) { throw err; }
						resolve(user.toObject());
					});
				});
			});
		});

		return user;
	}
}

export default new UserService();