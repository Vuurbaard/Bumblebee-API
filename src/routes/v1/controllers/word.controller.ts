import { Request, Response } from 'express';
import { Controller } from './controller';
import wordService from '../../../services/word.service';
import { IUser } from '../../../database/schemas';

export class WordController implements Controller {

	constructor() { }

	async getAll(req: Request, res: Response) {
		try {
			res.json(await wordService.all(req.query));
		}
		catch(err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong getting all the words." });
		}
	}

	async getByID(req: Request, res: Response) {
		try {
			res.json(await wordService.getByID(req.params.id));
		}
		catch(err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong getting the word by id." });
		}
	}

	async create(req: Request, res: Response) {
		try {
			let word = await wordService.create(req.user as IUser, req.body.text);
			res.status(201).json(word);
		}
		catch(err) {
			console.error(err.message);
			res.status(500).json({ "message": "Something went wrong creating the word." });
		}
	}

	async updateByID(req: Request, res: Response) {
		try {
			await wordService.update(req.user as IUser, req.params.id, req.body);
			res.json(200);
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