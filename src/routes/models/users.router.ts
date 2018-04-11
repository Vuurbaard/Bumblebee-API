import { Router, Request, Response } from 'express';
import { User, IUser } from '../../database/schemas';
import { ErrorHandler } from '../errorHandler';
import passport from 'passport';
import bcrypt from 'bcryptjs';

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

router.post('/', (req: Request, res: Response) => {

    let externalId: string = req.body.externalId;
    let email: string = req.body.email;
    let username: string = req.body.username;
    let password: string = req.body.password;
    let avatar: string = req.body.avatar;
    let name: string = req.body.name;

    console.log('POST /users/', email, username);

    User.findOne({ externalId: externalId }, (err: any, user: IUser | null) => {
        if (err) {
            ErrorHandler(err, req, res, "POST user " + externalId + "(" + username + ") failed.");
        }
        else {
            if (user) {

                // Update some fields
                user.name = name;
                user.avatar = avatar;
                user.save();

                res.json({ success: true, created: false });
            }
            else {
                let newUser = new User({
                    externalId: externalId,
                    email: email,
                    username: username,
                    password: password,
                    avatar: avatar,
                    name: name
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        newUser.password = hash;
                        newUser.save((err: any, user: IUser) => {
                            if (err) {
                                ErrorHandler(err, req, res, "POST SAVE new user " + externalId + "(" + username + ") failed.");
                            }
                            else {
                                res.json({ success: true, created: true });
                            }
                        })
                    });
                });
                
            }
        }
    });

});

export const UsersRoute: Router = router;