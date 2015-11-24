class AddWordList < ActiveRecord::Migration
  def change
    create_table :words do |t|
      t.column :name, :string
    end
    add_index(:words, :name, unique: true)
  end
end
