const WebSocket = require('ws');

var SNAKEWIDTH = 50;
var WIDTH = 800;
var HEIGHT = 800;
var RIGHTSIDE = 100;
var SNAKE1INITIALY = 300;
var SNAKE2INITIALY = 600;
var INITIALLENGTH = 5;
var NBFRAMEPAUSE = 10;

const GAMES = {};
const SOCKETS = {};

function move(snake) {
  var tip = snake.body[0];
  var x = tip.x;
  var y = tip.y
  switch (snake.direction) {
    case "R": x = x + SNAKEWIDTH; break;
    case "L": x = x - SNAKEWIDTH; break;
    case "U": y = y - SNAKEWIDTH; break;
    case "D": y = y + SNAKEWIDTH; break;
  }
  if (y < 0) {
    y = HEIGHT - SNAKEWIDTH;
  } else if (y >= HEIGHT) {
    y = 0
  }
  if (x < 0) {
    x = WIDTH - SNAKEWIDTH;
  } else if (x >= WIDTH) {
    x = 0;
  }
  snake.body.unshift({x: x, y: y});
  snake.body = snake.body.slice(0, snake.length);
  return snake;
}

function createSnake(y, color) {
  var body = [{x: 50, y: y}, {x: 100, y: y}, {x: 150, y: y}, {x: 200, y: y}];
  var length = body.length;
  var direction = "R";
  return {body: body, length: length, direction: direction, color: color}
}

function getRandom(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function intersects(snake, food) {
  var head = snake.body[0];
  return head.x === food.x && head.y === food.y;
}

function createFood() {
  var yummy = getRandom(5) == 4;
  return {
    value: yummy ? 15 : 3,
    color: yummy ? "green" : "orange",
    x: getRandom(WIDTH / SNAKEWIDTH) * SNAKEWIDTH,
    y: getRandom(HEIGHT / SNAKEWIDTH) * SNAKEWIDTH,
  };
}

function eatFood(snake, food) {
  if (intersects(snake, food)) {
    snake.length = snake.length + food.value;
    Object.assign(food, createFood());
  }
}

function eatEachOther(game) {
  var snakes = game.snakes;
  restart = false;
  if (hit(snakes[0], snakes[1])) {
    snakes[1].score ++;
    snakes[1].winner = true;
    restart = true;
  } else {
    snakes[1].winner = false;
  }
  if (hit(snakes[1], snakes[0])) {
    snakes[0].score ++;
    snakes[0].winner = true;
    restart = true;
  } else {
    snakes[0].winner = false;
  }
  if (restart) {
    game.pause = NBFRAMEPAUSE;
  }
}

function hit(snake, snake2) {
  var head = snake.body[0];
  for (let pos of snake2.body) {
    if (pos.x == head.x && pos.y == head.y) {
      return true;
    }
  }
  return false;
}

function toInitialPos(snake1, snake2) {
  Object.assign(snake1, createSnake(SNAKE1INITIALY, "red"));
  Object.assign(snake2, createSnake(SNAKE2INITIALY, "blue"));
}

function randomId() {
  const syms = "abcdefghijklmnopqrstuvwxyz1234567890";
  let id = "";
  for (let i = 0; i < 12; i++) {
    id += syms[getRandom(syms.length)];
  }
  return id;
}

function attachListenerToGame(socket, gameId, snakeNumber) {
  if (SOCKETS[gameId] == undefined) {
    SOCKETS[gameId] = [];
  }
  SOCKETS[gameId][snakeNumber] = socket;
  const game = GAMES[gameId];
  socket.on('message', message => {
    switch (JSON.parse(message).d) {
      case "R": game.snakes[snakeNumber].direction = "R"; break;
      case "L": game.snakes[snakeNumber].direction = "L"; break;
      case "U": game.snakes[snakeNumber].direction = "U"; break;
      case "D": game.snakes[snakeNumber].direction = "D"; break;
    }
    console.log(`Received message => ${message}`)
  });
}

function main(game) {
  if (game.wait) {
    return;
  }
  if (game.pause > 0) {
    if (game.pause < 4) {
      toInitialPos(game.snakes[0], game.snakes[1]);
    }
    game.pause -- ;
  } else {
    game.snakes.forEach(snake => move(snake));
    game.snakes.forEach(snake => eatFood(snake, game.food));
    eatEachOther(game);
  }
}

function startGame(socket) {
  const game = {};
  const gameId = randomId();
  GAMES[gameId] = game;
  game.id = gameId;
  game.wait = true;
  let snake1 = createSnake(SNAKE1INITIALY, "red");
  snake1.score = 0;
  let snake2 = createSnake(SNAKE2INITIALY, "blue");
  snake2.score = 0;
  game.snakes = [snake1, snake2];
  game.food = createFood();
  attachListenerToGame(socket, gameId, 0);
  var interval = setInterval(_ => {
    main(game);
    SOCKETS[gameId].forEach(socket => {
      console.log("sending game data");
        socket.send(JSON.stringify(game));
      });
  }, 100);
}

function joinGame(socket, gameId) {
  attachListenerToGame(socket, gameId, 1);
  GAMES[gameId].wait = false;
}

const webSocket = new WebSocket.Server({ port: 8080 });

webSocket.on('connection', socket => {
  socket.on('message', message => {
    const messageObject = JSON.parse(message);
    switch (messageObject.action) {
      case "NEW_GAME": startGame(socket); break;
      case "JOIN_GAME": joinGame(socket, messageObject.gameId); break;
    }
  })
});
