var _ = require('underscore')._;

var RoomClass = require('./room.js');

var Lobby = function(io) {
  this.io = io;
  this.rooms = {};
};


Lobby.prototype.createRoom = function(roomUrl) {
  roomUrl = roomUrl === undefined ? this.createUniqueURL() : roomUrl + this.createUniqueURL();
  if (this.rooms[roomUrl]) {
    this.createRoom(roomUrl);
  }

  // remove any existing empty rooms first
  var thatRooms = this.rooms;
  _.each(this.rooms, function(room, key, rooms) {
    if (room.getClientCount() == 0) {
      delete thatRooms[key];
      // console.log("removed room " + key);
    }
  });

  this.rooms[roomUrl] = new RoomClass.Room(this.io, roomUrl);
  return roomUrl;
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
  if(data.roomUrl && data.roomUrl in this.rooms) {
    var room = this.getRoom(data.roomUrl);
    if (socket != null && data && data.sessionId != null) {
      room.enter(socket, data);
      socket.join(data.roomUrl);
      socket.broadcast.to(data.roomUrl).emit('room joined');
    }
    return room;
  } else {
    return { error: 'Sorry, this room no longer exists ...'};
  }
};

Lobby.prototype.getRoom = function(roomUrl) {
  var room = this.rooms[roomUrl];
  if (room) {
    return room;
  } else {
    return { error: 'Sorry, this room no longer exists ...'};
  }
};

Lobby.prototype.broadcastDisconnect = function(socket) {
  for (const [roomKey, room] of Object.entries(this.rooms)) {
    if (room) {
      for (const [, connection] of Object.entries(this.getRoom(roomKey).connections)) {
        if (connection.socketId === socket.id) {
          room.leave(socket)
        }
      }
      this.io.sockets.in(roomKey).emit('room left');
    }
  }
};


exports.Lobby = Lobby;
