import { Router, Request, Response } from 'express';
import { ErrorHandler } from './errorHandler';
import passport from 'passport';
import AudioService from '../services/audio';
import { Fragment } from '../database/schemas/fragment';

const router: Router = Router();

router.post('/download', passport.authenticate('jwt', { session: true }), (req: Request, res: Response) => {

    let url: string = req.body.url;
    let userId = req.user!._id;

    console.log('wanting to download:', url);

    AudioService.download(url, userId).then((file: any) => {

        console.log('done downloading audio file:', file)

        Fragment.find({ 'source': file.sourceId }).populate('word').then(fragments => {

            var response = {
                url: file.url,
                sourceId: file.sourceId,
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