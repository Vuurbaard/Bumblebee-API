import express, { Response, Request } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyparser from 'body-parser';
import passport from 'passport';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

import log4js, { Logger } from 'log4js';

const logger = log4js.getLogger();

logger.level = 'debug';

import * as v1 from './routes/v1/routes';
import { Fragment } from './database/schemas/fragment.schema';
import { ValidationException } from './services/validation/validationException';

let dotEnvPath = fs.existsSync(path.resolve(process.cwd(), '..','.env')) ? path.resolve(process.cwd(), '..','.env') : path.resolve(process.cwd(), '.env');

logger.debug(`Using ${dotEnvPath} as path for environment variables`);

dotenv.config({
	'path' : dotEnvPath
});

export const app = express();
const port: any = process.env.PORT || 3000;

/** 
 * Register Error Handler
 */

 // Overwrite some process typical stuff
app.use(function(req, res, next){
	process.on('unhandledRejection', (reason, p) => {
		errorHandler(reason, req, res, next);
	});

	next();
});

app.use(errorHandler);

// Fix deprecation
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
// Database
mongoose.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/bumblebeev2');

mongoose.connection.on('connected', () => {
	logger.info( 'Connection to MongoDB established' );
	// Start API
	app.listen(port, () => {
		logger.info( `Listening at http://localhost:${port}/` );
	});

	//exportFragments();
});

mongoose.connection.on('error', err => {
	logger.fatal('Failed to connect to the database', err)

	setTimeout(() => {
		mongoose.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/bumblebeev2');
	}, 5000);
});


function errorHandler (err: any, req: Request, res: Response, next: any) {

	if(!res.headersSent){
		if (err) {
			let data = {} as any;
	
			switch(true) {
				case err instanceof ValidationException:
					err as ValidationException;
					res.status(400); // Bad request
					data = err.toJSON();
					break;
				case err instanceof Error:
					res.status(500);
					data = {'error' : 'Server Exception', 'message' : 'A server exception occured.'} as any;
					err as Error;
					if (process.env.SHOW_EXCEPTIONS) {
						data['detail'] = {
							name: err.name,
							message: err.message,
							stack: err.stack?.split('\n').map((item: string) => { return item.trim() })
						};
						
					} else {
						data['detail'] = { message: 'Unknown' };
					}
	
					break;
				default:
					res.status(500);
					data = { 'status' : 'unknown error occured'}
					break;
			}
			
	
			res.json(data);
		} else {
			console.error(err);
			return next();
		}
	}


}

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
})


// Run some code to check if all youtube videos are still downloaded
// JobService.handleMissingYoutubeFiles()
// ImportService.oldToNew
// ImportService.import();




function exportFragments() {
	Fragment.find({}).populate('word', '-_id -__v -links').populate('source', '-_id -__v -origin -fragments').select('-_id -__v -active -createdAt -createdBy').then(fragments => {
		fs.writeFile('fragments.json', JSON.stringify(fragments), function (err) {
			if (err) throw err;
		})
	});
}