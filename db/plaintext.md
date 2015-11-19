going to build a 3x3 grid of squares. squares will be stored as a board object, as two-dimensional
array. ajax'ed request to the server to change the state of the squares. then polling to update the state
of the game based on the server status of the squares. which will be true or false to begin with.

delete:
which columns did we delete from, grab array of column id, make sure unique
how many did we delete in each column
increment the data & ids of each thing in that row that we did not delete, by the number of
things we did delete
