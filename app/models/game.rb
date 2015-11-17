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
        game_board[i] << { color: "blue", coordX: "#{i}", coordY: "#{j}"}
      end
    end
    game_board.to_json
    self.gamestate = game_board
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
