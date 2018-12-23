var DIRECTION = "RIGHT";
var DIRECTION2 = "RIGHT";
var SCORE1 = 0;
var SCORE2 = 0;
var SNAKEWIDTH = 50;
var WIDTH = 800;
var HEIGHT = 800;
var SNAKE1INITIALY = 300;
var SNAKE2INITIALY = 600;
function move(snake) {
  var tip = snake.body[0];
  var x = tip.x;
  var y = tip.y
  switch (snake.direction) {
    case "RIGHT": x = x + SNAKEWIDTH; break;
    case "LEFT": x = x - SNAKEWIDTH; break;
    case "UP": y = y - SNAKEWIDTH; break;
    case "DOWN": y = y + SNAKEWIDTH; break;
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
  var direction = "RIGHT";
  return {body: body, length: length, direction: direction, color: color}
}

function draw(game) {
  var context = game.canvasContext;
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  game.snakes.forEach(snake => {
    context.fillStyle = snake.color;
    snake.body.forEach(pos => context.fillRect(pos.x, pos.y, SNAKEWIDTH, SNAKEWIDTH));
  });
  context.fillStyle = game.food.color;
  context.fillRect(game.food.x, game.food.y, SNAKEWIDTH, SNAKEWIDTH);
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
    value: yummy ? 5 : 1,
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

function eatEachOther(snakes) {
  restart = false;
  if (hit(snakes[0], snakes[1])) {
    SCORE2++;
    restart = true;
  }
  if (hit(snakes[1], snakes[0])) {
    SCORE1++;
    restart = true;
  }
  if (restart) {
    toInitialPos(snakes[0], snakes[1]);
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
  DIRECTION = "RIGHT";
  DIRECTION2 = "RIGHT";
}

function main(game) {
  game.snakes.forEach(snake => eatFood(snake, game.food));
  game.snakes[0].direction = DIRECTION;
  game.snakes[1].direction = DIRECTION2;
  eatEachOther(game.snakes);
  game.snakes.forEach(snake => move(snake));
  draw(game);
}

function start(context) {
  snake = createSnake();
}

function handleKeyDown(event) {
  switch (event.code) {
    case "ArrowUp":
    case "kVK_UpArrow":
    case "VK_UP":
    case "GDK_KEY_Up":
    case "GDK_KEY_KP_Up":
    case "Qt::Key_Up":
      DIRECTION = "UP"; break;

    case "ArrowDown":
    case "kVK_DownArrow":
    case "VK_DOWN":
    case "GDK_KEY_Down":
    case "GDK_KEY_KP_Down":
    case "Qt::Key_Down":
      DIRECTION = "DOWN"; break;

    case "ArrowLeft":
    case "kVK_LeftArrow":
    case "VK_LEFT":
    case "GDK_KEY_Left":
    case "GDK_KEY_KP_Left":
    case "Qt::Key_Left":
      DIRECTION = "LEFT"; break;

    case "ArrowRight":
    case "kVK_RightArrow":
    case "VK_RIGHT":
    case "GDK_KEY_Right":
    case "GDK_KEY_KP_Right":
    case "Qt::Key_Right":
      DIRECTION = "RIGHT"; break;

    case "KeyW": DIRECTION2 = "UP"; break;
    case "KeyS": DIRECTION2 = "DOWN"; break;
    case "KeyA": DIRECTION2 = "LEFT"; break;
    case "KeyD": DIRECTION2 = "RIGHT"; break;
  }
}

var canvas = document.getElementById("myCanvas");
canvas.width = WIDTH;
canvas.height = HEIGHT;
canvas.addEventListener("keydown", handleKeyDown);
var labelScore1 = document.getElementById("score1");
var labelScore2 = document.getElementById("score2");
var ctx = canvas.getContext("2d");
var GAME = {};
GAME.snakes = [createSnake(SNAKE1INITIALY, "red"), createSnake(SNAKE2INITIALY, "blue")];
GAME.scores = [0, 0];
GAME.food = createFood();
GAME.canvasContext = ctx;
var interval = setInterval(_ => main(GAME), 100);
