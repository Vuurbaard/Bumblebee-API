import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyparser from 'body-parser';
import passport from 'passport';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import * as routes from './routes/v1/routes';
import JobService from './services/jobs';

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
});

mongoose.connection.on('error', err => {
    console.log('Database error', err);

	setTimeout(() => {
		mongoose.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/bumblebeev2');
	}, 5000);
});


// Express middlewares
app.use(bodyparser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({ origin: true }));

require('./database/config')(passport);

// Routes
app.use(routes.v1);

app.get('*', (req, res) => {
    res.send('Invalid endpoint');
})



// Run some code to check if all youtube videos are still downloaded
// JobService.handleMissingYoutubeFiles()

