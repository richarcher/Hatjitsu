function Room(name) {
  var self = this
    , adminPanel
    , playArea
    , cardDeck
    , clientCount
    ;
  self.name = name;

  socket = io.connect(document.location.origin);
  socket.on('connect', function () {
    setupRoom();
    this.emit('join room', name, function(response){
      handleResponse(response);
    });
  });
  socket.on('room joined', function () {
    this.emit('room info', name, function(response){
      handleResponse(response);
    });
  });
  socket.on('room left', function () {
    this.emit('room info', name, function(response){
      handleResponse(response);
    });
  });

  function handleResponse(response) {
    self.clientcount = response.clientcount;
    updateRoom();
  };

  function setupRoom() {
    adminPanel = $(document.createElement('div')).attr('id', 'adminPanel');
    playArea = $(document.createElement('div')).attr('id', 'playArea');
    cardDeck = $(document.createElement('div')).attr('id', 'cardDeck');
    clientCount = $(document.createElement('div')).attr('id', 'clientCount');
    clientCount.appendTo(playArea);
    $('#content').html('').hide().append(adminPanel, playArea, cardDeck);
  };

  function updateRoom() {
    $('#content').show();
    clientCount.html('Players : ' + self.clientcount);
  };
};


var thisRoom;
$(function() {
  thisRoom = new Room(window.location.pathname.split( '/' )[1]);
});