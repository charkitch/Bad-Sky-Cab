class FloatingPlatform {
  constructor(options) {
    this.x = 0;
    this.y = 0;
    this.width = 20;
    this.height = 20;
    this.offsetTop = 20;
    this.offsetLeft = 1000;
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

export default FloatingPlatform;
