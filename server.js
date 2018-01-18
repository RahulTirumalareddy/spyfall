const WebSocket = require('ws');
const moment = require('moment');

var users = [];

const wss = new WebSocket.Server({ port: 8080 });

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

  });
});
