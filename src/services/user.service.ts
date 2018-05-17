import { User, IUser } from "../database/schemas";
import authenticationService from "./authentication.service";

class UserService {

	constructor() { }

	async all() {
		return User.find({}, { password: 0, roles: 0 });
	}

	async getByID(id: string) {
		return User.findById(id, { password: 0, roles: 0 });
	}

	async create(username: string, password: string, email?: string, name?: string, externalId?: string, avatar?: string) {

		if (!username) { throw new Error('Username is required.'); }
		if (!password) { throw new Error('Password is required.'); }

		// Throw error if the user already exists by username
		let existingUser = await User.findOne({ username: username });
		if (existingUser) { throw new Error('Username already taken.'); }

		let newUser = new User({
			username: username,
			password: await authenticationService.hashPassword(password),
			email: email,
			name: name,
			externalId: externalId,
			avatar: avatar,
		});

		let user = await newUser.save((err: any, user: IUser) => {
			if (err) { throw err; }

			let newUser = user.toObject();
			delete newUser.password;
			delete newUser.roles;
			return newUser;
		});

		return user;
	}

	async updateByID(id: string, fields: any) { // username?: string, password?: string, email?: string, name?: string, externalId?: string, avatar?: string
		return await User.findByIdAndUpdate(id, fields);
	}
}

export default new UserService();