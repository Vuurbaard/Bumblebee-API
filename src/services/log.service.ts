import  App from '../app';


class LogService {

	public constructor() { 
	}

	public info(message: string, ...args: any[] ){
		return App.logger.info(message, ...args);
	}

	public fatal(message: string, ...args: any[] ){
		return App.logger.fatal(message, ...args);
	}

	public debug(message: string, ...args: any[] ){
		return App.logger.debug(message, ...args);
	}

	public warn(message: string, ...args: any[] ){
		return App.logger.warn(message, ...args);
	}

	public trace(message: string, ...args: any[] ){
		return App.logger.trace(message, ...args);
	}

}

export default new LogService();