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

  # rails will automatically create these if they dont exist

  # def create

  # end

  # def update

  # end

  def join_game
    @game = Game.find(params[:game_id])
    @game.add_player(current_user)
    redirect_to game_path(@game)
  end

  def pick_letters
    @game = Game.find(params[:game_id])
    user = @game.which_player(current_user)
    @game.get_letters(params[:tile], current_user)
    respond_to do |format|
      format.js
      format.json { render :json => {game: @game, user: user} }
      format.html {redirect_to game_path(@game)}
    end
  end

  def game_board
    @game = Game.find(params[:game_id])
    user = @game.which_player(current_user)
    respond_to do |format|
      format.json { render :json => {game: @game, user: user} }
    end
  end

  def wagic_word
    game = Game.find(params[:game_id])
    game.wagic_word(params[:word], current_user)
  end
end
