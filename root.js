/* global require */
var http = require('http');
var fs = require('fs');
var express = require('express');
var level = require('level');
var sublevel = require('level-sublevel');
var levelws = require('level-ws');

var db = levelws(sublevel(level(__dirname + 'database')));

var initialize = require('./initialize');

var app = express();
app.set('port', process.env.PORT || 3001);

app.get('/api/chapters', chapters);
app.get('/api/chapters/:chapter_name', sanitize, chapter);
app.get('/api/chapters/:chapter_name/:directory', sanitize, chapter_directory);

function sanitize(req, res, next) {
  for (var key in req.params) {
    if (req.params[key].indexOf(".") > -1) {
      return res.json(400, "Bad request");
    }
  }
  next();
}

function chapters(req, res) {
  function callback(err, files) {
    res.json(200, files);
  }

  fs.readdir('chapters', callback);
}

function chapter(req, res) {
  function callback(err, files) {
    res.json(200, files);
  }

  fs.readdir('chapters/' + req.params.chapter_name, callback);
}

function chapter_directory(req, res) {

  function callback(err, files) {
    var data = [];

    for (var i=0; i<files.length; i++) {
      try {
        var d = require('./chapters/' + req.params.chapter_name + '/' + req.params.directory + '/' + files[i]);
        data.push(d)
      } catch(exception) {}
    }

    res.json(200, data);
  }

  fs.readdir('chapters/' + req.params.chapter_name + '/' + req.params.directory, callback);
}

var server = http.createServer(app);

//
// Initializes the database and loads
//
initialize(db, function (err) {
  if (err) {
    console.error(err);
    return process.exit(1);
  }
  server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
});
