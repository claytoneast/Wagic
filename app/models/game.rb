class Game < ActiveRecord::Base
  has_and_belongs_to_many :users
  before_save :stamp

  before_create :set_gamestate
  def set_gamestate
    initial_board = {
      board_state: [],

      turn: 'player1',
      won: 'false',
      turn_state: 'pick_letters',
      ts: Time.now.to_f * 1000,
      time_since_switch: '',
      players: {
        player1: {
          id: '',
          current_health: 100,
          max_health: 100,
          experience: 0,
          level: 1,
          gold: 0,
          name: 'player1',
          history: '',
          hand: []
        },
        player2: {
        id: '',
        current_health: 100,
        max_health: 100,
        experience: 0,
        level: 1,
        gold: 0,
        name: 'player2',
        history: '',
        hand: []
        }
      }
    }
    game_board = []
    8.times do |i|
      game_board << []
      8.times do |j|
        game_board[i] << { color: random_color, x: i, y: j, letter: random_letter }
      end
    end
    initial_board[:board_state] = game_board
    self.gamestate = initial_board
  end

  def random_letter
    letters = ['e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 't', 't', 't', 't', 't', 't', 't', 't', 't', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'i', 'i', 'i', 'i', 'i', 'i', 'i', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 's', 's', 's', 's', 's', 's', 'h', 'h', 'h', 'h', 'h', 'h', 'r', 'r', 'r', 'r', 'r', 'r', 'd', 'd', 'd', 'd', 'l', 'l', 'l', 'l', 'c', 'c', 'c', 'u', 'u', 'u', 'm', 'm', 'w', 'w', 'f', 'f', 'g', 'g', 'y', 'y', 'p', 'p', 'b', 'b', 'v', 'k', 'j', 'x', 'q', 'z']
    letters.sample
  end

  def random_color
    colors = ['blue', 'red', 'orange']
    colors.sample
  end


  def win_game
    self.gamestate['players']['player1']['health'] -= 150
    self.check_won
  end

  def p1gold(i)
    self.gamestate['players']['player1']['gold'] += i
    self.save
  end
  def p2gold(i)
    self.gamestate['players']['player2']['gold'] += i
    self.save
  end
  def p1health(i)
    self.gamestate['players']['player1']['current_health'] += i
    self.save
  end
  def p2health(i)
    self.gamestate['players']['player2']['current_health'] += i
    self.save
  end
  def p1xp(i)
    self.gamestate['players']['player1']['experience'] += i
    self.check_level
    self.save
  end
  def p2xp(i)
    self.gamestate['players']['player2']['experience'] += i
    self.check_level
    self.save
  end

  def random_space_in_column(column)
    jspace = { color: random_color, 'x': "#{column}", 'y': '', 'letter': random_letter }
  end

  def user_check(check_user)
    self.users.include?(check_user)
  end

  def add_player(user)
    g = self.gamestate
    unless user_check(user)
      self.users.push(user)
      if g['players']['player1']['id'] == ''
        g['players']['player1']['id'] = user.id
      elsif g['players']['player2']['id'] == ''
        g['players']['player2']['id'] = user.id
      end
    end
    g['time_since_switch'] = Time.zone.now
    self.save
  end

  def wagic_word(word, user)
    hand = self.gamestate['players'][user]['hand']
    word = word.split(',').map { |l| l.split('.') }
    word = word.map { |space| {color: space[0], letter: space[1]}}
    parsed_word = word_array_to_string(word)
    if letters_against_hand(word, hand) != false && scrabble_word?(parsed_word)
      score = score_word(parsed_word, user)
      play_word(word.first[:color], score, user)
      remove_letters_from_hand(word, hand)
      check_won
      check_level
      self.gamestate['players'][user]['history'] = parsed_word
      self.save
      return parsed_word
    else
      return false
    end
  end

  def check_won
    p1 = self.gamestate['players']['player1']
    p2 = self.gamestate['players']['player2']
    if p2['current_health'] < 1 || p1['gold'] == 200
      self.gamestate['won'] = 'player1'
    elsif p1['current_health'] < 1 || p2['gold'] == 200
      self.gamestate['won'] = 'player2'
    end
    self.save
  end

  def check_level
    self.gamestate['players'].each do |player|
      player[1]['level'] = (player[1]['experience'] / 29.9).ceil if player[1]['experience'] > 0
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
        if space['color'] == letter[:color] && space['letter'] == letter[:letter]
          hand.delete(space)
         break
       end
      end
    end
  end

  def score_word(word, user)
    word = word.split('')
    score = 0
    scores = {  a: 1,
                b: 3,
                c: 3,
                d: 2,
                e: 1,
                f: 4,
                g: 2,
                h: 4,
                i: 1,
                j: 8,
                k: 5,
                l: 1,
                m: 3,
                n: 1,
                o: 1,
                p: 3,
                q: 10,
                r: 1,
                s: 1,
                t: 1,
                u: 1,
                v: 4,
                w: 4,
                x: 8,
                y: 4,
                z: 10
              }
    word.each { |letter| score += scores[letter.to_sym] }
    return score
  end

  def play_word(color, score, user)
    player = self.gamestate['players'][user]
    if color == 'green'
      heal = score < (player['max_health'] - player['current_health']) ? score : player['max_health']
      player['health'] += heal
    elsif color == 'red'
      self.gamestate['players']['player2']['current_health'] -= score*player['level'] if user == 'player1'
      self.gamestate['players']['player1']['current_health'] -= score*player['level'] if user == 'player2'
    elsif color == 'orange'
      player['gold'] += score
    elsif color == 'blue'
      player['experience'] += score
    end
  end

  def scrabble_word?(word)
    r = Regexp.new('^' + word.upcase + '\r\n')
    !!open('db/seeds/wordlist.txt') { |f| f.each_line.detect { |l| r.match(l) } }
  end

  def use_card!(card, user)
    card.activate(self, self.gamestate['players'][user])
    self.save
  end

  def can_use?(card, user)
    self.gamestate['players'][which_player(user)]['gold'].to_i >= card.price
  end

  def letters_against_hand(word, hand)
    found = []
    word.each do |letter|
      hand.each do |space|
        if space['color'] == letter[:color] && space['letter'] == letter[:letter]
          found << space
          break
        end
      end
    end
    return found if found.length == word.length
    return false
  end

  def update_user_hand!(space, user)
    block = getBlock(xy_to_space(parse_coords(space)))
    letters_to_hand(block, user)
    self.gamestate['turn_state'] = 'picked_letters'
    self.save
  end

  def destroy_space!(space)
    space = xy_to_space(parse_coords(space))
    self.gamestate['board_state'].each do |column|
      column.delete(space)
    end
    add_spaces
    adjust_spaces
    self.gamestate['turn_state'] = 'picked_letters'
    self.save
  end

  def parse_coords(space)
    space = space.split(',')
    space.map! { |item| item.to_i}
  end

  def letters_to_hand(spaces, user)
    json_user = which_player(user) # find the players json identifer
    hand = self.gamestate['players'][json_user]['hand'] #get player hand
    spaces.sort! { |a,b | a['y'] <=> b['y'] }
    def push_spaces(chosen_spaces, hand)
      chosen_spaces.each do |space|
        board_column = self.gamestate['board_state'][space['x'].to_i]
        board_column.delete_if { |item| hand << item if item['y'] == space['y'] }
        # if hand.length > 14
        #   (hand.length - 14).times { hand.shift }
        # end
      end
    end
    if hand.empty?
      push_spaces(spaces, hand)
    elsif hand.first['color'] == spaces.first['color']
      push_spaces(spaces, hand)
    else
      hand.clear
      push_spaces(spaces, hand)
    end
    add_spaces
    adjust_spaces
  end

  def adjust_spaces
    board = self.gamestate['board_state']
    board.each do |column|
      column.each_with_index do |space, index|
        space['y'] = (index.to_s)
      end
    end
  end

  def add_spaces
    board = self.gamestate['board_state']
    board.each_with_index do |column, index|
      if column.length < 8
        (8-column.length).times {column.unshift(random_space_in_column(index))}
      end
    end
  end

  def which_player(user)
    return 'player1' if self.gamestate['players']['player1']['id'] == user.id
    return 'player2' if self.gamestate['players']['player2']['id'] == user.id
  end

  def switch_turn
    game = self.gamestate
    game['turn_state'] = 'pick_letters'
    game['turn'] = game['turn'] == 'player1' ? 'player2' : 'player1'
    diff = Time.zone.now - Time.parse(game['time_since_switch']) - 30
    if diff >= 0
      xp = 1 + (diff/5).floor
      game['players'][game['turn']]['experience'] += xp
    end
    game['time_since_switch'] = Time.zone.now
    self.check_level
    self.save
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

  def space_to_xy(space)
    coords = [space['x'].to_i, space['y'].to_i]
  end

  def xy_to_space(coords)
    self.gamestate['board_state'][coords[0]][coords[1]]
  end

  def getNeighbors(space)
    intCoords = space_to_xy(space)
    neighbors = []
    above = [intCoords[0], intCoords[1]-1]
    below = [intCoords[0], intCoords[1]+1]
    left = [intCoords[0]-1, intCoords[1]]
    right = [intCoords[0]+1, intCoords[1]]
    neighbors << xy_to_space(above)  if intCoords[1] > 0
    neighbors << xy_to_space(below)  if intCoords[1] < 7
    neighbors << xy_to_space(left)   if intCoords[0] > 0
    neighbors << xy_to_space(right)  if intCoords[0] < 7
    return neighbors.compact
  end

  def sameColorNeighbors(all_neighbors, space)
    colorQueryAgainst = space['color']
    same_neighbors = []
    all_neighbors.each do |neighbor|
      same_neighbors << neighbor if neighbor['color'] == colorQueryAgainst
    end
    return same_neighbors
  end

  def as_json(opts={})
    { board: gamestate['board_state'],
      players: gamestate['players'],
      turn: gamestate['turn'],
      turn_state: gamestate['turn_state'],
      time_since_switch: gamestate['time_since_switch'],
      won: gamestate['won'],
      ts: gamestate['ts']
    }
  end

  def stamp
    gamestate['ts'] = Time.now.to_f if gamestate
  end
end


#
# def self.populate_list
#   Word.delete_all
#   File.foreach('db/seeds/wordlist.txt').with_object([]) do |word|
#     begin
#       Word.create(name: word.chomp)
#     rescue ActiveRecord::RecordNotUnique
#     end
#   end
# end
