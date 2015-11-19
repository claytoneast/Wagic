console.log('init')
$(document).ready(function(){

  $(".tile-wrapper").on({
    mouseenter: function() {
      space = $(this);
      sameNeighbors = arrayCheckLayer(space);
      sameNeighbors.forEach(function(neighbor) {
        neighbor = neighbor.split(",");
        $("#coordX" + neighbor[0] + "coordY" + neighbor[1]).toggleClass("selected");
      });
    },
    mouseleave: function() {
      space = $(this);
      sameNeighbors = arrayCheckLayer(space);
      sameNeighbors.forEach(function(neighbor) {
        neighbor = neighbor.split(",");
        $("#coordX" + neighbor[0] + "coordY" + neighbor[1]).toggleClass("selected");
      });
    }
  }, ".tile");

  $('.tile-wrapper').on("click", ".tile", function() {
    space = $(this)
    neighborShiftInfo = []
    sameNeighbors = arrayCheckLayer(space);
    sameNeighbors.forEach(function(neighbor) {
      neighbor = neighbor.split(",");
      neighborShiftInfo.push(neighbor);
      $("#coordX" + neighbor[0] + "coordY" + neighbor[1]).remove();
    });

  });


});

function updateBoard(deletedBlocks) {
  // this function needs to go into the json of the game board object,
  // and then figure out how to modify that data. how do I get this json here...
}

function arrayCheckLayer(space) {
  masterCheckArray = [];
  getBlock([space]);
  function getBlock(spaces) {
    colorBlock = [];
    spaces.forEach(function(space) {
      // if space isn't already in the masterCheckArray, then push it there, then check it. else nothing.
      if (masterCheckArray.indexOf(flatSpace(space)) <= -1) { // if not in there do this
        masterCheckArray.push(flatSpace(space)); // push into check array
        colorBlock.push(space);
        neighbors = findAllNeighbors(space); // returns coordinates, not UI objects
        sameNeighbors = colorNeighbors(neighbors, getColor(space)); // returns an array
        if (sameNeighbors.length > 0) { // if this array has something in it then send it to getBlock
          getBlock(sameNeighbors);
        } else {
          return
        }
      } else {
        return
      }
    });
    return colorBlock;
  }
  console.log(masterCheckArray)
  return masterCheckArray
}

function flatSpace(space) {
  return getCoords(space).toString();
}

var colorNeighbors = function (neighbors, color) {
  var sameColorNeighbors = []
  neighbors.forEach(function(neighbor) {
    foundNeighbor = $('#coordX' + neighbor[1] + 'coordY' + neighbor[2])
    if (getColor(foundNeighbor) == color) {
      sameColorNeighbors.push(foundNeighbor)
    }
  });
  return sameColorNeighbors
}

var findAllNeighbors = function (space) {
  var neighbors = [];
  coords = getCoords(space);
  if (coords[1]-1 >= 0) {
    nAbove = ['above', coords[0], coords[1]-1]
    neighbors.push(nAbove)
  }
  if (coords[1]+1 <= 7) {
    nBelow = ['below', coords[0], coords[1]+1]
    neighbors.push(nBelow)
  }
  if (coords[0]-1 >= 0) {
    nLeft = ['left', coords[0]-1, coords[1]]
    neighbors.push(nLeft)
  }
  if (coords[0]+1 <= 7) {
    nRight = ['right', coords[0]+1, coords[1]]
    neighbors.push(nRight)
  }
  return neighbors
}

var getCoords = function(element) {
  coordX = parseInt($(element).attr('data-coordX'));
  coordY = parseInt($(element).attr('data-coordY'));
  return [coordX, coordY];
}
var getColor = function(element) {
  color = $(element).attr('data-color');
  return color;
}
