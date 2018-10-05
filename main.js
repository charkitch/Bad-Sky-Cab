import Game from './lib/game';
import HomeOverlay from './lib/interface/home_overlay';
import Sound from './lib/audio/sound';

let theme = new Sound('./assets/audio/317363.mp3');
theme.play();

let gameStarted = false;
const canvas = document.getElementById("game-world");
const context = canvas.getContext('2d');
let Homer = new HomeOverlay(canvas, context);

if (gameStarted) {
  const BadSkyCab = new Game(canvas, context);
  BadSkyCab.render();
  window.game = BadSkyCab;
} else {
  Homer.draw(context);
}
