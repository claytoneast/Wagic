class GamesController < ApplicationController
  before_action :validate_player, only: [ :pick_letters, :wagic_word, :destroy_space, :switch_turn, :play_card ]
  before_action :fetch_game_and_user, only: [ :show, :join_game, :pick_letters, :game_board, :wagic_word, :destroy_space, :switch_turn, :play_card ]
  before_action :fetch_card, only: [:play_card]

  def create
    @game = Game.create
    @game.add_player(current_user)
    redirect_to game_path(@game)
  end

  def play_card
    if @game.can_use?(@card, current_user)
      @game.use_card!(@card, @user)
      render json: {game: @game, user: @user, card: @card}
    else
      render json: false
    end
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
    @game.update_user_hand!(params[:tile], current_user)
    render json: {game: @game, user: @user}
  end

  def game_board
    if !params['ts'] || @game.gamestate['ts'].to_f > params['ts'].to_f
      render json: {game: @game, user: @user}
    end
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
    @game.destroy_space!(params[:tile])
    render json: {game: @game, user: @user}
  end

  def switch_turn
    @game.switch_turn
    render json: {game: @game, user: @user}
  end

  private

  def fetch_card
    @card = Card.find(params[:card_id])
  end

  def fetch_game_and_user
    @game = Game.find(params[:game_id] || params[:id])
    @user = @game.which_player(current_user) if current_user
  end

  def validate_player
    # check if current user is player 1 or player 2
    # if
    #   head :unauthorized && return
    # end
  end
end
