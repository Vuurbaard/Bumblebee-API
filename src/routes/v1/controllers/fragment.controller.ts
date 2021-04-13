import { Request, Response } from 'express';
import { RESTController } from './rest.controller';
import fragmentService from '../../../services/fragment.service';
import { IUser } from '../../../database/schemas';
import cacheService from '../../../services/cache.service';

export class FragmentController implements RESTController {

	constructor() { }

	async getAll(req: Request, res: Response) {
		try {
			res.json(await fragmentService.all(req.query));
		}
		catch(err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong getting all the fragments." });
		}
	}

	async getByID(req: Request, res: Response) {
		try {
			res.json(await fragmentService.getByID(req.params.id));
		}
		catch(err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong getting the fragment by id." });
		}
	}

	async create(req: Request, res: Response) {
		try {
			const fragment = await fragmentService.create(req.user as IUser, req.body);
			await cacheService.clear('all-fragments')
			res.status(201).json(fragment);
		}
		catch(err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong creating the fragment." });
		}
	}

	async updateByID(req: Request, res: Response) {
		try {
			await fragmentService.update(req.user as IUser, req.params.id, req.body);
			await cacheService.clear('all-fragments')
			res.json();
		}
		catch(err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong updating the fragment." });
		}
	}

	async deleteByID(req: Request, res: Response) {
		try {
			await fragmentService.delete(req.user, req.params.id);
			await cacheService.clear('all-fragments')
			res.status(200).json();
		}
		catch(err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong removing the fragment." });
		}
		// res.sendStatus(501);
	}
}