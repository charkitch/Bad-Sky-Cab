
const canvas = document.getElementById("game-world");
const cntx = canvas.getContext('2d');
const cabHeight = 20;
const cabWidth = 40;
let cabX = 75;
let cabY = 50;

let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let downPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);


obstacleThicknesses = [80, 40, 120]


let towersCount = 6;
let towerWidth = 80;
let towerHeight = 200;
let towerOffsetTop = 160;
let towerOffsetLeft = 3000;
let cabDamage = 0;
let cabHorz = cabX + cabWidth;

let towers = [];
for (let i = 0; i < towersCount; i++) {
  towers[i] = { x: 0, y: 0 };
}

function drawTower(tower) {
  cntx.beginPath();
  cntx.rect(towerOffsetLeft, towerOffsetTop, towerWidth, towerHeight);
  cntx.fillStyle = "green";
  cntx.fill();
  cntx.closePath();
}

function clearAndGo() {
  towers.shift();
}

function drawTowers() {
  towers.forEach( (tower, i) => {
    let stored = towerOffsetLeft;
    towerOffsetLeft = towerOffsetLeft - (i * 300);
    if (towerOffsetLeft + towerWidth < 0) {
      clearAndGo();
    }
    drawTower(tower);
    tower.x = towerOffsetLeft;
    collisionDetection(tower.x);
    towerOffsetLeft = stored - 1;
  });
}

function drawObstacles() {
  drawTowers();
}

function keyDownHandler(e)  {
  if (e.key === 'ArrowRight' || e.key === 'd') {
    rightPressed = true;
  } else if (e.key === 'ArrowLeft' || e.key === 'a') {
    leftPressed = true;
  } else if (e.key === "ArrowUp" || e.key === 'w') {
    upPressed = true;
  } else if (e.key === "ArrowDown" || e.key === 's') {
    downPressed = true;
  }
}


function keyUpHandler(e) {
  if (e.key === "ArrowRight"  || e.key === 'd') {
    rightPressed = false;
  } else if (e.key === "ArrowLeft"  || e.key === 'a') {
    leftPressed = false;
  } else if (e.key === "ArrowUp"  || e.key === 'w') {
    upPressed = false;
  } else if (e.key === "ArrowDown"  || e.key === 's') {
    downPressed = false;
  }
}

function collisionDetection(towerX) {
  if (cabWidth + cabX - 2 > towerX
    && cabWidth + cabX < towerX + towerWidth
      && cabY - cabHeight < canvas.height - towerOffsetTop) {
        debugger
        cabX -= 20;
        cabDamage += 1;
  }
}

function drawCab() {
  cntx.beginPath();
  cntx.rect(cabX, canvas.height-cabY, cabWidth, cabHeight);
  cntx.fillStyle = 'blue';
  cntx.fill();
}

function gameOver() {
  if (canvas.height - cabY > canvas.height) {
    return true;
  } else if (canvas.width - cabX - cabWidth/2 > canvas.width) {
    return true;
  } else if (canvas.width - cabX - cabWidth/2 < 0) {
    return true;
  } else if (cabDamage > 10) {
    return true;
  }
  return false;
}

function draw() {
  if (rightPressed) {
    cabX += 4;
  } else if (leftPressed) {
    cabX -= 2.5;
  }
  if (upPressed) {
    cabY += 2.5;
  } else if (downPressed) {
    cabY -= 4;
  }
  if (gameOver()) {
    alert("explosion, had to be there, game over");
    clearInterval(canvasInt);
    location.reload(true);
  }
  cntx.clearRect(0, 0, canvas.width, canvas.height);
  drawCab();
  drawObstacles();
}

let canvasInt = setInterval(draw, 10);
