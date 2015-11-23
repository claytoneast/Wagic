going to build a 3x3 grid of squares. squares will be stored as a board object, as two-dimensional
array. ajax'ed request to the server to change the state of the squares. then polling to update the state
of the game based on the server status of the squares. which will be true or false to begin with.

delete:
which columns did we delete from, grab array of column id, make sure unique
how many did we delete in each column
increment the data & ids of each thing in that row that we did not delete, by the number of
things we did delete


<div class="flex-wrap tile-wrapper">
<% @game_state["board_state"]["array"].each do |horizontal| %>
  <div class="flex-box" id="row<%= horizontal.first['coordX'] %> ">
    <% horizontal.each do |vertical| %>
      <a href=""></a>
      <%= button_to vertical['letter'],
      game_choose_letters_path(@game.id, data: vertical),
      class: 'btn btn-primary btn-game tile',
      id: "coordX#{vertical["coordX"]}coordY#{vertical["coordY"]}",
      data: {
        coordX: vertical['coordX'],
        coordY: vertical['coordY'],
        color: vertical['color']},
      style: "background-color:#{vertical["color"]}" %>
    <% end %>

  </div>
<% end %>
</div>
