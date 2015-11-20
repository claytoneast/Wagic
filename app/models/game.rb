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

  # take space, copy it to hand
  #

  def letters_to_hand(spaces, user)
    spaces.sort! { |a,b | a["coordY"] <=> b["coordY"] }
    json_user = which_player(user) # find the players json identifer
    # column count for each one. whichever column its in, push a number to that array index of a column array
    column_count = Array.new(8) {Hash[count: 0, max_index: 0]}
    spaces.each do |space|
      board_column = self.gamestate["board_state"]["array"][space["coordX"].to_i]
      column_count[space["coordX"].to_i][:count] += 1 #increment column count
      if column_count[space["coordX"].to_i][:max_index] < space["coordY"].to_i
        column_count[space["coordX"].to_i][:max_index] = space["coordY"].to_i
      end
      self.gamestate[json_user][json_user + 'hand'] << space # copy space to player
      # # then for each space above that space, change it
      # board_column.each do |move_space|
      #   ## needs to move spaces down, and for each number of spaces moved in that column, randomized that many on top
      #   if move_space["coordY"].to_i < space["coordY"].to_i #is this space above original?
      #     move_space_above = board_column[space["coordY"].to_i - 1]# get the space just above it
      #     if move_space_above == board_column.last  # if the space is negativeindexed last space, randomized the space
      #       move_space["letter"] = random_letter
      #       move_space["color"] = random_color
      #     else #otherwise
      #       move_space["color"] = move_space_above["color"] #overwrite that fucking thing with whavter is above it
      #       move_space["letter"] = move_space_above["letter"] #overwrite that fucking thing with whavter is above it
      #     end
      #   else #otherwise do fucking nothing
      #   end
      # end
    end
    self.save
    move_space(column_count)
  end

  def delete_spaces(column_count)
    column_count.each_with_index do |column, i|
      db_column = self.gamestate["board_state"]["array"][i]
      column[:count].times {db_column[column[:max_index]]}
    end

  end

  def add_space(column_coordX)
    column = self.gamestate["board_state"]["array"][column_coordX]
    # if removed 2, array is 6 elements long. 0-5 index. coords are 2-7 next element needs to be index of 1. 7- length of array.
    column.unshift({ "color": "#{random_color}", "coordX": "#{column_coordX}", "coordY": "#{7 - column.length}", "letter": "#{random_letter}"})
    self.save
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
          sameNeighbors = sameColorNeighbors(neighbors, space)
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
    colorQueryAgainst = space["color"]
    same_neighbors = []
    all_neighbors.each do |neighbor|
      same_neighbors << neighbor if neighbor["color"] == colorQueryAgainst
    end
    return same_neighbors
  end

end
