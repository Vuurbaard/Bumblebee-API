import { ISource } from '../../database/schemas';

export interface ISourceProvider {
	basepath(): string;
	download(url: string, userId?: string): Promise<ISource>;
	sourceUrl(source: ISource): string;
	canHandle(url: string): boolean;
	sourceIdentifier(): string;
}