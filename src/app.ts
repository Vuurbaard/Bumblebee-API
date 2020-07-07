import databaseService from "./services/database.service"
import logService from "./services/log.service";
import configService from "./services/config.service";
import httpService from "./services/http.service";
import Bootable from "./interfaces/bootable";


export default class Application {


	async bootstrap() {

		let bootables = new Array<Bootable>(
			configService,
			logService,
			databaseService,
			httpService
		);

		await this.boot(bootables).then(() => {
			logService.info('Application succesfully bootstrapped');
		})
	}

	private async boot(items: Array<Bootable>){

		for(let i in items){
			let item = items[i];
			let instance = item.constructor.name;
			logService.debug(`Booting ${instance}`);
			
			try {
				await item.boot();
			} catch (exception) {
				logService.fatal(`Unable to boot ${instance} because of`, exception);
				throw exception;
			}
		}

		return;
	}
}