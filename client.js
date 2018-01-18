const server = new WebSocket('ws://127.0.0.1:8080');
var username;
var users;

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('username_input').onkeydown = function(e){
    if(e.keyCode == 13){
      submitUsername();
    }
  }
});

server.addEventListener('open', function (event) {
    server.send('Hello Server!');
});

server.addEventListener('message', function (event) {
    let message = event.data;
    if (message.startsWith('initialUsers')) {
      users = JSON.parse(message.substring(12));
      users.forEach(addToUserList);
    }

    if (message.startsWith('newUser')) {
      let newUser = message.substring(7);
      users.push(newUser);
      addToUserList(newUser);
    }

    if (message.startsWith('delete')) {
      let deletedUser = message.substring(6);
      removeFromUserList(deletedUser);
    }
});

function addToUserList(user) {
  let listElement = document.createElement('LI');
  let text = document.createTextNode(user);
  listElement.appendChild(text);
  listElement.id = user;
  document.getElementById("users").appendChild(listElement);
}

function removeFromUserList(user) {
  if (user){
    let removedNode = document.getElementById(user);
    removedNode.parentNode.removeChild(removedNode);
  }
}

window.onbeforeunload = function(e) {
  server.send("delete" + username);
  server.close();
};

function submitUsername() {
  let username_input = document.getElementById("username_input");
  if (!users.includes(username_input.value)) {
    server.send('newUser' + username_input.value);
    username = username_input.value;
    username_input.parentNode.removeChild(username_input);
    document.getElementById('my_username').innerHTML = "You are " + username;
  } else {
    alert('Username already exists with that name!');
  }
};
