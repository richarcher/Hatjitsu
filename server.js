
/**
 * Module dependencies.
 */
var _ = require('underscore')._;

var env = process.env.NODE_ENV || 'development';

var fs = require('fs')
var http = require('http');

var express = require('express');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler')
var methodOverride = require('method-override');
var morgan = require('morgan')
var compression = require('compression')

var app = express();
var server = http.createServer(app)
var socketIO = require('socket.io');
var io = socketIO(server, {
  transports : ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']
});
var lobbyClass = require('./lib/lobby.js');
var config = require('./config.js')[env];
var path = require('path');

var lobby = new lobbyClass.Lobby(io);

var statsConnectionCount = 0;
var statsDisconnectCount = 0;
var statsSocketCount = 0;
var statsSocketMessagesReceived = 0;

// Configuration

// Set the CDN options
var options = {
    publicDir  : path.join(__dirname, 'app')
  , viewsDir   : path.join(__dirname, 'app')
  , domain     : 'dkb4nwmyziz71.cloudfront.net'
  , bucket     : 'hatchetapp'
  , key        : 'AKIAIS3XCFXFKWXGKK7Q'
  , secret     : '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'
  , hostname   : config.hostname
  , port       : config.port
  , ssl        : false
  , production : config.packAssets
};

// Initialize the CDN magic
var CDN = require('express-cdn')(app, options);

app.set('views', __dirname + '/app');
app.set('view engine', 'ejs');
app.set('view options', {
    layout: false
});
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(methodOverride());

if (env === 'development') {
  app.use(express.static(__dirname + '/app'));
  app.use(errorhandler());
}

if (env === 'production') {
  var oneDay = 86400000;
  // app.use(assetsManagerMiddleware);
  app.use(compression());
  app.use(express.static(__dirname + '/app'));
  app.use(errorhandler());
}

// Add the dynamic view helper
app.locals.CDN = CDN();

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


var port = process.env.app_port || 5000; // Use the port that Heroku provides or default to 5000
server.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", port, app.settings.env);
});




/* EVENT LISTENERS */

io.on('connection', function (socket) {

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

  socket.on('sort votes', function (data, callback) {
    statsSocketMessagesReceived++;
    var room = lobby.getRoom(data.roomUrl);
    if (room.error) {
      callback( { error: room.error });
    } else {
      room.sortVotes();
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
