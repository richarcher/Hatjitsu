var Lobby = function() {
  this.roomObj = {};
};


Lobby.prototype.createRoom = function() {
  var randURL = this.createUniqueURL();
  // var l = new lobby.Lobby();
  if (randURL in this.roomObj) {
    this.createRoom();
  }
  this.roomObj[randURL] = {
    room : randURL,
    administratorSet: false
  };
  return this.roomObj[randURL];
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


Lobby.prototype.roomNeedsAdmin = function(room) {
  if (this.roomObj[room].administratorSet) {
    return false;
  } else {
    return this.roomObj[room].administratorSet = true;
  }
};


Lobby.prototype.joinRoom = function(socket, name) {
  var obj = {};
  if(name in this.roomObj) {
    socket.join(name);
    socket.broadcast.to(name).emit('room joined');
    obj.room = name;
    obj.needsAdmin = this.roomNeedsAdmin(name);
    if (obj.needsAdmin) {
      socket.set('admin', true);  
    }
    return obj;
  } else {
    return { 'error' : 'room does not exist' }
  }
};


exports.Lobby = Lobby;