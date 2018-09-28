class Towers {
  constructor() {
    this.towerCollection = [];
    this.towersCount = 6;
    this.towerWidth = 80;
    this.towerHeight = 200;
    this.towerOffsetTop = 160;
    this.towerOffsetLeft = 3000;
  }

  towerGenerator() {
    for (let i = 0; i < this.towersCount; i++) {
      this.towerCollection[i] = { x: 0, y: 0 };
    }
  }

  drawTower(tower, cntx) {
    cntx.beginPath();
    cntx.rect(this.towerOffsetLeft, this.towerOffsetTop, this.towerWidth, this.towerHeight);
    cntx.fillStyle = "green";
    cntx.fill();
    cntx.closePath();
  }

  clearAndGo() {
    this.towerCollection.shift();
  }

  drawTowers(cntx) {
    this.towerCollection.forEach( (tower, i) => {
      let stored = this.towerOffsetLeft;
      this.towerOffsetLeft = this.towerOffsetLeft - (i * 300);
      if (this.towerOffsetLeft + this.towerWidth < 0) {
        this.clearAndGo();
      }
      this.drawTower(tower, cntx);
      tower.x = this.towerOffsetLeft;
      this.towerOffsetLeft = stored - 1;
    });
  }
}

export default Towers;
