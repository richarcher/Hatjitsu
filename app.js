
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);
var lobbyObj = require('./lib/lobby.js');
// var roomObj = {};

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.get('/:id', function(req, res) {
  if (req.params.id in lobby.roomObj) {
    res.render('room', { title: 'Room ' + req.params.id, script: 'room' });
  }
  res.send(404);
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
  io.set('log level', 2);
  io.set('transports', [
      "websocket"
    ]);
});

var port = process.env.PORT || 5000; // Use the port that Heroku provides or default to 5000
app.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

var lobby = new lobbyObj.Lobby();




/* EVENT LISTENERS */

io.sockets.on('connection', function (socket) {

  console.log("Connect");

  socket.on('disconnect', function () {
    console.log("Disconnect");
    broadcastDisconnect(socket);
  });
  
  socket.on('create room', function (data, callback) {
    console.log("create room");
    callback(lobby.createRoom());
  });

  socket.on('join room', function (roomname, callback) {
    console.log("join room");
    var response = lobby.joinRoom(socket, roomname);
    if(response.error) {
      callback( 'room does not exist' );
    } else {
      callback(roomInfo(response));
    }
  });

  socket.on('room info', function (roomname, callback) {
    console.log("room info");
    callback(roomInfo({ room: roomname, needsAdmin: lobby.roomNeedsAdmin(roomname) }));
  });

});


 /* METHODS */

function roomInfo(obj) {
  obj.clientcount = Object.keys(io.sockets.clients(obj.room)).length;
  return obj;
};

function broadcastDisconnect(socket) {
  var clientRooms = io.sockets.manager.roomClients[socket.id]
    , room
    ;
  console.log("broadcast Disconnect");
  for (room in clientRooms) {
    if (room.length) {
      roomname = room.substr(1);
      io.sockets.in(roomname).emit('room left');
    }
  }
};
