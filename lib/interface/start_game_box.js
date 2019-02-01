import { drawStrokeText, getCurrentScore, doesScoreExist } from '../util';

class StartGameBox {
  constructor() {
    this.x = 100;
    this.y = 50;
  }

  draw(cntx, score) {
    cntx.strokeText(
      `Click here to start driving the unfriendly skies.`,
      this.x,
      this.y
    )
    if (doesScoreExist()) {
      let score = getCurrentScore();
      drawStrokeText(cntx, `Your High Score: ${score}`, 650, 30);
    }
  }
}

export default StartGameBox;
