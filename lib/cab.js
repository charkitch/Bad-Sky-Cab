class Cab {
  constructor(cntx) {
    this.height = 20;
    this.width = 40;
    this.cabX = 75;
    this.cabY = 50;
    this.damage = 0;
    this.rightPressed = false;
    this.leftPressed = false;
    this.upPressed = false;
    this.downPressed = false;
    this.image = new Image();
    this.image.src = './assets/vehicle_taxi.png';
  }

  // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, 40, 20);
  // void ctx.drawImage(this.image, this.cabX, this.cabY, 40, 20);


  drawCab(cntx, canvasHeight) {
    debugger
    cntx.drawImage(this.image, this.cabX, canvasHeight - this.cabY, 40, 20);
  }


//   drawCab(cntx, canvasHeight) {
//     cntx.beginPath();
//     cntx.rect(
//       this.cabX,
//       canvasHeight - this.cabY,
//       this.width,
//       this.height
//     );
//     cntx.fillStyle = 'blue';
//     cntx.fill();
//   }
}

export default Cab;
