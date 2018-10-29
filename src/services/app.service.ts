import { App, IApp } from "../database/schemas/app.schema";
import { IUser } from "../database/schemas";

class AppService {

	constructor() { }

	async all(query?: any) {
		return App.find(query || {});
	}

	async getOne(query?: any) {
		return App.findOne(query || {});
	}

	async getByID(id: string) {
		let app = await App.findById(id);
		return app ? app : {}
	}

	async create(user: IUser, name: string, avatar?: string) {

		if (!user) { throw new Error('User is required.'); }
		if (!name) { throw new Error('Name is required.'); }

		// Throw error if the app already exists by name
		let exists = await App.findOne({ name: name });
		if (exists) { throw new Error('Name already taken.'); }

		let newApp = new App({ name: name, avatar: avatar, createdBy: user });

		return await newApp.save((err: any, app: IApp) => {
			if (err) { throw err; }
			return app.toObject();
		});
	}

	async updateByID(id: string, name: string) {
		if (!name) { throw new Error('Name is required.'); }

		// Throw error if the app already exists by name
		let exists = await App.findOne({ name: name });
		if (exists) { throw new Error('Name already taken.'); }

		return await App.findByIdAndUpdate(id, { name: name }, { new: true });
	}

	async deleteByID(id: string) {
		return await App.findByIdAndRemove(id);
	}
}

export default new AppService();