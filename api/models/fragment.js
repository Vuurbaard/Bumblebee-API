const mongoose = require('mongoose');

const FragmentSchema = mongoose.Schema({
    start: { type: Number, required: true },
	end: { type: Number, required: true },
	source: { type: mongoose.Schema.Types.ObjectId, ref: 'Source'},
	word: { type: mongoose.Schema.Types.ObjectId, ref: 'Word'},
	active: { type: Boolean, default: false },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Fragment = module.exports = mongoose.model('Fragment', FragmentSchema);
