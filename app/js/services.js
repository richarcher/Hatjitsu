'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
var pokerAppServices = angular.module('pokerApp.services', []);

pokerAppServices.value('version', '0.1');

pokerAppServices.service('socket', ['$rootScope', function($rootScope) {
  var sock = new Sock($rootScope);
  return sock;
}]);


var Sock = function(rootScope) {
  this.rootScope = rootScope;
  this.message = null;

  this.socket = io.connect(document.location.origin);

  this.socket.on('error', function(reason) {
    this.message = reason;
    console.log(reason);
  })
  this.socket.on('connect_failed', function(reason) {
    this.message = reason;
    console.log(reason);
  })
  this.socket.on('disconnect', function() {
    this.message = "Disconnected";
    console.log('disconnected');
  })
  this.socket.on('connect', function() {
    this.message = null;
    console.log('connected');
  })
};

Sock.prototype.emit = function(msg, data, callback) {
  this.socket.emit(msg, data, callback);  
}

Sock.prototype.on = function(msg, callback) {
  this.message = null;
  this.socket.on(msg, callback);
}