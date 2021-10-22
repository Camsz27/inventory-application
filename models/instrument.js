var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define schema for the instrument's
var InstrumentSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  brand: { type: String, required: true, maxLength: 100 },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true, min: 0, max: 100000 },
  number_in_stock: { type: Number, required: true, min: 0, max: 1000 },
});

// Create virtual for instrument's url
InstrumentSchema.virtual('url').get(function () {
  return '/inventory/instrument/' + this._id;
});

module.exports = mongoose.model('Instrument', InstrumentSchema);
