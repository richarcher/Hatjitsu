
/**
 * Module dependencies.
 */
var _ = require('underscore')._;

var env = process.env.NODE_ENV || 'development';

var express = require('express'),
    fs = require('fs');

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);
var lobbyClass = require('./lib/lobby.js');
var config = require('./config.js')[env];
var path = require('path');

var lobby = new lobbyClass.Lobby(io);

var statsConnectionCount = 0;
var statsDisconnectCount = 0;
var statsSocketCount = 0;
var statsSocketMessagesReceived = 0;

app.configure(function(){
  app.set('views', __dirname + '/app');
  app.set('view engine', 'ejs');
  app.set('view options', {
      layout: false
  });
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.staticCache());
});

app.configure('development', function(){
  app.use(express.static(__dirname + '/app'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.static(__dirname + '/app'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

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

app.get('/styleguide', function(req, res) {
  res.render('styleguide.ejs');
});

app.get('/:id', function(req, res) {
  if (req.params.id in lobby.rooms) {
    res.render('index.ejs');
  } else {
   res.redirect('/');  
  }
});


io.configure(function () {
  io.set('transports', ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
});

io.configure('production', function(){
  io.enable('browser client minification');
  io.enable('browser client etag');
  io.enable('browser client gzip');
  io.set("polling duration", 10);
  io.set('log level', 1);
});
io.configure('development', function(){
  io.set('log level', 2);
});

var port = process.env.app_port || 5000; // Use the port that Heroku provides or default to 5000
app.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
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
    // console.log("on join room " + data.roomUrl, socket.id, data);
    var room = lobby.joinRoom(socket, data);
    if(room.error) {
      callback( { error: room.error } );
    } else {
      callback(room.info());
    }
  });

  socket.on('room info', function (data, callback) {
    statsSocketMessagesReceived++;
    // console.log("on room info for " + data.roomUrl, socket.id, data);
    var room = lobby.getRoom(data.roomUrl);
    // room = { error: "there was an error" };
    if (room.error) {
      callback( { error: room.error } );
    } else {
      callback(room.info());
    }
  });

  socket.on('set card pack', function (data, cardPack) {
    statsSocketMessagesReceived++;
    // console.log("on set card pack " + data.cardPack + " for " + data.roomUrl, socket.id, data);
    var room = lobby.getRoom(data.roomUrl);
    // console.log("error=" + room.error);
    if (!room.error) {
      room.setCardPack(data);
    }
  });

  socket.on('vote', function (data, callback) {
    statsSocketMessagesReceived++;
    // console.log("on vote " + data.vote + " received for " + data.roomUrl, socket.id, data);
    var room = lobby.getRoom(data.roomUrl);
    if (room.error) {
      callback( { error: room.error });
    } else {
      room.recordVote(socket, data);
      callback( {} );
    }
  });

  socket.on('unvote', function (data, callback) {
    statsSocketMessagesReceived++;
    // console.log("omn unvote received for " + data.roomUrl, socket.id, data);
    var room = lobby.getRoom(data.roomUrl);
    if (room.error) {
      callback( { error: room.error });
    } else {
      room.destroyVote(socket, data);
      callback( {} );
    }
  });

  socket.on('reset vote', function (data, callback) {
    statsSocketMessagesReceived++;
    // console.log("on reset vote  received for " + data.roomUrl, socket.id, data);
    var room = lobby.getRoom(data.roomUrl);
    if (room.error) {
      callback( { error: room.error });
    } else {
      room.resetVote();
      callback( {} );
    }
  });

  socket.on('force reveal', function (data, callback) {
    statsSocketMessagesReceived++;
    var room = lobby.getRoom(data.roomUrl);
    if (room.error) {
      callback( { error: room.error });
    } else {
      room.forceReveal();
      callback( {} );
    }
  });

  socket.on('toggle voter', function (data, callback) {
    statsSocketMessagesReceived++;
    // console.log("on toggle voter for " + data.roomUrl, socket.id, data);
    var room = lobby.getRoom(data.roomUrl);
    if (room.error) {
      callback( { error: room.error });
    } else {
      room.toggleVoter(data);
      callback( {} );
    }
  });

});