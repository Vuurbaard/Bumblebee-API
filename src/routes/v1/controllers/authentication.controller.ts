import { Request, Response } from 'express';
import { User, IUser, App, IApp } from '../../../database/schemas';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userService from '../../../services/user.service';
import { Required } from '../../../services/validation/rules/required';
import { Unique } from '../../../services/validation/rules/unique';
import { Min } from '../../../services/validation/rules/min';
import { isEmail } from '../../../services/validation/rules/isEmail'
import { Validator } from '../../../services/validation/validator';

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

		let rules = {
			'username' : [
				new Required(), 
				new Unique(async (data: any) => {
					return ! await userService.exists({ username : data });
				})
			],
			'email' : [
				new Required(), 
				new isEmail(),
				new Unique(async (data: any) => {
					return ! await userService.exists({ email : data });
				})
			],
			'password' : [
				new Required(),
				new Min('string', 8)
			]
		}

		// This will validate the input request with the given rules.
		let isValid = await (new Validator(rules)).validate(req.body);
		
		let user = await (await userService.create(req.body.username, req.body.password, req.body.email, req.body.name)).toObject();
		delete user.password;
		delete user.roles;

		res.status(201).json({ user: user });
	}
}