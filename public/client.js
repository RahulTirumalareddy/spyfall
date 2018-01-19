var HOST = location.origin.replace(/^http/, 'ws');
var server = new WebSocket(HOST);
var username;
var users;
var numberInLobby;
var gameInProgress = false;

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('username_input').onkeydown = function(e){
    if(e.keyCode == 13){
      submitUsername();
    }
  }
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
      changeNumberInLobby(numberInLobby + 1);
    }

    if (message.startsWith('delete')) {
      let deletedUser = message.substring(6);
      let index = users.indexOf(deletedUser);
      users.splice(index, 1);
      removeFromUserList(deletedUser);
      changeNumberInLobby(numberInLobby - 1);
    }

    if (message.startsWith('startGame')) {
      gameInProgress = true;
      let arr = message.split(',');
      let spy = arr[1];
      let location = arr[2];
      if (username === spy) {
        document.getElementById('my_role').innerHTML = 'You are the spy.';
      } else {
        document.getElementById('my_role').innerHTML = `You are not the spy. The location is ${location}`;
      }
    }

    if (message.startsWith('endGame')) {
      gameInProgress = false;
      document.getElementById('my_role').innerHTML = '';
    }

    if (message.startsWith('clearLobby')) {
      users = [];
      username = null;
      document.getElementById('users').innerHTML = '';
      document.getElementById('username_input').style.visibility = 'visible';
      document.getElementById('join_button').style.visibility = 'visible';
      changeNumberInLobby(0);
    }
    startButtonCheck();
    endButtonCheck();
    clearButtonCheck();
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


window.onbeforeunload = window.onunload = function(e) {
  if (username) {
    server.send("delete" + username);
  }
  server.close();
};

function submitUsername() {
  let username_input = document.getElementById("username_input");
  let input = username_input.value
  if (!users.includes(input) && input.length > 0 && !input.includes(',')) {
    server.send('newUser' + username_input.value);
    username = username_input.value;
    document.getElementById('username_input').style.visibility = 'hidden';
    document.getElementById('join_button').style.visibility = 'hidden';
  } else {
    if (input.length <= 0) {
      alert('Username must be at least one character!');
    } else if (input.includes(',')) {
      alert('Username cannot have commas [fuck up some commas]');
    } else {
      alert('Username already exists with that name');
    }
  }
}

function startGame() {
  server.send('startGame');
}

function endGame() {
  server.send('endGame');
}

function clearLobby() {
  server.send('clearLobby');
}

function startButtonCheck() {
  let button = document.getElementById('start_button');
  if (users.length > 2 && !gameInProgress) {
    button.className = 'waves-effect waves-teal btn-flat';
  } else {
    button.className = 'btn-flat disabled';
  }
}

function endButtonCheck() {
  let button = document.getElementById('end_button');
  if (gameInProgress) {
    button.className = 'waves-effect waves-teal btn-flat';
  } else {
    button.className = 'btn-flat disabled';
  }
}

function clearButtonCheck() {
  let button = document.getElementById('clear_button');
  if (users.length == 0) {
    button.className = 'btn-flat disabled';
  } else {
    button.className = 'waves-effect waves-teal btn-flat';
  }
}

function changeNumberInLobby(newNumber) {
  numberInLobby = newNumber;
  document.getElementById('numberInLobby').innerHTML = `(${numberInLobby})`;
}