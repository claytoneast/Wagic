var ready = function() {
  var id = parseInt($("#game-id").text()),
      cards =[];
  var timestamp = Math.floor(Date.now() / 1000);
  //Fetch Board
  $.ajax({
    url: "/games/" + id + "/game_board",
    type: "GET",
    dataType: "json",
    success: function(data) {
      showBoard(data.game);
      updateHand(data);
      // showGameMeta(data);gam
      updateGame(data);
      poll(data);
    }
  });

  //Fetch Cards
  $.ajax({
    url: "/cards",
    type: "GET",
    dataType: "json",
    async: false,
    success: function(data) {
      spellOverlay(data);
    }
  });
  $(".hand-wrapper").mousewheel(function(event, delta) {
      this.scrollLeft -= (delta * 3);
      event.preventDefault();
  });
};

$(document).ready(ready);
$(document).on('page:load', ready);


function wagicWord(data) {
  showGameMeta(data);
  clearSpelledWord();
  updateGame(data);
}

//Event Functions
function hoverBoard() {
  var neighbors = getNeighbors(this);
  neighbors.forEach(function(neighbor) {
    neighbor = neighbor.split(',');
    $('#x' + neighbor[0] + 'y' + neighbor[1]).toggleClass('selected');
  });
}

function submitWord() {
  console.log('submitword');
  var word = [];
  var collection = $('.spell').children();
  $.each(collection, function(index, tile) {
    var coordSpace = (tile.getAttribute('data-color') + '.' + tile.getAttribute('data-letter'));
    word.push(coordSpace);
  });
  $.ajax({
    url: '/games/' + id + '/wagic_word',
    type: 'PATCH',
    data: 'word=' + word,
    dataType: 'json',
    success: function(data) {
      if (data === false) {
        alert('That word is not allowed');
      } else {
        wagicWord(data);
      }
    }
  });
}

function moveTile() {
  console.log('moveTile');
  if ($(this).parent().hasClass('spell')) {
    $(this).detach().appendTo('.hand-wrapper');
  } else {
    $(this).detach().appendTo('.spell');
  }
}

function chooseCard() {
  var cardID = $(this).attr('id');
  useCard(cardID);
}

function chooseTile() {
  console.log('choose tile');
  var chosenTile = ($(this).attr('data-x') + $(this).attr('data-y')).split('');
  var neighbors = getNeighbors(this);
  neighbors.forEach(function(neighbor) {
    neighbor = neighbor.split(',');
  });
  $.ajax({
    url: '/games/' + id + '/pick_letters',
    type: 'PATCH',
    data: 'tile=' + chosenTile,
    dataType: 'json',
    success: function(data) {
      updateBoard(data);
    }
  });
}

//Cards
function useCard(card_id) {
  $.ajax({
    url: '/games/' + id + '/play_card',
    type: 'PATCH',
    data: 'card_id=' + card_id,
    dataType: 'json',
    success: function(data) {
      fCard = findCard(card_id);
      if (data !== false) {
        if (fCard.name == 'Heal') {
          healCard(data);
        } else if (fCard.name == 'Cluster') {
          clusterCard(data);
        } else if (fCard.name == 'Doubledip') {
            doubledipCard(data);
        } else if (fCard.name == 'Switcheroo') {
          switcherooCard(data);
        }

      } else {
        alert("You do not have the gold for that card.");
      }
    }
  });
}

function findCard(card_id) {
  var foundCard;
  for (var i = 0; i < cards.length; i++) {
    if (cards[i].id === parseInt(card_id)) {
      foundCard = cards[i];
      break;
    }
    return foundCard;
  }
  return foundCard;
}

function healCard(data) {
  showGameMeta(data);
}

function switcherooCard(data) {
  showHand(data);
  showGameMeta(data);
  reloadHandListeners();
}

function clusterCard(data) {
  showBoard(data);
  showGameMeta(data);
}

function doubledipCard(data) {
  $('#board .cards').removeClass('show-cards').empty();
}

function resetHandPlayArea() {
  tiles = $('.spell').children().detach();
  $('.hand-wrapper').append(tiles);
}

function switchTurn(event) {
  console.log('switch turn');
  $.ajax({
    url: '/games/' + id + '/switch_turn',
    type: 'PATCH',
    dataType: 'json',
    success: function(data) {
        waitPhase();
        resetHandPlayArea();
        updateBoard(data);
    }
  });
}

