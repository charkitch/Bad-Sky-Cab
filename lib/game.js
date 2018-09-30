import Cab from './cab';
import Obstructions from './obstructions';

class Game {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.cntx = context;

    this.cab = new Cab();
    this.obstructions = new Obstructions();
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
    if (this.occupyingSameSpace(obstacle)) {
      if (this.cab.cabX < obstacle.x) {
        this.bounceLeft();
      } else if (this.cab.cabX > obstacle.x) {
        this.bounceRight();
      }
    }
  }

  occupyingSameSpace(obstacle) {
    return (this.cab.cabY - this.cab.height < this.canvas.height - obstacle.y
        && this.cab.cabY > this.canvas.height - obstacle.y - obstacle.height)
          && (this.cab.width + this.cab.cabX - 2 > obstacle.x
            && this.cab.cabX < obstacle.x + obstacle.width);
  }

  bounceUp() {

  }

  bounceLeft() {
    this.cab.cabX -= 10;
    this.cab.damage += 1;
  }

  bounceRight() {
    this.cab.cabX += 10;
    this.cab.damage += 1;
  }



  collisionDetector() {
    this.obstructions.allObstructions.forEach( obstacle => {
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
      location.reload(true);
    }
    this.cntx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.cab.drawCab(this.cntx, this.canvas.height);
    this.obstructions.drawObstacles(this.cntx);
    this.collisionDetector();
    this.obstructions.timer += 1;
    requestAnimationFrame(this.draw.bind(this))
  }

  render() {
    document.addEventListener("keydown", this.keyDownHandler.bind(this));
    document.addEventListener("keyup", this.keyUpHandler.bind(this));
    this.draw();
  }

}


export default Game;
