// export function drawCab(c) {
//   cntx.beginPath();
//   cntx.rect(cabX, canvas.height-cabY, cabWidth, cabHeight);
//   cntx.fillStyle = 'blue';
//   cntx.fill();
// }


class Cab {
  constructor() {
    this.Height = 20;
    this.Width = 40;
    this.cabX = 75;
    this.cabY = 50;
    this.damage = 0;
    this.rightPressed = false;
    this.leftPressed = false;
    this.upPressed = false;
    this.downPressed = false;
    }
}
