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
  this.rooms[roomUrl] = {
    createAdmin: true,
    hasAdmin: false,
    cardPack: 'fib'
  };
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
    return this.rooms[roomUrl];
  } else {
    return { 'error' : 'room does not exist' }
  }
};

Lobby.prototype.refreshRoomInfo = function(roomUrl) {
  var roomObj = this.rooms[roomUrl];
  roomObj.clientcount = this.getClientCount(roomUrl);
  roomObj.createAdmin = roomObj.hasAdmin == false;
  roomObj.hasAdmin = true;
  return roomObj;
};

Lobby.prototype.getClientCount = function(roomUrl) {
  return Object.keys(this.io.sockets.clients(roomUrl)).length;
}

Lobby.prototype.setCardPack = function(roomUrl, cardPack) {
  var roomObj = this.rooms[roomUrl];
  roomObj.cardPack = cardPack;
  this.io.sockets.in(roomUrl).emit('card pack set');
  console.log('card pack set');
  return roomObj;
}

Lobby.prototype.broadcastDisconnect = function(socket) {
  var clientRooms = this.io.sockets.manager.roomClients[socket.id]
    , room
    ;
  console.log("broadcast Disconnect");
  for (room in clientRooms) {
    if (room.length) {
      roomUrl = room.substr(1);
      this.io.sockets.in(roomUrl).emit('room left');
    }
  }
};


exports.Lobby = Lobby;