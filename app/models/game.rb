class Game < ActiveRecord::Base
  has_and_belongs_to_many :users

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
