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

const users = require('./routes/users');
const audio = require('./routes/audio');

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/youtube/:file', function (req, res, next) {
    console.log('Request URL:', req.params);
    var file = req.params.file;
    next();
});

app.use('/youtube', express.static(path.join(__dirname, 'youtube')));
app.use('/fragments', express.static(path.join(__dirname, 'fragments')));

app.use(bodyparser.json());
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

// Routes
app.use('/users', users);
app.use('/audio', audio);

app.get('/', (req, res) => {
    res.send('Invalid endpoint');
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
})

app.listen(port, () => {
    console.log('Server listening on port', port);
})


// TEST:
// var options = {
//     url: 'https://stream.watsonplatform.net/speech-to-text/api/v1/recognize?timestamps=true',
//     // gzip: true,
//     headers: {
//         'Content-Type': 'audio/mpeg',
//         // 'Transfer-Encoding': 'chunked',
//     },
//     body: fs.readFileSync(__dirname + '\\youtube\\SRRw1ERj2Gc.mp3'),
//     // encoding: null,
// };

// request.post(options, function (err, response, body) {
//     if (err) { 
//         return console.error('upload failed:', err); 
//     }

//     var body = JSON.parse(body.toString());

//     for(var result of body.results) {
//         console.log(result);
//         for(var alternative of result.alternatives) {
//             for(var timestamp of alternative.timestamps) {
//                 console.log(timestamp);
//             }
//         }
//     }
//     // console.log(body.results[0].alternatives);



// }).auth('ca4e920b-6e5f-46a1-866f-33f904b65e73', 'iJktKEPGrhLn', false);