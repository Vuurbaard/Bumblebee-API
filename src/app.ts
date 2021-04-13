// Load all dependencies

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyparser from 'body-parser';
import passport from 'passport';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

import log4js, { Logger } from 'log4js';

import * as v1 from './routes/v1/routes';


export default class App {
	private static _mongoose: any;
	private static _logger: Logger;
	private static _dotenv: any;
	private static _express: any;

	constructor(){
		App.logger = log4js.getLogger();
		App.logger.level = 'debug';
	}
	
	public static get logger() : Logger {
		const logger = App._logger;

		if(!logger){
			App.registerLogger();
		}

		return logger;
	}
	
	public static set logger(logger: Logger) {
		App._logger = logger;
	}

	/**
	 * Boot all critial components
	 */
	static async boot() {
		await App.registerLogger();
		await App.configuration();
		await App.database();

		return true;
	}

	static async registerLogger() {
		return new Promise((resolve, reject) => {
			const logger = log4js.getLogger();
			logger.level = 'debug';
	
			App.logger = logger;
			App.logger.debug('Registered application logger');
			resolve(true);
		})
	}

	static async http() {
		return new Promise((resolve, reject) => {
			const app = express();
			const port: any = process.env.PORT || 3000;
			
			
			// Express middlewares
			app.use(bodyparser.json());
			app.use(bodyparser.urlencoded({ extended: true }));
			app.use(passport.initialize());
			app.use(passport.session());
			app.use(cors({ origin: true }));
			
			require('./database/config')(passport);
			require('./database/schemas');
			
			// Routes
			app.use('/', v1.routes);
			
			app.get('*', (req, res) => {
				res.send('Invalid endpoint');
			});
	
			App._express = app;

			app.listen(port, () => {
				App.logger.info( `Listening at http://localhost:${port}/` );
				resolve(true);
			});

		})

	}

	static async configuration() {
		return new Promise((resolve, reject) => {
			const dotEnvPath = fs.existsSync(path.resolve(process.cwd(), '..','.env')) ? path.resolve(process.cwd(), '..','.env') : path.resolve(process.cwd(), '.env');

			dotenv.config({
				'path' : dotEnvPath
			});

			App.logger.level = process.env.LOG_LEVEL || 'debug';
			
			App.logger.debug(`Using ${dotEnvPath} as path for environment variables`);

			resolve(true);
		})
	}

	/**
	 * Init Database
	 */
	static async database() {
		return new Promise((resolve,reject) => {
			const debugMode = (process.env.MONGO_DEBUG == 'true') ?? false;
			const mongoUrl = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/bumblebeev2`;

			// Fix deprecation
			mongoose.set('useNewUrlParser', true);
			mongoose.set('useUnifiedTopology', true);
			// Database
			mongoose.connect(mongoUrl);

			mongoose.connection.on('connected', () => {
				App.logger.info( 'Connection to MongoDB established' );
				resolve(true);
			});

			mongoose.set('debug', debugMode);

			mongoose.connection.on('error', err => {
				App.logger.fatal('Failed to connect to the database', err)

				setTimeout(() => {
					mongoose.connect(mongoUrl);
				}, 5000);
			});
		})


	}
}