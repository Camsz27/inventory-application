var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define schema for the instrument's categories
var CategorySchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true, maxLength: 200 },
  image: { type: String, required: true },
});

// Virtual for category url
CategorySchema.virtual('url').get(function () {
  return 'inventory/category/' + this._id;
});

module.exports = mongoose.model('Category', CategorySchema);
