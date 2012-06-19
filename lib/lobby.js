var Lobby = function(io) {
  this.io = io;
  this.rooms = {};
};


Lobby.prototype.createRoom = function() {
  var randURL = this.createUniqueURL();
  // var l = new lobby.Lobby();
  if (randURL in this.rooms) {
    this.createRoom();
  }
  this.rooms[randURL] = {
    createAdmin: true,
    hasAdmin: false
  };
  return randURL;
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


Lobby.prototype.joinRoom = function(socket, roomname) {
  if(roomname in this.rooms) {
    socket.join(roomname);
    socket.broadcast.to(roomname).emit('room joined');
    return this.rooms[roomname]
  } else {
    return { 'error' : 'room does not exist' }
  }
};

Lobby.prototype.refreshRoomInfo = function(roomname) {
  var roomObj = this.rooms[roomname];
  roomObj.clientcount = this.getClientCount(roomname);
  roomObj.createAdmin = roomObj.hasAdmin == false;
  roomObj.hasAdmin = true;
  return roomObj;
};

Lobby.prototype.getClientCount = function(roomname) {
  return Object.keys(this.io.sockets.clients(roomname)).length;
}

Lobby.prototype.broadcastDisconnect = function(socket) {
  var clientRooms = this.io.sockets.manager.roomClients[socket.id]
    , room
    ;
  console.log("broadcast Disconnect");
  for (room in clientRooms) {
    if (room.length) {
      roomname = room.substr(1);
      this.io.sockets.in(roomname).emit('room left');
    }
  }
};


exports.Lobby = Lobby;