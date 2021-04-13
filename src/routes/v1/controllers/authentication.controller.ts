import { Request, Response } from 'express';
import { User, IUser, App, IApp } from '../../../database/schemas';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userService from '../../../services/user.service';

export class AuthenticationController {

	constructor() { }

	public login(req: Request, res: Response) {
		try {
			const username = req.body.username;
			const password = req.body.password;
			const token = req.body.token;

			if (username && password) {
				User.findOne({ username: username }, (err: any, user: IUser) => {
					if (err) { res.sendStatus(500); }
					if (!user) { res.sendStatus(401); }
					else {
						bcrypt.compare(password, user.password, (err: any, success: boolean) => {
							if (err) { res.status(500).json({ message: "Something went wrong logging in." }); }
							else if (!success) { res.status(401).json({ message: "The supplied username/password combination is wrong." }); }
							else {

								const userObj = user.toObject(); // Convert from mongoose object to 'normal' object
								userObj.password = ''; // We don't want the encrypted password to be returned

								res.json({
									token: 'JWT ' + jwt.sign(userObj, "SomethingVerySecret", { expiresIn: '100 years' }),
									user: userObj
								});
							}
						});
					}
				});
			}
			else if (token) {
				App.findOne({ token: token }, (err: any, app: IApp) => {
					if (err) { res.status(500).json({ message: "Something went wrong logging in." }); }
					if (!app) { res.status(401).json({ message: "The supplied token is invalid." }); }
					else {
						res.json({
							token: 'JWT ' + jwt.sign(app, "SomethingVerySecret", { expiresIn: '100 years' }),
							app: app
						});
					}
				});
			}
			else {
				res.status(400).json({ message: "You need to supply a username/password combination or a token in the request." });
			}
		}
		catch (err) {
			res.status(500).json({ message: "Something went wrong logging in." });
		}
	}


	public async register(req: Request, res: Response) {
		try {
			const user = await userService.create(req.body.username, req.body.password, req.body.email, req.body.name);
			res.status(201).json({ user: user });
		}
		catch (err) {
			if (err.message == 'Username is required.' || err.message == 'Password is required.' || err.message == 'Username already taken.') {
				res.status(400).json({ message: err.message });
				return;
			}
			res.status(500).json({ message: "Something went wrong creating the new user." });
		}
	}
}