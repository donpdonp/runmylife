var r = require('rethinkdb')
var express = require('express');
var app = express();
var dbname = 'activitystream'
var tablename = 'activity'

var opts = {host:'localhost', port: 28015, db:dbname}
r.connect(opts).then(function(conn) {
  console.log('connected', opts)
  r.dbList().run(conn).then(function(list){
    if(list.indexOf(dbname) == -1) { 
      console.log('warning: creating database '+dbname)
      return r.dbCreate('activitystream').run(conn)
    }
  })
  .then(function(){
    r.tableList().run(conn).then(function(list){
      if(list.indexOf(tablename) == -1) {
        console.log('warning: creating table '+tablename)
        return r.tableCreate(tablename).run(conn)
      }
    })
  }).then(function(){
    websetup(conn)
    var port = 6106
    app.listen(port);
    console.log('Listening on port '+port);
  })
})

function websetup(conn) {
    app.set('views', __dirname + '/views')
    app.set('view engine', 'jade')
    app.use(express.static(__dirname + '/public'))
    app.get('/',function(req, res){
      r.table('activity').orderBy(r.desc('published')).
        limit(20).
        run(conn, function(err, cursor){
          console.log(req.route.method+" "+req.originalUrl)
          cursor.toArray(function(err, rows){
            res.render('index', {activities:rows});
          })
        })
    })
}


