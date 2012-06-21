'use strict';


// Declare app level module which depends on filters, and services
angular.module('pokerApp', ['pokerApp.filters', 'pokerApp.services', 'pokerApp.directives']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
    $routeProvider.when('/', { templateUrl: 'partials/createRoom.html', controller: CreateRoomCtrl});
    $routeProvider.when('/:roomId', { templateUrl: 'partials/room.html', controller: RoomCtrl});
    $routeProvider.otherwise({redirectTo: '/'});
  }]);

var socket = io.connect(document.location.origin);