// export function drawCab(c) {
//   cntx.beginPath();
//   cntx.rect(cabX, canvas.height-cabY, cabWidth, cabHeight);
//   cntx.fillStyle = 'blue';
//   cntx.fill();
// }


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
  }

  drawCab(cntx, canvasHeight) {
    cntx.beginPath();
    cntx.rect(
      this.cabX,
      canvasHeight - this.cabY,
      this.width,
      this.height
    );
    cntx.fillStyle = 'blue';
    cntx.fill();
  }
}

export default Cab;
