import Cab from './cab';
import GameOverlay from './interface/game_overlay';
import HomeOverlay from './interface/home_overlay';
import Obstructions from './obstructions';
import Sound from './audio/sound.js';
import SpeakerIcon from './interface/speaker_icon';

class Game {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.cntx = context;
    this.over = true;
    this.homeOverlay = new HomeOverlay();
    // this.backdrop = new Backdrop();
    this.cab = new Cab();
    this.obstructions = new Obstructions();
    this.gameOverlay = new GameOverlay();
    this.score = 0;
    this.scoreMultiplier = 2;
    this.soundPaused = true;
    this.speakerIcon = new SpeakerIcon();

    this.rightPressed = false;
    this.leftPressed = false;
    this.upPressed = false;
    this.downPressed = false;
    this.timer = 0;
    this.inProgress = false;
    this.directionClick = false;
    this.touchPressed = false;

    this.bumpSound = new Sound({
      src: './assets/audio/2791__bump.wav',
      loopStatus: false
    });
    this.boomSound = new Sound({
      src: './assets/audio/276341__boom.wav',
      loopStatus: false
    });
    this.themeSound = new Sound({
      src: './assets/audio/317363.mp3',
      loopStatus: false
    });
    this.sounds = [this.bumpSound, this.boomSound, this.themeSound];

