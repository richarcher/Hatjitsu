var should = require('chai').should();
var io = require('socket.io-client');
var socketURL = "http://0.0.0.0:5000";
var options = {
  transports: ['websocket'],
  'force new connection' : true
};

var errorMsg = "room undefined does not exist";

describe("Socket Server events", function() {
  describe('Creating or joining a room', function(){
    it('should not allow users to join non-existant rooms', function(done){
      var client1 = io.connect(socketURL, options);
      var fakeroom = 'Room';
      client1.emit('join room', fakeroom, function(callback){
        callback.should.have.property('error', errorMsg);
        client1.disconnect();
        done();
      });
    });

    it("should allow users to create and join a room", function(done){
      var client1 = io.connect(socketURL, options);
      client1.emit('create room', {}, function(roomUrl) {
        client1.emit('join room', {roomUrl : roomUrl} , function(callback){
          callback.should.have.property('clientCount', 1);
          client1.disconnect();
          done();
        });
      });
    });

    it("should assign a specific count of users across multiple rooms" ,function(done){
      var client1 = io.connect(socketURL, options);
      client1.emit('create room', {}, function(roomUrl1) {
        client1.emit('join room', {roomUrl : roomUrl1}, function(callback){
          callback.should.have.property('clientCount', 1);
          client1.disconnect();

          var client2 = io.connect(socketURL, options);
          client2.emit('create room', {}, function(roomUrl2) {
            client2.emit('join room', {roomUrl : roomUrl2}, function(callback){

              var client3 = io.connect(socketURL, options);
              client3.emit('join room', {roomUrl : roomUrl2}, function(callback) {

                callback.should.have.property('clientCount', 2);
                client2.disconnect();
                client3.disconnect();
                done();
              });
            });
          });
        });
      });
    });

    it("should update client count on joining room or disconnection", function(done){
      var client1 = io.connect(socketURL, options);
      client1.emit('create room', {}, function(roomUrl){
        client1.emit('room info', {roomUrl : roomUrl}, function(callback){
          // client1 has yet to join room, so no admin is set and clientCount is zero
          Object.keys(callback).length.should.equal(6);
          callback.should.have.property('clientCount', 0);

          client1.emit('join room', {roomUrl : roomUrl}, function(callback){
            client1.emit('room info', {roomUrl : roomUrl}, function(callback){
              // client1 has now joined room, so _now_ room info is updated
              Object.keys(callback).length.should.equal(6);
              callback.should.have.property('clientCount', 1);

              var client2 = io.connect(socketURL, options);
              client2.emit('join room', {roomUrl : roomUrl}, function(callback){
                client2.emit('room info', {roomUrl : roomUrl}, function(callback){
                  callback.should.have.property('clientCount', 2);

                  client1.disconnect();
                  client2.emit('room info', {roomUrl : roomUrl}, function(callback){
                    callback.should.have.property('clientCount', 1);

                    client2.disconnect();
                    done();

                  });
                });
              });
            });
          });
        });
      });
    });

  });

  describe('Assigning room administrator', function(){

    it("should consider the first visitor to a room as the administrator", function(done){
      var client1 = io.connect(socketURL, options);
      client1.emit('create room', {}, function(roomUrl){
        client1.emit('room info', {roomUrl : roomUrl}, function(callback){
          callback.should.have.property('createAdmin', true);
          callback.should.have.property('hasAdmin', true);
          callback.should.have.property('clientCount', 0);
          client1.emit('join room', {roomUrl : roomUrl}, function(callback){
            client1.emit('room info', {roomUrl : roomUrl}, function(callback){
              callback.should.have.property('createAdmin', false);
              callback.should.have.property('hasAdmin', true);
              callback.should.have.property('clientCount', 1);
              client1.disconnect();
              done();
            });
          });
        });
      });
    });
  });

});