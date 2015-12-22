class CardCluster < Card
  def activate(game, player)
    game.gamestate['board_state'].each do |column|
      column.clear
    end
    game.add_spaces
    game.adjust_spaces
    game.gamestate['events'] << {
      name: 'clusterCard',
      start: game.gamestate['turn_count'],
      duration: 1
    }
    game.gamestate['players'][player['name']]['gold'] -= self.price
  end
end
