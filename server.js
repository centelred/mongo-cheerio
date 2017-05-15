//dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

//scraping tools prepared
var request = require('request');
var cheerio = require('cheerio');
var path = require('path');

var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(express.static(process.cwd() + '/public'));

//using morgan and bodyParser
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

//public static dir
app.use(express.satic('public'));

//mongoose db config
mongoose.Promise = global.Promise;
mongoose.connect('**Heroku Info**');

var db = mongoose.connection;

//mongoose error handling
db.on('error', function (err) {
  console.log('Mongoose error: ', err);
});

//connection message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});

var Note = require('./model/note');
var Article = require('./model/article');
var currents = "http://www.nytimes.com/pages/todayspaper/index.html";

app.get("/", function(req, res) {
  var articles = Article.find({}, function (err, doc) {
    console.log(doc);
    res.render('index', {
      doc: doc
    });
  })
});

app.get('/scrape', function(err, res){
  request(currents, function(error, response, html) {
    var $ = cheerio.load(html);
    $('.story').each(function (i, element) {
      var result = {};

      result.title = $(this).children('h3').text();
      result.articleNote = $(this).find('p').text();
      result.text = $(this).children('p').text();
      result.link = $(this).find('a').attr('href');
      result.image = $(this).find('img').attr('src');

      var entry = new Article(result);
      entry.save(function(err,doc){

      })
    });
  });

  Article.find({}, function(err,doc){
    if (err) {
      console.log (err);
    } // when scrape button is press, redirect to mainpage
    else {
      res.redirect("/");
    }
  });
});

app.get('/articles', function(req, res) {
  // grab all info in Articles array
  Article.find({}, function(req,doc){
    if (err) {
      console.log(err);
    }
    else { // send the doc to browser or as json
      res.json(doc);
    }
  });
});

app.get('/delete', function(req,res) {
  // grab all info in Articles array
  Article.remove({}, function(err, doc) {
    if (err) {
      console.log(err);
    }
    else { // when delete is pressed, redirect to mainpage
      res.redirect("/");
    }
  });
});

var PORT = process.env.PORT || 3001;
app.listen(PORT, function() {
  console.log('Listen on port ' + PORT);
})
