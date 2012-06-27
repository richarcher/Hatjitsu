var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");
var should = chai.should();
var LobbyClass = require('../lib/lobby.js');
var RoomClass = require('../lib/room.js');

chai.use(sinonChai);

describe('Lobby Class', function(){

  describe('#createRoom()', function(){

    it('should return a room url', function(){
      var lobby = new LobbyClass.Lobby()
         , stub
         , spy
         ;
      stub = sinon.stub(lobby, 'createUniqueURL', function(){ 
        return 'fakeURL';
      });
      spy = sinon.spy(lobby, 'createRoom');
      lobby.createRoom();
      spy.should.have.returned('fakeURL');
    });

    it('should instantiate a Room', function(){
      var lobby = new LobbyClass.Lobby()
         , stub
         , spy
         ;
      stub = sinon.stub(lobby, 'createUniqueURL', function(){ 
        return 'fakeURL';
      });
      lobby.createRoom();
      lobby.rooms['fakeURL'].should.be.an.instanceof(RoomClass.Room);
    });

    it('should create a unique rooms[room] object', function(){
      var lobby = new LobbyClass.Lobby()
         ;
      Object.keys(lobby.rooms).length.should.equal(0);
      lobby.createRoom();
      Object.keys(lobby.rooms).length.should.equal(1);
      lobby.createRoom();
      Object.keys(lobby.rooms).length.should.equal(2);
      Object.keys(lobby.rooms)[0].should.not.equal(Object.keys(lobby.rooms)[1]);
    });

    it('should call #createUniqueURL()', function(){
      var lobby = new LobbyClass.Lobby()
          , mock
          ;
      mock = sinon.mock(lobby);
      mock.expects("createUniqueURL").once();
      lobby.createRoom();
      mock.verify;
    });

    it('should trigger again if the room name already exists', function () {
      var lobby = new LobbyClass.Lobby()
        , stub
        , spy
        ;
      stub = sinon.stub(lobby, 'createUniqueURL', function(){ 
        return 'fake';
      });
      spy = sinon.spy(lobby, 'createRoom');
      lobby.createRoom();
      lobby.createRoom();

      spy.should.have.been.calledThrice;
      spy.should.have.been.calledWith('fake');
    });

    it('should define default room values', function(){
      var lobby = new LobbyClass.Lobby();
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

    it('should be called from #createRoom()', function(){
      var lobby = new LobbyClass.Lobby();
      var spy = sinon.spy(lobby, "createUniqueURL");
      lobby.createRoom();
      spy.should.have.been.calledOnce;
    });

    it('should generate a random 4-character string', function(){
      var lobby = new LobbyClass.Lobby();
      var string = lobby.createUniqueURL();
      string.should.match(/^[0-9a-zA-Z]{4}$/);
    });
  });

  describe('#joinRoom()', function(){
    
    var testSocket = { id : 1234567890 };

    it('should expect a room parameter', function() {
      var lobby = new LobbyClass.Lobby();
      var test1 = lobby.joinRoom(testSocket);
      test1.should.have.property('error', 'room undefined does not exist');
    });

    it('should error if trying to join a non-existent room', function(){
      var lobby = new LobbyClass.Lobby();
      var stubRoom = sinon.stub(lobby, 'createUniqueURL', function(){ 
        return 'fake';
      });
      var test1 = lobby.joinRoom(testSocket, 'fake');
      test1.should.have.property('error', 'room fake does not exist');
    });

    it('should call #getRoom() and return room', function() {
      var lobby = new LobbyClass.Lobby();
      var stubRoom = sinon.stub(lobby, 'createUniqueURL', function(){ 
        return 'fake';
      });
      var getRoomSpy = sinon.spy(lobby, 'getRoom');
      lobby.createRoom();
      lobby.joinRoom(null, 'fake');
      getRoomSpy.should.have.been.calledWith('fake');
    });

    it('should be a member of the room on success', function() {
      var lobby = new LobbyClass.Lobby();
      var stubRoom = sinon.stub(lobby, 'createUniqueURL', function(){ 
        return 'fake';
      });
      var getRoomSpy = sinon.spy(lobby, 'getRoom');
      lobby.createRoom();
      lobby.joinRoom(null, 'fake');
      getRoomSpy.should.have.returned(lobby.rooms['fake']);
    });

    it('should return the roomUrl on success', function(){
      var lobby = new LobbyClass.Lobby();
      var stubRoom = sinon.stub(lobby, 'createUniqueURL', function(){ 
        return 'fake';
      });
      var joiner;
      lobby.createRoom();
      joiner = lobby.joinRoom(null, 'fake');
      joiner.should.have.property('roomUrl', 'fake');
    });

  });

  describe('#getRoom()', function() {

    it('should return a room object', function () {
      var lobby = new LobbyClass.Lobby();
      var stubRoom = sinon.stub(lobby, 'createUniqueURL', function(){ 
        return 'fake';
      });
      var getRoomSpy = sinon.spy(lobby, 'getRoom');
      lobby.createRoom();
      lobby.getRoom('fake');
      getRoomSpy.should.have.returned(lobby.rooms['fake']);
    });

    it('should return an error when no room parameter is specified', function () {
      var lobby = new LobbyClass.Lobby();
      var response = lobby.getRoom('notThere');
      response.should.have.property('error', 'room notThere does not exist');
    });

  });

  describe('#broadcastDisconnect()', function(){
    it('should be tested somehow. Now idea how though.');
  });
});