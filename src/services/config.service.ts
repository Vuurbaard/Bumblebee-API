import config from '../config';
import _ from 'lodash';
import Bootable from '../interfaces/bootable';
import { config as dotenvConfig } from "dotenv";
import fs from 'fs';
import path from 'path';
import logService from './log.service';

class ConfigurationService implements Bootable {

	private configuration = {};

	constructor() { }

	async boot(): Promise<this> {
		const dotEnvPath = fs.existsSync(path.resolve(process.cwd(), '..','.env')) ? path.resolve(process.cwd(), '..','.env') : path.resolve(process.cwd(), '.env');
		logService.debug(`Using ${dotEnvPath} as DotEnv file`);

		dotenvConfig({
			'path': dotEnvPath
		});

		console.log(this);

		this.configuration = Object.assign({}, config.build());

		return this;
	}


	/**
	 * Returns configuration value based on given key. (Can do nested calls towards the right key e.g. 'mongo.username')
	 * @param key 
	 * @param fallback 
	 */
	public get(path: string, fallback?: any){
		return _.get(this.configuration, path, fallback)
	}

	
}

export default new ConfigurationService();