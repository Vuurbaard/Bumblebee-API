import log4js, { Logger } from 'log4js';
import Bootable from '../interfaces/bootable';
import ConfigurationService from './config.service';

class LogService implements Bootable {

	private logger: Logger;

	public constructor() {
		// Emergency logger
		this.logger = log4js.getLogger('pre-boot');
		this.logger.level = 'debug';
	}

	async boot(): Promise<this> {
		this.logger = log4js.getLogger();
		this.logger.level = ConfigurationService.get('log.level')

		return this;
	}

	public info(message: string, ...args: any[] ){
		return this.logger.info(message, ...args);
	}

	public fatal(message: string, ...args: any[] ){
		return this.logger.fatal(message, ...args);
	}

	public debug(message: string, ...args: any[] ){
		return this.logger.debug(message, ...args);
	}

	public warn(message: string, ...args: any[] ){
		return this.logger.warn(message, ...args);
	}

	public trace(message: string, ...args: any[] ){
		return this.logger.trace(message, ...args);
	}

}


export default new LogService();