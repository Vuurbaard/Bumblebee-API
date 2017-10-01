const mongoose = require('mongoose');

const SourceSchema = mongoose.Schema({
	id: { type: String, required: true, unique: true },
	origin: { type: String, required: true }
});

const Source = module.exports = mongoose.model('Source', SourceSchema);