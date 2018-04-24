import { Router, Request, Response } from 'express';
import { User, IUser } from '../database/schemas';
import { ErrorHandler } from './errorHandler';
import VoiceBox from '../services/voicebox';

const router: Router = Router();

router.post('/tts', (req: Request, res: Response) => {

    console.log('POST /tts');

    let text: string = req.body.text;

    console.log('voicebox tts:', text);

    VoiceBox.tts(text).then((result) => {
        console.log('tts result:', result);
        res.json(result);
    }).catch(err => {
        console.log('tts error:', err);
    });

});

export const HomeRoute: Router = router;