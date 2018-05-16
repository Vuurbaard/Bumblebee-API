import { Request, Response } from 'express';
import { Controller } from './controller';
import userService from '../../../services/user.service';

export class UserController implements Controller {

	constructor() { }

	public getAll(req: Request, res: Response) {

		if (req.user!.roles.indexOf('admin') > -1) {
			userService.all()
				.then(users => { res.json(users); })
				.catch(err => { res.status(500).json({ "message": "Something went wrong getting all the users." }); });
		}
		else {
			res.json([req.user]); // Only allowed to get yourself.
		}
	}

	public getByID(req: Request, res: Response) {
		res.json({ 'GET': '/v1/user/' + req.params.id });
	}

	public updateByID(req: Request, res: Response) {
		res.json({ 'PATCH': '/v1/user/' + req.params.id });
	}

	public async create(req: Request, res: Response) {
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

	public deleteByID(req: Request, res: Response) {
		res.json({ 'DELETE': '/v1/user/' + req.params.id });
	}

	// Custom non-standard routes
	public self(req: Request, res: Response) {
		res.json({ 'GET': '/v1/user/self' });
	}

	public updateSelf(req: Request, res: Response) {
		res.json({ 'GET': '/v1/user/self' });
	}

	public getAllSourcesByUserID(req: Request, res: Response) {
		res.json({ 'GET': '/v1/user/self' });
	}
}