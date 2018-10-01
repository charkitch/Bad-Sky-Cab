class Obstacle {
  constructor(options) {
    this.x = 1000;
    this.y = 0;
    this.image = new Image();
  }

  draw(cntx) {
    cntx.drawImage(
      this.image,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

export default Obstacle;
