function Room(name) {
  var adminPanel
    , playArea
    , cardDeck
    , clientCountDiv
    , socket
    ;
  // this.name = name;

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
    //TODO: create admin cookie if response.needsAdmin
    console.log(response);
    $('#content').show();
    clientCountDiv.html('Players : ' + response.clientcount);
  };

  function setupRoom() {
    adminPanel = $(document.createElement('div')).attr('id', 'adminPanel');
    playArea = $(document.createElement('div')).attr('id', 'playArea');
    cardDeck = $(document.createElement('div')).attr('id', 'cardDeck');
    clientCountDiv = $(document.createElement('div')).attr('id', 'clientCount');
    clientCountDiv.appendTo(playArea);
    $('#content').html('').hide().append(adminPanel, playArea, cardDeck);
  };

};

var thisRoom = new Room(window.location.pathname.split( '/' )[1]);
