const express = require('express');
const path = require('path');
const bodyparser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
const fs = require('fs');
const request = require('request');

mongoose.connect(config.database);

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

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/youtube/:file', function (req, res, next) {
    console.log('Request URL:', req.params);
    var file = req.params.file;
    next();
});

app.use('/youtube', express.static(path.join(__dirname, 'audio/youtube')));
app.use('/fragments', express.static(path.join(__dirname, 'audio/fragments')));

app.use(bodyparser.json());
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

// Routes
app.use('/users', usersRoute);
app.use('/audio', audioRoute);

app.get('/', (req, res) => {
    res.send('Invalid endpoint');
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
})

app.listen(port, () => {
    console.log('Server listening on port', port);
})


// test
// var engine = require('./services/engine');
// engine.tts('please let this work');

// var fragments = require('./services/fragments');
// fragments.search('please let this work');

// var audio = require('./services/audio');
// audio.download('https://www.youtube.com/watch?v=9-yUbFi7VUY').then(file => {
// 	console.log('file:', file);
	
// });