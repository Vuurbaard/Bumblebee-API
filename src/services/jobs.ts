import q from 'q';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ytdl from 'ytdl-core';
import { Source } from '../database/schemas/source';
import AudioService from './audio';



class JobService {

    extension: string = ".mp3";

    public constructor() {
    }


    public async handleMissingYoutubeFiles(){
        console.log("Run this stuff async like a boss?");
        console.log(AudioService);

        // Retrieve all sources
        // Source.find({origin: 'YouTube'}).then(data => {
        //     console.log(data);
        // });

    }



}

export default new JobService();