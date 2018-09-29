import Cab from './cab';
import Obstacles from './obstacles';

class Game {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.cntx = context;

    this.cab = new Cab();
    this.obstacles = new Obstacles();
    this.absoluteSpeed = 1;

    this.rightPressed = false;
    this.leftPressed = false;
    this.upPressed = false;
    this.downPressed = false;
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

  collisionDetection(obstacle) {
    if (this.cab.width + this.cab.cabX - 2 > obstacle.x
      && this.cab.width + this.cab.cabX < obstacle.x + obstacle.width
        && this.cab.cabY - this.cab.height < this.canvas.height - obstacle.offsetTop
          && this.cab.cabY > this.canvas.height - obstacle.offsetTop - obstacle.height) {
          this.cab.cabX -= 20;
          this.cab.damage += 1;
    }
  }

  collisionDetector() {
    this.obstacles.allObstacles.forEach( obstacle => {
      this.collisionDetection(obstacle);
    });
  }

  gameOver() {
    if (this.canvas.height - this.cab.cabY > this.canvas.height) {
      return true;
    } else if (this.canvas.width - this.cab.cabX - this.cab.width/2 > this.canvas.width) {
      return true;
    } else if (this.canvas.width - this.cab.cabX - this.cab.width/2 < 0) {
      return true;
    } else if (this.cab.damage > 10) {
      return true;
    }
    return false;
  }

  draw() {
    if (this.rightPressed) {
      this.cab.cabX += 4;
    } else if (this.leftPressed) {
      this.cab.cabX -= 2.5;
    }
    if (this.upPressed) {
      this.cab.cabY += 2.5;
    } else if (this.downPressed) {
      this.cab.cabY -= 4;
    }
    if (this.gameOver()) {
      alert("explosion, had to be there, game over");
      clearInterval(this.canvasInt);
      location.reload(true);
    }
    this.cntx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.cab.drawCab(this.cntx, this.canvas.height);
    this.obstacles.drawObstacles(this.cntx);
    this.collisionDetector();
    this.obstacles.timer += 1;
  }

  render() {
    document.addEventListener("keydown", this.keyDownHandler.bind(this));
    document.addEventListener("keyup", this.keyUpHandler.bind(this));
    this.canvasInt = setInterval(this.draw.bind(this), 10);
  }

}


export default Game;
