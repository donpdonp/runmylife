var r = require('rethinkdb')
var express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var redislib = require('then-redis');
var Promise = require("bluebird")
var XDate = require("xdate")

var redis = redislib.createClient();
var app = express();
var dbname = 'activitystream'
var tablename = 'activity'
var indexname = 'published'

var opts = {host:'localhost', port: 28015, db:dbname}
app.locals.pretty = true;

dbsetup(opts).then(webapp)

function dbsetup(opts) {
  return r.connect(opts).then(function(conn) {
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
    })
    .then(function(){
      r.table(tablename).indexList().run(conn).then(function(list){
        if(list.indexOf(indexname) == -1) {
          console.log('warning: creating index '+indexname)
          return r.table(tablename).indexCreate(indexname).run(conn)
        }
      })
    })
    return conn
  })
}

function webapp(conn){
  websetup(conn)
  var port = 6106
  app.listen(port);
  console.log('Listening on port '+port);
}

function websetup(conn) {
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')
  app.use(express.static(__dirname + '/public'))
  app.use(express.urlencoded())
  app.use(cookieParser())

  app.get('/',function(req, res){
    var days = 8
    if(req.query.days){ days = req.query.days }
    var stop = new Date()
    var start = new Date(stop - 1000*60*60*24*days)

    r.table(tablename)
     .between(start.toISOString(), stop.toISOString(), {index: 'published', left_bound: 'open'})
     .orderBy(r.desc('published'))
     .run(conn, function(err, cursor){
        if(err){ console.log(err) }
        console.log(req.route.method+" "+req.originalUrl)
        cursor.toArray(function(err, rows){
          redis.hget('indieauth:donp.org', req.cookies['indieauth']).then(function(me){
            res.render('index', {activities:rows, me: me, start: start, stop: stop, days: days});
          })
        })
      })
  })
  app.get('/post',function(req, res){
    var secret = req.cookies['indieauth']
    redis.hget('indieauth:donp.org', secret).then(function(me){
      if(me) {
        res.render('post', {me: me} );
      } else {
        res.redirect('/as?msg=login-first' );
      }
    })
  })
  app.post('/post',function(req, res){
    var secret = req.cookies['indieauth']
    redis.hget('indieauth:donp.org', secret).then(function(me){
      if(me) {
        var time = req.body.datetime || (new Date()).toISOString()
        doc = { verb: req.body.verb,
                object: { name: req.body.name },
                provider: "as.js",
                actor: me,
                published: time
               }
         if(req.body.price) {doc.object.price = parseFloat(req.body.price) }
         r.table(tablename).insert(doc).run(conn, function(err,res){ console.log(err, res)})
         res.redirect('/as?msg=posted' );
       } else {
         res.redirect("/as")
       }
     })
   })
  app.post('/delete',function(req, res){
    var secret = req.cookies['indieauth']
    redis.hget('indieauth:donp.org', secret).then(function(me){
      if(me) {
         r.table(tablename).get(req.body.id).delete().run(conn, function(err,res){ console.log(err, res)})
         res.redirect('/as?msg=deleted' );
      }
    })
  })

}
