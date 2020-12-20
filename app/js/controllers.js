/*jslint indent: 2, browser: true */
/*global angular, _, $, ScrollIntoView, DropDown */

'use strict';

/* Controllers */

function MainCtrl($scope, $timeout) {
  $scope.logoState = '';
  $scope.errorMessage = null;
  $scope.message = null;

  $scope.$on('$routeChangeSuccess', function () {
    $scope.logoState = '';
    $scope.bodyState = '';
  });
  $scope.$on('unanimous vote', function () {
    $scope.logoState = ' header__logo--green';
    $scope.bodyState = ' body--green';
  });
  $scope.$on('not unanimous vote', function () {
    $scope.logoState = ' header__logo--yellow';
    $scope.bodyState = ' body--yellow';
  });
  $scope.$on('problem vote', function () {
    $scope.logoState = ' header__logo--red';
    $scope.bodyState = ' body--red';
  });
  $scope.$on('unfinished vote', function () {
    $scope.logoState = '';
    $scope.bodyState = '';
  });

  $scope.$on('show message', function (evnt, msg) {
    $scope.message = msg;
    $timeout(function () {
      $scope.message = null;
    }, 4000);
  });
  $scope.$on('show error', function (evnt, msg) {
    $scope.errorMessage = msg;
    $timeout(function () {
      $scope.errorMessage = null;
    }, 3000);
  });
}

MainCtrl.$inject = ['$scope', '$timeout'];

function LobbyCtrl($scope, $location, socket) {
  $scope.disableButtons = false;
  $scope.createRoom = function () {
    // console.log('createRoom: emit create room');
    $scope.disableButtons = true;
    socket.emit('create room', {}, function (roomUrl) {
      $location.path(roomUrl);
    });
  };
  $scope.enterRoom = function (room) {
    // console.log('enterRoom: room info');
    $scope.disableButtons = true;
    socket.emit('room info', { roomUrl: room }, function (response) {
      if (response.error) {
        $scope.disableButtons = false;
        $scope.$emit('show error', response.error);
      } else {
        // console.log("going to enter room " + response.roomUrl);
        $location.path(response.roomUrl);
      }
    });
  };
}

LobbyCtrl.$inject = ['$scope', '$location', 'socket'];

