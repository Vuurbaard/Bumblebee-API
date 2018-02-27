import { Router, Request, Response } from 'express';
import { User, IUser } from '../database/schemas';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
    User.find({}, (err: any, users: [IUser]) => {
        console.log(err, users);
        if (err) { res.status(404); }
        else { res.json(users); }
    });
});

router.get('/:id', (req: Request, res: Response) => {

    let id: number = req.params.id;

    console.log('/users/:id', id);

    User.findById(id, (err: any, user: IUser) => {
        console.log(err);
        if (err.name == "CastError") { res.sendStatus(400); }
        else if(err) { res.sendStatus(500); }
        else { res.json(user); }
    });
});

export const UsersRoute: Router = router;