class Word < ActiveRecord::Base
  validates :name, presence: true

  def self.populate_list
    Word.delete_all
    File.foreach("db/seeds/wordlist.txt").with_object([]) do |word|
      begin
        Word.create(name: word.chomp)
      rescue ActiveRecord::RecordNotUnique
      end
    end
  end
end