function updateGame(data, prevBoard) {
  if (data.game) {
    console.log('[board updated]');
    timestamp = data.game.ts;
    showGameMeta(data);
    if (data.game.won != 'false') {
      gameWon(data.game.won);
    } else {
      updateBoard(data);
    }
    if (data.game.turn === data.user) {
      console.log('your turn!');
      if (data.game.turn_state === "pick_letters") {
        pickPhase();
      } else {
        spellPhase();
      }
    } else {
      console.log('opponents turn!');
      waitPhase();
    }
    xpCircle(data);
  } else {
    data = prevBoard;
  }
}

function pickPhase() {
  $('.wgc-board').off();
  clearTimeout(fiveTimeout);
  clearTimeout(thirtyTimeout);
  $('#board .counter').remove();
  $('.spell-overlay').hide();
  $('.wgc-board')
    .on('click', '.board-tile', chooseTile)
    .on('mouseenter mouseleave', '.board-tile', hoverBoard)
    .off('click', '.hand-wrapper .tile', moveTile);
}

function spellPhase() {
  clearTimeout(fiveTimeout);
  clearTimeout(thirtyTimeout);
  $('.wgc-board').off();
  $('.wgc-board')
    .on('click', '.end', switchTurn)
    .on('click', '.wagick', submitWord)
    .on('click', '.card', chooseCard)
    .on('click', '.spell .tile', moveTile)
    .on('click', '.hand-wrapper .tile', moveTile);
  setTimeout(function(){
    $('.spell-overlay').show();
  }, 500);

}

function waitPhase() {
  clearTimeout(fiveTimeout);
  clearTimeout(thirtyTimeout);
  $('#board .tile').addClass('wait-phase');
  $('.spell-overlay').hide();
  $('.wgc-board')
    .off('click', '.board-tile', chooseTile)
    .off('mouseenter mouseleave', '.board-tile', hoverBoard)
    .off('click', '.hand-wrapper .tile', moveTile)
    .on('click', '.spell .tile', moveTile)
    .off('click', '.end', switchTurn)
    .off('click', '.wagick', submitWord);
}


function spellOverlay(cards) {
    $('.spell-overlay').show();

    cards.forEach(function(card) {
      $('#board .spell-overlay .cards').append(
        '<div class="card flex-column ' + card.name + '" id="' + card.id + '">' +
          '<img src="../card-' + card.name + '.png" class="icon">' +
          '<div class="price">' +
            '<div class="gold"></div>' +
            '<span class="cost">X' + card.price + '</span>' +
          '</div>' +
        '</div>'
      );
    });
}

function clearSpelledWord() {
  $('.spell').empty();
}

function updateHand(data) {
  var hand = data.game.players[data.user].hand; // rewrite this shit so it gets it from the game data
  $('#user-hand .hand-wrapper').empty();
  hand.forEach(function(tile) {
    $('#user-hand .hand-wrapper').append(
      '<button class="btn btn-game tile hand-tile btn-primary ' + tile.color + '"' +
      'data-color="' + tile.color + '"' +
      'data-letter="' + tile.letter + '"' +
      'data-x="' + tile.x + '"' +
      'data-y="' + tile.y + '"' +
      '>' + tile.letter + '</button>'
    );
  });
}

function showBoard(game) {
  if ($('.tile').length) {
    updateBoard(game);
  } else {
    for (var x = 0; x < game.board.length; x++) {
      var column = '<div class="flex-column" id="row' + x + '"></div>';
      $("#board").append(column);
      for (var y = 0; y < game.board[x].length; y++) {
        var tile = newTile(game.board[x][y]);
        $('#row' + x).append(tile);
      }
    }
  }
}

function updateBoard(data) {
  for (var x = 0; x < data.game.board.length; x++) {
    for (var y = 0; y < data.game.board[x].length; y++) {
      var prevTile = $('#row'+x+' button:nth-child('+(y+1)+')');
      var nextTile = data.game.board[x][y];
      if ( prevTile.attr('data-color') !== nextTile.color ||
           prevTile.attr('data-letter') !== nextTile.letter ) {
        prevTile.replaceWith( newTile(nextTile) );
      }
    }
  }
  updateHand(data);
}

