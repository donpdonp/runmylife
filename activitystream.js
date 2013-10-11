var r = require('rethinkdb')
var express = require('express');
var app = express();

r.connect({host:'localhost', port: 28015, db:'activitystream'}, function(err, conn) {
  r.dbCreate('activitystream').run(conn, function(err){})
  r.tableCreate('activity').run(conn, function(err){if(err){console.log(err)}})
  //r.table('activity').insert({verb:"checkin", object: {objectType:"place",name:"My Father's Place"}}).run(conn, function(){})

  if(err){ console.log(err) } else {
    console.log('db on')
    app.set('views', __dirname + '/views')
    app.set('view engine', 'jade')
    app.use(express.static(__dirname + '/public'))
    app.get('/',function(req, res){
      r.table('activity').orderBy(r.desc('published')).run(conn, function(err, cursor){
        console.log(req.route.method+" "+req.originalUrl)
        cursor.toArray(function(err, rows){
          res.render('index', {activities:rows});
        })
      })
    })
  }

})

var port = 6106
app.listen(port);
console.log('Listening on port '+port);

