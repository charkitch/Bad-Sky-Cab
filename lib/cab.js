class Cab {
  constructor(cntx) {
    this.height = 20;
    this.width = 40;
    this.x = 75;
    this.Y = 200;
    this.damage = 0;
    this.rightPressed = false;
    this.leftPressed = false;
    this.upPressed = false;
    this.downPressed = false;
    this.image = new Image();
    this.image.src = './assets/images/vehicles/taxi.png';
  }

  imageToggle() {
    // if (this.image.src = './assets/images/vehicles/taxi.png') {
      // this.image.src =
    // }
  }



  drawCab(cntx, canvasHeight) {
    cntx.drawImage(this.image, this.x, this.Y, 40, 20);
  }


}

export default Cab;
