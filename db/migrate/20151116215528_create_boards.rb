class CreateBoards < ActiveRecord::Migration
  def change
    create_table :boards do |t|

      t.timestamps null: false
    end
    create_table :games do |t|
      
      t.timestamps null: false
    end
  end
end
