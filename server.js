var express = require('express');
var app = express();
var server = app.listen(process.env.PORT || 3000, listen);

function listen() {
  var host = server.address().address;
  var port = server.address().port;
  //console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));

var io = require('socket.io')(server);

let BOARD;
let PAWNS;
let kill = 0;

io.sockets.on('connection', function(socket) {
  //console.log("We have a new client: " + socket.id);

  socket.on('state', function(Board, Pawns) {
    BOARD = Board;
    PAWNS = Pawns;
    io.sockets.emit('new state', BOARD, PAWNS);
  });

  socket.on('kill state', function(Board, Pawns) {
    BOARD = Board;
    PAWNS = Pawns;
    kill++;
    console.log(kill);
    io.sockets.emit('new kill state', BOARD, PAWNS);
  });
  
  socket.on('move', function(targetPos) {
    let newPos = { x: targetPos.x, y: targetPos.y, oldX: targetPos.oldX, oldY: targetPos.oldY };
    io.sockets.emit('animate', newPos); // Broadcast to all clients
  });

  socket.on('disconnect', function() {
    //console.log("Client has disconnected");
  });
});
