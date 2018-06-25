import { Source } from "../database/schemas/source";

class SourceService {

	constructor() { }

	async all(query?: any) {
		return Source.find(query || {}).populate({ path: 'fragments', populate: { path: 'word' } });
	}

	async getByID(id: string) {
		let source = await Source.findById(id).populate({ path: 'fragments', populate: { path: 'word' } });
		return source ? source : {}
	}
}

export default new SourceService();