import { Request, Response } from 'express';
import { RESTController } from './rest.controller';
import appService from '../../../services/app.service';
import { IUser } from '../../../database/schemas';

export class AppController implements RESTController {

	constructor() { 
		this.getAll = this.getAll.bind(this);
		this.getByID = this.getByID.bind(this);
		this.updateByID = this.updateByID.bind(this);
		this.create = this.create.bind(this);
		this.deleteByID = this.deleteByID.bind(this);
	}

	private isAdmin(req: Request): Boolean {
		return req.user!.roles.indexOf('admin') > -1;
	}

	public async getAll(req: Request, res: Response) {
		try {
			if (this.isAdmin(req)) {
				// admin can get everything
				res.json(await appService.all(req.query));
			}
			else if (req.query.createdBy == req.user._id) {
				// normal user is only allowed to get his own apps
				res.json(await appService.all(req.query));
			}
			else {
				// Something is fucky, thus forbidden.
				res.status(403).json([]);
			}
		}
		catch (err) {
			console.error(err.message);
		}
	}

	public async getByID(req: Request, res: Response) {
		try {
			if (this.isAdmin(req)) {
				res.json(await appService.getByID(req.params.id));
			}
			else {
				res.json(await appService.getOne({ '_id': req.params.id, 'createdBy': req.user.id }))
			}
		}
		catch (err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong getting an app by id." });
		}
	}

	public async updateByID(req: Request, res: Response) {
		try {
			res.json(await appService.updateByID(req.params.id, req.body.name));
		}
		catch (err) {
			console.error(err.message);

			if (err.message == 'Name already taken.') {
				res.status(400).json({ message: err.message });
				return;
			}
			
			res.status(500).json({ "message": "Something went wrong updating an app by id." });
		}
	}

	public async create(req: Request, res: Response) {
		try {
			let app = await appService.create(req.user as IUser, req.body.name);
			res.status(201).json(app);
		}
		catch (err) {
			console.error(err.message);

			if (err.message == 'Name already taken.') {
				res.status(400).json({ message: err.message });
				return;
			}

			res.status(500).json({ "message": "Something went wrong creating the app." });
		}
	}

	public async deleteByID(req: Request, res: Response) {
		try {
			if (this.isAdmin(req)) {
				await appService.deleteByID(req.params.id);
				res.status(200).json({});
			}
			else {
				let app = await appService.getOne({ '_id': req.params.id, 'createdBy': req.user.id });
				if (app) {
					appService.deleteByID(app._id);
					res.status(200).json({});
				}
				else {
					res.status(403).json({});
				}
			}
		}
		catch (err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong deleting the app." });
		}
	}

}