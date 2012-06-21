'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('pokerApp.services', []).
  value('version', '0.1');

angular.module('pokerApp.socket', [], function($provide) {
  $provide.factory('socket', function() {
    var socket = io.connect(document.location.origin);
    return socket;
  });
});