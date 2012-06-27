'use strict';

/* Controllers */

function LobbyCtrl($scope, $location, socketService) {
  $scope.createRoom = function() {
    socketService.emit('create room', {}, function(roomUrl){
      $scope.$apply(function() {
        $location.path(roomUrl);
      });
    });
  }
  $scope.enterRoom = function(room) {
    socketService.emit('room info', { roomUrl: room }, function(response){
      if (!response.error) {
        $scope.$apply(function() {
          console.log("going to enter room " + response.roomUrl);
          $location.path(response.roomUrl);    
        });
      }
    });
  }
}

LobbyCtrl.$inject = ['$scope', '$location', 'socketService'];


function RoomCtrl($scope, $routeParams, $timeout, socketService) {

  var processMessage = function(response, process) {
    $scope.$apply(function() {
      if (response.error) {
        $scope.errorMessage = response.error;
        $timeout(function() {
          $scope.errorMessage = null;
        }, 3000);
      } else {
        $scope.errorMessage = null;
        (process || angular.noop)(response);
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
    
    $scope.humanCount = roomObj.clientCount;
    $scope.cardPack = roomObj.cardPack;

    if ($scope.cardPack == 'fib') {
      $scope.cards = ['0', '1', '2', '3', '5', '8', '13', '20', '40', '?'];
    } else if ($scope.cardPack == 'seq') {
      $scope.cards = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '?'];
    }
    console.log("received votes: " + roomObj.connections);
    $scope.connections = roomObj.connections;
    $scope.votes = _.chain($scope.connections).filter(function(c) { return c.vote }).values().value();
    $scope.voterCount = _.filter($scope.connections, function(c) { return c.voter }).length;
  }


  $scope.configureRoom = function() {

    socketService.on('room joined', function () {
      this.emit('room info', { roomUrl: $scope.roomId }, function(response){
        processMessage(response, refreshRoomInfo);
      });
    });
    socketService.on('room left', function () {
      this.emit('room info', { roomUrl: $scope.roomId }, function(response){
        processMessage(response, refreshRoomInfo);
      });
    });
    socketService.on('card pack set', function () {
      displayMessage("Card pack was changed.");
      this.emit('room info', { roomUrl: $scope.roomId }, function(response){
        processMessage(response, refreshRoomInfo);
      });
    });
    socketService.on('voter status changed', function () {
      this.emit('room info', { roomUrl: $scope.roomId }, function(response){
        processMessage(response, refreshRoomInfo);
      });
    });
    socketService.on('voted', function () {
      this.emit('room info', { roomUrl: $scope.roomId }, function(response){
        processMessage(response, refreshRoomInfo);
      });
    });
    socketService.on('unvoted', function () {
      this.emit('room info', { roomUrl: $scope.roomId }, function(response){
        processMessage(response, refreshRoomInfo);
      });
    });
    socketService.on('vote reset', function () {
      $scope.$apply(function() {
        $scope.myVote = null;  
      })
      this.emit('room info', { roomUrl: $scope.roomId }, function(response){
        processMessage(response, refreshRoomInfo);
      });
    });
    socketService.on('connect', function() {
      this.emit('room info', { roomUrl: $scope.roomId }, function(response){
        processMessage(response, refreshRoomInfo);
      });
    });
    socketService.on('disconnect', function() {
      $scope.$apply(function() {
        $scope.myVote = null;  
      })
    });
    socketService.emit('join room', { roomUrl: $scope.roomId, sessionId: $scope.sessionId }, function(response){
      processMessage(response, refreshRoomInfo);
    });
  }

  $scope.setCardPack = function(cardPack) {
    $scope.cardPack = cardPack;
    $scope.resetVote();
    socketService.emit('set card pack', { roomUrl: $scope.roomId }, cardPack);
  }

  $scope.vote = function(vote) {
    if ($scope.myVote != vote) {
      $scope.myVote = vote;
      socketService.emit('vote', { roomUrl: $scope.roomId, sessionId: $scope.sessionId, vote: vote }, function(response) {
        processMessage(response);
      });
    }
  }

  $scope.unvote = function(sessionId) {
    if (sessionId == $scope.sessionId) {
      $scope.myVote = null;
      socketService.emit('unvote', { roomUrl: $scope.roomId, sessionId: $scope.sessionId }, function(response) {
        processMessage(response);
      });
    }
  }

  $scope.resetVote = function() {
    socketService.emit('reset vote', { roomUrl: $scope.roomId }, function(response) {
      processMessage(response);
    });
  }

  $scope.toggleVoter = function() {
    if (!$scope.voter) {
      $scope.unvote($scope.sessionId);
    }
    socketService.emit('toggle voter', { roomUrl: $scope.roomId, sessionId: $scope.sessionId, voter: $scope.voter }, function(response) {
      processMessage(response);
    });
  }

  $scope.roomId = $routeParams.roomId;
  $scope.humanCount = 0;
  $scope.voterCount = 0;
  $scope.showAdmin = false;
  $scope.voter = true;
  $scope.errorMessage = null;
  $scope.message = null;
  $scope.connections = {};
  $scope.votes = [];
  $scope.cardPack = '';
  $scope.myVote = null;
}

RoomCtrl.$inject = ['$scope', '$routeParams', '$timeout', 'socketService'];