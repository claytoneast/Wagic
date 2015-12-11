$(document).ready(function(){
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
      showGameMeta(data);
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
});

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
};

function chooseCard() {
  var cardID = $(this).attr('id');
  useCard(cardID);
}

function chooseTile() {
  console.log('choose tile')
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
  return foundCard;
}

function doubledipCard(data) {
  $('#board .cards').removeClass('show-cards').empty();
}

// function spellOverlay() {
//     cards.forEach(function(card) {
//       $('#board .cards .card-wrapper').append(
//         '<div class="card flex-column" id="'+ card.id + '">' +
//           '<div class="flex-row card-info">' +
//             '<span class="card-name">' + card.name + '</span>' +
//             '<span class="card-price">' + card.price + 'G</span>' +
//             '<span class="card-effect">' + card.effect + '<span>' +
//         '</div>'
//       );
//     });
// }

function resetHandPlayArea() {
  tiles = $('.spell').children().detach();
  $('.hand-wrapper').append(tiles);
}

function switchTurn() {
  $.ajax({
    url: '/games/' + id + '/switch_turn',
    type: 'PATCH',
    dataType: 'json',
    success: function(data) {
        resetHandPlayArea();
        updateBoard(data);
        waitPhase();
    }
  });
}

function updateGame(data, prevBoard) {
  // loadListeners();
  if (data.game) {
    console.log('[board updated]');
    timestamp = data.game.ts;
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
  } else {
    data = prevBoard;
  }
}

function pickPhase() {
  $('.spell-overlay').hide();
  $('.wgc-board')
    .on('click', '.board-tile', chooseTile)
    .on('mouseenter mouseleave', '.board-tile', hoverBoard)
    .off('click', '.hand-wrapper .tile', moveTile);
}

function spellPhase() {
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
  $('.spell-overlay').hide();
  $('.wgc-board')
    .off('click', '.board-tile', chooseTile)
    .off('mouseenter mouseleave', '.board-tile', hoverBoard)
    .off('click', '.hand-wrapper .tile', moveTile);
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
  }, 1000);
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
      };
    };
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


var thirtyCounter, fiveCounter;

function xpCircle(data) {
  $('#board').append('<div class="counter">' +
    '<div class="chart">' +
      '<div class="backdrop"></div>' +
      '<span class="number"></span><span class="caption">til bonus XP</span>' +
    '</div>' +
    '</div>');
  $('#board .counter .chart').circleProgress({
    value: 1,
    startAngle: -1.57,
    size: 100,
    thickness: 13,
    fill: {
      color: '#016289'
    },
    animation: {
      duration: 30000,
      easing: 'linear'
    }
  });
  thirtyCounter = setTimeout(function() {
    $('#board .counter .chart').remove();
    fiveCounter();
  }, 30000);
}

function fiveCounter() {
  $('#board .counter').append('<div class="chart">' +
    '<div class="backdrop"></div>' +
    '<span class="number"></span><span class="caption">+1 XP/5 seconds</span>' +
  '</div>');
  $('#board .counter .chart').circleProgress({
    value: 1,
    startAngle: -1.57,
    size: 100,
    thickness: 13,
    fill: {
     color: '#016289'
    },
    animation: {
     duration: 5000,
     easing: 'linear'
    }
  });
  fiveTimeout = setTimeout(function() {
    $('#board .counter').empty();
    fiveCounter();
  }, 5000);
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
          '</button>'
}

function letterScore(letter) {
  var scores = { 'a': 1, 'b': 3, 'c': 3, 'd': 2, 'e': 1, 'f': 4, 'g': 2, 'h': 4, 'i': 1, 'j': 8, 'k': 5, 'l': 1, 'm': 3, 'n': 1, 'o': 1, 'p': 3, 'q': 10, 'r': 1, 's': 1, 't': 1, 'u': 1, 'v': 4, 'w': 4, 'x': 8, 'y': 4, 'z': 10 };
  return scores[letter];
}

function showGameMeta(data) {
  $('.game-header').empty();
  function activeTurn(id){
    if (data.game.turn === id) return 'active';
  }
  $.each(data.game.players, function(id, player){
    $('.game-header').append(
      '<div class="stats ' + player.name + '">' +
        '<div class="xp"></div>' +
        '<span class="bar-wrapper">' +
          '<span class="bar" style="width:' + (player.current_health/player.max_health)*100 + '%">' + player.current_health + "/" + player.max_health +'</span>' +
        '</span>' +
      '</div>' +

        //   '<div class="stat xp">' +
        //     '<span class="xp-caption">XP | ' + '</span>' +
        //     '<span class="bar-wrapper">' +
        //       '<span class="bar" style="width:' + (player.experience % 30)/30*100 + '%">' + player.experience + "/" + (player.level)*30 + '</span>' +
        //     '</span>' +
        //   '</div>' +
        //   '<div class="stat gold">' +
        //     'GOLD | ' +
        //     '<span class="bar" style="width: 4rem">' + player.gold + '</span>' +
        //   '</div>' +
        // '</div>' +
      '</div>'
    );
    $(document).ready(function(){
        $('.xp').circleProgress({
            value: 1,
            startAngle: -1.57,
            size: 26,
            thickness: 13,
            fill: {
              color: '#016289'
            }
        });
      });
    });
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
        '<div class="recent ' + player.name + '">' + player.history + '</div>'
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

    $(document).ready(function(){
        $('.xp.' + player.name).circleProgress({
            value: player.experience/(player.level * 30),
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
