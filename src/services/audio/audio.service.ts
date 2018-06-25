import q from 'q';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ytdl from 'ytdl-core';

import YouTubeService from './youtube.service';
import { Source, ISource } from '../../database/schemas/source';
import { ISourceProvider } from './ISourceProvider';

class AudioService {

    extension: string = ".mp3";
    handlers: Array<ISourceProvider> = [];

    public constructor() {
        this.handlers.push(YouTubeService);
    }
    /**
     * Returns the service based on the given url
     */

    private service(url: string) : ISourceProvider|null{
        let rc = null;


        for(let i=0;i<this.handlers.length;i++){
            let handler : ISourceProvider = this.handlers[i];
            if(handler.canHandle(url)){
                rc = handler;
                break;
            };
        }

        return rc;
    }

    public sourceUrl(source: ISource){
        let service = null;

        for(let i=0;i<this.handlers.length;i++){
            let handler : ISourceProvider = this.handlers[i];
            if(source.origin.toString() == handler.sourceIdentifier()){
                service = handler;
                break;
            };
        }

        if(service != null){
            return service.sourceUrl(source); 
        }

        return "";
    }

    public download(url: string, userId: string) : Promise<ISource> {
        let deferred = q.defer<ISource>();

        let service : ISourceProvider | null = this.service(url);

        if(service != null){
            service.download(url,userId).then( source => {
                deferred.resolve(source);

            }, err => {
                deferred.reject(err);
            });
        }

        return deferred.promise;
    }
}

export default new AudioService();