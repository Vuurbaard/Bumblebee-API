import { Router, Request, Response } from 'express';
// import { ErrorHandler } from '../errorHandler';
import { IFragment, Fragment } from '../../database/schemas/fragment';
import passport from 'passport';
import WordService from '../../services/word';
import FragmentService from '../../services/fragment';

const router: Router = Router();

router.get('/', passport.authenticate('jwt', { session: true }), (req: Request, res: Response) => {
    Fragment.find({}, (err: any, users: [IFragment]) => {
        if (err) {
            // ErrorHandler(err, req, res, "GET all fragments failed");
        }
        else {
            res.json(users);
        }
    });
});

router.post('/', passport.authenticate('jwt', { session: true }), (req: Request, res: Response) => {
    let sourceId = req.body.sourceId;
    let fragments = req.body.fragments;
    let userId = req.user!._id;

    FragmentService.save(fragments, sourceId, userId).then(fragments => {
        console.log('saved fragments:', fragments);
        res.json({ success: true });
    }).catch(err => {
        console.log(err);
		res.json({ success: false, error: err });
    });
});

router.get('/:id', passport.authenticate('jwt', { session: true }), (req: Request, res: Response) => {

    let id: number = req.params.id;

    console.log('/fragments/:id', id);

    Fragment.findById(id, (err: any, user: IFragment) => {
        if (err) {
            // ErrorHandler(err, req, res, "GET fragment by id " + id + " failed.");
        }
        else {
            res.json(user);
        }
    });
});

export const FragmentsRoute: Router = router;