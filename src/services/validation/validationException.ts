import { Validator } from "./validator";


export class ValidationException extends Error {

	constructor(private validator: Validator) {
		super('Validation Exception occured');
	}

	public toJSON(){
		return this.validator.toJSON();
	}

}