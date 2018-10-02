class Backdrop {
  constructor() {
    this.image = new Image();
    this.image.src = './assets/images/backdrop/backdrop';
    this.x = 0;
  }

  draw(cntx) {
    cntx.drawImage(this.image, this.x, 0);
  }
}

export default Backdrop;
