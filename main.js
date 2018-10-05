import Game from './lib/game';
import HomeScreen from './lib/home_screen';
import Sound from './lib/audio/sound';

let theme = new Sound('./assets/audio/317363.mp3');
theme.play();

let gameStarted = true;
const canvas = document.getElementById("game-world");
const context = canvas.getContext('2d');

if (gameStarted) {
  const BadSkyCab = new Game(canvas, context);
  BadSkyCab.render();
  window.game = BadSkyCab;
} else {
  new HomeScreen(canvas, context);
  HomeScreen.render();
}
