var Poker = {};
Poker.init = function () {
  Poker.socket = io.connect(document.location.origin);
  Poker.setup_stage();
  // Poker.socket.on('status', function (data) {
    // console.log(data.rooms);
  // });
  $('#button').on('click', function (){
    Poker.socket.emit('create room', 'create room', function(response){
      location.href = response;
    });
  });

};

Poker.setup_stage = function () {
};

$(function() {
  Poker.init();
});