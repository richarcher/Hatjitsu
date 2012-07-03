
/**
 * Module dependencies.
 */

var express = require('express'),
    fs = require('fs');

var app = module.exports = express.createServer();
var assetManager = require('connect-assetmanager');
var io = require('socket.io').listen(app);
var lobbyClass = require('./lib/lobby.js');
// Configuration


var assetManagerGroups = {
  'js': {
    'route': /\/static\/js\/[0-9]+\/.*\.js/
    , 'path': './app/js/'
    , 'dataType': 'javascript'
    , 'files': [
      'app.js',
      'controllers.js',
      'directives.js',
      'filters.js',
      'services.js',
    ]
  }
}
var assetsManagerMiddleware = assetManager(assetManagerGroups);

app.configure(function(){
  app.set('views', __dirname + '/app');
  app.set('view engine', 'ejs');
  app.set('view options', {
      layout: false
  });
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(assetsManagerMiddleware);
  app.use(express.staticCache());
  app.use(express.static(__dirname + '/app'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(express.static(__dirname + '/app', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

app.get('/', function(req, res) {
  res.render('index.ejs');
});

app.get('/:id', function(req, res) {
  if (req.params.id in lobby.rooms) {
    res.render('index.ejs');
    // fs.readFile(__dirname + '/app/index.html', 'utf8', function(err, text){
    //   console.log(text);
    //   res.send(text);
    // });
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

var port = process.env.app_port || 5000; // Use the port that Heroku provides or default to 5000
app.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});


var lobby = new lobbyClass.Lobby(io);




/* EVENT LISTENERS */

io.sockets.on('connection', function (socket) {

  // console.log("On connect", socket.id);

  socket.on('disconnect', function () {
    // console.log("On disconnect", socket.id);
    lobby.broadcastDisconnect(socket);
  });
  
  socket.on('create room', function (data, callback) {
    // console.log("on create room", socket.id, data);
    callback(lobby.createRoom());
  });

  socket.on('join room', function (data, callback) {
    // console.log("on join room " + data.roomUrl, socket.id, data);
    var room = lobby.joinRoom(socket, data);
    if(room.error) {
      callback( { error: room.error } );
    } else {
      callback(room.info());
    }
  });

  socket.on('room info', function (data, callback) {
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
    // console.log("on set card pack " + data.cardPack + " for " + data.roomUrl, socket.id, data);
    var room = lobby.getRoom(data.roomUrl);
    // console.log("error=" + room.error);
    if (!room.error) {
      room.setCardPack(data);
    }
  });

  socket.on('vote', function (data, callback) {
    // console.log("on vote " + data.vote + " received for " + data.roomUrl, socket.id, data);
    var room = lobby.getRoom(data.roomUrl);
    if (room.error) {
      callback( { error: room.error });
    } else {
      room.recordVote(data);
      callback( {} );
    }
  });

  socket.on('unvote', function (data, callback) {
    // console.log("omn unvote received for " + data.roomUrl, socket.id, data);
    var room = lobby.getRoom(data.roomUrl);
    if (room.error) {
      callback( { error: room.error });
    } else {
      room.destroyVote(data);
      callback( {} );
    }
  });

  socket.on('reset vote', function (data, callback) {
    // console.log("on reset vote  received for " + data.roomUrl, socket.id, data);
    var room = lobby.getRoom(data.roomUrl);
    if (room.error) {
      callback( { error: room.error });
    } else {
      room.resetVote();
      callback( {} );
    }
  });

  socket.on('toggle voter', function (data, callback) {
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