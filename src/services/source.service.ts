import { Source } from "../database/schemas";

class SourceService {

	constructor() { }

	async all(query?: any) {

		return Source.find(query || {}).populate({ path: 'fragments', select: '_id' , populate: { path: 'word', select: 'text' } });
	}

	async getByID(id: string) {
		let source = await Source.findById(id).populate({ path: 'fragments', populate: { path: 'word' } });
		return source ? source : {}
	}
}

export default new SourceService();