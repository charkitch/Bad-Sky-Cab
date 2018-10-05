import Game from './lib/game';
import HomeScreen from './lib/home_screen';
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
