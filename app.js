var express = require('express')
  , app = express.createServer()
  , io = require('socket.io').listen(app)
  , routes = require('./routes')
  , roomObj = {}
  ;
// Configuration

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/:id', function(req, res) {
  if (req.params.id in roomObj) {
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

/* EVENT LISTENERS */

io.sockets.on('connection', function (socket) {

  socket.on('disconnect', function () {
    broadcastDisconnect(socket);
  });
  
  socket.on('create room', function (data, callback) {
    createRoom(socket, callback);
  });

  socket.on('join room', function (roomname, callback) {
    var obj = {};
    if(roomname in roomObj) {
      socket.join(roomname);
      socket.broadcast.to(roomname).emit('room joined');
      obj.room = roomname;
      obj.needsAdmin = roomNeedsAdmin(roomname);
      callback(roomInfo(obj));
    } else {
      callback('error');
    }
  });

  socket.on('room info', function (data, callback) {
    callback(roomInfo({ room : data }));
  });

});



/* METHODS */

function createRoom(socket, callback) {
  var randurl = createUniqueUrl();
  socket.set('admin', true);
  roomObj[randurl] = {
                      administratorSet: false
                    };
  return callback(randurl);
};

function createUniqueUrl() {
  var text = ""
    , possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    , i
    ;
  for ( i = 0; i < 4; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
  if (text in roomObj) {
    createUniqueUrl();
    }
  return text;
};

function roomInfo(obj) {
  obj.clientcount = Object.keys(io.sockets.clients(obj.room)).length;
  return obj;
};

function broadcastDisconnect(socket) {
  var clientRooms = io.sockets.manager.roomClients[socket.id]
    , room
    ;
  for (room in clientRooms) {
    if (room.length) {
      io.sockets.in(room.substr(1)).emit('room left');
    }
  }
};

function roomNeedsAdmin(room) {
  if (roomObj[room].administratorSet) {
    return false;
  } else {
    return roomObj[room].administratorSet = true;
  }
}
