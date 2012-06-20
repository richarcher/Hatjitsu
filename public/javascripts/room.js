function Room(name) {
  var $adminPanel
    // , playArea
    // , cardDeck
    , $clientCount
    , socket
    ;

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
    console.log(response);
    if (response.createAdmin) {
      $.cookie("admin-" + name, true);  
    }
    
    $('#content').show();
    $clientCount.html('Players : ' + response.clientcount);

    if($.cookie("admin-" + name)) {
      $adminPanel.show();
    }
    else {
      $adminPanel.hide();
    }
  };

  function setupRoom() {
    // playArea = $(document.createElement('div')).attr('id', 'playArea');
    // cardDeck = $(document.createElement('div')).attr('id', 'cardDeck');
    $adminPanel = $('#adminPanel');
    $clientCount = $('#clientCount');

    $clientCount.show();
    // $('#content').html('').hide().append(playArea, cardDeck);
  };

};

var thisRoom = new Room(window.location.pathname.split( '/' )[1]);
