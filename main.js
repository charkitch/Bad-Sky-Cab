import Game from './lib/game';
import HomeOverlay from './lib/interface/home_overlay';
import Sound from './lib/audio/sound';

class Page {
  constructor() {
    this.theme = new Sound('./assets/audio/317363.mp3');
    this.gameStarted = false;
    this.canvas = document.getElementById("game-world");
    this.context = this.canvas.getContext('2d');
    this.homeOverlay = new HomeOverlay(this.canvas, this.context);
    this.game = new Game(this.canvas, this.context);
    this.keyDownHandler = this.keyDownHandler.bind(this);
  }

  gameStatusToggle() {
    this.gameStarted = ! this.gameStarted;
  }

  keyDownHandler(e) {
    this.gameStatusToggle();
  }

  render() {
    if (this.gameStarted) {
      this.theme.play();
      this.game.render();
    } else {
      debugger
      let glerd = document.addEventListener("keydown", this.keyDownHandler);
      debugger
      this.homeOverlay.draw(this.context);
    }
  }

}

let website = new Page();
website.render();
