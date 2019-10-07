var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
connections = [];
users = [];

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

//let numUsers = 0;

io.sockets.on('connection', (socket) => {
  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);

  //Disconnect
  socket.on('disconnect', (data) => {
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected', connections.length);
  });

  //send message
  socket.on('send message', (data) => {
    io.sockets.emit('new message', {msg: data, user: socket.username});
  });

  //new user
  socket.on('new user', function(data, cb){
    cb(true);
    socket.username = data.user;
    users.push(socket.username);
    updateUsernames();
  });

  function updateUsernames(){
    io.sockets.emit('get users', users);
  } 
});
