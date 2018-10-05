class DirectionsBox {
  constructor() {
    this.x = 150;
    this.y = 100;
  }

  draw(cntx, score) {
    cntx.strokeText(
      `The arrow keys allow movement up, down, fowards or backwards`,
      this.x,
      this.y
    );
    cntx.strokeText(
      `You are also able to use the WASD combination.`,
      200,
      150
    );
  }
}

export default DirectionsBox;
