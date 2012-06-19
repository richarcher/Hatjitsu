// var should = require('should');
var io = require('socket.io-client');
var room = require('../lib/room.js');
var socketURL = "http://0.0.0.0:5000";
var options = {
  transports: ['websocket'],
  'force new connection' : true
};

describe("Socket Server", function() {
  it('Should not allow users to join non-existant rooms', function(done){
    var client1 = io.connect(socketURL, options);
    var room1 = 'Room1';
    client1.on('connect', function(){
      client1.emit('join room', room1, function(response){
        response.should.equal('room does not exist');
        client1.disconnect();
        done();
      })
    });
  });

  it("Should allow users to create a room", function(done){
    var client1 = io.connect(socketURL, options);

    client1.on('connect', function(){
      client1.emit('create room', {}, function(response) {
        response.should.have.property('administratorSet', false);
        response.should.have.property('room');
        client1.disconnect();
        done();
      });
    });
  });

  it("Should allow users to join an existing room", function(done){
    var client1 = io.connect(socketURL, options);
    
    // var client3 = io.connect(socketURL, options);
    client1.on('connect', function(){
      client1.emit('create room', {}, function(response) {

        var client2 = io.connect(socketURL, options);
        client2.on('connect', function(){
          client2.emit('join room', response.room, function(callback){
            callback.should.have.property('room', response.room);

            client1.disconnect();
            client2.disconnect();
            done();
          });
        });
      });
    });
  });

  it("Should assign a count of users in a room", function(done){    
    var client1 = io.connect(socketURL, options);
    
    // var client3 = io.connect(socketURL, options);
    client1.on('connect', function(){
      client1.emit('create room', {}, function(response) {

        var client2 = io.connect(socketURL, options);
        client2.on('connect', function(){
          client2.emit('join room', response.room, function(callback){
            callback.should.have.property('room', response.room);
            callback.should.have.property('clientcount', 1);

            var client3 = io.connect(socketURL, options);
            client3.on('connect', function() {
              client3.emit('join room', response.room, function(callback){
                callback.should.have.property('room', response.room);
                callback.should.have.property('clientcount', 2);

                client1.disconnect();
                client2.disconnect();
                client3.disconnect();
                done();
              });
            });
          });
        });
      });
    });
  });

  it("Should specific room information upon request", function(done){
    // on('room info')
    // client count should work
  });
  
  it("Should assign a count of users in multiple rooms" ,function(done){
    //TODO: deal with multiple rooms
  });

  it("Should update the count of users in a room when users disconnect", function(done){
    //TODO: deal with disconnects
  });

  it("Should assign the first visitor to a room as the administrator", function(done){
    // on('connect')
    // if clientcount === 0 roominfo should return administratorSet as false
    // on ('join room')
    // if clientcount === 1 roominfo should return administrator as true
  });  
});