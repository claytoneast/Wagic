class CardRandomonium < Card
  def activate(game, player)
    g = game.gamestate
    disabled = [];
    all = [];
    7.times do |i|
      all.concat(g['board_state'][i-1])
    end
    15.times do
      disabled << all.delete_at(Random.rand(all.length))
    end
    g['events'] << {
      name: 'randomoniumCard',
      start: g['turn_count'],
      duration: 1,
      tiles: disabled
    }
    g['players'][player['name']]['gold'] -= self.price
  end
end
