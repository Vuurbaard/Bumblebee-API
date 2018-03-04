import { Router, Request, Response } from 'express';
import { User, IUser } from '../../database/schemas';
import { ErrorHandler } from '../errorHandler';
import passport from 'passport';

const router: Router = Router();

router.get('/', passport.authenticate('jwt', { session: true }), (req: Request, res: Response) => {
    User.find({}, (err: any, users: [IUser]) => {
        if (err) {
            ErrorHandler(err, req, res, "GET all users failed");
        }
        else {
            res.json(users);
        }
    });
});

router.get('/:id', passport.authenticate('jwt', { session: true }), (req: Request, res: Response) => {

    let id: number = req.params.id;

    console.log('/users/:id', id);

    User.findById(id, (err: any, user: IUser) => {
        if (err) {
            ErrorHandler(err, req, res, "GET user by id " + id + " failed.");
        }
        else {
            res.json(user);
        }
    });
});

export const UsersRoute: Router = router;