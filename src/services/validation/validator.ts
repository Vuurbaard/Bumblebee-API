import { Rule } from "./rule";
import { ValidationException } from "./validationException";
import * as _ from "lodash";


/**
 * Input validator
 * 
 */
export class Validator {

	private errors: any = {};

	constructor(private rules: any, private throwOnError: boolean = true) {
	}

	public async validate(data: any): Promise<boolean> {
		
		let errorMessages = {} as any;
		let hasErrors = false;

		for(let key in this.rules) {
			let inputData = this.getKey(key, data);
			let rules = this.rules[key];
			let valid = true;

			for(let i in rules) {
				let rule = rules[i] as Rule;
				let isValid = await rule.run(inputData);
				if(!await rule.run(inputData)){
					hasErrors = true;
					let errorMessage = rule.message().replace(':attribute', key);
					if(errorMessages[key] == null) {
						errorMessages[key] = [];
					}
					errorMessages[key].push(errorMessage);
					break;
				};
			}
		}

		if(hasErrors) {
			this.errors = errorMessages;

			if(this.throwOnError) {
				throw new ValidationException(this);
			}

			return false;
		}

		return true;
	}

	public messages() {
		return this.errors;
	}

	public toJSON() {
		return {
			'error' : 'Incorrect data has been given for this request.',
			'messages' : this.errors
		}
	}

	protected getKey(key: string, data?: any): any {
		return _.get(data, key);
	}

}