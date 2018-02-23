var mongoose      = require('mongoose');
var Schema        = mongoose.Schema;
var util          = require('util');
var child_process = require('child_process');

var VideoSchema = new Schema({
   name: String,
   approved: {
      type: Boolean,
      default: false
   },
   dateCreated: {
      type: Date,
      default: Date.now
   },
   status: {
      type: String,
      default: 'pending'
   },
   path: String
});

module.exports = mongoose.model('Video', VideoSchema);
