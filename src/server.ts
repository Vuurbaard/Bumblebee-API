import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyparser from 'body-parser';
import passport from 'passport';
import cors from 'cors';
import JobService from './services/audio/jobs'
import fs from 'fs';

import * as v1 from './routes/v1/routes';
import { Fragment } from './database/schemas/fragment.schema';

dotenv.config();

const app = express();
const port: any = process.env.PORT || 3000;

// Database
mongoose.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/bumblebeev2');

mongoose.connection.on('connected', () => {
	console.log('Connected to database');

	// Start API
	app.listen(port, () => {
		console.log(`Listening at http://localhost:${port}/`);
	});



	//exportFragments();
});

mongoose.connection.on('error', err => {
	console.log('Database error', err);

	setTimeout(() => {
		mongoose.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/bumblebeev2');
	}, 5000);
});


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

function exportFragments() {
	Fragment.find({}).populate('word', '-_id -__v -links').populate('source', '-_id -__v -origin -fragments').select('-_id -__v -active -createdAt -createdBy').then(fragments => {
		fs.writeFile('fragments.json', JSON.stringify(fragments), function (err) {
			if (err) throw err;
		})
	});
}