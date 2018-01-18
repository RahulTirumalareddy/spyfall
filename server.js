const PORT = process.env.PORT || 8080;
const path = require('path');
const INDEX = path.join(__dirname, 'index.html');
const express = require('express');
const app = express();

app.use((req, res) => res.sendFile(INDEX));

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));
const WebSocket = require('ws');
const moment = require('moment');
const wss = new WebSocket.Server({ server });


var users = [];
var locations = ['Beach', 'Broadway Theater', 'Casino', 'Circus Tent', 'Day Spa'];

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

wss.on('connection', function connection(client) {
  client.send("initialUsers" + JSON.stringify(users));
  client.on('message', function incoming(message) {
    if (message.startsWith('newUser')) {
      let username = message.substring(7);
      users.push(username);
      wss.broadcast('newUser' + username);
    }
    if (message.startsWith('delete')) {
      let username = message.substring(6);
      let index = users.indexOf(username);
      users.splice(index,1);
      wss.broadcast('delete' + username);
    }
    if (message === 'startGame') {
      let spy = users[getRandomInt(users.length)];
      let location = locations[getRandomInt(locations.length)];
      wss.broadcast('startGame' + ',' + spy + ',' + location);
    }
    if (message === 'endGame') {
      wss.broadcast('endGame');
    }
    if (message === 'clearLobby') {
      wss.broadcast('clearLobby');
    }
  });
});

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
