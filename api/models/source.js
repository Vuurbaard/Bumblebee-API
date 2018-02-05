const mongoose = require('mongoose');

const SourceSchema = mongoose.Schema({
	id: { type: String, required: true, unique: true },
	origin: { type: String, required: true }
});

SourceSchema.virtual('fragments', {
	ref: 'Fragment', // The model to use
	localField: '_id', // Find people where `localField`
	foreignField: 'source', // is equal to `foreignField`
	justOne: false
});

SourceSchema.set('toObject', { virtuals: true });
SourceSchema.set('toJSON', { virtuals: true });

const Source = module.exports = mongoose.model('Source', SourceSchema);