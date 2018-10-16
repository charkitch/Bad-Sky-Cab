class Cab {
  constructor(cntx) {
    this.height = 20;
    this.width = 40;
    this.x = 75;
    this.y = 110;
    this.damage = 0;
    this.rightPressed = false;
    this.leftPressed = false;
    this.upPressed = false;
    this.downPressed = false;
    this.image = new Image();
    this.image.src = './assets/images/vehicles/taxi.png';
  }

  zoomForward() {
    this.x += 4;
  }

  applyBrakes() {
    this.x -= 2.5;
  }

  gainAltitude() {
    this.y -= 2.5;
  }

  loseAltitude() {
    this.y += 4;
  }


  drawCab(cntx, canvasHeight) {
    cntx.drawImage(this.image, this.x, this.y, 40, 20);
  }

  bounceUp(obstacle) {
    this.y -= 10;
    this.damage += obstacle.damage / 4;
  }

  bounceDown(obstacle) {
    this.x -=20;
    this.y += 5;
    this.damage += obstacle.damage / 4;
  }

  bounceLeft(obstacle) {
    this.x -= 100;
    this.damage += obstacle.damage;
  }

  bounceRight(obstacle) {
    this.x += 10;
    this.damage += obstacle.damage / 2;
  }

}

export default Cab;
