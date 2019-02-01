class DamageBox {
  constructor() {
    this.x = 30;
    this.y = 30;
  }

  draw(cntx, cabDamage) {
    cntx.strokeStyle = 'darkgrey';
    cntx.font = '20px Arial';
    cntx.strokeText(
      `Structural Integrity:`,
      this.x,
      this.y
    );
    if (cabDamage < 2) {
      cntx.strokeStyle = 'green';
       cntx.strokeText(
      `${Math.floor(10 - cabDamage)}`,
      200,
      31
    );
    } else if (cabDamage < 6) {
      cntx.strokeStyle = 'goldenrod';
       cntx.strokeText(
      `${Math.floor(10 - cabDamage)}`,
      200,
      31
    );
    } else if (cabDamage > 5) {
      cntx.fillStyle = 'red';
      cntx.fillText(
      `${Math.floor(10 - cabDamage)}`,
      200,
      31
    );
    }
  }
}

export default DamageBox;
