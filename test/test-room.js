var io = require('socket.io-client');
var socketURL = "http://0.0.0.0:5000";
var options = {
  transports: ['websocket'],
  'force new connection' : true
};

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");
var should = chai.should();
var LobbyClass = require('../lib/lobby.js');
var RoomClass = require('../lib/room.js');
chai.use(sinonChai);

describe('Room Class', function(){
  describe('default values', function(){
    it('should provide default values', function(){
      var room = new RoomClass.Room('testio','testroom');
      room.should.deep.equal({ 
        io : 'testio',
        roomUrl : 'testroom',
        createAdmin : true,
        hasAdmin : false,
        cardPack : 'fib',
        clientCount : 0,
        connections : {}
      });
    });
  });

  describe('#info()', function(){
    it('should call #getClientCount()', function(){
      var room = new RoomClass.Room();
      var mock = sinon.mock(room).expects('getClientCount');
      room.info();
      mock.should.have.been.calledOnce
    });
    it('should set hasAdmin after first call', function(){
      var room = new RoomClass.Room();
      var mock = sinon.mock(room).expects('getClientCount');
      room.should.have.property('hasAdmin', false);
      room.info();
      room.should.have.property('hasAdmin', true);
    });
  });

  describe('#enter()', function(){
    it('should create connections[socket]', function(){
      var room = new RoomClass.Room();
      room.enter( { id : 12345 } );
      room.should.deep.property('connections.12345.socketId', 12345);
    });
  });

  describe('#leave()', function(){
    it('should delete connections[socket]', function(){
      var room = new RoomClass.Room();
      room.connections = {
        'fake' : { socketId : 'fake', vote : null, voter : null }
      };
      room.leave( { id : 'fake'} );
      room.should.have.property('connections').and.be.empty;
    });
  });

  describe('#setCardPack()', function(){

  });
});