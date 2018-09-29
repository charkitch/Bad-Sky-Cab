class Tower {
  constructor(options) {
    this.x = 0;
    this.y = 0;
    this.width = 80;
    this.height = 200;
    this.offsetTop = 160;
    this.offsetLeft = 1000;
    this.image = new Image();
    this.image.src = './assets/wide_building.png'
  }

  // draw(cntx) {
  //   this.x = this.offsetLeft;
  //   cntx.beginPath();
  //   cntx.rect(this.offsetLeft, this.offsetTop, this.width, this.height);
  //   cntx.fillStyle = "green";
  //   cntx.fill();
  //   cntx.closePath();
  // }

  draw(cntx) {
    cntx.drawImage(this.image, this.offsetLeft, this.offsetTop, this.width, this.height);
  }
}


// void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, 40, 20);
// void ctx.drawImage(this.image, this.cabX, this.cabY, 40, 20);


export default Tower;