function gameWon(winning_player) {
  waitPhase();
  alert('This game has been won by: ' + winning_player);
}

// #############################################################################
// #############################################################################
// #########                      ##############################################
// #########                      ##############################################
// #########      ############    ##############################################
// #########      ############    ##############################################
// #########                      ##############################################
// #########                      ##############################################
// #########      ##############################################################
// #########      ##############################################################
// #########      ##############################################################
// #########      ##############################################################
// #########      ##############################################################
// #############################################################################
// #############################################################################

function poll(prevBoard) {
  setInterval(function() {
    $.ajax({
      url: '/games/' + id + '/game_board?ts=' + timestamp,
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        updateGame(data, prevBoard);
      }
    });
  }, 500);
}


var thirtyTimeout;
var fiveTimeout;

function xpCircle(data) {
  var elapsed = (Date.now() - Date.parse(data.game.time_since_switch));
  // if ( $.contains($('#board')[0], $('.counter')[0]) ) { // delete it
  //   $('#board .counter').remove();
  // }
  $('.board-wrapper .xp.' + inactivePlayer(data)).append(
    '<div class="counter">' +
      '<div class="chart">' +
      // '<div class="backdrop"></div>' +
      '<span class="caption">+<span class="number">' + 1 + '</span> XP</span>' +
      '</div>' +
    '</div>'
  );
  if (elapsed < 30000) {
    thirtyCounter(elapsed, inactivePlayer(data));
    thirtyTimeout = setTimeout(function() {
      incrementXP(data);
      fiveCounter(0, inactivePlayer(data));
    }, 30000-elapsed);
  } else {
    fiveCounter(elapsed, inactivePlayer(data));
  }
}

function incrementXP() {
  $('.board-wrapper .counter .chart .caption').removeClass('fade');
  setTimeout(function() {
    $('.board-wrapper .counter .chart .caption').addClass('fade');
  }, 0);
                                              // .addClass('fade');
}

function inactivePlayer(data) {
  return data.game.turn === 'player1' ? 'player2' : 'player1';
}

function bonusXP(elapsed) {
  var bonus;
  if (elapsed < 30000) {
    bonus = 0;
  } else if (elapsed > 30000 && elapsed < 35000) {
    bonus = 1;
  } else {
    bonus = Math.floor((1 + (elapsed - 30000) / 5000));
  }
  return bonus;
}

function thirtyCounter(elapsed, inactive) {
  var left = 30000-elapsed;
  $('.board-wrapper .xp.' + inactive + ' .chart').circleProgress({
    value: 1,
    startAngle: -1.57,
    size: 80,
    thickness: 13,
    animationStartValue: elapsed/30000,
    fill: {
      color: '#016289'
    },
    animation: {
      duration: left,
      easing: 'linear'
    }
  });
}

function fiveCounter(elapsed, inactive) {
  var left = 5000 - (elapsed % 5000);
  fiveTimeout = setTimeout(function() {
    // debugger
    incrementXP();
    fiveCounter(0, inactive);
  }, left);
  // debugger;
  $('.board-wrapper .xp.' + inactive + ' .chart').circleProgress({
    value: 1,
    startAngle: -1.57,
    size: 80,
    thickness: 8,
    animationStartValue: 1 - (left/5000),
    fill: {
     color: '#016289'
    },
    animation: {
     duration: left,
     easing: 'linear'
    }
  });
  // run the animation again but with 0 seconds elapsed
}


function newTile(tile) {
  return '<button class="tile board-tile ' + tile.color + '"' +
            'data-x="' + tile.x + '"' +
            'data-y="' + tile.y + '"' +
            'data-color="' + tile.color + '"' +
            'data-letter="' + tile.letter + '"' +
            'id="x' + tile.x + 'y' + tile.y + '">' +
            '<span>' + tile.letter + '</span>' +
            '<span class="score">' + letterScore(tile.letter) + '</span>' +
          '</button>';
}

function letterScore(letter) {
  var scores = { 'a': 1, 'b': 3, 'c': 3, 'd': 2, 'e': 1, 'f': 4, 'g': 2, 'h': 4, 'i': 1, 'j': 8, 'k': 5, 'l': 1, 'm': 3, 'n': 1, 'o': 1, 'p': 3, 'q': 10, 'r': 1, 's': 1, 't': 1, 'u': 1, 'v': 4, 'w': 4, 'x': 8, 'y': 4, 'z': 10 };
  return scores[letter];
}

