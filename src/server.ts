// import express, { Response, Request } from 'express';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import bodyparser from 'body-parser';
// import passport from 'passport';
// import cors from 'cors';
// import fs from 'fs';
// import path from 'path';
// import log4js, { Logger } from 'log4js';


import Application from './app';

import './global.functions';


const app = new Application();
app.bootstrap();

// import * as v1 from './routes/v1/routes';
// import { Fragment } from './database/schemas/fragment.schema';
// import { ValidationException } from './services/validation/validationException';


// export const app = express();
// const port: any = process.env.PORT || 3000;

// /** 
//  * Register Error Handler
//  */

//  // Overwrite some process typical stuff
// app.use(function(req, res, next){
// 	process.on('unhandledRejection', (reason, p) => {
// 		errorHandler(reason, req, res, next);
// 	});

// 	next();
// });

// app.use(errorHandler);



// function errorHandler (err: any, req: Request, res: Response, next: any) {

// 	if(!res.headersSent){
// 		if (err) {
// 			let data = {} as any;
	
// 			switch(true) {
// 				case err instanceof ValidationException:
// 					err as ValidationException;
// 					res.status(400); // Bad request
// 					data = err.toJSON();
// 					break;
// 				case err instanceof Error:
// 					res.status(500);
// 					data = {'error' : 'Server Exception', 'message' : 'A server exception occured.'} as any;
// 					err as Error;
// 					if (process.env.SHOW_EXCEPTIONS) {
// 						data['detail'] = {
// 							name: err.name,
// 							message: err.message,
// 							stack: err.stack?.split('\n').map((item: string) => { return item.trim() })
// 						};
						
// 					} else {
// 						data['detail'] = { message: 'Unknown' };
// 					}
	
// 					break;
// 				default:
// 					res.status(500);
// 					data = { 'status' : 'unknown error occured'}
// 					break;
// 			}
			
	
// 			res.json(data);
// 		} else {
// 			console.error(err);
// 			return next();
// 		}
// 	}


// }

// // Express middlewares
// app.use(bodyparser.json());
// app.use(bodyparser.urlencoded({ extended: true }));
// app.use(passport.initialize());
// app.use(passport.session());
// app.use(cors({ origin: true }));



// require('./database/config')(passport);
// require('./database/schemas');

// // Routes
// app.use('/', v1.routes);

// app.get('*', (req, res) => {
// 	res.send('Invalid endpoint');
// })
