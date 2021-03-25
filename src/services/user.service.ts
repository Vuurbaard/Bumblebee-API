import authenticationService from "./authentication.service";
import { User, IUser } from "../database/schemas";

class UserService {

	constructor() { }

	async all(query?: any) {
		return User.find(query || {}, { password: 0, roles: 0 });
	}

	async getByID(id: string) {
		let user = await User.findById(id, { password: 0, roles: 0 });
		return user ? user : {}
	}

	async create(username: string, password: string, email?: string, name?: string, externalId?: string, avatar?: string) {

		if (!username) { throw new Error('Username is required.'); }
		if (!password) { throw new Error('Password is required.'); }

		// Throw error if the user already exists by username
		let existingUser = await User.findOne({ username: username });
		if (existingUser) { throw new Error('Username already taken.'); }

		let newUser = new User({
			username: username,
			password: await authenticationService.hashPassword(password) as string,
			email: email,
			name: name,
			externalId: externalId,
			avatar: avatar,
		});

		const user = newUser.save((err: any, user: IUser) => {
			if (err) { throw err; }

			const newUser = user.toObject();

			return {
				name: newUser.name,
				email: newUser.email,
				username: newUser.username,
				avatar: newUser.avatar ?? '',
				externalId: newUser.externalId
			};
		});

		return user;
	}

	async updateByID(id: string, fields: any) { // username?: string, password?: string, email?: string, name?: string, externalId?: string, avatar?: string
		return await User.findByIdAndUpdate(id, fields, { new: true });
	}

	async deleteByID(id: string) {
		return await User.findByIdAndRemove(id);
	}
}

export default new UserService();