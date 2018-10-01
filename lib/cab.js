class Cab {
  constructor(cntx) {
    this.height = 20;
    this.width = 40;
    this.cabX = 75;
    this.cabY = 200;
    this.damage = 0;
    this.rightPressed = false;
    this.leftPressed = false;
    this.upPressed = false;
    this.downPressed = false;
    this.image = new Image();
    this.image.src = './assets/images/vehicles/taxi.png';
  }




  drawCab(cntx, canvasHeight) {
    cntx.drawImage(this.image, this.cabX, this.cabY, 40, 20);
  }


}

export default Cab;
