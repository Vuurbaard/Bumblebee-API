import { Router, Request, Response } from 'express';
import { ErrorHandler } from './errorHandler';
import passport from 'passport';
import AudioService from '../services/audio';
import { Fragment } from '../database/schemas/fragment';
import { ISource } from '../database/schemas/source';

const router: Router = Router();

router.post('/download', passport.authenticate('jwt', { session: true }), (req: Request, res: Response) => {

    let url: string = req.body.url;
    let userId = req.user!._id;

    console.log('wanting to download:', url);

    AudioService.download(url, userId).then((source: any ) => {

        console.log('done downloading audio file:', source)

        Fragment.find({ 'source': source._id }).populate('word').then(fragments => {

            var response = {
                url: AudioService.sourceUrl(source),
                sourceId: source._id,
                fragments: fragments
            }

            console.log('succeeded downloading', url, response);

            res.json(response);
        });

    }).catch(err => {
        console.log('error downloading', url, err);
    });

    // res.sendStatus(200);

});

export const AudioRoute: Router = router;