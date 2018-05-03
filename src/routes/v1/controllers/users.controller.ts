import { Request, Response } from 'express';
import { Controller } from './controller';

export class UsersController implements Controller {

	constructor() { }

	public getAll(req: Request, res: Response) {
		res.json({ 'GET': '/v1/users/' });
	}

	public getByID(req: Request, res: Response) {
		res.json({ 'GET': '/v1/users/' + req.params.id });
	}
}