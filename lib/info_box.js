class InfoBox {
  constructor(AuthorBox) {
    this.cntx = AuthorBox.getContext('2d');
    this.x = 300;
    this.y = 300;
  }

  draw(cntx, score) {

    this.cntx.font = '50px Arial';
    this.cntx.fillStyle = 'black';
    this.cntx.fillText(
      `BAD SKY CAB`,
      this.x,
      this.y
    );
    this.cntx.strokeStyle = "red";
    this.cntx.strokeText(
      `BAD SKY CAB`,
      this.x,
      this.y
    );
  }
}



export default InfoBox
