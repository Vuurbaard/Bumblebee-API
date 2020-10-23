import { Request, Response } from 'express';
import { RESTController } from './rest.controller';
import sourceService from '../../../services/source.service';
import cacheService from '../../../services/cache.service';

export class SourceController implements RESTController {

	constructor() { }

	public async getAll(req: Request, res: Response) {
		if(await cacheService.hasKey('all-fragments')){
			res.json(await cacheService.get('all-fragments'));
		} else {
			try {
				let sources = (await sourceService.all(req.query)).map(function(item){
					return {
						'id' : item.id,
						'name' : item.name,
						'origin' : item.origin,
						'fragments' : item.fragments.map(function(item) {
							return {
								'word' : {
									'text' : item.word != null ? item.word.text : null
								}
							}
						})
					};
				});
				
				await cacheService.set('all-fragments', sources);
				res.json(sources);
			}
			catch(err) {
				console.error(err.message);
				res.status(500).json({ "message": "Something went wrong getting all the sources." });
			}
		};

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