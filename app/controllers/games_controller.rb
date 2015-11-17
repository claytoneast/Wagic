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
    if params[:data]
      locationX = params[:data][:coordX].to_i
      locationY = params[:data][:coordY].to_i
      space = game.gamestate["board_state"]["array"][locationX][locationY]
      if space["state"] == "true"
        space["state"] = "false"
      elsif space["state"] == "false"
        space["state"] = "true"
      end
      game.save
      redirect_to game_path(game)
    else
      game.users.push(current_user)
      if game.save
        redirect_to game_path
      else
        render "update"
      end

    end
  end
end
