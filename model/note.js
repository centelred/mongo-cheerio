//require mongoose
var mongoose = require('mongoose');
//create schema class
var Schema = mongoose.Schema;
//create note schema
var NoteSchema = new Schema({
  title:{
    type: String
  },
  body:{
    type: String
  }
});

var Note = mongoose.model('Note', NoteSchema);

module.exports = Note;
