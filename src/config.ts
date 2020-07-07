import { env } from './global.functions';


class Config {
	public build(){
		return {
			'mongo' : {
				'host' : env('MONGO_HOST', ''),
				'port' : env('MONGO_PORT', 27016),
				'database' : env('MONGO_DATABASE', 'bumblebee')
			},
			'log' : {
				'level' : env('LOG_LEVEL', 'info')
			},
			'debug' : {
				'exceptions' : env('SHOW_EXCEPTIONS', false)
			}
		}
	}
}

export default new Config;