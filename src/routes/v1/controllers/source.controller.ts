import { Request, Response } from 'express';
import { Controller } from './controller';
import sourceService from '../../../services/source.service';

export class SourceController implements Controller {

	constructor() { }

	public async getAll(req: Request, res: Response) {
		try {
			res.json(await sourceService.all(req.query));
		}
		catch(err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong getting all the sources." });
		}
	}

	public async getByID(req: Request, res: Response) {
		try {
			res.json(await sourceService.getByID(req.params.id));
		}
		catch(err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong getting source by id." });
		}
	}

	public async updateByID(req: Request, res: Response) {
		res.sendStatus(501);
	}

	public async create(req: Request, res: Response) {
		res.sendStatus(501);
	}

	public async deleteByID(req: Request, res: Response) {
		res.sendStatus(501);
	}
}