var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.use(express.static(__dirname + '/public'));

var players=1;

io.on('connection', function(socket){

    console.log(socket.id+' connected'); //this maps to the player
    socket.nickname='player '+players;
    players+=1;
    socket.on('chat message', function(msg){
        io.emit('chat message', socket.nickname+' '+msg);
    });

    socket.on('reset game', function(){
        init();
        io.emit('board setup', board)
    });
    socket.on('disconnect', function(){
        console.log(socket.id+' disconnected');
    });

    socket.on('select group', function(group){
        for(i=0;i<group.length;i++){
            board.letters[group[i]]=(alphabets[Math.floor((Math.random() * (alphabets.length)) )]);
            board.colors[group[i]]=(colors[Math.floor((Math.random() * (colors.length)) )])
        }
        io.emit('board setup', board)
    })

    //intialize board
    io.emit('board setup', board)

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});


//setup game board
var alphabets = ["a","a","a","a","a","a","a","a","a","b","b","c","c","c","c","d","d","d","d","d","e","e","e","e","e","e","e","e","e","e","e","e","e","f","f","f","f","g","g","g","g","h","h","h","h","h","h","h","i","i","i","i","i","i","i","i","i","j","k","k","l","l","l","l","l","m","m","m","m","n","n","n","n","n","n","n","n","o","o","o","o","o","o","o","o","p","p","p","qu","r","r","r","r","r","r","r","s","s","s","s","s","s","s","t","t","t","t","t","t","t","t","t","t","u","u","u","u","v","v","w","w","w","w","x","y","y","y","z"];

var board={};

var colors=["red","blue", "green"]

function init(){
    board={
        rows:8,
        columns:8,
        letters:[],
        colors:[]
    }
    for(r=0;r<board.rows;r++){
        for(c=0; c<board.columns; c++){
            board.letters.push(alphabets[Math.floor((Math.random() * (alphabets.length)) )]);
            board.colors.push(colors[Math.floor((Math.random() * (colors.length)) )])
        }
    }
}


init();

