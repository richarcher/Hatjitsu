'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
var pokerAppServices = angular.module('pokerApp.services', []);

pokerAppServices.value('version', '0.1');

pokerAppServices.service('socketService', ['$rootScope',  '$timeout', function($rootScope) {
  var sock = new Sock($rootScope);
  return sock;
}]);


var Sock = function(rootScope) {
  var that = this;

  this.rootScope = rootScope;
  this.rootScope.socketMessage = null;  
  this.rootScope.activity = false;  
  this.rootScope.sessionId = null;

  this.socket = io.connect(location.protocol + '//' + location.hostname, {
    'port': location.port,
    'reconnect': true,
    'reconnection delay': 500,
    'max reconnection attempts': 10,
    'try multiple transports': true,
    'transports': ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']
  });

  this.socket.on('error', function(reason) {
    // console.log('service: on error', reason);
    that.rootScope.$apply(function() {
      that.rootScope.socketMessage = ":-(  Error = " + reason;  
    });
    // console.log(reason);
  });
  this.socket.on('connect_failed', function(reason) {
    // console.log('service: on connect failed', reason);
    that.rootScope.$apply(function() {
      that.rootScope.socketMessage = ":-(  Connect failed";  
    });
    // console.log(reason);
  });
  this.socket.on('disconnect', function() {
    // console.log('service: on disconnect');
    that.rootScope.$apply(function() {
      that.rootScope.socketMessage = ":-(  Disconnected";  
    });
    // console.log('disconnected');
  });
  this.socket.on('connecting', function() {
    // console.log('service: on connecting');
    that.rootScope.$apply(function() {
      that.rootScope.socketMessage = "Connecting...";  
    });
    // console.log('disconnected');
  });
  this.socket.on('reconnecting', function() {
    // console.log('service: on reconnecting');
    that.rootScope.$apply(function() {
      that.rootScope.socketMessage = "Reconnecting...";  
    });
    // console.log('disconnected');
  });
  this.socket.on('reconnect', function() {
    // console.log('service: on reconnect');
    that.rootScope.$apply(function() {
      that.rootScope.socketMessage = null;  
    });
    // console.log('disconnected');
  });
  this.socket.on('reconnect_failed', function() {
    // console.log('service: on reconnect_failed');
    that.rootScope.$apply(function() {
      that.rootScope.socketMessage = ":-( Reconnect failed";  
    });
    // console.log('disconnected');
  });
  this.socket.on('connect', function() {
    var sessionId = this.socket.sessionid;
    // console.log('service: on connect');
    that.rootScope.$apply(function() {
      that.rootScope.socketMessage = null;  
      // console.log("new session id = " + sessionId);
      if (!$.cookie("sessionId")) {
        $.cookie("sessionId", sessionId);  
      }
      that.rootScope.sessionId = $.cookie("sessionId");
      // console.log("session id = " + that.rootScope.sessionId);
    });
  });
};

Sock.prototype.emit = function(msg, data, callback) {
  var that = this;

  // console.log('service: emit ' + msg);
   this.rootScope.activity = true;
   this.socket.emit(msg, data, function(response) {
    that.rootScope.$apply(function() {
      that.rootScope.activity = false;
    });
    callback.call(this, response);
   });  
}

Sock.prototype.on = function(msg, callback) {
  // console.log('service: on ' + msg);
  this.rootScope.socketMessage = null;  
  this.socket.on(msg, callback);
}