function Home() {
  var socket = io.connect(document.location.origin);
  $('#button').on('click', function (){
    socket.emit('create room', {}, function(response){
      location.href = response;
    });
  });
};

var home = new Home();