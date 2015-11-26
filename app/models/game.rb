class Game < ActiveRecord::Base
  has_and_belongs_to_many :users

  before_create :set_gamestate
  def set_gamestate

    initial_board = {
      "board_state": {
        "array": [
        ]
      },
      "turn": "player1",
      "players": {
        "player1": {
          "id": "",
          "health": 50,
          "name": "player1",
          "hand": []
        },
        "player2": {
        "id": "",
        "health": 50,
        "name": "player2",
        "hand": []
        }
      }
    }
    game_board = initial_board[:board_state][:array]
    8.times do |i|
      game_board << []
      8.times do |j|
        game_board[i] << { color: "#{random_color}", x: "#{i}", y: "#{j}", letter: "#{random_letter}"}
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

  def random_space_in_column(column)
    jspace = JSON.parse({ "color": "#{random_color}", "x": "#{column}", "y": "", "letter": "#{random_letter}"}.to_json)
  end

  def user_check(check_user)
    return true if self.users.include?(check_user)
    return false if !self.users.include?(check_user)
  end

  def add_player(user)
    unless user_check(user)
      self.users.push(user)
      if self.gamestate["players"]["player1"]["id"] == ""
        self.gamestate["players"]["player1"]["id"] = user.id
      elsif
        self.gamestate["players"]["player2"]["id"] == ""
          self.gamestate["players"]["player2"]["id"] = user.id
      end
    end
    self.save
  end

  def wagic_word(word, user)
    j_user = which_player(user)
    hand = self.gamestate['players'][j_user]["hand"]
    word = word.split(",")
    word.map! { |l| l.split(".") }
    word = word.each_with_index.map { |space, i| space = {color: space[0], letter: space[1]}}
    parsed_word = word_array_to_string(word)
    if letters_against_hand(word, hand) != false && scrabble_word?(parsed_word)
        score_word(parsed_word, j_user)
        remove_letters_from_hand(word, hand)
        return parsed_word
    else
      return false
    end
  end

  def word_array_to_string(word)
    concat_w =  []
    word.map {|item| concat_w << item[:letter]}
    parsed_word = concat_w.join
  end

  def remove_letters_from_hand(word, hand)
    word.each do |letter|
      hand.each do |space|
        if space["color"] == letter[:color] && space["letter"] == letter[:letter]
          hand.delete(space)
         break
       end
      end
    end
  end

  def score_word(word, user)
    word = word.split('')
    score = 0
    scores = {  'a': 1,
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
              }
  word.each { |letter| score += scores[letter.to_sym] }
  self.gamestate['players'][user]['health'] += score
  end

  def scrabble_word?(word)
    Word.exists?(name: word)
  end

  def letters_against_hand(word, hand)
    found = []
    word.each do |letter|
      hand.each do |space|
        if space["color"] == letter[:color] && space["letter"] == letter[:letter]
          found << space
          break
        end
      end
    end
    if found.length == word.length
      return found
    else
      return false
    end
  end

  def get_letters(space, user)
    tileCoords = space.split(",")
    tileCoords.map! { |item| item.to_i}
    block = getBlock(coordsToSpace(tileCoords))
    letters_to_hand(block, user)
    self.save
  end

  def letters_to_hand(spaces, user)
    json_user = which_player(user) # find the players json identifer
    hand = self.gamestate["players"][json_user]['hand'] #get player hand
    spaces.sort! { |a,b | a["y"] <=> b["y"] }
    def push_spaces(chosen_spaces, hand)
      chosen_spaces.each do |space|
        board_column = self.gamestate["board_state"]["array"][space["x"].to_i]
        board_column.delete_if { |item| hand << item if item["y"] == space["y"] }
        if hand.length > 14
          (hand.length - 14).times { hand.shift }
        end
      end
    end
    if hand.empty?
      push_spaces(spaces, hand)
    elsif hand.first["color"] == spaces.first["color"]
      push_spaces(spaces, hand)
    else
      hand.clear
      push_spaces(spaces, hand)
    end
    self.save
    add_spaces
    adjust_spaces
  end

  def adjust_spaces
      board = self.gamestate["board_state"]["array"]
      board.each do |column|
          column.each_with_index do |space, index|
            space["y"] = (index.to_s)
          end
      end
  end

  def add_spaces
    board = self.gamestate["board_state"]["array"]
    board.each_with_index do |column, index|
      if column.length < 8
        (8-column.length).times {column.unshift(random_space_in_column(index))}
      end
    end
    self.save
  end

  def which_player(user)
      return "player1" if self.gamestate["players"]["player1"]["id"] == user.id
      return "player2" if self.gamestate["players"]["player2"]["id"] == user.id
  end

  def switch_turn
    if self.gamestate['turn'] == "player1"
      self.gamestate['turn'] = "player2"
    elsif self.gamestate['turn'] == "player2"
      self.gamestate['turn'] = "player1"
    end
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
    coords = [space["x"].to_i, space["y"].to_i]
  end

  def coordsToSpace(coords)
    self.gamestate["board_state"]["array"][coords[0]][coords[1]]
  end

  def getNeighbors(space)
    intCoords = spaceToCoords(space)
    neighbors = []
    above = [intCoords[0], intCoords[1]-1]
    below = [intCoords[0], intCoords[1]+1]
    left = [intCoords[0]-1, intCoords[1]]
    right = [intCoords[0]+1, intCoords[1]]
    neighbors << coordsToSpace(above)  if intCoords[1] > 0
    neighbors << coordsToSpace(below)  if intCoords[1] < 7
    neighbors << coordsToSpace(left)   if intCoords[0] > 0
    neighbors << coordsToSpace(right)  if intCoords[0] < 7
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

  def as_json(opts={})
    { board: gamestate["board_state"]["array"], players: gamestate["players"], turn: gamestate["turn"] }
  end

end
