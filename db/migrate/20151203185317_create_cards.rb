class CreateCards < ActiveRecord::Migration
  def change
    create_table :cards do |t|
      t.column :price, :int
      t.column :name, :string
      t.column :type, :string
      t.column :effect, :string
      t.timestamps null: false
    end
  end
end
