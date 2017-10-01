const mongoose = require('mongoose');

const WordSchema = mongoose.Schema({
    text: { type: String, required: true, lowercase: true, trim: true, unique: true },
	links: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Word'} ],
	fragments: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Fragment'} ]
});

WordSchema.index({ text: 'text' });

const Word = module.exports = mongoose.model('Word', WordSchema);
