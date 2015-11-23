
  console.log("document ready");
  var id = parseInt($("#game-id").text());

  $.ajax({
    url: "/games/" + id + "/game_board",
    type: "GET",
    dataType: "json",
    success: function(data) {
      initBoard(data);
      console.log("init board");
    }
  });

  function initBoard(data) {
    showBoard(data);
  }

  function spaceBindings(){
    $(document).ready(function(){
      $('.tile').hover(function(){
        var neighbors = getNeighbors(this);

        neighbors.forEach(function(neighbor) {
          neighbor = neighbor.split(",");
          $("#x" + neighbor[0] + "y" + neighbor[1]).toggleClass("selected");
        });
      });

      $('.tile').on("click", function() {
        var neighborShiftInfo = []; // Is this being used for anything?
        var neighbors = getNeighbors(this);
        neighbors.forEach(function(neighbor) {
          neighbor = neighbor.split(",");
          neighborShiftInfo.push(neighbor); // ?
          $("#x" + neighbor[0] + "y" + neighbor[1]).remove();
        });
        $.ajax({
          
        });
      });
    });
  }

  function showBoard(game) {
    game.board.forEach(function(column, x) {
      var make_column = '<div class="flex-box" id="row' + x + '"></div>';
      $("#board").append(
        make_column
      );
      column.forEach(function(space, y) {
        $("#row" + x).append(
          '<button class="btn btn-game tile btn-primary"' +
          'data-x="' + x + '"' +
          'data-y="' + y + '"' +
          'data-color="' + space.color + '"' +
          'style="background-color:' + space.color + '"' +
          'id="x' + x + 'y' + y + '"' +
          '>' + space.letter + '</button>'
        );
      });
    });
    spaceBindings();
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

    if (y >= -1) { neighbors.push(nAbove); }
    if (y <= 8)  { neighbors.push(nBelow); }
    if (x >= -1) { neighbors.push(nLeft); }
    if (x <= 9)  { neighbors.push(nRight); }
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
