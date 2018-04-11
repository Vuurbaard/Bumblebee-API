import { ISource } from '../database/schemas/source';
export interface  ISourceHandler {


    basepath() : string;
    download(url : string, userId? : string) : Promise<ISource>;

    sourceUrl(source : ISource) : string;


}