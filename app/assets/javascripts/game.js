    cards = [];

  $(document).ready(function() {
    console.log("document ready");
    getCards();
    id = parseInt($("#game-id").text());
  });
    debugger;

  function getCards() {
    $.ajax({
      url: "/cards",
      type: "GET",
      dataType: "json",
      async: false,
      success: function(data) {
        cards = data;
      }
    });
  }

  $.ajax({
    url: "/games/" + id + "/game_board",
    type: "GET",
    dataType: "json",
    success: function(data) {
      initBoard(data);
      console.log("initial board request successful");
    }
  });

  function initBoard(data) {
    showBoard(data.game);
    showGameMeta(data);
    if (data.user !== null) {
      showHand(data);
    }
    if (data.game.turn == data.user && data.game.turn_state == "pick_letters") { // if users turn and needs to pick letters
      loadBoardListeners();
      handOverlay();
    } else if (data.game.turn == data.user && data.game.turn_state == "picked_letters") { // if its users turn and has picked letters
      spellOverlay();
      cardListeners();
      loadHandListeners();
      loadActionListeners();
    }
  }

  function handOverlay() {
    $('#user-hand').append(
      '<span class="hand-overlay">select a letter block</span>'
    );
    $('#user-hand .hand-wrapper').addClass('hand-mask');
    for (var i=0; i<8; i++) {
      $('#user-hand .hand-wrapper').append(
        '<button class="tile hand-tile blank"></button>'
      );
    }
  }

  function removeHandOverlay() {
    $('#user-hand .hand-wrapper').removeClass('hand-mask');
    $('#user-hand .hand-overlay').remove();
  }

  function lettersPicked(data) {
    showBoard(data.game);
    $('.tile').off();
    spellOverlay();
    cardListeners();
    showHand(data);
    removeHandOverlay();
    reloadHandListeners();
    loadActionListeners();
  }

  function destroySpace(data) {
    showBoard(data.game);
    $('#board .tile').off();
    spellOverlay();
    showHand(data);
    loadHandListeners();
    loadActionListeners();
  }

  function handToPlayArea() {
    reloadHandListeners();
    reloadWordListeners();
  }

  function wagicWord(data) {
    showGameMeta(data);
    clearSpelledWord();
  }

  function killListeners() {
    $('.tile').off();
    $('#wagic').off();
    $('#end-turn').off();
  }

  function cardListeners() {
    $('.card').on('click', function() {
      var cardID = $(this).attr('id');
      useCard(cardID);
    });
  }

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
    showBoard(data.game);
    showGameMeta(data);
  }

  function doubledipCard(data) {
    $('#board .spell-overlay').removeClass('show-cards').empty();
    reloadBoardListeners();
    // overlay goes away, event listeners for the board go on.
    // game state goes back to pick letters in the backend
    //
  }

  function spellOverlay() {
      $('#board .spell-overlay').empty();
      $('#board .spell-overlay').show();
      // $('#board .spell-overlay').addClass('show');
      $('#board .spell-overlay').append(
        '<span class="title buy">Buy Items</span>' +
        '<div class="cards flex-row">' +

        '</div>' +
        '<span class="title cast">cast spells</span>' +
        '<div class="spell flex-row">' +
        '</div>' +

        '<div class="actions flex-row">' +
          '<div class="butt wagick">wagick</div>' +
          '<div class="butt end">end turn</div>' +
        '</div>'
      );

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
      // for (var i=0; i<14; i++) {
      //   $('#board .spell-overlay .spell .blank-tiles').append(
      //     '<div class="tile hand-tile blank"></div>'
      //   );
      // }
  }

  function resetHandPlayArea() {
    tiles = $('.play-wrapper').children().detach();
    $('.hand-wrapper').append(tiles);
  }

  function switchTurn() {
    $.ajax({
      url: '/games/' + id + '/switch_turn',
      type: 'PATCH',
      dataType: 'json',
      success: function(data) {
          killListeners();
          resetHandPlayArea();
          hideSpellOverlay();
      }
    });
  }

  function hideSpellOverlay() {
    $('#board .spell-overlay').empty();
    $('#board .spell-overlay').hide();
  }

  function loadBoardListeners(){
    $(document).ready(function(){
      $('#board .tile').hover(function(){
        var neighbors = getNeighbors(this);
        neighbors.forEach(function(neighbor) {
          neighbor = neighbor.split(',');
          $('#x' + neighbor[0] + 'y' + neighbor[1]).toggleClass('selected');
        });
      });

      var pressTimer;
      $('#board .tile').mouseup(function(){
        clearTimeout(pressTimer);
        // Clear timeout
        return false;
      }).mousedown(function(){
        var chosenTile = ($(this).attr('data-x') + $(this).attr('data-y')).split('');
        pressTimer = window.setTimeout(function() {
          $.ajax({
            url: '/games/' + id + '/space',
            type: 'DELETE',
            data: 'tile=' + chosenTile,
            dataType: 'json',
            success: function(data) {
              destroySpace(data);
            }
          });
        },1000);
        return false;
      });



      $('#board .tile').on('click', function() {
        var chosenTile = ($(this).attr('data-x') + $(this).attr('data-y')).split('');
        var neighborShiftInfo = []; // Is this being used for anything?
        var neighbors = getNeighbors(this);
        neighbors.forEach(function(neighbor) {
          neighbor = neighbor.split(',');
          neighborShiftInfo.push(neighbor); // ?
          $('#x' + neighbor[0] + 'y' + neighbor[1]).remove();
        });

        $.ajax({
          url: '/games/' + id + '/pick_letters',
          type: 'PATCH',
          data: 'tile=' + chosenTile,
          dataType: 'json',
          success: function(data) {
            lettersPicked(data);
          }
        });
      });
    });
  }
  function reloadBoardListeners() {
    $('#board .tile').off();
    loadBoardListeners();
  }

  function loadActionListeners() {
    $('#board .end').on('click', function() {
      switchTurn();
    });

    $('#board .wagick').on('click', function() {
      var word = [];
      var collection = $('#board .spell-overlay .spell').children();
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
    });
  }

  function loadHandListeners() {
    $('#user-hand .hand-wrapper .tile').on('click', function() {
      $(this).appendTo('#board .spell-overlay .spell');
      handToPlayArea();
    });
  }
  function reloadHandListeners() {
    $('#user-hand .hand-wrapper .tile').off();
    loadHandListeners();
  }

  function loadWordListeners() {
    $('#board .spell-overlay .spell .tile').on('click', function() {
      $(this).appendTo('.hand-wrapper');
      handToPlayArea();
    });
  }
  function reloadWordListeners() {
    $('#user-word .play-wrapper .tile').off();
    loadWordListeners();
  }
  function reloadActionListeners() {
    $('#end-turn').off();
    $('#wagic').off();
    loadActionListeners();
  }
  function gameWon(winning_player) {
    killListeners();
    alert('This game has been won by: ' + winning_player);
  }

  (function poll(previousTurn) {
    setTimeout(function() {
      $.ajax({
        url: '/games/' + id + '/game_board',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
          if (data.game.won != 'false') {
            gameWon(data.game.won);
          } else if (data.user === null) {
            showBoard(data.game);
            showGameMeta(data);
            poll(data.game.turn);
          } else if (data.user == data.game.turn && data.game.turn != previousTurn && previousTurn !== undefined) { // just became your turn
            showBoard(data.game);
            showGameMeta(data);
            reloadBoardListeners();
            poll(data.game.turn);
          } else if (data.user == data.game.turn) { // your turn
            poll(data.game.turn);
          } else { // other persons turn
            showBoard(data.game);
            showGameMeta(data);
            showHand(data);
            poll(data.game.turn);
          }
        }
      });
    }, 1000);
  })();

  function clearSpelledWord() {
    $('#board .spell-overlay .spell').empty();
  }

  function showHand(data) {
    var hand = data.game.players[data.user].hand; // rewrite this shit so it gets it from the game data
    $('#user-hand .hand-wrapper').empty();
    hand.forEach(function(tile) {
      $('#user-hand .hand-wrapper').append(
        '<button class="tile hand-tile ' + tile.color + '"' +
        'data-color="' + tile.color + '"' +
        'data-letter="' + tile.letter + '"' +
        '>' + tile.letter + '</button>'
      );
    });
  }

  function showBoard(game) {
    $('#board').children().not('.spell-overlay').remove();
    game.board.forEach(function(column, x) {
      var make_column = '<div class="flex-column" id="row' + x + '"></div>';
      $("#board").append(
        make_column
      );
      column.forEach(function(tile, y) {
        $('#row' + x).append(
          '<button class="tile ' + tile.color + '"' +
            'data-x="' + x + '"' +
            'data-y="' + y + '"' +
            'data-color="' + tile.color + '"' +
            'id="x' + x + 'y' + y + '">' +
            '<span>' + tile.letter + '</span>' +
            '<span class="score">' + letterScore(tile.letter) + '</span>' +
          '</button>'
        );
      });
    });
  }

  function letterScore(letter) {
    var scores = {
      'a': 1,
      'b': 3,
      'c': 3,
      'd': 2,
      'e': 1,
      'f': 4,
      'g': 2,
      'h': 4,
      'i': 1,
      'j': 8,
      'k': 5,
      'l': 1,
      'm': 3,
      'n': 1,
      'o': 1,
      'p': 3,
      'q': 10,
      'r': 1,
      's': 1,
      't': 1,
      'u': 1,
      'v': 4,
      'w': 4,
      'x': 8,
      'y': 4,
      'z': 10
    };
    return scores[letter];
  }

  function showGameMeta(data) {
    $('.game-header').empty();
    function activeTurn(id){
      if (data.game.turn === id) return 'active';
      return "inactive";
    }
    $.each(data.game.players, function(id, player){
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
          // $('.xp.' + player.name).circleProgress({
          //     value: player.experience/(player.level * 30),
          //     startAngle: -1.57,
          //     size: 26,
          //     thickness: 13,
          //     fill: {
          //       color: '#016289'
          //     }
          // });
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


  // $('#board .tile').each(function(i, tile) {
  //   neighbors.forEach(function(nTile) {
  //     if (tile.getAttribute('data-x') == nTile[0] && tile.getAttribute('data-y') == nTile[1]) {
  //     } else {
  //       tile.style.background = 'url("../tile-blank.png")';
  //     }
  //   });
  // });
