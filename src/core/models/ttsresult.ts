import { Fragment } from "src/database/schemas/fragment.schema";

export class TTSresult {

	public words: Array<string> = [];
	public missing: Array<string> = [];
	public fragments: Array<Fragment> = [];

	constructor(){

	}
}
