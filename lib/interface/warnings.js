class WarningsBox {
  constructor() {
    this.x = 250;
    this.y = 200;
  }

  draw(cntx, score) {
    cntx.strokeText(
      `Watch out for flying cars, buildings, and the edges!`,
      this.x,
      this.y
    );
  }
}

export default WarningsBox;
