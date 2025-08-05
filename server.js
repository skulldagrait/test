// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Serve your static files from a folder called 'public'
app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
  console.log(`New player connected: ${socket.id}`);
  
  players[socket.id] = { x: 400, y: 300 };
  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', { id: socket.id, ...players[socket.id] });

  socket.on('move', (position) => {
    players[socket.id] = position;
    socket.broadcast.emit('playerMoved', { id: socket.id, position });
  });

  socket.on('shoot', (bullet) => {
    socket.broadcast.emit('bulletFired', { id: socket.id, bullet });
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is live at http://localhost:${PORT}`);
});
