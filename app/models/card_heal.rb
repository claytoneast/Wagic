class CardHeal < Card
  def activate(game, user)
    player = game.gamestate['players'][user]
    player['gold'] -= self.price
    heal = 20 < (player["max_health"] - player["current_health"]) ? 20 : player["max_health"]
    binding.pry
    player["current_health"] += heal
  end
end
