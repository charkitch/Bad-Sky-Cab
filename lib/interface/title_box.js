class ScoreBox {
  constructor() {
    this.x = 300;
    this.y = 300;
  }

  draw(cntx, score) {

    cntx.font = '50px Arial';
    cntx.fillStyle = 'black';
    cntx.fillText(
      `BAD SKY CAB`,
      this.x,
      this.y
    );
    cntx.strokeStyle = "red";
    cntx.strokeText(
      `BAD SKY CAB`,
      this.x,
      this.y
    );
  }
}

export default ScoreBox;
