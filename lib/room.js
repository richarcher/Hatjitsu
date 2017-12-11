var _ = require('underscore')._;
var util = require('util');

var Room = function(io, roomUrl) {
  this.io = io;
  this.roomUrl = roomUrl;
  this.createdAt = calcTime(2);
  this.createAdmin = true;
  this.hasAdmin = false;
  this.cardPack = 'pow2';
  this.connections = {}; // we collect the votes in here
  this.forcedReveal = false;
};

Room.prototype.info = function() {
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

Room.prototype.recordVote = function(socket, data) {
  if (this.connections[data.sessionId]) {
    this.connections[data.sessionId]['vote'] = data.vote;
  }
  socket.broadcast.to(this.roomUrl).emit('voted');
  // this.io.sockets.in(this.roomUrl).emit('voted');
}

Room.prototype.destroyVote = function(socket, data) {
  if (this.connections[data.sessionId]) {
    this.connections[data.sessionId]['vote'] = null;
  }
  socket.broadcast.to(this.roomUrl).emit('unvoted');
  // this.io.sockets.in(this.roomUrl).emit('unvoted');
}

Room.prototype.resetVote = function() {
  _.forEach(this.connections, function(c) {
    c.vote = null;
  })
  this.forcedReveal = false;
  this.io.sockets.in(this.roomUrl).emit('vote reset');
}

Room.prototype.forceReveal = function() {
  this.forcedReveal = true;
  this.io.sockets.in(this.roomUrl).emit('reveal');
}

Room.prototype.getClientCount = function() {
  return _.filter(this.connections, function(c) { return c.socketId }).length;
}

Room.prototype.json = function() {
  return {
    roomUrl: this.roomUrl,
    createdAt: this.createdAt,
    createAdmin: this.createAdmin,
    hasAdmin: this.hasAdmin,
    cardPack: this.cardPack,
    forcedReveal: this.forcedReveal,
    connections: _.filter(this.connections, function(c) { return c.socketId })
  };
}


function calcTime(offset) {
  // create Date object for current location
  d = new Date();
  
  // convert to msec
  // add local time zone offset 
  // get UTC time in msec
  utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  
  // create new Date object for different place
  // using supplied offset
  nd = new Date(utc + (3600000*offset));
  
  // return time as a string
  return nd.toLocaleString();
}


exports.Room = Room;