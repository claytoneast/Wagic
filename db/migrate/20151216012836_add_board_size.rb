class AddBoardSize < ActiveRecord::Migration
  def change
    add_column(:games, :board_size, :int)
  end
end
