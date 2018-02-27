import { Router, Request, Response } from 'express';
import { User, IUser } from '../database/schemas';
import { ErrorHandler } from './errorHandler';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

router.post('/register', (req: Request, res: Response) => {

    console.log('POST /users/register');

    let newUser = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    });

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) { throw err; }
            newUser.password = hash;
            newUser.save((err: any, user: IUser) => {
                if (err) { ErrorHandler(err, req, res, "POST of new user failed"); }
                else {
                    res.json({ success: true });
                }
            });
        });
    });

});

router.post('/login', (req: Request, res: Response) => {
    const username = req.body.username;
    const password = req.body.password;

    console.log('POST /users/login');

    User.findOne({ username: username }, (err: any, user: IUser) => {
        if (err) {
            ErrorHandler(err, req, res, "POST /users/login failed.");
        }
        else if (!user) {
            res.json({ success: false, msg: "User not found" });
        }
        else {
            bcrypt.compare(password, user.password, (err: any, success: boolean) => {
                if (err) {
                    ErrorHandler(err, req, res, "POST /users/login failed.");
                }
                else if (!success) {
                    res.json({ success: false, msg: "Password is incorrect" });
                }
                else {
                    const token = jwt.sign(user.toObject(), "SomethingVerySecret");

                    res.json({
                        success: true,
                        token: 'JWT ' + token,
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        isAdmin: user.isAdmin
                    });
                }
            });
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