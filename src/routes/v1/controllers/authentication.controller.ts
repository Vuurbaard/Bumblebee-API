import { Request, Response } from 'express';
import { Controller } from './controller';
import { User, IUser } from '../../../database/schemas/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
						const token = jwt.sign(user.toObject(), "SomethingVerySecret", { expiresIn: '100 years' });

						res.json({
							success: true,
							token: 'JWT ' + token,
							user: {
								id: user._id,
								username: user.username,
								name: user.name,
								email: user.email,
								roles: user.roles,
								avatar: user.avatar
							}
						});
					}
				});
			}
		});

		// res.json({ 'POST': '/v1/login' });
	}

	public register(req: Request, res: Response) {

		let newUser = new User({
			externalId: req.body.externalId,
			email: req.body.email,
			username: req.body.username,
			password: req.body.password,
			avatar: req.body.avatar,
			name: req.body.name
		});

		User.findOne({ username: newUser.username }, (err: any, user: IUser) => {
			if (err) { res.sendStatus(500); }
			if (user) { res.status(400).json({ success: false, message: "Username already taken" }) }

			if (!user) {
				bcrypt.genSalt(10, (err, salt) => {
					if (err) { res.sendStatus(500); }

					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if (err) { res.sendStatus(500); }

						else {
							newUser.password = hash;
							newUser.save((err: any, user: IUser) => {
								if (err) { res.sendStatus(500); }
								else {
									res.json({ success: true });
								}
							});
						}
					});
				});
			}
		});

		// res.json({ 'POST': '/v1/register' });
	}

}