var r = require('rethinkdb')
var express = require('express');
var app = express();

r.connect({host:'localhost', port: 28015, db:'activitystream'}, function(err, conn) {
  if(err){ console.log(err) } else {
    console.log('db on')
    app.get('/',function(req, res){
      console.log(req.route.method+" "+req.originalUrl)

      var body = 'Hello World';
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Length', body.length);
      res.end(body);
    });
  }
})

var port = 6106
app.listen(port);
console.log('Listening on port '+port);

