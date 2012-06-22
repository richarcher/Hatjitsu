var Room = function(io, roomUrl) {
  this.io = io;
  this.roomUrl = roomUrl;
  this.createAdmin = true;
  this.hasAdmin = false;
  this.cardPack = 'fib';
  this.clientcount = 0;
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
  return this;
}

Room.prototype.getClientCount = function() {
  return Object.keys(this.io.sockets.clients(this.roomUrl)).length;
}

Room.prototype.json = function() {
  return {
    createAdmin: this.createAdmin,
    hasAdmin: this.hasAdmin,
    cardPack: this.cardPack,
    clientcount: this.clientcount
  };
}

exports.Room = Room;