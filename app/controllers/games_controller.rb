class GamesController < ApplicationController

  before_action :fetch_game_and_user, only: [:show, :join_game, :pick_letters, :game_board, :wagic_word, :destroy_space, :switch_turn]

  def create
    @game = Game.create
    @game.add_player(current_user)
    redirect_to game_path(@game)
  end

  def show
    @game_state = @game.gamestate
  end

  def index
    @games = Game.limit(100)
  end

  def join_game
    @game.add_player(current_user)
    redirect_to game_path(@game)
  end

  def pick_letters
    @game.get_letters(params[:tile], current_user)
    render json: {game: @game, user: @user}
  end

  def game_board
    render json: {game: @game, user: @user}
  end

  def wagic_word
    word = @game.wagic_word(params[:word], @user)
    if word === false
      render json: false
    else
      render json: {game: @game, user: @user}
    end
  end

  def destroy_space
    @game.destroy_space(params[:tile])
    render json: {game: @game, user: @user}
  end

  def switch_turn
    @game.switch_turn
    render json: {game: @game, user: @user}
  end

  private
  def fetch_game_and_user
    @game = Game.find(params[:game_id] || params[:id])
    @user = @game.which_player(current_user) if current_user
  end

end
