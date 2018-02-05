require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyparser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
const fs = require('fs');

mongoose.connect(config.database, { useMongoClient: true });

mongoose.connection.on('connected', () => {
    console.log('Connected to database', config.database);
});

mongoose.connection.on('error', (err) => {
    console.log('Database error', err);
});

const app = express();
const port = 3000;

const usersRoute = require('./routes/users');
const audioRoute = require('./routes/audio');
const fragmentsRoute = require('./routes/fragments');
const sourcesRoute = require('./routes/sources');

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/youtube/:file', function (req, res, next) {
    console.log('Request URL:', req.params);
    var file = req.params.file;
    next();
});

app.use('/youtube', express.static(path.join(__dirname, 'audio/youtube')));
app.use('/audio/temp', express.static(path.join(__dirname, 'audio/temp')));

app.use(bodyparser.json());
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

// Routes
app.use('/users', usersRoute);
app.use('/audio', audioRoute);
app.use('/fragments', fragmentsRoute);
app.use('/sources', sourcesRoute);

app.get('/', (req, res) => {
    res.send('Invalid endpoint');
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
})

app.listen(port, () => {
    console.log('Server listening on port', port);
})