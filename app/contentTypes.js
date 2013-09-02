var mongoose = require('mongoose');

var ContentSchema = mongoose.Schema({
  type: String,
  content: String
});

var AreaSchema = mongoose.Schema({
  name: String,
  types: [String],
  content: [ContentSchema]
});

var PageSchema = mongoose.Schema({
  slug: String,
  areas: [AreaSchema]
});

module.exports.AposContent = AposContent = mongoose.model('AposContent', ContentSchema);
module.exports.AposArea    = AposArea    = mongoose.model('AposArea',    AreaSchema);
module.exports.AposPage    = AposPage    = mongoose.model('AposPage',    PageSchema);