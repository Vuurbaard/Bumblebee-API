import { Rule } from '../rule';
import { isString, isNumber } from 'util';

export class Required extends Rule {

	protected async validate(data?: any): Promise<boolean> {
		return (data !== null && data !== undefined) && 
			(
				(isString(data) && data.length > 0) || // Validate string
				(isNumber(data) && data > 0) // Validate number
			);
	}


	public message(): string {
		return "The :attribute field is required.";
	}
	
}