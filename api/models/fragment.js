const mongoose = require('mongoose');

const FragmentSchema = mongoose.Schema({
    start: { type: Number, required: true },
	end: { type: Number, required: true },
	source: { type: mongoose.Schema.Types.ObjectId, ref: 'Source'},
	word: { type: mongoose.Schema.Types.ObjectId, ref: 'Word'},
});

const Fragment = module.exports = mongoose.model('Fragment', FragmentSchema);
