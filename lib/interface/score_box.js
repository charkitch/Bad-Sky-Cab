import { currentScoreMore, doesScoreExist } from '../util';

class ScoreBox {
  constructor() {
    this.x = 700;
    this.y = 30;
    this.timer = 0
  }

  draw(cntx, score) {
    cntx.strokeStyle = 'darkgrey';
    
    cntx.strokeText(
      `Score:`,
      this.x,
      this.y
    );
    if (currentScoreMore(score) && doesScoreExist()) {
      this.timer += 1
      cntx.strokeStyle = 'green'
      if (this.timer < 100) {
        cntx.strokeText(
        `NEW HIGH SCORE`,
        this.x,
        this.y + 40,
      )}
      cntx.strokeStyle = 'black';
    }
    cntx.strokeStyle = 'black';
     cntx.strokeText(
      `${score} `,
      this.x + 60,
      this.y
    );
  }
}

export default ScoreBox;
