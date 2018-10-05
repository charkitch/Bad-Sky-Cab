class StartGameBox {
  constructor() {
    this.x = 100;
    this.y = 50;
  }

  draw(cntx, score) {
    cntx.strokeText(
      `Click here to start driving the unfriendly skies.`,
      this.x,
      this.y
    );
  }
}

export default StartGameBox;
