import { Fragment } from '../database/schemas/fragment.schema';
import { IUser } from '../database/schemas';

class FragmentService {

	public constructor() { }

	public async all(query?: any) {
		return Fragment.find(query || {}).populate('word');
	}

	public async getByID(id: string) {
		const fragment = await Fragment.findById(id);
		return fragment ? fragment : {}
	}

	public async create(user: IUser, fields: any) {

		if(fields.id) {
			return this.getByID(fields.id);
		}

		fields.createdBy = user;
		const newFragment = new Fragment(fields);

		return await newFragment.save();
	}

	public async update(user: IUser, id: string, fields: any) {
		return await Fragment.findByIdAndUpdate(id, fields);
	}

	public async delete(user: IUser, id: string) {
		return await Fragment.findByIdAndDelete(id);
	}
}

export default new FragmentService();