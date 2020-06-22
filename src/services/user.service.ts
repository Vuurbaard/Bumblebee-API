import authenticationService from "./authentication.service";
import { User, IUser } from "../database/schemas";

class UserService {

	constructor() { }

	async all(query?: any) {
		return User.find(query || {}, { password: 0, roles: 0 });
	}

	async exists(query: any) {
		return User.exists(query);
	}	

	async getByID(id: string) {
		let user = await User.findById(id, { password: 0, roles: 0 });
		return user ? user : {}
	}

	async create(username: string, password: string, email?: string, name?: string, externalId?: string, avatar?: string) {

		if (!username) { throw new Error('Username is required.'); }
		if (!password) { throw new Error('Password is required.'); }
		if (!email) { throw new Error('Email is required.'); }

		// Throw error if the user already exists by username
		let existingUser = await User.findOne({ username: username });
		if (existingUser) { throw new Error('Username already taken.'); }

		existingUser = await User.findOne({ email: email });
		if (existingUser) { throw new Error('E-mail already taken.'); }

		let newUser = new User({
			username: username,
			password: await authenticationService.hashPassword(password) as string,
			email: email,
			name: name,
			externalId: externalId,
			avatar: avatar,
		});

		let user = await newUser.save();

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