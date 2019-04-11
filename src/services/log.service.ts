import log4js from 'log4js';
import dotenv from 'dotenv';
var logger = log4js.getLogger();


dotenv.config();

logger.level = process.env.LOG_LEVEL || 'debug';


class LogService {

	public constructor() { }

	public info(message: string, ...args: any[] ){
		return logger.info(message, ...args);
	}

	public fatal(message: string, ...args: any[] ){
		return logger.fatal(message, ...args);
	}

	public debug(message: string, ...args: any[] ){
		return logger.debug(message, ...args);
	}

	public warn(message: string, ...args: any[] ){
		return logger.warn(message, ...args);
	}

	public trace(message: string, ...args: any[] ){
		return logger.trace(message, ...args);
	}

}

export default new LogService();