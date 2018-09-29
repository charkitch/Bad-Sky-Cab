class TallTower {
  constructor(options) {
    this.x = 0;
    this.y = 0;
    this.width = 30;
    this.height = 300;
    this.offsetTop = 100;
    this.offsetLeft = 1000;
    this.image = new Image();
    this.image.src = './assets/wide_building.png';
  }



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

export default TallTower;
