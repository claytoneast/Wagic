class CardRandomonium < Card
  def activate(game, player)
    g = game.gamestate
    disabled = [];
    all = [];
    15.times do
      space = g['board_state'][Random.rand(7)-1][Random.rand(7)-1]
      space['state'] = 0
      disabled << space
    end
    g['events'] << {
      name: 'cardRandomonium',
      id: self.id,
      start: g['turn_count'],
      duration: 1,
      tiles: disabled
    }
    g['players'][player['name']]['gold'] -= self.price
  end

  def deactivate(game)
    game.gamestate['board_state'].each do |col|
      col.each do |space|
        space['state'] = 1 if space['state'] === 0
      end
    end
  end
end
