'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
var pokerAppServices = angular.module('pokerApp.services', []);

pokerAppServices.value('version', '0.1');

pokerAppServices.service('socketService', ['$rootScope', function($rootScope) {
  var sock = new Sock($rootScope);
  return sock;
}]);


var Sock = function(rootScope) {
  var that = this;

  this.rootScope = rootScope;
  this.rootScope.socketMessage = null;  
  this.rootScope.activity = false;  
  this.rootScope.sessionId = null;
  this.socket = io.connect(document.location.origin);

  this.socket.on('error', function(reason) {
    console.log('service: on error', reason);
    that.rootScope.$apply(function() {
      that.rootScope.socketMessage = reason;  
    });
    console.log(reason);
  })
  this.socket.on('connect_failed', function(reason) {
    console.log('service: on connect failed', reason);
    that.rootScope.$apply(function() {
      that.rootScope.socketMessage = reason;  
    });
    console.log(reason);
  })
  this.socket.on('disconnect', function() {
    console.log('service: on disconnect');
    that.rootScope.$apply(function() {
      that.rootScope.socketMessage = "Disconnected";  
    })
    console.log('disconnected');
  })
  this.socket.on('connect', function() {
    var sessionId = this.socket.sessionid;
    console.log('service: on connect');
    that.rootScope.$apply(function() {
      that.rootScope.socketMessage = null;  
      console.log("new session id = " + sessionId);
      if (!$.cookie("sessionId")) {
        $.cookie("sessionId", sessionId);  
      }
      that.rootScope.sessionId = $.cookie("sessionId");
      console.log("session id = " + that.rootScope.sessionId);
    });
  })
};

Sock.prototype.emit = function(msg, data, callback) {
  var that = this;

  console.log('service: emit ' + msg);
   this.rootScope.activity = true;
   this.socket.emit(msg, data, function(response) {
    that.rootScope.activity = false;
    callback.call(this, response);
   });  
}

Sock.prototype.on = function(msg, callback) {
  console.log('service: on ' + msg);
  this.rootScope.socketMessage = null;  
  this.socket.on(msg, callback);
}