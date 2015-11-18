class AddGamesUsersRelationships < ActiveRecord::Migration
  def change
    create_table :games_users do |t|
      t.belongs_to :game, index: true
      t.belongs_to :user, index: true
    end

    add_column :games, :gamestate, :json
    add_column :games, :active, :boolean

  end
end