import { Request, Response } from 'express';
import { Controller } from './controller';

export class UserController implements Controller {

	constructor() { }

	public getAll(req: Request, res: Response) {
		res.json({ 'GET': '/v1/user/' });
	}

	public getByID(req: Request, res: Response) {
		res.json({ 'GET': '/v1/user/' + req.params.id });
	}

	public updateByID(req: Request, res: Response) {
		res.json({ 'PATCH': '/v1/user/' + req.params.id });
	}

	public create(req: Request, res: Response) {
		res.json({ 'POST': '/v1/user/' });
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