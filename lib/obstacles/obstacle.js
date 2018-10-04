class Obstacle {
  constructor(options) {
    this.x = 1000;
    this.y = 0;
    this.image = new Image();
    this.damage = 1;
    this.speed = 4;
    this.passedCab = false;
  }

  onScreen() {
    return (this.x - this.width < 1000 && this.x + this.width > 0);
  }

  draw(cntx) {
    if (this.onScreen) {
      cntx.drawImage(
        this.image,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }
}

export default Obstacle;
