import { Request, Response } from 'express';

export interface Controller {
	getAll(req: Request, res: Response) : void,
	getByID(req: Request, res: Response) : void,
}