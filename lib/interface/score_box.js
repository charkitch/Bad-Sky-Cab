class ScoreBox {
  constructor() {
    this.x = 800;
    this.y = 30;
  }

  draw(cntx, cabDamage) {
    cntx.font = '20px Arial';
    cntx.strokeText(
      `Score: `,
      this.x,
      this.y
    );
  }
}

export default ScoreBox;
