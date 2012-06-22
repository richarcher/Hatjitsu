var RoomClass = require('./room.js');

var Lobby = function(io) {
  this.io = io;
  this.rooms = {};
};


Lobby.prototype.createRoom = function() {
  var roomUrl = this.createUniqueURL();
  // var l = new lobby.Lobby();
  if (roomUrl in this.rooms) {
    this.createRoom();
  }
  this.rooms[roomUrl] = new RoomClass.Room(this.io, roomUrl);
  return roomUrl;
};


Lobby.prototype.createUniqueURL = function() {
  var text = ""
    , possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    , i
    ;
  for ( i = 0; i < 4; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
  return text;
};


Lobby.prototype.joinRoom = function(socket, roomUrl) {
  if(roomUrl in this.rooms) {
    socket.join(roomUrl);
    socket.broadcast.to(roomUrl).emit('room joined');
    console.log("broadcast room " + roomUrl + " joined");
    return this.getRoom(roomUrl);
  } else {
    return { error: 'room ' + roomUrl + ' does not exist'}
  }
};

Lobby.prototype.getRoom = function(roomUrl) {
  var room = this.rooms[roomUrl];
  if (room) {
    return room;
  } else {
    return { error: 'room ' + roomUrl + ' does not exist'}
  }
}

Lobby.prototype.broadcastDisconnect = function(socket) {
  var clientRooms = this.io.sockets.manager.roomClients[socket.id]
    , socketRoom, room
    ;
  console.log("broadcast Disconnect");
  for (socketRoom in clientRooms) {
    if (socketRoom.length) {
      roomUrl = socketRoom.substr(1);
      room = this.getRoom(roomUrl);
      room.destroyVote(socket);
      this.io.sockets.in(roomUrl).emit('room left');
    }
  }
};


exports.Lobby = Lobby;