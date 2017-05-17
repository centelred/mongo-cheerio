////////////////////////////////////////////////
////////////////dependencies////////////////////
////////////////////////////////////////////////
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
////////////////////////////////////////////////
///////////////scraping tools///////////////////
////////////////////////////////////////////////
var request = require('request');
var cheerio = require('cheerio');
////////////////////////////////////////////////
////////////////////////////////////////////////
//use morgan and body parser
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

//static public dir
app.use(express.static('public'));

//use handlebars as template
var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//database config with mongoose
mongoose.connect('mongodb://localhost/huffpostScraper');
var db = mongoose.connection;

//show mongoose errors
db.on('error', function(err){
  console.log('**ERROR ERROR**', err);
});

//show successful connection
db.once('open', function(){
  console.log('**MONGOOSE SUCCESSFULLY CONNECTED**');
});

///////////////////////////////////////////////
///////////note & article models///////////////
///////////////////////////////////////////////
var Note = require('./model/note.js');
var Article = require('./model/article.js');

////////////////////////////////////////////////
/////////////////////routes/////////////////////
////////////////////////////////////////////////

//index routes
app.get('/', function(req, res){
  res.render('index')
});

//get request to scrape
app.get('/scrape', function(req, res){
  //grab the body
  request('http://www.huffingtonpost.com/', function(error, respose, html) {
    //load into cheerio and save it to $
    var $ = cheerio.load(html);
    //grab every h2 within article tag
    $('h2').each(function(i, element) {
      //save to empty array
      var result = {};
      //add text and href of all links save to result obj
      result.title = $(this).children('a').text();
      result.link = $(this).children('a').attr('href');
      //using Article to create a new entry.
      var entry = new Article (result);
      console.log(entry);
      //check for unique entry
      Article.count({'title': entry.title}, function(err, count){
        if(count>0){
          console.log('**DUPLICATE**');
        }
        else {
          entry.save(function(err, doc){
            if (err) {
              console.log(err);
            }
            else {
              console.log(doc);
            }
          });
        }
      });
    });
  });
  res.send("**SCRAPE FINISHED**");
});

//get scraped articles from mongodb
app.get('/articles', function(req, res){
  //grab docs from Articles array
  Article.find({}, function(err, doc){
    //log errors
    if (err){
      console.log(err);
    }
    //send to doc as json
    else {
      res.json(doc);
    }
  });
});

//grab article by id
app.get('articles/:id', function(req, res){
  Article.findOne({'_id': req.params.id})
  .populate('note')
  .exec(function(err, doc){
    if (err) {
      console.log(err);
    }
    else {
      res.json(doc);
    }
  });
});

//replace existing not with new once
app.post('/articles/:id', function(req, res){
  var newNote = new Note(req.body);
  //save the note to db
  newNote.save(function(err, doc){
    if (err){
      console.log(err);
    }
    else{
      Article.findOneAndUpdate({'_id': req.params.id}, {'note': doc._id})
      .exec(function(err, doc){
        if (err){
          console.log(err);
        }
        else {
          res.send(doc);
        }
      });
    }
  });
});

app.listen(process.env.PORT || 3002, function(){
  console.log('**APP LIVE ON 3002**');
});
