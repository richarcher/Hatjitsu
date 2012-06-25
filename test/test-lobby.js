var should = require('chai').should();
var lobbyClass = require('../lib/lobby.js');

describe('Lobby Class', function(){
  describe('#createRoom()', function(){
    it('should create a unique room', function(){
      var lobby = new lobbyClass.Lobby();
      Object.keys(lobby.rooms).length.should.equal(0);
      lobby.createRoom();
      Object.keys(lobby.rooms).length.should.equal(1);
      lobby.createRoom();
      Object.keys(lobby.rooms).length.should.equal(2);
      Object.keys(lobby.rooms)[0].should.not.equal(Object.keys(lobby.rooms)[1]);
    });
    it('should define default room values', function(){
      var lobby = new lobbyClass.Lobby();
      var room;
      lobby.createRoom();
      room = Object.keys(lobby.rooms)[0];
      Object.keys(lobby.rooms[room]).length.should.equal(7);
      lobby.rooms[room].should.have.property('createAdmin', true);
      lobby.rooms[room].should.have.property('hasAdmin', false);
      lobby.rooms[room].should.have.property('cardPack', 'fib');
      lobby.rooms[room].should.have.property('clientCount', 0);
      lobby.rooms[room].should.have.property('connections').and.be.empty;
    });
  });

  describe('#createUniqueURL()', function(){
    it('should generate a random 4-character string', function(){
      var lobby = new lobbyClass.Lobby();
      var string = lobby.createUniqueURL();
      string.should.match(/^[0-9a-zA-Z]{4}$/);
    });
  });

  describe('#joinRoom()', function(){
    it('should error if trying to join a non-existent room');
    it('should be a member of the room on success');
    it('should tell other room members that a client has joined');
    it('should return the roomUrl on success');
  });

  describe('#refreshRoomInfo()', function(){
    it('should return information about a specific room');
  });

  describe('#getClientCount()', function(){
    it('should return a count of users currently connected to a room');
  });

  describe('#broadcastDisconnect()', function(){
    it('should error if trying to leave a non-existent room');
    it("should not be a member of the room on success");
    it("should tell other room members that a client has left");
  });
});