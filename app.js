
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

  socket.on('join room', function (data, callback) {
    console.log("join room " + data.roomUrl);
    var room = lobby.joinRoom(socket, data.roomUrl);
    if(room.error) {
      callback( { error: room.error } );
    } else {
      callback(room.info());
    }
  });

  socket.on('room info', function (data, callback) {
    console.log("room info for " + data.roomUrl);
    var room = lobby.getRoom(data.roomUrl);
    // room = { error: "there was an error" };
    if (room.error) {
      callback( { error: room.error } );
    } else {
      callback(room.info());
    }
  });

  socket.on('set card pack', function (data, cardPack) {
    console.log("set card pack " + data.cardPack + " for " + data.roomUrl);
    var room = lobby.getRoom(data.roomUrl);
    console.log("error=" + room.error);
    if (!room.error) {
      room.setCardPack(data.cardPack);
    }
  });

  socket.on('vote', function (data, callback) {
    console.log("vote " + data.vote + " received for " + data.roomUrl);
    var room = lobby.getRoom(data.roomUrl);
    if (room.error) {
      callback( { error: room.error });
    } else {
      room.recordVote(socket, data.vote);
      callback( {} );
    }
  });

  socket.on('unvote', function (data, callback) {
    console.log("unvote received for " + data.roomUrl);
    var room = lobby.getRoom(data.roomUrl);
    if (room.error) {
      callback( { error: room.error });
    } else {
      room.destroyVote(socket);
      callback( {} );
    }
  });

  socket.on('reset vote', function (data, callback) {
    console.log("reset vote  received for " + data.roomUrl);
    var room = lobby.getRoom(data.roomUrl);
    if (room.error) {
      callback( { error: room.error });
    } else {
      room.resetVote();
      callback( {} );
    }
  });

  socket.on('toggle voter', function (data, callback) {
    var room = lobby.getRoom(data.roomUrl);
    if (room.error) {
      callback( { error: room.error });
    } else {
      room.toggleVoter(socket, data.voter);
      callback( {} );
    }
  });

});