var express = require('express')
  , app = express.createServer()
  , io = require('socket.io').listen(app)
  , rooms = []
  ;
// Configuration

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

// Heroku won't actually allow us to use WebSockets
// so we have to setup polling instead.
// https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
io.configure('production', function(){
  io.enable('browser client etag');
  io.set('log level', 1);
  io.set('transports', [
      "websocket"
    ]);
});
io.configure('development', function(){
  io.enable('browser client etag');
  io.set('log level', 3);
  io.set('transports', [
      "websocket"
    ]);
});


/* ROUTES */

var port = process.env.PORT || 5000; // Use the port that Heroku provides or default to 5000
app.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

app.use("/public", express.static(__dirname + '/public'));
app.get("/favicon.ico", function(req, res) {
  return false;
});
app.get('/:id?', function(req, res) {
  var params = req.params.id;
  if (params === undefined) {
    res.render('index', { title: 'Express', script: 'index' });
    }
  else if (rooms.indexOf(params) != -1) {
    res.render('room', { title: 'Room ' + params, script: 'room' });
    } 
  else {
    res.send(404);
  }
});


/* EVENT LISTENERS */

io.sockets.on('connection', function (socket) {

  socket.on('disconnect', function () {
    broadcastDisconnect(socket);
  });
  
  socket.on('create room', function (data, callback) {
    createRoom(socket, callback);
  });

  socket.on('join room', function (data, callback) {
    socket.join(data);
    socket.broadcast.to(data).emit('room joined');
    callback(roomInfo({ room : data }));
  });

  socket.on('room info', function (data, callback) {
    callback(roomInfo({ room : data }));
  });

});



/* METHODS */

function createRoom(socket, callback) {
  var randurl = createUniqueUrl();
  socket.set('admin', true);
  rooms.push(randurl);
  return callback(randurl);
  //TODO: create admin cookie
};

function createUniqueUrl() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < 4; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
  if (rooms.indexOf(text) === -1) {
    return text;
    }
  makeUniqueUrl();
};

function roomInfo(obj) {
  var clientcount = Object.keys(io.sockets.clients(obj.room)).length;
  obj.clientcount = clientcount;
  return obj;
};

function broadcastDisconnect(socket) {
  var rooms = io.sockets.manager.roomClients[socket.id]
    , room
    ;
  for (room in rooms) {
    if (room.length) {
      io.sockets.in(room.substr(1)).emit('room left');
      }
    }
};