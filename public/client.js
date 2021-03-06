var HOST = location.origin.replace(/^http/, 'ws');
var server = new WebSocket(HOST);
var locations = ['Beach','Broadway Theater','Casino','Circus Tent','Bank','Day Spa','Hotel','Restaurant',
'Supermarket','Service Station','Hospital','Embassy','Military Base','Police Station','School','University',
'Airplane','Ocean Liner', 'Passenger Train','Submarine','Cathedral','Corporate Party','Movie Studio',
'Crusader Army','Pirate Ship','Polar Station','Space Station'];

var username;
var users;
var numberInLobby;
var gameInProgress = false;

document.addEventListener("DOMContentLoaded", function() {
  $('select').material_select();
  $('.modal').modal();
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

    if (message.startsWith('initialLocations')) {
      locations = JSON.parse(message.substring(16));
      locations.forEach(addToLocationList);
    }

    if (message.startsWith('newUser')) {
      let newUser = message.substring(7);
      users.push(newUser);
      addToUserList(newUser);
      changeNumberInLobby(numberInLobby + 1);
    }

    if (message.startsWith('newLocation')) {
      let newLocation = message.substring(11);
      locations.push(newLocation)
      addToLocationList(newLocation);
    }

    if (message.startsWith('deleteUser')) {
      let deletedUser = message.substring(10);
      let index = users.indexOf(deletedUser);
      users.splice(index, 1);
      removeFromPage(deletedUser);
      changeNumberInLobby(numberInLobby - 1);
    }

    if (message.startsWith('deleteLocation')) {
      let deletedLocation = message.substring(14);
      let index = locations.indexOf(deletedLocation);
      locations.splice(index, 1);
      removeFromPage(deletedLocation);
    }

    if (message.startsWith('startGame')) {
      gameInProgress = true;
      let arr = message.split(',');
      let spy = arr[1];
      let location = arr[2];
      if (username === spy) {
        document.getElementById('my_role').innerHTML = 'You are the spy.';
        document.getElementById('my_role').style.opacity = 1;
      } else {
        document.getElementById('my_role').innerHTML = `You are not the spy. The location is ${location}`;
        document.getElementById('my_role').style.opacity = 1;
      }
    }

    if (message.startsWith('endGame')) {
      gameInProgress = false;
      document.getElementById('my_role').style.opacity = 0;
      setTimeout(function(){
        document.getElementById('my_role').innerHTML = '';
      }, 1000);
    }

    if (message.startsWith('clearLobby')) {
      users = [];
      username = null;
      document.getElementById('users').innerHTML = '';
      document.getElementById('input_div').style.display = 'inline-block';
      document.getElementById('join_button').style.display = 'inline-block';
      changeNumberInLobby(0);
    }
    startButtonCheck();
    endButtonCheck();
    clearButtonCheck();
});

function addToUserList(user) {
  let listElement = document.createElement('li');
  let text = document.createTextNode(user);
  listElement.appendChild(text);
  listElement.id = user;
  document.getElementById("users").appendChild(listElement);
}

function addToLocationList(location) {
  if (!document.getElementById(location)) {
    let gridElement = document.createElement('div');
    gridElement.className = 'col s3';
    gridElement.innerHTML = location;
    gridElement.id = location;
    gridElement.onclick = toggleStrikeThrough;
    document.getElementById('locations').appendChild(gridElement);
  }
}

function removeFromPage(element) {
  let removedNode = document.getElementById(element);
  removedNode.parentNode.removeChild(removedNode);
}


window.onbeforeunload = window.onunload = function(e) {
  if (username) {
    server.send("deleteUser" + username);
  }
  server.close();
};

function submitUsername() {
  let username_input = document.getElementById("username_input");
  let input = username_input.value
  if (!users.includes(input) && input.length > 0 && !input.includes(',') && !input.toLowerCase().includes('bahul')) {
    server.send('newUser' + username_input.value);
    username = username_input.value;
    document.getElementById('input_div').style.display = 'none';
    document.getElementById('join_button').style.display = 'none';
  } else {
    if (input.length <= 0) {
      alert('Username must be at least one character!');
    } else if (input.includes(',')) {
      alert('Username cannot have commas!');
    } else if (input.toLowerCase().includes('bahul')) {
      alert('no');
    } else {
      alert('Username exists with that name!')
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
    button.className = 'waves-effect blue accent-1 waves-light btn';
  } else {
    button.className = 'btn disabled';
  }
}

function endButtonCheck() {
  let button = document.getElementById('end_button');
  if (gameInProgress) {
    button.className = 'waves-effect blue accent-1 waves-light btn';
  } else {
    button.className = 'btn disabled';
  }
}

function clearButtonCheck() {
  let button = document.getElementById('clear_button');
  if (users.length == 0) {
    button.className = 'btn disabled';
  } else {
    button.className = 'waves-effect blue accent-1 waves-light btn';
  }
}

function changeNumberInLobby(newNumber) {
  numberInLobby = newNumber;
  document.getElementById('numberInLobby').innerHTML = `(${numberInLobby})`;
}

function toggleStrikeThrough() {
  if (this.style.getPropertyValue('text-decoration') != 'line-through') {
    this.style.setProperty('text-decoration', 'line-through');
  } else {
    this.style.setProperty('text-decoration', 'none');
  }
}
