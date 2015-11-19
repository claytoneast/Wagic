class GamesController < ApplicationController
  def new
    @game = Game.new
    @game.users.push(current_user)
    if @game.save
      redirect_to game_path(@game)
    else
      render 'index'
    end
  end

  def show
    @game = Game.find(params[:id])
    @game_state = @game.gamestate
  end

  def index
    @games = Game.all
  end

  def create

  end

  def update
    game = Game.find(params[:id])
    game.update_board(params[:data], current_user)
    @game_state = game.gamestate
    render
  end
end
