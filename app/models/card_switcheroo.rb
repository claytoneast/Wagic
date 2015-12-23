class CardSwitcheroo < Card
  def activate(game, player)
    players = game.gamestate['players']
    hand2 = players['player2']['hand']
    players['player2']['hand'] = players['player1']['hand']
    players['player1']['hand'] = hand2
    players[player['name']]['gold'] -= self.price
  end

  def deactivate(game)

  end
end
