var _ = require('underscore')._;
var util = require('util');

var Room = function(io, roomUrl) {
  this.io = io;
  this.roomUrl = roomUrl;
  this.createAdmin = true;
  this.hasAdmin = false;
  this.cardPack = 'fib';
  this.clientCount = 0;
  this.connections = {}; // we collect the votes in here
};

Room.prototype.info = function() {
  this.clientCount = this.getClientCount();
  this.createAdmin = this.hasAdmin == false;
  this.hasAdmin = true;
  return this.json();
};

Room.prototype.enter = function(socket) {
  console.log("room entered as " + socket.id);
  this.connections[socket.id] = { socketId: socket.id, vote: null, voter: true };
}

Room.prototype.leave = function(socket) {
  delete (this.connections[socket.id]);  
}

Room.prototype.setCardPack = function(cardPack) {
  this.cardPack = cardPack;
  this.io.sockets.in(this.roomUrl).emit('card pack set');
  console.log('card pack set');
}

Room.prototype.toggleVoter = function(socket, value) {
  if (this.connections[socket.id]) {
    this.connections[socket.id]['voter'] = value;
    console.log("voter set to " + value + " for " + socket.id);
  }
  this.io.sockets.in(this.roomUrl).emit('voter status changed');
}

Room.prototype.recordVote = function(socket, vote) {
  if (this.connections[socket.id]) {
    this.connections[socket.id]['vote'] = vote;
  }
  this.io.sockets.in(this.roomUrl).emit('voted');
}

Room.prototype.destroyVote = function(socket) {
  if (this.connections[socket.id]) {
    this.connections[socket.id]['vote'] = null;
  }
  this.io.sockets.in(this.roomUrl).emit('unvoted');
}

Room.prototype.resetVote = function() {
  _.forEach(this.connections, function(c) {
    c.vote = null;
  })
  this.io.sockets.in(this.roomUrl).emit('vote reset');
}

Room.prototype.getClientCount = function() {
  return Object.keys(this.io.sockets.clients(this.roomUrl)).length;
}

Room.prototype.json = function() {
  return {
    roomUrl: this.roomUrl,
    createAdmin: this.createAdmin,
    hasAdmin: this.hasAdmin,
    cardPack: this.cardPack,
    clientCount: this.clientCount,
    connections: this.connections
  };
}

exports.Room = Room;