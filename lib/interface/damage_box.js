class DamageBox {
  constructor() {
    this.x = 30;
    this.y = 30;
  }

  draw(cntx, cabDamage) {
    cntx.font = '20px Arial';
    cntx.strokeText(
      `Structural Integrity: ${Math.floor(10 - cabDamage)}`,
      this.x,
      this.y
    );
  }
}

export default DamageBox;
