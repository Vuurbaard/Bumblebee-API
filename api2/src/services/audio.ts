import q from 'q';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ytdl from 'ytdl-core';
import { Source } from '../database/schemas/source';

class AudioService {

    extension: string = ".mp3";

    public constructor() {

    }

    public download(url: string, userId: string) {
        let deferred = q.defer();

        if (url.indexOf('youtube.com') != -1) {
            this.downloadFromYouTube(url).then((file: any) => {

                console.log('done downloading audio:', file);

                // TODO: Move this to private function?
                Source.findOne({ 'id': file.id, 'origin': 'YouTube' }, (err, source) => {
                    if (err) { deferred.reject(err); }
                    else if (source) { 
                        deferred.resolve({ url: file.publicpath, sourceId: source._id }); 
                    }
                    else { // Insert

                        console.log('Inserting new source', file.id, file.origin);
                        let newSource = new Source({ id: file.id, origin: 'YouTube', createdBy: userId });
                        newSource.save((err, source) => {
                            if (err) { deferred.reject(err); }
                            else if (source) {
                                deferred.resolve({ url: file.publicpath, sourceId: source._id });
                            }
                        });
                    }
                });


            }).catch(deferred.reject);
        }

        return deferred.promise;
    }

    public downloadFromYouTube(url: string) {
        let deferred = q.defer();

        let youtubeID = url.replace('https://www.youtube.com/watch?v=', '');
        let filename = youtubeID + this.extension;
        let filepath = path.resolve(__dirname, '../audio/youtube/' + filename);
        let publicfilepath = '/audio/youtube/' + filename;

        var file = {
            id: youtubeID,
            filename: filename,
            path: filepath,
            publicpath: publicfilepath
        }

        if (!fs.existsSync(filepath)) {
            console.log('Download of youtube video', youtubeID, 'starting...');
            ffmpeg()
                .input(ytdl(url))
                .noVideo()
                .audioBitrate(256)
                .save(filepath)
                .on('error', err => {
                    console.error(err);
                    deferred.reject(err);
                })
                .on('end', function () {
                    console.log("Done downloading", youtubeID, "from YouTube");
                    deferred.resolve(file);
                });
        }
        else {
            deferred.resolve(file);
        }

        return deferred.promise;
    }
}

export default new AudioService();