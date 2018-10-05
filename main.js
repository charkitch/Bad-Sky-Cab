import Game from './lib/game';
import Sound from './lib/audio/sound';

class Page {
  constructor() {
    this.started = false;
    this.canvas = document.getElementById("game-world");
    this.context = this.canvas.getContext('2d');
    this.game = new Game(this.canvas, this.context);
    this.paused = false;
  }

  gameStatusToggle() {
    this.gameStarted = ! this.gameStarted;
  }

  render() {
      this.game.render();
  }

}

let website = new Page();
website.render();
