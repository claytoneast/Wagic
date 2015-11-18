console.log('init')
$(document).ready(function(){
  $('a').hover(function(){
    space = $(this)
    space.toggleClass('selected')
    thisColor = getColor(space);
    thisCoords = getCoords(space);
    sameSameNeighbors = allSameNeighbors(thisCoords, thisColor);
    // neighbors = findAllNeighbors(getCoords(space))
    // sameNeighbors = colorNeighbors(neighbors, color);
  });
});


  var connectedNeighbors = [];
function allSameNeighbors(coords, color) {
  neighbors = findAllNeighbors(coords);
  sameNeighbors = colorNeighbors(neighbors, color);
  // debugger;
  sameNeighbors.forEach(function(neighbor) {
    connectedNeighbors.push(neighbor)
    neighborCoords = getCoords(neighbor);
    neighborColor = getColor(neighbor)
    allSameNeighbors(neighborCoords, neighborColor)
  });
  console.log(connectedNeighbors)
  return connectedNeighbors;
  // debugger;
  // going to take a space, and call find its neighbors.
  // then going to find all its same-colored neighbors
  // then going to take each of these same colored neighbors
  // and pass them into itself to find all of its same-colored neighbors

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

var findAllNeighbors = function (coords) {
  var neighbors = [];
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
