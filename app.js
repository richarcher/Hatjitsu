
/**
 * Module dependencies.
 */

var express = require('express'),
    fs = require('fs');

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);
var lobbyClass = require('./lib/lobby.js');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/app');
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/app'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


app.get('/:id', function(req, res) {
  if (req.params.id in lobby.rooms) {
    fs.readFile(__dirname + '/app/index.html', 'utf8', function(err, text){
      console.log(text);
      res.send(text);
    });
  } else {
    res.send(404);  
  }
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


var lobby = new lobbyClass.Lobby(io);




/* EVENT LISTENERS */

io.sockets.on('connection', function (socket) {

  console.log("Connect");

  socket.on('disconnect', function () {
    console.log("Disconnect");
    lobby.broadcastDisconnect(socket);
  });
  
  socket.on('create room', function (data, callback) {
    console.log("create room");
    callback(lobby.createRoom());
  });

  socket.on('join room', function (roomUrl, callback) {
    console.log("join room " + roomUrl);
    var response = lobby.joinRoom(socket, roomUrl);
    if(response.error) {
      callback( response.error );
    } else {
      callback(lobby.refreshRoomInfo(roomUrl));
    }
  });

  socket.on('room info', function (roomUrl, callback) {
    console.log("room info");
    callback(lobby.refreshRoomInfo(roomUrl));
  });

});