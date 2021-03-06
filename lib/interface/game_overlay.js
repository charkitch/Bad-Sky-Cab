import DamageBox from './damage_box';
import ScoreBox from './score_box';

class GameOverlay {
  constructor() {
    this.damageBox = new DamageBox;
    this.scoreBox = new ScoreBox;
  }

  draw(cntx, cab, score) {
    cntx.strokeStyle = 'darkgrey';
    cntx.font = '25px Arial';
    this.damageBox.draw(cntx, cab.damage);
    this.scoreBox.draw(cntx, score);
  }
}

export default GameOverlay;
