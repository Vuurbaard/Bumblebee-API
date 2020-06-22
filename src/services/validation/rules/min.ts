import { Rule } from '../rule';
import { isString, isNumber } from 'util';

export class Min extends Rule {

	constructor(private type: string = 'string', private length: number) {
		super();
		let allowedTypes = ['string', 'number'];

		if(!allowedTypes.includes(type)){
			throw new Error('Min can only be of type [' + allowedTypes.join(', ') + ']');
		}

		if(length <= 0) {
			throw new Error('Min must have a length of 0 or greather');
		}
	}

	protected async validate(data?: any): Promise<boolean> {
		let rc = false;

		if(isString(data) && this.type === 'string') {
			rc = data.length > this.length;
		}

		if(isNumber(data) && this.type === 'number') {
			rc = data > this.length;
		}

		return rc;
	}

	public message(): string {
		
		let message = "";

		switch(this.type) {
			case "string":
				message = "The :attribute must be atleast " + this.length + " characters long."
			break;
			case "number":
				message = "The :attribute must be greather than " + this.length + "."
			break;
		}

		return message;
	}
	
}