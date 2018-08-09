import { Request, Response } from 'express';
import { RESTController } from './rest.controller';
import userService from '../../../services/user.service';

export class UserController implements RESTController {

	constructor() { }

	public async getAll(req: Request, res: Response) {
		try {
			if (req.user!.roles.indexOf('admin') > -1) {
				res.json(await userService.all(req.query));
			}
			else {
				delete req.query.roles; // Don't want people to query what role someone has
				delete req.query.password; // Or on hashed password, not sure why you would do that but hey let's block it anyway
				res.json(await userService.all(req.query));
			}
		}
		catch (err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong getting all the users." });
		}
	}

	public async getByID(req: Request, res: Response) {
		try {
			res.json(await userService.getByID(req.params.id));
		}
		catch (err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong getting a user by id." });
		}
	}

	public async updateByID(req: Request, res: Response) {
		try {
			if (req.user!.roles.indexOf('admin') > -1) {
				await userService.updateByID(req.params.id, req.body);
			}
			else {

				if (req.user!._id.toString() != req.params.id) { throw new Error('Not allowed to update another user.'); }
				if (req.body.username) { throw new Error('Not allowed to update your own username.'); }
				if (req.body.password) { throw new Error('Not allowed to update your own password.'); }
				if (req.body.roles) { throw new Error('Not allowed to update your own roles.'); }

				await userService.updateByID(req.params.id, req.body);
			}

			res.sendStatus(204);
		}
		catch (err) {
			console.error(err.message);

			if (err.message == 'Not allowed to update another user.' ||
				err.message == 'Not allowed to update your own username.' ||
				err.message == 'Not allowed to update your own password.' ||
				err.message == 'Not allowed to update your own roles.') {
				res.status(400).json({ message: err.message });
				return;
			}

			res.status(500).json({ "message": "Something went wrong updating the user." });
		}
	}

	public async create(req: Request, res: Response) {
		try {
			let user = await userService.create(req.body.username, req.body.password, req.body.email, req.body.name);
			res.status(201).json({ user: user });
		}
		catch (err) {
			console.error(err.message);
			if (err.message == 'Username is required.' || err.message == 'Password is required.' || err.message == 'Username already taken.') {
				res.status(400).json({ message: err.message });
				return;
			}
			res.status(500).json({ message: "Something went wrong creating the new user." });
		}
	}

	public async deleteByID(req: Request, res: Response) {
		try {
			if (req.user!.roles.indexOf('admin') > -1) {
				await userService.deleteByID(req.params.id);
			}
			else {
				res.status(403).json({ message: "You are not allowed to delete a user"});
				return;
			}
		}
		catch (err) {
			console.error(err.message);
			res.status(500).json({ message: "Something went wrong deleting the user." });
		}
	}

	// Custom non-standard routes
	public getAllSourcesByUserID(req: Request, res: Response) {
		// TODO
		res.json({ 'GET': '/v1/user/self' });
	}
}