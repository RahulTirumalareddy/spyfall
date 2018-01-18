const server = new WebSocket('ws://127.0.0.1:8080');
var username;
var users;
var numberInLobby;

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
      numberInLobby = users.length;
      changeNumberInLobby(numberInLobby);
    }

    if (message.startsWith('newUser')) {
      let newUser = message.substring(7);
      users.push(newUser);
      addToUserList(newUser);
      changeNumberInLobby(numberInLobby+1);
    }

    if (message.startsWith('delete')) {
      let deletedUser = message.substring(6);
      let index = users.indexOf(deletedUser);
      users.splice(index,1);
      removeFromUserList(deletedUser);
      changeNumberInLobby(numberInLobby-1);
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
  let removedNode = document.getElementById(user);
  removedNode.parentNode.removeChild(removedNode);
}

window.onbeforeunload = function(e) {
  if (username) {
    server.send("delete" + username);
  }
  server.close();
};

function submitUsername() {
  let username_input = document.getElementById("username_input");
  let input = username_input.value
  if (!users.includes(input) && input.length > 0) {
    server.send('newUser' + username_input.value);
    username = username_input.value;
    username_input.parentNode.removeChild(username_input);
    let button = document.getElementById('join_button');
    button.parentNode.removeChild(button);
    document.getElementById('my_username').innerHTML = "You are " + username;
  } else {
    if (input.length <= 0) {
      alert('Username must be at least one character!');
    } else {
      alert('Username already exists with that name!')
    }
  }
};

function changeNumberInLobby(newNumber) {
  numberInLobby = newNumber;
  document.getElementById('numberInLobby').innerHTML = numberInLobby;
}
