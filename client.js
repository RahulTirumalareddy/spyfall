const server = new WebSocket('ws://127.0.0.1:8080');
var username;

document.addEventListener("DOMContentLoaded", function() {
  let form = document.getElementById('username_form');
  form.onkeydown = function(e) {
    if (e.keyCode == 13) {
      username = form.value;
      server.send('newUser' + username);
      form.value = '';
    }
  };
});

server.addEventListener('open', function (event) {
    server.send('Hello Server!');
});

server.addEventListener('message', function (event) {
    let message = event.data;
    if (message.startsWith('users')) {
      let users = JSON.parse(message.substring(5));
      users.forEach(addToUserList);
    }
    if (message.startsWith('newUser')) {
      let newUser = message.substring(7);
      addToUserList(newUser);
    }
});

function addToUserList(user) {
  let listElement = document.createElement('LI');
  let text = document.createTextNode(user);
  listElement.appendChild(text);
  document.getElementById("users").appendChild(listElement);
}

window.onbeforeunload = function(e) {
  server.close();
};
