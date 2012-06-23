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
  var that = this;

  this.rootScope = rootScope;
  this.rootScope.socketMessage = null;  
  this.socket = io.connect(document.location.origin);

  this.socket.on('error', function(reason) {
    that.rootScope.$apply(function() {
      that.rootScope.socketMessage = reason;  
    });
    console.log(reason);
  })
  this.socket.on('connect_failed', function(reason) {
    that.rootScope.$apply(function() {
      that.rootScope.socketMessage = reason;  
    });
    console.log(reason);
  })
  this.socket.on('disconnect', function() {
    that.rootScope.$apply(function() {
      that.rootScope.socketMessage = "Disconnected";  
    })
    console.log('disconnected');
  })
  this.socket.on('connect', function() {
    that.rootScope.$apply(function() {
      that.rootScope.socketMessage = null;  
    });
    console.log('connected with ' + this.socket.sessionid);
  })
};

Sock.prototype.emit = function(msg, data, callback) {
  this.socket.emit(msg, data, callback);  
}

Sock.prototype.on = function(msg, callback) {
  this.rootScope.socketMessage = null;  
  this.socket.on(msg, callback);
}