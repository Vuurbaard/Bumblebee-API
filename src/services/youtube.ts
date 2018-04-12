import q from 'q';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ytdl from 'ytdl-core';
import { ISource, Source } from '../database/schemas/source';
import AudioService from './audio';
import { ISourceProvider } from './ISourceProvider';



class YouTubeService implements ISourceProvider {

    private extension = ".mp3";

    public constructor() {
    }

    public basepath() : string {
        return "/audio/youtube/";
    };

    public sourceUrl(source : ISource){
        let filename = source.id.toString() + this.extension;
        let filepath = path.resolve(__dirname, '..' + this.basepath() + filename);
        let publicfilepath = this.basepath() + filename;
        return publicfilepath;
    }

    public download(url : string, userId? : string) : Promise<ISource>{
        let vm = this;
        userId = userId ? userId : '';

        return new Promise((resolve,reject) => {
            let id = this.identifier(url);
            let filename = id + this.extension;
            let filepath = path.resolve(__dirname, '..' + this.basepath() + filename);
            let publicfilepath = this.basepath() + filename;
    
            var file = {
                id: this.identifier(url),
                filename: filename,
                path: filepath,
                publicpath: publicfilepath
            }

            if (!fs.existsSync(filepath)) {
                console.log('Download of youtube video', id, 'starting...');
                ffmpeg()
                    .input(ytdl(url))
                    .noVideo()
                    .audioBitrate(256)
                    .audioFrequency(44100)
                    .save(filepath)
                    .on('error', err => {
                        reject(err);
                    })
                    .on('end', function () {
                        console.log("Done downloading", id, "from YouTube");
                        //resolve(file);
                        vm.source(id).then((src : ISource | null) => {
                            if (src) { 
                                resolve(src); 
                            }
                            else { // Insert
                                let newSource = new Source({ id: file.id, origin: 'YouTube', createdBy: userId });
                                newSource.save((err, src) => {
                                    if (err) { reject(err); }
                                    else if (src) {
                                        resolve(src);
                                    }
                                });
                            }
                        });
                    });
            }
            else {
                this.source(id).then((src : ISource | null) => {
                    if (src) { 
                        resolve(src); 
                    }
                    else { // Insert
                        reject();
                    }
                });
            }
        });
    }

    /* Helper functions */

    /**
     * 
     * @param url YouTube url
     * @returns Identifier based on YouTube url
     */
    private identifier(url : string ){
        let regex = /v=([A-z0-9_-]*)/g;
        let matches = regex.exec(url);
    
        if(matches != null && matches['index'] > 0){
            return matches[1];
        }

        return '';
    }

    private source(id : string){
        return Source.findOne({'id': id, 'origin' : 'YouTube'});
    }

    public canHandle( url : string ) : boolean {
        return (url.indexOf('youtube.com') != -1 && this.identifier(url) != '');
    }

    public sourceIdentifier() : string {
        return "YouTube";
    }

}

export default new YouTubeService();