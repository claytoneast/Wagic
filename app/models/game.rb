class Game < ActiveRecord::Base
  has_and_belongs_to_many :users

  before_create :set_gamestate
  def set_gamestate

    initial_board = {
      "board_state": {
        "array": [

        ]
      },
      "player1": {
        "player1id": ""
      }
    }
    game_board = initial_board[:board_state][:array]
    8.times do |i|
      game_board << []
      8.times do |j|
        game_board[i] << { color: "#{random_color}", coordX: "#{i}", coordY: "#{j}", letter: "#{random_letter}"}
      end
    end
    game_board.to_json
    self.gamestate = initial_board
    binding.pry
  end

  def random_letter
    letters = ["e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "t", "t", "t", "t", "t", "t", "t", "t", "t", "a", "a", "a", "a", "a", "a", "a", "a", "o", "o", "o", "o", "o", "o", "o", "o", "i", "i", "i", "i", "i", "i", "i", "n", "n", "n", "n", "n", "n", "n", "s", "s", "s", "s", "s", "s", "h", "h", "h", "h", "h", "h", "r", "r", "r", "r", "r", "r", "d", "d", "d", "d", "l", "l", "l", "l", "c", "c", "c", "u", "u", "u", "m", "m", "w", "w", "f", "f", "g", "g", "y", "y", "p", "p", "b", "b", "v", "k", "j", "x", "q", "z"]
    letters.sample
  end


  def random_color
    colors = ['blue', 'green', 'red', 'orange']
    colors.sample
  end

  def user_check(check_user)
    self.users.each do |user|
      if user == check_user
        return true
      else
        return false
      end
    end
  end

  def update_board(space, user)
    block = getBlock(space)
    binding.pry
  end

  def getBlock(space)
    def recursiveGetBlock(spaces, masterBlock)
      colorBlock = []
      spaces.each do |space|
        unless masterBlock.include?(space)
          masterBlock << space
          colorBlock << space
          neighbors = getNeighbors(space)
          sameNeighbors = sameColorNeighbors(neighbors, space) #now we have db objects of same neighbors
          recursiveGetBlock(sameNeighbors, masterBlock) if sameNeighbors.length > 0
        end
      end
    end

    masterBlock = []
    recursiveGetBlock([space], masterBlock)
    return masterBlock
  end

  def spaceToCoords(space)
    coords = [space["coordX"].to_i, space["coordY"].to_i]
  end

  def coordsToSpace(coords)
    self.gamestate[coords[0]][coords[1]]
  end

  def getNeighbors(space)
    intCoords = spaceToCoords(space)
    neighbors = []
    if intCoords[1]-1 >= 0
      above = [intCoords[0], intCoords[1]-1]
      neighbors << coordsToSpace(above)
    end
    if intCoords[1]+1 <= 7
      below = [intCoords[0], intCoords[1]+1]
      neighbors << coordsToSpace(below)
    end
    if intCoords[0]-1 >= 0
      left = [intCoords[0]-1, intCoords[1]]
      neighbors << coordsToSpace(left)
    end
    if intCoords[0]+1 <= 7
      right = [intCoords[0]+1, intCoords[1]]
      neighbors << coordsToSpace(right)
    end
    return neighbors
  end

  def sameColorNeighbors(all_neighbors, space)
    colorQueryAgainst = space[:color]
    same_neighbors = []
    all_neighbors.each do |neighbor|
      same_neighbors << neighbor if neighbor["color"] == colorQueryAgainst
    end
    return same_neighbors
  end

end
