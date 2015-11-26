
  console.log("document ready");
  var id = parseInt($("#game-id").text());

  $.ajax({
    url: "/games/" + id + "/game_board",
    type: "GET",
    dataType: "json",
    success: function(data) {
      initBoard(data);
      console.log("initial board request");
    }
  });

  function initBoard(data) {
    showBoard(data.game);
    showGameMeta(data.game);
    if (data.game.turn == data.user) {
      spaceBindings();
      showHand(data.user, data.game.players);
      playBindings();
    } else {
      killListeners();
    }
  }

  function killListeners() {
    $(".tile").off();
    $("#wagic").off();
    $("#end-turn").off();
  }

  function switchTurn() {
    $.ajax({
      url: "/games/" + id + "/switch_turn",
      type: "PATCH",
      dataType: "json",
      success: function(data) {
          initBoard(data);
          clearSpelledWord();
      }
    });
  }

  function refreshBoard(data) {
    if (data.game.turn == data.user) {

    } else {
      showBoard(data.game);
      showGameMeta(data.game);
    }
  }

  function showHand(user, playersHands) {
    var hand = playersHands[user]['hand'];
    $("#user-hand .hand-wrapper").empty();
    hand.forEach(function(tile) {
      $("#user-hand .hand-wrapper").append(
        '<button class="btn btn-game tile hand-tile btn-primary ' + tile.color + '"' +
        'data-color="' + tile.color + '"' +
        'data-letter="' + tile.letter + '"' +
        '>' + tile.letter + '</button>'
      );
    });
  }

  function spaceBindings(){
    $(document).ready(function(){
      $('#board .tile').hover(function(){
        var neighbors = getNeighbors(this);
        neighbors.forEach(function(neighbor) {
          neighbor = neighbor.split(",");
          $("#x" + neighbor[0] + "y" + neighbor[1]).toggleClass("selected");
        });
      });

      $('#board .tile').on("click", function() {
        var chosenTile = ($(this).attr('data-x') + $(this).attr('data-y')).split("");
        var neighborShiftInfo = []; // Is this being used for anything?
        var neighbors = getNeighbors(this);
        neighbors.forEach(function(neighbor) {
          neighbor = neighbor.split(",");
          neighborShiftInfo.push(neighbor); // ?
          $("#x" + neighbor[0] + "y" + neighbor[1]).remove();
        });
        $.ajax({
          url: "/games/" + id + "/pick_letters",
          type: "PATCH",
          data: "tile=" + chosenTile,
          dataType: "json",
          success: function(data) {
            addSpaces(data);
          }
        });
      });
    });
  }

  function playBindings() {
    console.log('playBindings has fired')
    addHandBindings();
    addPlayBindings();
    addActionBindings();
  }

  function addActionBindings() {
    $("#end-turn").on("click", function() {
      console.log('click')
      switchTurn();
    });

    $("#wagic").on("click", function() {
      var word = [];
      var collection = $(".play-wrapper").children();
      $.each(collection, function(index, tile) {
        var coordSpace = (tile.getAttribute("data-color") + "." + tile.getAttribute("data-letter"));
        word.push(coordSpace);
      });
      $.ajax({
        url: "/games/" + id + "/wagic_word",
        type: "PATCH",
        data: "word=" + word,
        dataType: "json",
        success: function(data) {
          if (data === false) {
            alert("That word is not allowed");
          } else {
            initBoard(data);
            clearSpelledWord();
          }
        }
      });
    });
  }

  function addHandBindings() {
    $("#user-hand .hand-wrapper .tile").on("click", function() {
      $(this).appendTo(".play-wrapper");
    });
  }

  function addPlayBindings() {
    $("#user-word .play-wrapper .tile").on("click", function() {
      $(this).appendTo(".hand-wrapper");
    });
  }

  (function poll(previousTurn) {
    setTimeout(function() {
      $.ajax({
        url: "/games/" + id + "/game_board",
        type: "GET",
        dataType: "json",
        success: function(data) {
          if (previousTurn == data.game.turn) {
            refreshBoard(data);
            poll(data.game.turn);
          } else {
            initBoard(data)
            poll(data.game.turn)
          }
        }
      });
    }, 1000);
  })();

  function clearSpelledWord() {
    $('#user-word .play-wrapper').empty();
  }
  function showBoard(game) {
      $('#board').empty();
    game.board.forEach(function(column, x) {
      var make_column = '<div class="flex-box" id="row' + x + '"></div>';
      $("#board").append(
        make_column
      );
      column.forEach(function(tile, y) {
        $("#row" + x).append(
          '<button class="tile ' + tile.color + '"' +
          'data-x="' + x + '"' +
          'data-y="' + y + '"' +
          'data-color="' + tile.color + '"' +
          'id="x' + x + 'y' + y + '"' +
          '><span>' + tile.letter + '</span></button>'
        );
      });
    });
  }

  function showGameMeta(game) {
    var p1 = game.players.player1;
    var p2 = game.players.player2;
    $(".game-header").html(
      '<div class="player-header" id="player1-header">' +
       '<span>' + p1.name + '</span>' +
       '<div class="player-header-stats">' + p1.health + '</div>' +
       '</div>' +

       '<div class="versus-header"><h5>VS</h5></div>' +

       '<div class="player-header" id="player2-header">' +
        '<span>' + p2.name + '</span>' +
        '<div class="player-header-stats">' + p2.health + '</div>' +
        '</div>'
    );
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


  function addSpaces(newBoard) {
    $("#board").empty();
    initBoard(newBoard);
  }