    this.soundButtonPressed = this.soundButtonPressed.bind(this);
    this.startClick = this.clickHandler.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.keyUpHandler = this.keyUpHandler.bind(this);
    this.touchStartHandler = this.touchStartHandler.bind(this);
    this.touchEndHandler = this.touchEndHandler.bind(this);
    this.canvas.onmousedown = this.startClick;
    this.canvas.onmouseup = this.handleMouseUp;
    this.canvas.ontouchdown = this.touchStartHandler;
    this.canvas.ontouchend = this.touchEndHandler;
  }

  keyDownHandler(e)  {
    if (e.key === 'ArrowRight' || e.key === 'd') {
      e.preventDefault();
      this.rightPressed = true;
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
      e.preventDefault();
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

  touchEndHandler(e) {
    if (this.touchPressed === true) {
      this.upPressed = false;
      this.rightPressed = false;
      this.downPressed = false;
      this.leftPressed = false;
      this.touchPressed = false;
    }
  }

  touchStartHandler(e) {
    let page = this.canvas.getBoundingClientRect();
    let touchX = e.clientX - page.left;
    let touchY = e.clientY - page.top;
    e.preventDefault();
    if (Math.abs(this.cab.y - touchY) > Math.abs(this.cab.x - touchY)) {
      if (touchY < this.cab.y) {
        this.upPressed = true;
      } else if (touchY > this.cab.y) {
        this.downPressed = true;
      }
    } else if (touchX > this.cab.x) {
      this.rightPressed = true;
    } else if (touchX < this.cab.x) {
      this.leftPressed = true;
    }
    this.directionClick = true;
  }



  collisionClamor() {
    if (this.cab.damage < 9) {
      this.bumpSound.play(this.soundPaused);
    } else {
      this.boomSound.play(this.soundPaused);
    }
  }

  collisionDetection(obstacle) {
    if (this.occupyingSameSpace(obstacle)) {
      this.collisionClamor();
      if (this.cab.y < obstacle.y) {
        this.cab.bounceUp(obstacle);
      } else if (this.cab.y > obstacle.y) {
        this.cab.bounceDown(obstacle);
      } else if (this.cab.x < obstacle.x) {
        this.cab.bounceLeft(obstacle);
      } else if (this.cab.x > obstacle.x) {
        this.cab.bounceRight(obstacle);
      }
    }
  }

  occupyingSameSpace(obstacle) {
    const belowTheTop = this.cab.y + this.cab.height > obstacle.y;
    const aboveTheBottom = this.cab.y < obstacle.y + obstacle.height;
    const toTheLeftOfRight = this.cab.x < obstacle.x + obstacle.width;
    const toTheRightOfLeft =  this.cab.width + this.cab.x - 2 > obstacle.x;
    return (
      belowTheTop
      && aboveTheBottom
      && toTheLeftOfRight
      && toTheRightOfLeft
    );
  }

  collisionDetector() {
    this.obstructions.allObstructions.forEach( obstacle => {
      this.collisionDetection(obstacle);
    });
  }

  gameOver() {
    if (this.cab.y > this.canvas.height) {
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

  clickHandler(e) {
    if (this.inSpeakerBox(e)) {
      this.soundButtonPressed(e);
      return;
    }
    if (this.inProgress) {
      this.touchStartHandler(e);
      // this.handleDirectionalClick(e);
    }
    if (!this.inProgress) {
      this.reset();
      this.inProgress = true;
      this.over = false;
    }
  }

  handleMouseUp(e) {
    if (this.directionClick === true) {
      this.upPressed = false;
      this.rightPressed = false;
      this.downPressed = false;
      this.leftPressed = false;

      this.directionClick = false;
    }
  }

  handleDirectionalClick(e) {
    if (Math.abs(this.cab.y - e.offsetY) > Math.abs(this.cab.x - e.offsetX)) {
      if (e.offsetY < this.cab.y) {
        this.upPressed = true;
      } else if (e.offsetY > this.cab.y) {
        this.downPressed = true;
      }
    } else if (e.offsetX > this.cab.x) {
      this.rightPressed = true;
    } else if (e.offsetX < this.cab.x) {
      this.leftPressed = true;
    }
    this.directionClick = true;
  }


  soundButtonPressed(e) {
    if (this.soundPaused === false) {
      this.soundPaused = true;
      this.sounds.forEach( (sound) => {
        sound.stop();
      })} else {
        this.soundPaused = false;
      }
    }

  reset() {
    this.cab = new Cab();
    this.obstructions = new Obstructions();
  }

  inSpeakerBox(e) {
    let page = this.canvas.getBoundingClientRect();
    let clickX = e.clientX - page.left;
    let clickY = e.clientY - page.top;
    return clickX > this.speakerIcon.x
      && clickX < this.speakerIcon.x + 15
        && clickY > this.speakerIcon.y
         && clickY < this.speakerIcon.y + 20;
  }



  draw() {
    this.cntx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.over) {
      this.homeOverlay.draw(this.cntx);
    } else {
      this.themeSound.play(this.soundPaused);

      // this.backdrop.draw()
      if (this.rightPressed) {
        this.cab.zoomForward();
      } else if (this.leftPressed) {
        this.cab.applyBrakes();
      }
      if (this.upPressed) {
        this.cab.gainAltitude();
      } else if (this.downPressed) {
        this.cab.loseAltitude();
      }
      if (this.gameOver()) {
        this.cab.image.src = './assets/images/vehicles/boom.png';
        this.inProgress = false;
        this.over = true;
      }
      if (this.timer === 1000) {
        this.scoreMultiplier *= 2;
        this.timer = 0;
      }
      this.score += 1 * this.scoreMultiplier;
      this.cntx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.cab.drawCab(this.cntx, this.canvas.height);
      this.obstructions.drawObstacles(this.cntx);
      this.collisionDetector();
      this.obstructions.timer += 1;
      this.gameOverlay.draw(this.cntx, this.cab, this.score);
    }
    this.speakerIcon.draw(this.cntx, this.soundPaused);
    requestAnimationFrame(this.draw.bind(this));
  }

  render() {
    document.addEventListener("touchstart", this.touchStartHandler)
    document.addEventListener("touchend", this.touchEndHandler)
    document.addEventListener("keydown", this.keyDownHandler);
    document.addEventListener("keyup", this.keyUpHandler);
    this.draw();
  }

}


export default Game;
