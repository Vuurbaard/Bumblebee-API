const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

const FragmentSchema = mongoose.Schema({
    id: { type: String,  required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    phrase: { type: String, required: true },
    reviewed: { type: Boolean, required: true},
    wordCount: { type: Number, required: true}
});

const Fragment = module.exports = mongoose.model('Fragment', FragmentSchema);
