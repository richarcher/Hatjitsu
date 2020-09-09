var _ = require('underscore')._;

var RoomClass = require('./room.js');

var Lobby = function(io) {
  this.io = io;
  this.rooms = {};
};


Lobby.prototype.createRoom = function(id) {
  id = id === undefined ? this.createUniqueURL() : id;
  if (this.rooms[id]) {
    this.createRoom(id);
  }

  // remove any existing empty rooms first
  var thatRooms = this.rooms;
  _.each(this.rooms, function(room, key, rooms) {
    if (room.getClientCount() == 0) {
      delete thatRooms[key];
      // console.log("removed room " + key);
    }
  });

  this.rooms[id] = new RoomClass.Room(this.io, id);
  return id;
};

Lobby.prototype.createUniqueURL = function() {
  var text = ""
    , possible = "0123456789"
    , i
    ;
  for ( i = 0; i < 5; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
  return text;
};

Lobby.prototype.joinRoom = function(socket, data) {
  if ( ! data.id ) {
    return  { error: 'Invalid or missing Room ID'};
  }

  if( ! ( data.id in this.rooms ) ) {
    console.log( "creating new room from URL with: " + data.id );
    this.createRoom( data.id );
  }

  var room = this.getRoom(data.id);
  if (socket != null && data && data.sessionId != null) {
    room.enter(socket, data);
    socket.join(data.id);
    socket.broadcast.to(data.id).emit('room joined');
  }
  return room;
};

Lobby.prototype.getRoom = function(id) {
  var room = this.rooms[id];
  if (room) {
    return room;
  } else {
    return { error: 'Sorry, this room no longer exists ...'};
  }
};

Lobby.prototype.broadcastDisconnect = function(socket) {
  var clientRooms = this.io.sockets.manager.roomClients[socket.id]
    , socketRoom, room
    ;
  // console.log("broadcast Disconnect");
  for (socketRoom in clientRooms) {
    if (socketRoom.length) {
      var id = socketRoom.substr(1);
      var room = this.getRoom(id);
      if (room) {
        room.leave(socket);
      }
      this.io.sockets.in(id).emit('room left');
    }
  }
};


exports.Lobby = Lobby;