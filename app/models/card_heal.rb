class CardHeal < Card
  def activate(game, player)
    player['gold'] -= self.price
    heal = 15 < (player["max_health"] - player["current_health"]) ? 15 : player["max_health"] - player['current_health']
    player["current_health"] += heal
  end

  def deactivate(game)

  end
end
