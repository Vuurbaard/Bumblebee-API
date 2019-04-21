import { Source } from "../database/schemas";

class SourceService {

	constructor() { }

	async all(query?: any) {
		return Source.find(query || {}).populate({ path: 'fragments', select: '_id', options : { sort : { 'start' : 1 }} , populate: { path: 'word', select: 'text' } });
	}

	async getByID(id: string) {
		let source = await Source.findById(id).populate({ path: 'fragments', populate: { path: 'word' } });
		return source ? source : {}
	}
}

export default new SourceService();