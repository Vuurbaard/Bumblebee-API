import { Router, Request, Response } from 'express';
import { ErrorHandler } from '../errorHandler';
import { Source, ISource } from '../../database/schemas/source';
import passport from 'passport';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {

    Source.find({}).populate('fragments').populate({path: 'fragments', populate: { path: 'word'}}).then(sources => {
        res.json(sources);
    }).catch(err => {
        ErrorHandler(err, req, res, "GET all sources failed");
    });

});

router.get('/:id', passport.authenticate('jwt', { session: true }), (req: Request, res: Response) => {

    let id: number = req.params.id;

    console.log('/sources/:id', id);

    Source.findById(id, (err: any, user: ISource) => {
        if (err) {
            ErrorHandler(err, req, res, "GET source by id " + id + " failed.");
        }
        else {
            res.json(user);
        }
    });
});

export const SourcesRoute: Router = router;