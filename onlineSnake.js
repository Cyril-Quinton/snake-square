var WIDTH = 800;
var HEIGHT = 800;
var RIGHTSIDE = 100;
var SNAKEWIDTH = 50;

function draw(game, context) {
  if (game != undefined) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.strokeRect(0, 0, WIDTH, HEIGHT);
    game.snakes.forEach((snake, i, snakes) => {
      context.fillStyle = snake.color;
      snake.body.forEach(pos => context.fillRect(pos.x, pos.y, SNAKEWIDTH, SNAKEWIDTH));
      context.font = '48px serif';
      var gap = HEIGHT / 2 * (i) / snakes.length + HEIGHT / 3;
      if ((snake.winner && game.pause %2 == 0 || !snake.winner)) {
        context.fillText(snake.score, WIDTH + 10, gap);
      }
      if (game.wait) {
        INVITELINKLABEL.innerHTML = "file:///Users/cyril/perso/snakesquare/onlinesnake.html?gameId=" + game.id;
      }
    });
    context.fillStyle = game.food.color;
    context.fillRect(game.food.x, game.food.y, SNAKEWIDTH, SNAKEWIDTH);
}
}

function handleKeyDown(event, socket) {
  switch (event.code) {
    case "ArrowUp":
    case "kVK_UpArrow":
    case "VK_UP":
    case "GDK_KEY_Up":
    case "GDK_KEY_KP_Up":
    case "Qt::Key_Up":
      socket.send(JSON.stringify({d: "U"})); break;

    case "ArrowDown":
    case "kVK_DownArrow":
    case "VK_DOWN":
    case "GDK_KEY_Down":
    case "GDK_KEY_KP_Down":
    case "Qt::Key_Down":
    socket.send(JSON.stringify({d: "D"})); break;

    case "ArrowLeft":
    case "kVK_LeftArrow":
    case "VK_LEFT":
    case "GDK_KEY_Left":
    case "GDK_KEY_KP_Left":
    case "Qt::Key_Left":
      socket.send(JSON.stringify({d: "L"})); break;

    case "ArrowRight":
    case "kVK_RightArrow":
    case "VK_RIGHT":
    case "GDK_KEY_Right":
    case "GDK_KEY_KP_Right":
    case "Qt::Key_Right":
    socket.send(JSON.stringify({d: "R"})); break;
  }
}

let game = undefined;
var socket = new WebSocket("ws://localhost:8080");
socket.onopen = event => {
  console.log("socket succesfully open");
  var gameId = url.searchParams.get("gameId");
  if (gameId != undefined) {
    console.log("joining game");
    socket.send(JSON.stringify({action: "JOIN_GAME", gameId: gameId}));
  }
}

socket.onmessage = event => {
  game = JSON.parse(event.data);
}

var newGameButton = document.getElementById("newGame");
newGameButton.addEventListener("click", event => socket.send(JSON.stringify({action: "NEW_GAME"})))
var url = new URL(window.location.href);
var canvas = document.getElementById("myCanvas");
var INVITELINKLABEL = document.getElementById("inviteLink");
canvas.width = WIDTH + RIGHTSIDE;
canvas.height = HEIGHT;
canvas.addEventListener("keydown", event => handleKeyDown(event, socket));
var ctx = canvas.getContext("2d");
var interval = setInterval(_ => draw(game, ctx), 100);
