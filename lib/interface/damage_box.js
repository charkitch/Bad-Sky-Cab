class DamageBox {
  constructor() {
    this.x = 30;
    this.y = 320;
  }

  draw(cntx, cabDamage) {
    cntx.font = '20px Arial';
    cntx.fillStyle = 'navajowhite';
    cntx.fillText(`Frame Stability: ${Math.floor(10 - cabDamage)}`, this.x, this.y);
  }
}

export default DamageBox;
