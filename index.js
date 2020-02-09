const express = require('express');
const SocketIO = require('socket.io');
const path = require('path');
const app = express();

// settings
app.set('port', process.env.PORT || 3000);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Start server
const server = app.listen(app.get('port'), 
  () => console.log(`Server running at port ${app.get('port')}`));
  
// Socket.IO
let numUsers = 0;

const io = SocketIO(server);
io.on('connection', (socket) => {
  console.log('New connection: ' + socket.id);
  
  let addedUser = false;

  socket.on('chat:message', (data) => {
    io.sockets.emit('chat:message', {
      username: socket.username,
      message: data,
    });
  });

  socket.on('chat:addUser', (username) => {
    if (!username) return;

    socket.username = username;
    ++numUsers;
    addedUser = true;

    io.sockets.emit('chat:login', numUsers);

    socket.broadcast.emit('chat:userJoined', {
      username: socket.username,
    });
  });

  socket.on('chat:typing', () => {
    
    socket.broadcast.emit('chat:typing', {
      username: socket.username,
    });
  });

  socket.on('chat:stopTyping', () => {
    socket.broadcast.emit('chat:stopTyping');
  });

  socket.on('chat:disconnect', () => {
    if (addedUser) {
      --numUsers;
    }
    io.sockets.emit('chat:disconnect', {
      username: socket.username,
      numUsers,
    });
  });
});