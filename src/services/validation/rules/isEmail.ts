import { Rule } from '../rule';
import { isString } from 'util';
import validateEmail from 'validator/lib/isEmail';

export class isEmail extends Rule {

	protected async validate(data?: any): Promise<boolean> {
		return isString(data) && validateEmail(data);
	}


	public message(): string {
		return "The :attribute field must be a valid e-mail address.";
	}
	
}