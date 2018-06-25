import { IFragment, Fragment } from '../database/schemas/fragment';
import { IUser } from '../database/schemas';


class FragmentService {

	public constructor() { }

	public async all(query?: any) {
		return Fragment.find(query || {});
	}

	public async getByID(id: string) {
		let fragment = await Fragment.findById(id);
		return fragment ? fragment : {}
	}

	public async create(user: IUser, fields: any) {

		fields.createdBy = user;
		let newFragment = new Fragment(fields);

		return await newFragment.save();
	}

	public async update(user: IUser, id: string, fields: any) {
		return await Fragment.findByIdAndUpdate(id, fields);
	}
}

export default new FragmentService();