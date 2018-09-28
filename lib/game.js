
class Game {
  constructor() {
    this.canvas = document.getElementById("game-world");
    this.cntx = this.canvas.getContext('2d');

    this.cabHeight = 20;
    this.cabWidth = 40;
    this.cabX = 75;
    this.cabY = 50;
    this.cabDamage = 0;
    this.cabHorz = this.cabX + this.cabWidth;

    this.rightPressed = false;
    this.leftPressed = false;
    this.upPressed = false;
    this.downPressed = false;

    this.towers = [];
    this.towersCount = 6;
    this.towerWidth = 80;
    this.towerHeight = 200;
    this.towerOffsetTop = 160;
    this.towerOffsetLeft = 3000;
  }

  towerGenerator() {
    for (let i = 0; i < this.towersCount; i++) {
      this.towers[i] = { x: 0, y: 0 };
    }
  }

  drawTower(tower) {
    this.cntx.beginPath();
    this.cntx.rect(this.towerOffsetLeft, this.towerOffsetTop, this.towerWidth, this.towerHeight);
    this.cntx.fillStyle = "green";
    this.cntx.fill();
    this.cntx.closePath();
  }

  clearAndGo() {
    this.towers.shift();
  }

  drawTowers() {
    this.towers.forEach( (tower, i) => {
      let stored = this.towerOffsetLeft;
      this.towerOffsetLeft = this.towerOffsetLeft - (i * 300);
      if (this.towerOffsetLeft + this.towerWidth < 0) {
        this.clearAndGo();
      }
      this.drawTower(tower);
      tower.x = this.towerOffsetLeft;
      this.collisionDetection(tower.x);
      this.towerOffsetLeft = stored - 1;
    });
  }

  drawObstacles() {
    this.drawTowers();
  }

  keyDownHandler(e)  {
    if (e.key === 'ArrowRight' || e.key === 'd') {
      this.rightPressed = true;
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
      this.leftPressed = true;
    } else if (e.key === "ArrowUp" || e.key === 'w') {
      this.upPressed = true;
    } else if (e.key === "ArrowDown" || e.key === 's') {
      this.downPressed = true;
    }
  }

  keyUpHandler(e) {
    if (e.key === "ArrowRight"  || e.key === 'd') {
      this.rightPressed = false;
    } else if (e.key === "ArrowLeft"  || e.key === 'a') {
      this.leftPressed = false;
    } else if (e.key === "ArrowUp"  || e.key === 'w') {
      this.upPressed = false;
    } else if (e.key === "ArrowDown"  || e.key === 's') {
      this.downPressed = false;
    }
  }

  collisionDetection(towerX) {
    if (this.cabWidth + this.cabX - 2 > towerX
      && this.cabWidth + this.cabX < towerX + this.towerWidth
        && this.cabY - this.cabHeight < this.canvas.height - this.towerOffsetTop) {
          this.cabX -= 20;
          this.cabDamage += 1;
    }
  }

  drawCab() {
    this.cntx.beginPath();
    this.cntx.rect(
      this.cabX,
      this.canvas.height - this.cabY,
      this.cabWidth,
      this.cabHeight
    );
    this.cntx.fillStyle = 'blue';
    this.cntx.fill();
  }

  gameOver() {
    if (this.canvas.height - this.cabY > this.canvas.height) {
      return true;
    } else if (this.canvas.width - this.cabX - this.cabWidth/2 > this.canvas.width) {
      return true;
    } else if (this.canvas.width - this.cabX - this.cabWidth/2 < 0) {
      return true;
    } else if (this.cabDamage > 10) {
      return true;
    }
    return false;
  }

  draw() {
    this.towerGenerator();
    if (this.rightPressed) {
      this.cabX += 4;
    } else if (this.leftPressed) {
      this.cabX -= 2.5;
    }
    if (this.upPressed) {
      this.cabY += 2.5;
    } else if (this.downPressed) {
      this.cabY -= 4;
    }
    if (this.gameOver()) {
      alert("explosion, had to be there, game over");
      clearInterval(this.canvasInt);
      location.reload(true);
    }
    this.cntx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawCab(this.cntx);
    this.drawObstacles();
  }

  render() {
    console.log(this)
    document.addEventListener("keydown", this.keyDownHandler.bind(this), false);
    document.addEventListener("keyup", this.keyUpHandler.bind(this), false);
    this.canvasInt = setInterval(this.draw.bind(this), 10);
  }

}


export default Game;
