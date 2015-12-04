class CardHeal < Card
  def activate(game, player)
    player['gold'] -= self.price
    heal = 20 < (player["max_health"] - player["current_health"]) ? 20 : player["max_health"] - player['current_health']
    player["current_health"] += heal
  end
end
