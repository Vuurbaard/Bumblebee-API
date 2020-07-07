import Bootable from "../interfaces/bootable"
import { Mongoose } from "mongoose";
import configService from "./config.service";


class DatabaseService implements Bootable {

	mongoose: Mongoose;

	constructor(){
		this.mongoose = new Mongoose();
	}

	async boot() {
		this.mongoose = new Mongoose();
		// Fix deprecation
		this.mongoose.set('useNewUrlParser', true);
		this.mongoose.set('useUnifiedTopology', true);
		// Database
		this.mongoose = await this.mongoose.connect('mongodb://' + configService.get('mongo.host') + ':' + configService.get('mongo.port') + '/' + configService.get('mongo.database'));

		return this;		
	}


}


export default new DatabaseService();