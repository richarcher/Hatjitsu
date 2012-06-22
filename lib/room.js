var _ = require('underscore')._;
var util = require('util');

var Room = function(io, roomUrl) {
  this.io = io;
  this.roomUrl = roomUrl;
  this.createAdmin = true;
  this.hasAdmin = false;
  this.cardPack = 'fib';
  this.clientcount = 0;
  this.votes = []; // we collect the votes in here
};

Room.prototype.info = function() {
  this.clientcount = this.getClientCount();
  this.createAdmin = this.hasAdmin == false;
  this.hasAdmin = true;
  return this.json();
};


Room.prototype.setCardPack = function(cardPack) {
  this.cardPack = cardPack;
  this.io.sockets.in(this.roomUrl).emit('card pack set');
  console.log('card pack set');
}

Room.prototype.recordVote = function(socket, vote) {
  // each socket can only have one vote
  if (oldVote = _.find(this.votes, function(v) {
    return v.socket == socket.id
  })) {
    oldVote.vote = vote;
  } else {
    this.votes.push({ 'vote': vote, 'socket': socket.id });  
  }
  this.io.sockets.in(this.roomUrl).emit('voted');
}

Room.prototype.destroyVote = function(socket) {
  this.votes = _.filter(this.votes, function(v) { return v.socket != socket.id })
}

Room.prototype.resetVote = function() {
  this.votes = [];
  this.io.sockets.in(this.roomUrl).emit('vote reset');
  console.log('vote reset. votes=' + this.votes);
}

Room.prototype.getClientCount = function() {
  return Object.keys(this.io.sockets.clients(this.roomUrl)).length;
}

Room.prototype.json = function() {
  return {
    createAdmin: this.createAdmin,
    hasAdmin: this.hasAdmin,
    cardPack: this.cardPack,
    clientcount: this.clientcount,
    votes: _.pluck(this.votes, 'vote')
  };
}

exports.Room = Room;