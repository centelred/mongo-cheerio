//require mongoose
var mongoose = require('mongoose');
//create schema class
var Schema = mongoose.Schema;
//create article Schema
var ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: 'Note'
  }
});

var Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;
