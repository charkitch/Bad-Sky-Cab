class ScoreBox {
  constructor() {
    this.x = 700;
    this.y = 30;
  }

  draw(cntx, score) {
    cntx.font = '20px Arial';
    cntx.strokeText(
      `Score: ${score} `,
      this.x,
      this.y
    );
  }
}

export default ScoreBox;
