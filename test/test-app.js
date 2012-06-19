var io = require('socket.io-client');
var socketURL = "http://0.0.0.0:5000";
var options = {
  transports: ['websocket'],
  'force new connection' : true
};

describe("Socket Server", function() {
  it('Should not allow users to join non-existant rooms', function(done){
    var client1 = io.connect(socketURL, options);
    var fakeroom = 'Room';
    client1.emit('join room', fakeroom, function(callback){
      callback.should.equal('room does not exist');
      client1.disconnect();
      done();
    });
  });

  it("Should allow users to create and join a room", function(done){
    var client1 = io.connect(socketURL, options);
    client1.emit('create room', {}, function(roomUrl) {
      client1.emit('join room', roomUrl, function(callback){
        callback.should.have.property('clientcount', 1);
        client1.disconnect();
        done();
      });
    });
  });

  it("Should update clientcount on connect and disconnect", function(done){
    var client1 = io.connect(socketURL, options);
    client1.emit('create room', {}, function(roomUrl){
      client1.emit('room info', roomUrl, function(callback){
        // client1 has yet to join room, so no admin is set and clientcount is zero
        Object.keys(callback).length.should.equal(3);
        callback.should.have.property('clientcount', 0);


        client1.emit('join room', roomUrl, function(callback){
          client1.emit('room info', roomUrl, function(callback){
            // client1 has now joined room, so _now_ room info is updated
            Object.keys(callback).length.should.equal(3);
            callback.should.have.property('clientcount', 1);

            var client2 = io.connect(socketURL, options);
            client2.emit('join room', roomUrl, function(callback){
              client2.emit('room info', roomUrl, function(callback){
                callback.should.have.property('clientcount', 2);

                client1.disconnect();
                client2.emit('room info', roomUrl, function(callback){
                  callback.should.have.property('clientcount', 1);

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

  it("Should assign a specific count of users across multiple rooms" ,function(done){
    var client1 = io.connect(socketURL, options);
    client1.emit('create room', {}, function(roomUrl1) {
      client1.emit('join room', roomUrl1, function(callback){
        callback.should.have.property('clientcount', 1);
        client1.disconnect();

        var client2 = io.connect(socketURL, options);
        client2.emit('create room', {}, function(roomUrl2) {
          client2.emit('join room', roomUrl2, function(callback){

            var client3 = io.connect(socketURL, options);
            client3.emit('join room', roomUrl2, function(callback) {

              callback.should.have.property('clientcount', 2);
              client2.disconnect();
              client3.disconnect();
              done();
            });
          });
        });
      });
    });
  });

  it("Should assign the first visitor to a room as the administrator", function(done){
    var client1 = io.connect(socketURL, options);
    client1.emit('create room', {}, function(roomUrl){
      client1.emit('room info', roomUrl, function(callback){
        callback.should.have.property('createAdmin', true);
        callback.should.have.property('hasAdmin', true);
        callback.should.have.property('clientcount', 0);
        client1.emit('join room', roomUrl, function(callback){
          client1.emit('room info', roomUrl, function(callback){
            callback.should.have.property('createAdmin', false);
            callback.should.have.property('hasAdmin', true);
            callback.should.have.property('clientcount', 1);
            client1.disconnect();
            done();
          });
        });
      });
    });
  });

});