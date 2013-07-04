var r = require('rethinkdb')
var express = require('express');
var app = express();

r.connect({host:'localhost', port: 28015, db:'activitystream'}, function(err, conn) {
  if(err){ console.log(err) } else {
    console.log('db on')
    app.set('views', __dirname + '/views')
    app.set('view engine', 'jade')
    app.use(express.static(__dirname + '/public'))
    app.get('/',function(req, res){
      console.log(req.route.method+" "+req.originalUrl)
      res.render('index');
    });
  }
})

var port = 6106
app.listen(port);
console.log('Listening on port '+port);

