import Bootable from "../interfaces/bootable"


class HttpService implements Bootable {

	express?: Express.Application;

	async boot() {


		return this;		
	}


}


export default new HttpService();