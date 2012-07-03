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
  this.createAdmin = this.hasAdmin === false;
  this.hasAdmin = true;
  // console.log("room info = ", this.json());
  return this.json();
};

Room.prototype.enter = function(socket, data) {
  // console.log("room entered as " + socket.id);
  if (this.connections[data.sessionId]) {
    this.connections[data.sessionId].socketId = socket.id;
  } else {
    this.connections[data.sessionId] = { sessionId: data.sessionId, socketId: socket.id, vote: null, voter: true };
  }
}

Room.prototype.leave = function(socket) {
  var connection = _.find(this.connections, function(c) { return c.socketId === socket.id } );
  if (connection && connection.sessionId) {
    connection.socketId = null;
  }
}

Room.prototype.setCardPack = function(data) {
  this.cardPack = data.cardPack;
  this.io.sockets.in(this.roomUrl).emit('card pack set');
  // console.log('card pack set');
}

Room.prototype.toggleVoter = function(data) {
  if (this.connections[data.sessionId]) {
    this.connections[data.sessionId]['voter'] = data.voter;
    if (!data.voter) {
      this.connections[data.sessionId]['vote'] = null;
    }
    // console.log("voter set to " + data.voter + " for " + data.sessionId);
  }
  this.io.sockets.in(this.roomUrl).emit('voter status changed');
}

Room.prototype.recordVote = function(data) {
  if (this.connections[data.sessionId]) {
    this.connections[data.sessionId]['vote'] = data.vote;
  }
  this.io.sockets.in(this.roomUrl).emit('voted');
}

Room.prototype.destroyVote = function(data) {
  if (this.connections[data.sessionId]) {
    this.connections[data.sessionId]['vote'] = null;
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