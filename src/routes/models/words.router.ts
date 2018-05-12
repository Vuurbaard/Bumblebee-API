import { Router, Request, Response } from 'express';
// import { ErrorHandler } from '../errorHandler';
import { Word, IWord } from '../../database/schemas/word';
import passport from 'passport';

const router: Router = Router();

router.get('/', passport.authenticate('jwt', { session: true }), (req: Request, res: Response) => {
    Word.find({}, (err: any, users: [IWord]) => {
        if (err) {
            // ErrorHandler(err, req, res, "GET all words failed");
        }
        else {
            res.json(users);
        }
    });
});

router.get('/:id', passport.authenticate('jwt', { session: true }), (req: Request, res: Response) => {

    let id: number = req.params.id;

    console.log('/words/:id', id);

    Word.findById(id, (err: any, user: IWord) => {
        if (err) {
            // ErrorHandler(err, req, res, "GET word by id " + id + " failed.");
        }
        else {
            res.json(user);
        }
    });
});

export const WordsRoute: Router = router;