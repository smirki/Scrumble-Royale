const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const {rando, randoSequence} = require('@nastyox/rando.js');


const app = express();
const server = http.createServer(app);
const io = socketIO(server);


app.use(express.static('public'));

let rouletteActive = false;
let scumDeveloper = null;

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join', ({ role }) => {
    console.log(`A ${role} has joined the meeting`);
    socket.join('sprint-meeting');
  });

  socket.on('start-roulette', () => {
    rouletteActive = !rouletteActive;
    scumDeveloper = null;
    if (rouletteActive) {
      const developers = io.sockets.adapter.rooms.get('sprint-meeting');
      if (developers && developers.size > 1) {
        const nonScrumMasterDevelopers = [...developers].filter((dev) => dev !== socket.id);
        scumDeveloper = rando(nonScrumMasterDevelopers).value;
      }
    }
    io.in('sprint-meeting').emit('roulette-started', rouletteActive);
  });
  
  
  socket.on('check-status', (name) => {
    if (rouletteActive) {
      if (socket.id === scumDeveloper) {
        socket.emit('scum-status', 'scum');
      } else {
        socket.emit('scum-status', 'safe');
      }
    }
  });
  

  socket.on('send-question', (question) => {
    socket.to('sprint-meeting').emit('question', question);
  });

  socket.on('send-answer', (answer) => {
    socket.to('sprint-meeting').emit('new-answer', answer);
  });

  socket.on('set-order', (order) => {
    io.in('sprint-meeting').emit('order', order);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
