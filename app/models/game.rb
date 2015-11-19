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
        "player1id": "",
        "player1hand": []
      },
      "player2": {
        "player2id": "",
        "player2hand": []
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
    return true if self.users.include?(check_user)
    return false if !self.users.include?(check_user)
  end

  def add_player(user)
    unless user_check(user)
      self.users.push(user)
      if self.gamestate["player1"]["player1id"] == ""
        self.gamestate["player1"]["player1id"] = user.id
      elsif
        self.gamestate["player2"]["player2id"] == ""
          self.gamestate["player2"]["player2id"] = user.id
      end
    end
    self.save
  end

  def get_letters(space, user)
    block = getBlock(space)
    letters_to_hand(block, user)
  end

  def letters_to_hand(spaces, user)
    spaces.each do |space|
      #loop through spaces, find each one in db, remove it from the map.
      working_column = self.gamestate["board_state"]["array"][space[:coordX].to_i]
      json_user = which_player(user)
      gotten_space = working_column.delete_at(space[:coordY].to_i)
      self.gamestate[json_user][json_user + 'hand'] << gotten_space
      working_column.each do |change_space|
        # if the change_space Y index is...lower than the Y index of gotten_space, then we push its coordinates up by one
        if change_space["coordY"] < gotten_space["coordY"]
          y = change_space["coordY"].to_i
          y += 1
          change_space["coordY"] = y.to_s
        end
      end
      self.save
      #then, each space above it, iterate those coords by one
      #then push in a new space above
    end
  end

  def which_player(user)
      return "player1" if self.gamestate["player1"]["player1id"] == user.id
      return "player2" if self.gamestate["player2"]["player2id"] == user.id
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
    self.gamestate["board_state"]["array"][coords[0]][coords[1]]
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
    return neighbors.compact
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
