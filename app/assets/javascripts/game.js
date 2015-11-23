console.log('init');

// Don't forget to add ; to the end of all your statements. js linters are great for this

$(document).ready(function(){

  // Hover will cover both mouseenter & mouseleave if they are the same function
  $(".tile").on("hover", function() {
    // space = $(this);  //redundant, just use 'this'
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
  });


});

function updateBoard(deletedBlocks) {
  // this function needs to go into the json of the game board object,
  // and then figure out how to modify that data. how do I get this json here...
}

function getNeighbors(space) {
  var checkArray = []; //Be sure to declare your variables in js
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
  console.log(checkArray);
  return checkArray;
}

var colorNeighbors = function (neighbors, color) {
  var sameColorNeighbors = [];
  neighbors.forEach(function(neighbor) {
    foundNeighbor = $('#x' + neighbor[1] + 'y' + neighbor[2]);
    if (getColor(foundNeighbor) == color) {
      sameColorNeighbors.push(foundNeighbor);
    }
  });
  return sameColorNeighbors;
};

var findAllNeighbors = function (space) {
  var neighbors = [];
  coords = getCoords(space);
  // Use Else If's to prevent js from reading every line each time. If it find's the matching 'else-if' it will skip all others below.
  if (coords[1]-1 >= 0) {
    nAbove = ['above', coords[0], coords[1]-1];
    neighbors.push(nAbove);
  } else if (coords[1]+1 <= 7) {
    nBelow = ['below', coords[0], coords[1]+1];
    neighbors.push(nBelow);
  } else if (coords[0]-1 >= 0) {
    nLeft = ['left', coords[0]-1, coords[1]];
    neighbors.push(nLeft);
  } else if (coords[0]+1 <= 7) {
    nRight = ['right', coords[0]+1, coords[1]];
    neighbors.push(nRight);
  }
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
