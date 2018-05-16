import { Request, Response } from 'express';
import { Controller } from './controller';
import { User, IUser } from '../../../database/schemas/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userService from '../../../services/user.service';

export class AuthenticationController {

	constructor() { }

	public login(req: Request, res: Response) {
		const username = req.body.username;
		const password = req.body.password;

		User.findOne({ username: username }, (err: any, user: IUser) => {
			if (err) { res.sendStatus(500); }
			if (!user) { res.sendStatus(401); }
			else {
				bcrypt.compare(password, user.password, (err: any, success: boolean) => {
					if (err) { res.sendStatus(500); }
					if (!success) { res.sendStatus(401); }
					else {

						user = user.toObject(); // Convert from mongoose object to 'normal' object
						delete user.password; // We don't want the encrypted password to be returned

						res.json({
							token: 'JWT ' + jwt.sign(user, "SomethingVerySecret", { expiresIn: '100 years' }),
							user: user
						});
					}
				});
			}
		});
	}

	public async register(req: Request, res: Response) {
		try {
			let user = await userService.create(req.body.username, req.body.password, req.body.email, req.body.name);
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