function standardDeviation(values, avg){
  var squareDiffs = values.map(function(value){
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });

  var avgSquareDiff = average(squareDiffs);

  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

function average(data){
  var sum = data.reduce(function(sum, value){
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
}

function cardValue(vote){
  if (vote.match(/^[0-9]+$/)) {
    return parseFloat(vote);
  } else if (vote == '\u00BD') {
    return 0.5;
  } else if (vote == 'A\u2660') {
    return 1;
  } else if (vote == '\u2654') {
    return 13;
  }
}

function RoomCtrl($scope, $routeParams, $timeout, socket) {

  var processMessage = function (response, process) {
    // console.log("processMessage: response:", response)
    if (response.error) {
      $scope.$emit('show error', response.error);
    } else {
      (process || angular.noop)(response);
    }
  };

  var sumOfTwo = function (a, b) {
    return a + b;
  };

  // wipe out vote if voting state is not yet finished to prevent cheating.
  // if it has already been set - use the actual vote. This works for unvoting - so that
  // before the flip occurs - we don't display 'oi'
  var processVotes = function () {
    var voteCount = $scope.votes.length;
    _.each($scope.votes, function (v) {
      v.visibleVote = v.visibleVote === undefined && (!$scope.forcedReveal && voteCount < $scope.voterCount) ? 'oi!' : v.vote;
    });
    var voteArr = [];
    voteArr.length = $scope.voterCount - voteCount;
    $scope.placeholderVotes = voteArr;

    var cardValues =  _.filter(_.map(_.pluck($scope.votes, 'vote'), cardValue), _.isNumber);
    $scope.votingAverage = average(cardValues);
    $scope.votingStandardDeviation = standardDeviation(cardValues, $scope.votingAverage).toFixed(2);
    $scope.showAverage = voteArr.length === 0 && cardValues.length > 0;

    $scope.forceRevealDisable = (!$scope.forcedReveal && ($scope.votes.length < $scope.voterCount || $scope.voterCount === 0)) ? false : true;
    console.log("forceRevealDisable", $scope.forceRevealDisable)
    console.log("alreadySorted;", $scope.alreadySorted)
    $scope.sortVotesDisable = !$scope.forceRevealDisable || $scope.alreadySorted;
    console.log("sortVotesDisable", $scope.sortVotesDisable)

    if ($scope.votes.length === $scope.voterCount || $scope.forcedReveal) {
      if ($scope.alreadySorted) {
        $scope.votes = $scope.votes.sort(function(el1, el2) {
          return $scope.cards.indexOf(el1.vote) - $scope.cards.indexOf(el2.vote);
        });
      }

      var uniqVotes = _.chain($scope.votes).pluck('vote').uniq().value().length;
      if (uniqVotes === 1) {
        $scope.$emit('unanimous vote');
      } else if (uniqVotes === $scope.voterCount) {
        $scope.$emit('problem vote');
      } else if ($scope.voterCount > 3 && uniqVotes === ($scope.voterCount - 1)) {
        $scope.$emit('problem vote');
      } else {
        $scope.$emit('not unanimous vote');
      }
    } else {
      $scope.$emit('unfinished vote');
    }
  };

  var myConnectionHash = function () {
    return _.find($scope.connections, function (c) { return c.sessionId === $scope.sessionId; });
  };

  var myVoteHash = function () {
    return _.find($scope.votes, function (c) { return c.sessionId === $scope.sessionId; });
  };

  var haveIVoted = function () {
    if ($scope.myVote === 'undefined' || $scope.myVote === null) {
      return false;
    }
    return true;
  };

  var votingFinished = function () {
    return $scope.forcedReveal || $scope.votes.length === $scope.voterCount;
  };

  var setVotingState = function () {
    $scope.cardsState = votingFinished() || !$scope.voter ? ' card--disabled' : '';
    $scope.votingState = votingFinished() ? ' flipped-stagger' : '';
  };

  var setLocalVote = function (vote) {
    var voteHash = myVoteHash();
    $scope.myVote = vote;
    $scope.voted = haveIVoted();
    if (!voteHash) {
      // initialize connections array with my first vote. (just to speed up UI)
      $scope.votes.push({ sessionId: $scope.sessionId, vote: vote });
    } else {
      if (vote) {
        voteHash.vote = vote;
      } else {
        // we're unvoting - lets remove it from the votes.
        $scope.votes = _.filter($scope.votes, function (v) {
          return v.sessionId !== $scope.sessionId;
        });
        // the above works - but causes an error in the UI.
      }
    }
    processVotes();
    setVotingState();
    $scope.scrollToSelectedCards.now();
  };

  var chooseCardPack = function (val) {
    var fib = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?'];
    var goat = ['0', '\u00BD', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '\u2615'];
    var seq = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '?'];
    var play = ['A\u2660', '2', '3', '5', '8', '\u2654'];
    var tshirt = ['XL', 'L', 'M', 'S', 'XS', '?'];
    switch (val) {
    case ('fib'):
      return fib;
    case ('goat'):
      return goat;
    case ('seq'):
      return seq;
    case ('play'):
      return play;
    case ('tshirt'):
      return tshirt;
    default:
      return [];
    }
  };

  var refreshRoomInfo = function (roomObj) {
    // console.log("refreshRoomInfo: roomObj:", roomObj)
    if (roomObj.createAdmin) {
      $.cookie("admin-" + roomObj.roomUrl, true);
    }
    if ($.cookie("admin-" + roomObj.roomUrl)) {
      $scope.showAdmin = true;
    }

    $scope.connections = roomObj.connections;
    $scope.humanCount = $scope.connections.length;
    $scope.cardPack = roomObj.cardPack;
    $scope.forcedReveal = roomObj.forcedReveal;
    $scope.alreadySorted = roomObj.alreadySorted;
    $scope.cards = chooseCardPack($scope.cardPack);

    $scope.votes = _.chain($scope.connections).filter(function (c) {
      return c.vote;
    }).values().value();
    $scope.voterCount = _.filter($scope.connections, function (c) {
      return c.voter;
    }).length;

    var connection = myConnectionHash();

    if (connection) {
      $scope.voter = connection.voter;
      $scope.myVote = connection.vote;
      $scope.voted = haveIVoted();
    }

    processVotes();

    // we first want the cards to be displayed as hidden, and then apply the finished state
    // if voting has finished - which then actions the transition.
    $timeout(function () {
      setVotingState();
    }, 100);

  };

  $scope.configureRoom = function () {

    socket.on('room joined', function () {
      // console.log("on room joined");
      // console.log("emit room info", { roomUrl: $scope.roomId });
      this.emit('room info', { roomUrl: $scope.roomId }, function (response) {
        processMessage(response, refreshRoomInfo);
      });
    });
    socket.on('room left', function () {
      // console.log("on room left");
      // console.log("emit room info", { roomUrl: $scope.roomId });
      this.emit('room info', { roomUrl: $scope.roomId }, function (response) {
        processMessage(response, refreshRoomInfo);
      });
    });
    socket.on('card pack set', function () {
      $scope.$emit('show message', 'Card pack changed...');
      // console.log("on card pack set");
      // console.log("emit room info", { roomUrl: $scope.roomId });
      this.emit('room info', { roomUrl: $scope.roomId }, function (response) {
        processMessage(response, refreshRoomInfo);
      });
    });
    socket.on('voter status changed', function () {
      // console.log("on voter status changed");
      // console.log("emit room info", { roomUrl: $scope.roomId });
      this.emit('room info', { roomUrl: $scope.roomId }, function (response) {
        processMessage(response, refreshRoomInfo);
      });
    });
    socket.on('voted', function () {
      // console.log("on voted");
      // console.log("emit room info", { roomUrl: $scope.roomId });
      this.emit('room info', { roomUrl: $scope.roomId }, function (response) {
        processMessage(response, refreshRoomInfo);
      });
    });
    socket.on('unvoted', function () {
      // console.log("on unvoted");
      // console.log("emit room info", { roomUrl: $scope.roomId });
      this.emit('room info', { roomUrl: $scope.roomId }, function (response) {
        processMessage(response, refreshRoomInfo);
      });
    });
    socket.on('vote reset', function () {
      // console.log("on vote reset");
      // console.log("emit room info", { roomUrl: $scope.roomId });
      this.emit('room info', { roomUrl: $scope.roomId }, function (response) {
        processMessage(response, refreshRoomInfo);
      });
    });

    socket.on('reveal', function () {
      // console.log("reveal event received");
      // setLocalVote(null);
      this.emit('room info', { roomUrl: $scope.roomId }, function (response) {
        processMessage(response, refreshRoomInfo);
      });
    });

    socket.on('connect', function () {
      // console.log("on connect");
      var sessionId = this.id;
      // console.log("new socket id = " + sessionId);
      if (!$.cookie("sessionId")) {
        $.cookie("sessionId", sessionId);
      }
      $scope.sessionId = $.cookie("sessionId");
      // console.log("session id = " + $scope.sessionId);
      // console.log("emit join room", { roomUrl: $scope.roomId, sessionId: $scope.sessionId });
      socket.emit('join room', { roomUrl: $scope.roomId, sessionId: $scope.sessionId }, function (response) {
        processMessage(response, refreshRoomInfo);
      });
    });
    socket.on('disconnect', function () {
      // console.log("on disconnect");
    });

    // console.log("emit join room", { roomUrl: $scope.roomId, sessionId: $scope.sessionId });
    socket.emit('join room', { roomUrl: $scope.roomId, sessionId: $scope.sessionId }, function (response) {
      processMessage(response, refreshRoomInfo);
    });
  };

  $scope.setCardPack = function (cardPack) {
    $scope.cardPack = cardPack;
    $scope.resetVote();

    // console.log("set card pack", { roomUrl: $scope.roomId, cardPack: cardPack });
    socket.emit('set card pack', { roomUrl: $scope.roomId, cardPack: cardPack });
  };

  $scope.vote = function (vote) {
    if ($scope.myVote !== vote) {
      if (!votingFinished() && $scope.voter) {
        setLocalVote(vote);

        // console.log("emit vote", { roomUrl: $scope.roomId, vote: vote, sessionId: $scope.sessionId });
        socket.emit('vote', { roomUrl: $scope.roomId, vote: vote, sessionId: $scope.sessionId }, function (response) {
          processMessage(response);
        });
      }
    }
  };

  $scope.unvote = function (sessionId) {
    if (sessionId === $scope.sessionId) {
      if (!votingFinished()) {
        setLocalVote(undefined);

        // console.log("emit unvote", { roomUrl: $scope.roomId, sessionId: $scope.sessionId });
        socket.emit('unvote', { roomUrl: $scope.roomId, sessionId: $scope.sessionId }, function (response) {
          processMessage(response);
        });
      }
    }
  };

  $scope.resetVote = function () {
    // console.log("emit reset vote", { roomUrl: $scope.roomId });
    socket.emit('reset vote', { roomUrl: $scope.roomId }, function (response) {
      processMessage(response);
    });
  };

  $scope.forceReveal = function () {
    // console.log("emit force reveal", { roomUrl: $scope.roomId });
    $scope.forceRevealDisable = true;
    socket.emit('force reveal', { roomUrl: $scope.roomId }, function (response) {
      processMessage(response);
    });
  };

  $scope.sortVotes = function () {
    // console.log("emit sort votes", { roomUrl: $scope.roomId });
    $scope.sortVotesDisable = true;
    socket.emit('sort votes', { roomUrl: $scope.roomId }, function (response) {
      processMessage(response);
    });
  };

  $scope.toggleVoter = function () {
    // console.log("emit toggle voter", { roomUrl: $scope.roomId, voter: $scope.voter, sessionId: $scope.sessionId });
    socket.emit('toggle voter', { roomUrl: $scope.roomId, voter: $scope.voter, sessionId: $scope.sessionId }, function (response) {
      processMessage(response);
    });
  };

  $scope.roomId = $routeParams.roomId;
  $scope.humanCount = 0;
  $scope.voterCount = 0;
  $scope.showAdmin = false;
  $scope.voter = true;
  $scope.connections = {};
  $scope.votes = [];
  $scope.cardPack = '';
  $scope.myVote = undefined;
  $scope.voted = haveIVoted();
  $scope.votingState = "";
  $scope.forcedReveal = false;
  $scope.forceRevealDisable = true;
  $scope.sortVotesDisable = true;
  $scope.scrollToSelectedCards = new ScrollIntoView($('#chosenCards'));

  $scope.dropDown = new DropDown('#dd');
  $scope.votingAverage = 0;
}

RoomCtrl.$inject = ['$scope', '$routeParams', '$timeout', 'socket'];
