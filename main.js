import Game from './lib/game';

let gameStarted = true;
const canvas = document.getElementById("game-world");
const context = canvas.getContext('2d');


if (gameStarted) {
  const BadSkyCab = new Game(canvas, context);
  BadSkyCab.render();
  window.game = BadSkyCab;
}