function tileColor(tile, user, turn) {
  if (user === turn) {
    return tile.color;
  } else {
    return 'blank';
  }
}

// #####################################################################################################################################################
// #####################################################################################################################################################
// ########################################          ######################         ###################################################################
// ########################################           ###################           ####################################################################
// ########################################      ##     ##############     ###      ####################################################################
// ########################################      ###     ############     ####      ####################################################################
// ########################################      #####     #######     #######      ####################################################################
// ########################################      #######     ###     #########      ####################################################################
// ########################################      #########          ##########      ####################################################################
// ########################################      ###########     #############      ####################################################################
// #####################################################################################################################################################
// #####################################################################################################################################################
// #####################################################################################################################################################
// #####################################################################################################################################################
function showGameMeta(data) {
  $('.game-header').empty();
  function activeTurn(id){
    if (data.game.turn === id) return 'active';
    return "inactive";
  }
  $.each(data.game.players, function(id, player){
    if (data.game.turn === player.name && player.history !=='') {
      $('.game-header').append(
        '<div class="recent ' + player.name + '">' + player.history + '!!</div>'
      );
    }
    $('.game-header').append(
      '<div class="stats ' + player.name + '">' +
        '<span class="bar-wrapper">' +
          '<span class="bar" style="width:' + (player.current_health/player.max_health)*100 + '%">' + player.current_health + "/" + player.max_health +'</span>' +
        '</span>' +
        '<span class="gold ' + player.name + '">x' + player.gold + '</span>' +
      '</div>'
    );
    $('.board-wrapper').append(
      '<div class="xp ' + player.name + '">' +
        '<span class="xp-text">lvl' + '<span class="xp-num">' + player.level + '</span><span>' +
      '</div>' +
      '<div class="char ' + activeTurn(id) + ' ' + player.name + '"></div>'
    );
    var next = {
      '1': 20, '2': 50, '3': 90, '4': 140, '5': 200, '6': 270
    };
    $(document).ready(function(){
        $('.xp.' + player.name).circleProgress({
            value: player.experience/(next[player.level]),
            startAngle: -1.57,
            size: 26,
            thickness: 13,
            fill: {
              color: '#016289'
            }
        });
    });
  });
  $('.game-header .' + data.game.turn + '-name').addClass('this-turn');
}

function getNeighbors(space) {
  var checkArray = [];

  getBlock([space]);
  function getBlock(spaces) {
    var colorBlock = [];

    spaces.forEach(function(space) {
      if (checkArray.indexOf(String(getCoords(space))) <= -1) { // if not in there do this
        checkArray.push(String(getCoords(space))); // push into check array
        colorBlock.push(space);
        neighbors = findAllNeighbors(space); // returns coordinates, not UI objects
        sameNeighbors = colorNeighbors(neighbors, getColor(space)); // returns an array
        if (sameNeighbors.length > 0) { // if this array has something in it then send it to getBlock
          getBlock(sameNeighbors);
        } else {
          return;
        }
      } else {
        return;
      }
    });
    return colorBlock;
  }
  return checkArray;
}

var colorNeighbors = function (neighbors, color) {
  var sameColorNeighbors = [];

  neighbors.forEach(function(neighbor) {
    foundNeighbor = $('#x' + neighbor[0] + 'y' + neighbor[1]);
    if (getColor(foundNeighbor) == color) {
      sameColorNeighbors.push(foundNeighbor);
    }
  });
  return sameColorNeighbors;
};

var findAllNeighbors = function (space) {
  var neighbors = [];
  var x = getCoords(space)[0];
  var y = getCoords(space)[1];
  var nAbove = [x, y - 1];
  var nBelow = [x, y + 1];
  var nLeft = [x - 1, y];
  var nRight = [x + 1, y];

  if (y > 0) { neighbors.push(nAbove); }
  if (y < 7)  { neighbors.push(nBelow); }
  if (x > 0) { neighbors.push(nLeft); }
  if (x < 7)  { neighbors.push(nRight); }
  return neighbors;
};

var getCoords = function(element) {
  x = parseInt($(element).attr('data-x'));
  y = parseInt($(element).attr('data-y'));
  return [x, y];
};

var getColor = function(element) {
  return $(element).attr('data-color');
};
