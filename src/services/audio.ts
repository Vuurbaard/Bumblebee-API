import q from 'q';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ytdl from 'ytdl-core';

import YouTubeService from './youtube';
import { Source, ISource } from '../database/schemas/source';
import { ISourceHandler } from './ISourceHandler';

class AudioService {

    extension: string = ".mp3";

    handlers: Array<ISourceHandler> = [];

    public constructor() {
        this.handlers.push(YouTubeService);
    }
    /**
     * Returns the service based on the given url
     */

    private service(url: string) : ISourceHandler|null{
        let rc = null;
        
        if(url.indexOf('youtube.com') != -1){
            rc = YouTubeService;
        }

        return rc;
    }

    public sourceUrl(source: ISource){
        let service = null;
        switch(source.origin.toString()){
            case "YouTube":
                service = YouTubeService;
            break;
        }

        if(service != null){
            return YouTubeService.sourceUrl(source); 
        }
        return "";
    }

    public download(url: string, userId: string) {
        let deferred = q.defer();

        let service : ISourceHandler | null = this.service(url);

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