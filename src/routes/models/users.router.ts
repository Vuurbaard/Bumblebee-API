import { Router, Request, Response } from 'express';
import { User, IUser } from '../../database/schemas';
// import { ErrorHandler } from '../errorHandler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';

const router: Router = Router();

router.post('/register', (req: Request, res: Response) => {

	console.log('POST /register');

	let newUser = new User({
		externalId: req.body.externalId,
		email: req.body.email,
		username: req.body.username,
		password: req.body.password,
		avatar: req.body.avatar,
		name: req.body.name
	});

	User.findOne({ username: newUser.username }).then(user => {
		if (!user) {
			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(newUser.password, salt, (err, hash) => {
					if (err) { throw err; }

					newUser.password = hash;
					newUser.save((err: any, user: IUser) => {
						if (err) { 
							// ErrorHandler(err, req, res, "POST of new user failed " + err); 
						}
						else {
							res.json({ success: true });
						}
					});
				});
			});
		}
		else {
			res.json({ success: false, error: "Username already taken" });
		}
	})
});

router.post('/login', (req: Request, res: Response) => {
	const username = req.body.username;
	const password = req.body.password;

	console.log('POST /login');

	User.findOne({ username: username }, (err: any, user: IUser) => {
		if (err) {
			// ErrorHandler(err, req, res, "POST /login failed.");
		}
		else if (!user) {
			res.json({ success: false, msg: "User not found" });
		}
		else {
			bcrypt.compare(password, user.password, (err: any, success: boolean) => {
				if (err) {
					// ErrorHandler(err, req, res, "POST /login failed.");
				}
				else if (!success) {
					res.json({ success: false, msg: "Password is incorrect" });
				}
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

});

router.get('/', passport.authenticate('jwt', { session: true }), (req: Request, res: Response) => {
	User.find({}, (err: any, users: [IUser]) => {
		if (err) {
			// ErrorHandler(err, req, res, "GET all users failed");
		}
		else {
			res.json(users);
		}
	});
});

router.get('/:id', passport.authenticate('jwt', { session: true }), (req: Request, res: Response) => {

	console.log('/users/:id', req.params.id);
	let id: string = req.params.id;

	User.findById(req.user!._id).then(user => {

		if (!user) { res.sendStatus(500); return; }

		if (user.roles.indexOf('admin') > -1) {
			User.findById(id, (err: any, user: IUser) => {
				if (err) {
					// ErrorHandler(err, req, res, "GET user by id " + id + " failed.");
				}
				else {
					res.json(user);
				}
			});

		}
		else {
			// user is not an admin, return current user.
			res.json({
				_id: user._id,
				username: user.username,
				name: user.name,
				email: user.email,
				avatar: user.avatar,
				roles: user.roles,
			});
		}
	}).catch(err => {
		//ErrorHandler(err, req, res, "GET user by id " + id + " failed.");
	});

});

router.post('/:id', passport.authenticate('jwt', { session: true }), (req: Request, res: Response) => {

	console.log('POST /users/' + req.params.id);
	let id: string = req.params.id;

	User.findById(req.user!._id).then(user => {

		if (!user) { res.sendStatus(500); return; }

		if (user.roles.indexOf('admin') > -1 || user.roles.indexOf('bot') > -1) {
			// The current user is an admin or bot. Wooooweeee
			User.findByIdAndUpdate(id, {
				name: req.body.name,
				email: req.body.email,
				avatar: req.body.avatar
			}, { new: true }).then(user => {
				// Return the newly updated user object
				res.json({
					_id: user!._id,
					name: user!.name,
					email: user!.email,
					avatar: user!.avatar,
				});
			}).catch(err => {
				//ErrorHandler(err, req, res, "POST user by id " + id + " failed.");
			});
		}
		else {
			// The current user is not an admin. only allow to update some of the fields. (Name and email etc)
			User.findByIdAndUpdate(req.user!._id, {
				name: req.body.name,
				email: req.body.email,
				avatar: req.body.avatar
			}, { new: true }).then(user => {
				// Return the newly updated user object
				res.json({
					_id: user!._id,
					name: user!.name,
					email: user!.email,
					avatar: user!.avatar,
				});
			}).catch(err => {
				// ErrorHandler(err, req, res, "POST user by id " + id + " failed.");
			});
		}

	}).catch(err => {
		// ErrorHandler(err, req, res, "POST user by id " + id + " failed.");
	});

});

router.post('/:id/changepassword', passport.authenticate('jwt', { session: true }), (req: Request, res: Response) => {

	console.log('POST /users/' + req.params.id + '/changepassword');
	let id: string = req.params.id;
	let currentPassword: string = req.body.currentPassword;
	let newPassword: string = req.body.newPassword;
	let confirmPassword: string = req.body.confirmPassword;

	if (!id) {
		res.json({ error: "No user identifier specified" });
		return;
	}
	else if (!currentPassword || currentPassword == "") {
		res.json({ error: "The current password can't be empty" });
		return;
	}
	else if (!newPassword || newPassword == "") {
		res.json({ error: "The new password can't be empty" });
		return;
	}
	else if (newPassword != confirmPassword) {
		res.json({ error: "The new password doesn't match" });
		return;
	}

	User.findById(req.user!._id).then(user => {

		if (!user) { res.sendStatus(500); return; }

		bcrypt.compare(currentPassword, user.password, (err: any, success: boolean) => {
			if (err) {
				res.json({ error: "The current password is incorrect" });
				return;
			}

			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(newPassword, salt, (err, hash) => {
					user.password = hash;
					user.save((err: any, user: IUser) => {
						if (err) { 
							//ErrorHandler(err, req, res, "Password change for user " + id + " failed: "  + err); 
						}
						else {
							res.json({ error: null, success: true });
						}
					});
				});
			});

		});

	}).catch(err => {
		// ErrorHandler(err, req, res, "POST user by id " + id + " failed.");
	});

});

export const UsersRoute: Router = router;