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
    spaces.sort! { |a,b | a["coordY"] <=> b["coordY"] }
    json_user = which_player(user) # find the player
    spaces.each do |space| # for each space to be added to hand
      working_column = self.gamestate["board_state"]["array"][space["coordX"].to_i] #find out which column its in on the board
      gotten_space = working_column.delete_at(space["coordY"].to_i) # take the space out of the column
      self.gamestate[json_user][json_user + 'hand'] << gotten_space # push the space into the users hand
      working_column.each do |change_space| # now, for each space left in the column
        if change_space["coordY"].to_i < gotten_space["coordY"].to_i # if the space was higher than the remove spaced
          y = change_space["coordY"].to_i
          y += 1
          change_space["coordY"] = y.to_s # increment the spaces coordY by one, pushing it down the board for data sake
        end
      end
    end

    spaces.each do |space| # for each space to be added to hand
      working_column = self.gamestate["board_state"]["array"][space["coordX"].to_i] #find out which column its in on the board
      # then run add space for however many times the column is short of spaces
      times_to_run = 8-working_column.length # if 6 long, 0-5, will run twice
      times_to_run.times {add_space(space["coordX"].to_i)}
    end
    # do the same loop through spaces again, but this time push in new spaces at their proper place
    #now the amount of spaces we'e removed, we need to push back in
    # spaces_back = spaces.length + 1 #how many times to push in a new space
    # spaces_back.times {self.add_space(space["coordX"].to_i)} # pass in the x coord for the column
    self.save
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
    colorQueryAgainst = space["color"]
    same_neighbors = []
    all_neighbors.each do |neighbor|
      same_neighbors << neighbor if neighbor["color"] == colorQueryAgainst
    end
    return same_neighbors
  end

end

# currently trying to figure out why the fuck sameneighbors aren't returning everything there
# colorQueryAgainst was using space[:color] instead of space["color"] which sometimes works sometimes doesnt
# binding line 157 very useful. ++++++++++++++ FIXED

# now, why isn't it pushing the correct colors into the block. is it because the board is fucked from the previous move?
# block works the first time, gets totally fucked up the second time because of board being incomplete
# board needs to push in new pieces the first time, that should fix it.

# first time, it always works and repopulates correctly
# second time, it is grabbing the spaces correctly, previous to pushing them to the hand
# pushed to hand correctly on opposite side of board from the first move.
# third time, grabbed correct

# its breaking when it goes to push these letters into the hand.
# its deleting the previous space, making the coordinates go wonk if there
# is another space in that column it has to delete. It needs to sort the spaces
# so that the first ones it encounters are the ones on top

# also, when in database, nothing is actually JSON its all hash notation stuff. So....all of that
# needs to be JSON somehow. Store in JSON. Work with it in object notation, parsed JSON. then parsedit back
