'use strict';

/* Controllers */

function LobbyCtrl($scope, $location, socket) {
  $scope.createRoom = function() {
    socket.emit('create room', {}, function(roomUrl){
      $scope.$apply(function() {
        $location.path(roomUrl);
      });
    });
  }
  $scope.enterRoom = function(room) {
    socket.emit('room info', { roomUrl: room }, function(response){
      if (!response.error) {
        $scope.$apply(function() {
          console.log("going to enter room " + room);
          $location.path(room);    
        });
      }
    });
  }
}

LobbyCtrl.$inject = ['$scope', '$location', 'socket'];


function RoomCtrl($scope, $routeParams, $timeout, socket) {

  var processMessage = function(response, process) {
    $scope.$apply(function() {
      if (response.error) {
        $scope.errorMessage = response.error;
        $timeout(function() {
          $scope.errorMessage = null;
        }, 3000);
      } else {
        $scope.errorMessage = null;
        if (process) {
          process(response);  
        }
      }
    });
  }

  var displayMessage = function(msg) {
    $scope.$apply(function() {
      $scope.message = msg;
      $timeout(function() {
        $scope.message = null;
      }, 5000);
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
      this.emit('room info', { roomUrl: $scope.roomId }, function(response){
        processMessage(response, refreshRoomInfo);
      });
    });
    socket.on('room left', function () {
      this.emit('room info', { roomUrl: $scope.roomId }, function(response){
        processMessage(response, refreshRoomInfo);
      });
    });
    socket.on('card pack set', function () {
      displayMessage("Card pack was changed.");
      this.emit('room info', { roomUrl: $scope.roomId }, function(response){
        processMessage(response, refreshRoomInfo);
      });
    });
    socket.on('voted', function () {
      this.emit('room info', { roomUrl: $scope.roomId }, function(response){
        processMessage(response, refreshRoomInfo);
      });
    });
    socket.on('vote reset', function () {
      $scope.$apply(function() {
        $scope.myVote = null;  
      })
      this.emit('room info', { roomUrl: $scope.roomId }, function(response){
        processMessage(response, refreshRoomInfo);
      });
    });
    socket.on('connect', function() {
      this.emit('room info', { roomUrl: $scope.roomId }, function(response){
        processMessage(response, refreshRoomInfo);
      });
    });
    socket.on('disconnect', function() {
      $scope.$apply(function() {
        $scope.myVote = null;  
      })
    });
    socket.emit('join room', { roomUrl: $scope.roomId }, function(response){
      processMessage(response, refreshRoomInfo);
    });
  }

  $scope.setCardPack = function(cardPack) {
    $scope.cardPack = cardPack;
    $scope.resetVote();
    socket.emit('set card pack', { roomUrl: $scope.roomId }, cardPack);
  }

  $scope.vote = function(vote) {
    console.log("vote " + vote);
    $scope.myVote = $scope.myVote == vote ? null : vote;
    socket.emit('vote', { roomUrl: $scope.roomId, vote: vote }, function(response) {
      processMessage(response, null);
    });
  }

  $scope.resetVote = function() {
    socket.emit('reset vote', { roomUrl: $scope.roomId }, function(response) {
      processMessage(response, null);
    });
  }

  $scope.roomId = $routeParams.roomId;
  $scope.playerCount = 0;
  $scope.showAdmin = false;
  $scope.errorMessage = null;
  $scope.message = null;
  $scope.votes = [];
  $scope.cardPack = '';
  $scope.myVote = null;
}

RoomCtrl.$inject = ['$scope', '$routeParams', '$timeout', 'socket'];