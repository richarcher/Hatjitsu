'use strict';

/* Controllers */

function CreateRoomCtrl($scope, $location) {
  $scope.createRoom = function() {
    socket.emit('create room', {}, function(roomUrl){
      $scope.$apply(function() {
        console.log('new room url = ' + roomUrl);
        $location.path(roomUrl);
        // location.href = roomUrl;
      });
    });
  }
}

CreateRoomCtrl.$inject = ['$scope', '$location'];


function RoomCtrl($scope, $routeParams) {
  var refreshRoomInfo = function(roomObj) {
    if (roomObj.createAdmin) {
      $.cookie("admin-" + $scope.roomId, true);  
    }
    if($.cookie("admin-" + $scope.roomId)) {
      $scope.showAdmin = true;
    }
    
    $scope.playerCount = roomObj.clientcount;
  }

  $scope.configureRoom = function() {
    socket.on('room joined', function () {
      this.emit('room info', $scope.roomId, function(response){
        $scope.$apply(function() {
          refreshRoomInfo(response);
        });
      });
    });
    socket.on('room left', function () {
      this.emit('room info', $scope.roomId, function(response){
        $scope.$apply(function() {
          refreshRoomInfo(response);
        });
      });
    });
    socket.emit('join room', $scope.roomId, function(response){
      $scope.$apply(function() {
        refreshRoomInfo(response);
      });
  });
  }

  $scope.roomId = $routeParams.roomId;
  $scope.playerCount = 0;
  $scope.showAdmin = false;

}
  
RoomCtrl.$inject = ['$scope', '$routeParams'];