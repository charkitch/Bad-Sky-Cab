class Tower {
  constructor(options) {
    this.x = 0;
    this.y = 0;
    this.width = 80;
    this.height = 200;
    this.offsetTop = 160;
    this.offsetLeft = 600;
  }

  draw(cntx) {
    this.x = this.offsetLeft;
    cntx.beginPath();
    cntx.rect(this.offsetLeft, this.offsetTop, this.width, this.height);
    cntx.fillStyle = "green";
    cntx.fill();
    cntx.closePath();
  }
}

export default Tower;
