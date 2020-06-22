
export abstract class Rule {
	protected abstract async validate(data?: any): Promise<boolean>;
	public abstract message(): string;

	public async run(data?: any): Promise<boolean> {
		return this.validate(data);
	}

}