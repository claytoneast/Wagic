class GamesController < ApplicationController
  def new
    @game = Game.create
    @game.add_player(current_user)
    if @game.save
      redirect_to game_path(@game)
    else
      render 'index'
    end
  end

  def show
    @game = Game.find(params[:id])
    @game_state = @game.gamestate
    @json_user = @game.which_player(current_user)
  end

  def index
    @games = Game.all
  end

  def create

  end

  def update

  end

  def join_game
    @game = Game.find(params[:game_id])
    @game.add_player(current_user)
    redirect_to game_path(@game)
  end

  def choose_letters
    @game = Game.find(params[:game_id])
    @game.get_letters(params[:data], current_user)
    respond_to do |format|
      format.js
      format.json
      format.html {redirect_to game_path(@game)}
    end
  end

  def game_board
    @game = Game.find(params[:game_id])
    respond_to do |format|
      format.json { render :json => @game }
    end
  end

  def make_word

  end
end
