class CardDoubledip < Card
  def activate(game, player)
    game.gamestate['turn_state'] = 'pick_letters'
    player['gold'] -= self.price
  end
end
