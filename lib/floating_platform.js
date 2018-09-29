
const platforms = ['sky_condo', 'sushi_bar', 'moody_sky_condo', 'closed_craffiti', 'train_platform'];

function randomNumber(limiter) {
  const rando = Math.random();
  const useful = rando * limiter;
  const usefulInt = Math.floor(useful);
  return usefulInt;
}

function sample(array) {
  const randoInd = randomNumber(array.length);
  return array[randoInd];
}

class FloatingPlatform {
  constructor(options) {
    this.x = 0;
    this.y = 0;
    this.width = 30;
    this.height = 20;
    this.offsetTop = 20;
    this.offsetLeft = 1000;
    this.image = new Image();
    this.image.src = './assets/platforms/' + sample(platforms) + '.png';
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
    cntx.drawImage(
      this.image,
      this.offsetLeft,
      this.offsetTop,
      this.width,
      this.height
    );
  }
}

export default FloatingPlatform;
