import Cab from './cab';
import Obstructions from './obstructions';
import Overlay from './interface/overlay';
import Backdrop from './backdrop';

class Game {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.cntx = context;

    this.backdrop = new Backdrop();
    this.cab = new Cab();
    this.obstructions = new Obstructions();
    this.overlay = new Overlay();

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
      e.preventDefault();
      this.upPressed = true;
    } else if (e.key === "ArrowDown" || e.key === 's') {
      e.preventDefault();
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
      if (this.cab.Y < obstacle.y) {
        this.bounceUp(obstacle);
      } else if (this.cab.Y > obstacle.y) {
        this.bounceDown(obstacle);
      } else if (this.cab.x < obstacle.x) {
        this.bounceLeft(obstacle);
      } else if (this.cab.x > obstacle.x) {
        this.bounceRight(obstacle);
      }
    }
  }

  occupyingSameSpace(obstacle) {
    const belowTheTop = this.cab.Y + this.cab.height > obstacle.y;
    const aboveTheBottom = this.cab.Y < obstacle.y + obstacle.height;
    const toTheLeftOfRight = this.cab.x < obstacle.x + obstacle.width;
    const toTheRightOfLeft =  this.cab.width + this.cab.x - 2 > obstacle.x;
    return (
      belowTheTop
      && aboveTheBottom
      && toTheLeftOfRight
      && toTheRightOfLeft
    );
  }

  bounceDown(obstacle) {
    this.cab.x -= 20;
    this.cab.Y += 5;
    this.cab.damage += obstacle.damage / 4;
  }

  bounceUp(obstacle) {
    this.cab.Y -= 10;
    this.cab.damage += obstacle.damage / 4;
  }

  bounceLeft(obstacle) {
    this.cab.x -= 100;
    this.cab.damage += obstacle.damage;
  }

  bounceRight(obstacle) {
    this.cab.x += 10;
    this.cab.damage += obstacle.damage / 2;
  }


  collisionDetector() {
    this.obstructions.allObstructions.forEach( obstacle => {
      this.collisionDetection(obstacle);
    });
  }

  gameOver() {
    if (this.cab.Y > this.canvas.height) {
      return true;
    } else if (this.canvas.width - this.cab.x - this.cab.width/2 > this.canvas.width) {
      return true;
    } else if (this.canvas.width - this.cab.x - this.cab.width/2 < 0) {
      return true;
    } else if (this.cab.damage > 9) {
      return true;
    }
    return false;
  }

  draw() {
    // this.backdrop.draw()
    if (this.rightPressed) {
      this.cab.x += 4;
    } else if (this.leftPressed) {
      this.cab.x -= 2.5;
    }
    if (this.upPressed) {
      this.cab.Y -= 2.5;
    } else if (this.downPressed) {
      this.cab.Y += 4;
    }
    if (this.gameOver()) {
      this.cab.image.src = './assets/vehicles/boom.png';
      location.reload(true);
    }
    this.cntx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.cab.drawCab(this.cntx, this.canvas.height);
    this.obstructions.drawObstacles(this.cntx);
    this.collisionDetector();
    this.obstructions.timer += 1;
    this.overlay.draw(this.cntx, this.cab);
    requestAnimationFrame(this.draw.bind(this));
  }

  render() {
    document.addEventListener("keydown", this.keyDownHandler.bind(this));
    document.addEventListener("keyup", this.keyUpHandler.bind(this));
    this.draw();
  }

}


export default Game;
