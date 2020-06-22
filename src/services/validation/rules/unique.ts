import { Rule } from '../rule';

export class Unique extends Rule {

	constructor(private callback: Function) {
		super();

	}
	protected validate(data?: any): Promise<boolean> {
		return this.callback(data);
	}
	public message(): string {
		return "The :attribute has already been taken.";
	}
	
}