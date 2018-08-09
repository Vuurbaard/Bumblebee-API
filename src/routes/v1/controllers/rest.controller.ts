import { Request, Response } from 'express';

export interface RESTController {
	getAll(req: Request, res: Response) : void,
	getByID(req: Request, res: Response) : void,
	updateByID(req: Request, res: Response) : void,
	create(req: Request, res: Response) : void,
	deleteByID(req: Request, res: Response) : void,
}