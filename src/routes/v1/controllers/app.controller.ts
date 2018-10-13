import { Request, Response } from 'express';
import { RESTController } from './rest.controller';
import appService from '../../../services/app.service';
import { IUser } from '../../../database/schemas';

export class AppController implements RESTController {

	constructor() { }

	public async getAll(req: Request, res: Response) {
		try {
			if (req.user!.roles.indexOf('admin') > -1) {
				res.json(await appService.all(req.query));
			}
			else {
				req.query.createdBy = req.user;
				res.json(await appService.all(req.query));
			}
		}
		catch (err) {
			console.error(err.message);
		}
	}

	public async getByID(req: Request, res: Response) {
		try {
			res.sendStatus(501);
		}
		catch (err) {
			console.error(err.message);
		}
	}

	public async updateByID(req: Request, res: Response) {
		try {
			res.sendStatus(501);
		}
		catch (err) {
			console.error(err.message);
		}
	}

	public async create(req: Request, res: Response) {
		try {
			let app = await appService.create(req.user as IUser, req.body);
			res.status(201).json(app);
		}
		catch (err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong creating the app." });
		}
	}

	public async deleteByID(req: Request, res: Response) {
		try {
			
		}
		catch (err) {
			console.error(err.message);
		}
	}

}