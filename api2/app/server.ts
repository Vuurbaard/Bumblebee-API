import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyparser from 'body-parser';
import passport from 'passport';

import * as routes from './routes';

dotenv.config();

const app = express();
const port: any = process.env.PORT || 3000;

// Database
mongoose.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/bumblebeev2');

mongoose.connection.on('connected', () => {
    console.log('Connected to database');
});

mongoose.connection.on('error', err => {
    console.log('Database error', err);
});

// Express middlewares
app.use(bodyparser.json());
app.use(passport.initialize());
app.use(passport.session());

require('./database/config')(passport);

// Routes
app.use('/users', routes.UsersRoute);

app.get('/', (req, res) => {
    res.send('Invalid endpoint');
})

// Start API
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/`);
});