import DamageBox from './damage_box';

class Overlay {
  constructor() {
    this.damageBox = new DamageBox;
  }

  draw(cntx, cab) {
    this.damageBox.draw(cntx, cab.damage);
  }
}

export default Overlay;
