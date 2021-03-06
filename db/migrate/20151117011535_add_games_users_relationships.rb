class AddGamesUsersRelationships < ActiveRecord::Migration
  def change
    create_table :games_users do |t|
      t.belongs_to :game, index: true
      t.belongs_to :user, index: true
    end

    create_table :games do |t|
      t.column :gamestate, :json
      t.column :active, :boolean
      t.timestamps null: false
    end
  end
end
