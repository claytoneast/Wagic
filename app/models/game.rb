class Game < ActiveRecord::Base
  has_and_belongs_to_many :users

  before_create :populate_board
  def populate_board

    initial_board = {
      "board_state": {
        "array": [

        ]
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
    self.gamestate = game_board
  end

  def random_letter
    letters = ["e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "t", "t", "t", "t", "t", "t", "t", "t", "t", "a", "a", "a", "a", "a", "a", "a", "a", "o", "o", "o", "o", "o", "o", "o", "o", "i", "i", "i", "i", "i", "i", "i", "n", "n", "n", "n", "n", "n", "n", "s", "s", "s", "s", "s", "s", "h", "h", "h", "h", "h", "h", "r", "r", "r", "r", "r", "r", "d", "d", "d", "d", "l", "l", "l", "l", "c", "c", "c", "u", "u", "u", "m", "m", "w", "w", "f", "f", "g", "g", "y", "y", "p", "p", "b", "b", "v", "k", "j", "x", "q", "z"]
    letters.sample
  end


  def random_color
    colors = ['blue', 'green', 'red', 'orange']
    colors.sample
  end


#     self.gamestate = {
#    "board_state":{
#       "array":[
#          [
#             {
#                "state":"blue",
#                "coordX":"0",
#                "coordY":"0"
#             },
#             {
#                "state":"blue",
#                "coordX":"0",
#                "coordY":"1"
#             },
#             {
#                "state":"blue",
#                "coordX":"0",
#                "coordY":"2"
#             }
#          ],
#          [
#             {
#                "state":"red",
#                "coordX":"1",
#                "coordY":"0"
#             },
#             {
#                "state":"red",
#                "coordX":"1",
#                "coordY":"1"
#             },
#             {
#                "state":"red",
#                "coordX":"1",
#                "coordY":"2"
#             }
#          ],
#          [
#             {
#                "state":"green",
#                "coordX":"2",
#                "coordY":"0"
#             },
#             {
#                "state":"green",
#                "coordX":"2",
#                "coordY":"1"
#             },
#             {
#                "state":"green",
#                "coordX":"2",
#                "coordY":"2"
#             }
#          ]
#       ]
#    }
# }



  def user_check(check_user)
    self.users.each do |user|
      if user == check_user
        return true
      else
        return false
      end
    end
  end

end
