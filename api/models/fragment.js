const mongoose = require('mongoose');

const FragmentSchema = mongoose.Schema({
    start: { type: String, required: true },
	end: { type: String, required: true },
	source: { type: mongoose.Schema.Types.ObjectId, ref: 'Source'},
	word: { type: mongoose.Schema.Types.ObjectId, ref: 'Word'},
});

const Fragment = module.exports = mongoose.model('Fragment', FragmentSchema);
