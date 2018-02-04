const PORT = process.env.PORT || 8080;
const path = require('path');
const INDEX = path.join(__dirname, 'index.html');
const express = require('express');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => res.sendFile(INDEX));

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));
const WebSocket = require('ws');
const moment = require('moment');
const wss = new WebSocket.Server({ server });


var users = [];
var locations = ['Beach','Broadway Theater','Casino','Circus Tent','Bank','Day Spa','Hotel','Restaurant',
'Supermarket','Service Station','Hospital','Embassy','Military Base','Police Station','School','University',
'Airplane','Ocean Liner', 'Passenger Train','Submarine','Cathedral','Corporate Party','Movie Studio',
'Crusader Army','Pirate Ship','Polar Station','Space Station'];


wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

wss.on('connection', function connection(client) {
  client.send('initialUsers' + JSON.stringify(users));
  client.send('initialLocations' + JSON.stringify(locations));
  client.on('message', function incoming(message) {
    if (message.startsWith('newUser')) {
      let username = message.substring(7);
      users.push(username);
      wss.broadcast('newUser' + username);
    }
    if (message.startsWith('deleteUser')) {
      let username = message.substring(10);
      let index = users.indexOf(username);
      users.splice(index,1);
      wss.broadcast('deleteUser' + username);
    }
    if (message.startsWith('newLocation')) {
      let location = message.substring(11);
      locations.push(location);
      wss.broadcast('newLocation' + location);
    }
    if (message.startsWith('deleteLocation')) {
      let location = message.substring(14);
      let index = users.indexOf(location);
      locations.splice(index,1);
      wss.broadcast('deleteLocation' + location);
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
      users = [];
      wss.broadcast('clearLobby');
    }
  });
});

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
