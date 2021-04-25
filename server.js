
/**
 * Module dependencies.
 */
var _ = require('underscore')._;

var env = process.env.NODE_ENV || 'development';

const express = require('express');
const app = module.exports = express();
const port = process.env.app_port || 5000;

var lobbyClass = require('./lib/lobby.js');
var path = require('path');

var statsConnectionCount = 0;
var statsDisconnectCount = 0;
var statsSocketCount = 0;
var statsSocketMessagesReceived = 0;

app.use(express.static('app'));
app.set('views', path.join(__dirname, 'app'));

app.get('/', function(req, res) {
  res.render('index.ejs');
});

app.get('/debug_state', function(req, res) {
  res.json({
    "stats": {
      "connectionCount": statsConnectionCount,
      "disconnectCount": statsDisconnectCount,
      "currentSocketCount": statsSocketCount,
      "socketMessagesReceived": statsSocketMessagesReceived
    },
    "rooms": _.map(lobby.rooms, function(room, key) { return room.json() } )
  });
});

app.get('/room/:id', function(req, res) {
  if ( ! req.params.id in lobby.rooms ) {
    lobby.createRoom( req.params.id );
  }
  res.render('index.ejs');
});

app.use(function (req, res, next) {
  res.redirect('/');
});

 // Use the port that Heroku provides or default to 5000
const server = app.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", port, app.settings.env);
});

const io = require('socket.io').listen(server);
var lobby = new lobbyClass.Lobby(io);


io.configure(function () {
  io.set('transports', ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
});

io.configure('production', function(){
  io.enable('browser client minification');
  io.enable('browser client etag');
  io.set("polling duration", 10);
  io.set('log level', 1);
});
io.configure('development', function(){
  io.set('log level', 2);
});


/* EVENT LISTENERS */

io.sockets.on('connection', function (socket) {

  statsConnectionCount++;
  statsSocketCount++;

  // console.log("On connect", socket.id);

  socket.on('disconnect', function () {
    statsDisconnectCount++;
    statsSocketCount--;
    // console.log("On disconnect", socket.id);
    lobby.broadcastDisconnect(socket);
  });

  socket.on('create room', function (data, callback) {
    statsSocketMessagesReceived++;
    // console.log("on create room", socket.id, data);
    callback(lobby.createRoom());
  });

  socket.on('join room', function (data, callback) {
    statsSocketMessagesReceived++;
    // console.log("on join room " + data.id, socket.id, data);
    var room = lobby.joinRoom(socket, data);
    if(room.error) {
      callback( { error: room.error } );
    } else {
      callback(room.info());
    }
  });

  socket.on('room info', function (data, callback) {
    statsSocketMessagesReceived++;
    // console.log("on room info for " + data.id, socket.id, data);
    var room = lobby.getRoom(data.id);
    // room = { error: "there was an error" };
    if (room.error) {
      callback( { error: room.error } );
    } else {
      callback(room.info());
    }
  });

  socket.on('set card pack', function (data, cardPack) {
    statsSocketMessagesReceived++;
    // console.log("on set card pack " + data.cardPack + " for " + data.id, socket.id, data);
    var room = lobby.getRoom(data.id);
    // console.log("error=" + room.error);
    if (!room.error) {
      room.setCardPack(data);
    }
  });

  socket.on('vote', function (data, callback) {
    statsSocketMessagesReceived++;
    // console.log("on vote " + data.vote + " received for " + data.id, socket.id, data);
    var room = lobby.getRoom(data.id);
    if (room.error) {
      callback( { error: room.error });
    } else {
      room.recordVote(socket, data);
      callback( {} );
    }
  });

  socket.on('unvote', function (data, callback) {
    statsSocketMessagesReceived++;
    // console.log("omn unvote received for " + data.id, socket.id, data);
    var room = lobby.getRoom(data.id);
    if (room.error) {
      callback( { error: room.error });
    } else {
      room.destroyVote(socket, data);
      callback( {} );
    }
  });

  socket.on('reset vote', function (data, callback) {
    statsSocketMessagesReceived++;
    // console.log("on reset vote  received for " + data.id, socket.id, data);
    var room = lobby.getRoom(data.id);
    if (room.error) {
      callback( { error: room.error });
    } else {
      room.resetVote();
      callback( {} );
    }
  });

  socket.on('force reveal', function (data, callback) {
    statsSocketMessagesReceived++;
    var room = lobby.getRoom(data.id);
    if (room.error) {
      callback( { error: room.error });
    } else {
      room.forceReveal();
      callback( {} );
    }
  });

  socket.on('toggle voter', function (data, callback) {
    statsSocketMessagesReceived++;
    // console.log("on toggle voter for " + data.id, socket.id, data);
    var room = lobby.getRoom(data.id);
    if (room.error) {
      callback( { error: room.error });
    } else {
      room.toggleVoter(data);
      callback( {} );
    }
  });

});