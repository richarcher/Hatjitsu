'use strict';

/* Controllers */

function CreateRoomCtrl($scope, $location, socket) {
  $scope.createRoom = function() {
    socket.emit('create room', {}, function(roomUrl){
      $scope.$apply(function() {
        $location.path(roomUrl);
      });
    });
  }
}

CreateRoomCtrl.$inject = ['$scope', '$location', 'socket'];


function RoomCtrl($scope, $routeParams, socket) {

  var processMessage = function(response, process) {
    $scope.$apply(function() {
      if (response.error) {
        $scope.errorMessage = response.error;
        setTimeout(function() {
          $scope.$apply(function() {
            $scope.errorMessage = null;    
          });
        }, 3000);
      } else {
        $scope.errorMessage = null;
        process(response);
      }
    });
  }

  var refreshRoomInfo = function(roomObj) {
    if (roomObj.createAdmin) {
      $.cookie("admin-" + $scope.roomId, true);  
    }
    if($.cookie("admin-" + $scope.roomId)) {
      $scope.showAdmin = true;
    }
    
    $scope.playerCount = roomObj.clientcount;
    $scope.cardPack = roomObj.cardPack;

    if ($scope.cardPack == 'fib') {
      $scope.cards = ['0', '1', '2', '3', '5', '8', '13', '20', '40', '?'];
    } else if ($scope.cardPack == 'seq') {
      $scope.cards = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '?'];
    }
    console.log("received votes: " + roomObj.votes);
    $scope.votes = roomObj.votes;
  }

  $scope.configureRoom = function() {
    socket.on('room joined', function () {
      this.emit('room info', $scope.roomId, function(response){
        processMessage(response, refreshRoomInfo);
      });
    });
    socket.on('room left', function () {
      this.emit('room info', $scope.roomId, function(response){
        processMessage(response, refreshRoomInfo);
      });
    });
    socket.on('card pack set', function () {
      this.emit('room info', $scope.roomId, function(response){
        processMessage(response, refreshRoomInfo);
      });
    });
    socket.on('voted', function () {
      this.emit('room info', $scope.roomId, function(response){
        processMessage(response, refreshRoomInfo);
      });
    });
    socket.on('vote reset', function () {
      this.emit('room info', $scope.roomId, function(response){
        processMessage(response, refreshRoomInfo);
      });
    });
    socket.emit('join room', $scope.roomId, function(response){
      processMessage(response, refreshRoomInfo);
    });
  }

  $scope.setCardPack = function(cardPack) {
    $scope.cardPack = cardPack;
    $scope.resetVote();
    socket.emit('set card pack', $scope.roomId, cardPack);
  }

  $scope.vote = function(vote) {
    console.log("vote " + vote);
    $scope.myVote = vote;
    socket.emit('vote', $scope.roomId, vote);
  }

  $scope.resetVote = function() {
    socket.emit('reset vote', $scope.roomId);
  }

  $scope.roomId = $routeParams.roomId;
  $scope.playerCount = 0;
  $scope.showAdmin = false;
  $scope.errorMessage = null;
  $scope.votes = [];
  $scope.cardPack = '';
}

RoomCtrl.$inject = ['$scope', '$routeParams', 'socket'];