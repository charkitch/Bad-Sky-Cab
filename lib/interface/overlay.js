import DamageBox from './damage_box';
import ScoreBox from './score_box';

class Overlay {
  constructor() {
    this.damageBox = new DamageBox;
    this.scoreBox = new ScoreBox;
  }

  draw(cntx, cab) {
    cntx.strokeStyle = 'red';
    cntx.fillStyle = 'red';
    this.damageBox.draw(cntx, cab.damage);
    this.scoreBox.draw(cntx);
  }
}

export default Overlay;
