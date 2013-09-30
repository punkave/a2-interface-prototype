var mongoose = require('mongoose');

var ContentSchema = mongoose.Schema({
  area: String,
  type: String,
  // !!! NOTE: any time you save this you have to use aposContent.markModified('content') first !!!
  content: mongoose.Schema.Types.Mixed
});

var PageSchema = mongoose.Schema({
  slug: String,
  content: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AposContent' }]
});

module.exports.AposContent = AposContent = mongoose.model('AposContent', ContentSchema);
module.exports.AposPage    = AposPage    = mongoose.model('AposPage',    PageSchema);