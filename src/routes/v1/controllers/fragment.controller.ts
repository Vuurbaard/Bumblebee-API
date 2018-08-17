import { Request, Response } from 'express';
import { RESTController } from './rest.controller';
import fragmentService from '../../../services/fragment.service';
import { IUser } from '../../../database/schemas';

export class FragmentController implements RESTController {

	constructor() { }

	async getAll(req: Request, res: Response) {
		try {
			res.json(await fragmentService.all(req.query));
		}
		catch(err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong getting all the words." });
		}
	}

	async getByID(req: Request, res: Response) {
		try {
			res.json(await fragmentService.getByID(req.params.id));
		}
		catch(err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong getting the word by id." });
		}
	}

	async create(req: Request, res: Response) {
		try {
			let fragment = await fragmentService.create(req.user as IUser, req.body);
			res.status(201).json(fragment);
		}
		catch(err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong creating the word." });
		}
	}

	async updateByID(req: Request, res: Response) {
		try {
			await fragmentService.update(req.user as IUser, req.params.id, req.body);
			res.json();
		}
		catch(err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong updating the word." });
		}
	}

	async deleteByID(req: Request, res: Response) {
		res.sendStatus(501);
	}
}