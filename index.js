var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});

app.use('/public', express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

/*app.post('/public', function(req, res){
  if(req.body.name === 'Olga' && req.body.password === 'olga') {
    res.send('ok');
  } else {
    res.send('some mistake');
  }
});*/

let numUsers = 0;

io.on('connection', (socket) => {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });

  });

  socket.on('add user', (username) => {
    if (addedUser) return;

    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      username: socket.username,
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});

