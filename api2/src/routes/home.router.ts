import { Router, Request, Response } from 'express';
import { User, IUser } from '../database/schemas';
import { ErrorHandler } from './errorHandler';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

router.post('/register', (req: Request, res: Response) => {

    console.log('POST /register');

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
                if (err) { ErrorHandler(err, req, res, "POST of new user failed" + err); }
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

    console.log('POST /login');

    User.findOne({ username: username }, (err: any, user: IUser) => {
        if (err) {
            ErrorHandler(err, req, res, "POST /login failed.");
        }
        else if (!user) {
            res.json({ success: false, msg: "User not found" });
        }
        else {
            bcrypt.compare(password, user.password, (err: any, success: boolean) => {
                if (err) {
                    ErrorHandler(err, req, res, "POST /login failed.");
                }
                else if (!success) {
                    res.json({ success: false, msg: "Password is incorrect" });
                }
                else {
                    const token = jwt.sign(user.toObject(), "SomethingVerySecret");

                    res.json({
                        success: true,
						token: 'JWT ' + token,
						exp: Math.floor(Date.now() / 1000) + (60 * 60), // Expire in 1 hour
                        user: {
                            id: user._id,
                            username: user.username,
                            name: user.name,
                            email: user.email,
                            isAdmin: user.isAdmin,
                            avatar: user.avatar
                        }
                    });
                }
            });
        }
    });

});

export const HomeRoute: Router = router;