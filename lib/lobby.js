var RoomClass = require('./room.js');

var Lobby = function(io) {
  this.io = io;
  this.rooms = {};
};


Lobby.prototype.createRoom = function(roomUrl) {
  roomUrl = roomUrl === undefined ? this.createUniqueURL() : roomUrl + this.createUniqueURL();
  if (roomUrl in this.rooms) {
    this.createRoom(roomUrl);
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
  if(roomUrl && roomUrl in this.rooms) {
    var room = this.getRoom(roomUrl);
    if (socket != null) {
      room.enter(socket);
      socket.join(roomUrl);
      socket.broadcast.to(roomUrl).emit('room joined');
    }
    return room;
  } else {
    return { error: 'room ' + roomUrl + ' does not exist'};
  }
};

Lobby.prototype.getRoom = function(roomUrl) {
  var room = this.rooms[roomUrl];
  if (room) {
    return room;
  } else {
    return { error: 'room ' + roomUrl + ' does not exist'};
  }
};

Lobby.prototype.broadcastDisconnect = function(socket) {
  var clientRooms = this.io.sockets.manager.roomClients[socket.id]
    , socketRoom, room
    ;
  console.log("broadcast Disconnect");
  for (socketRoom in clientRooms) {
    if (socketRoom.length) {
      roomUrl = socketRoom.substr(1);
      room = this.getRoom(roomUrl);
      room.leave(socket);
      this.io.sockets.in(roomUrl).emit('room left');
    }
  }
};


exports.Lobby = Lobby;