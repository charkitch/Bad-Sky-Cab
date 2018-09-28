import Towers from './towers';

class Obstacles {
  constructor() {
    this.towers = new Towers();
    this.allObstacles = this.towers.towerCollection;
  }

  drawObstacles(cntx) {
    this.towers.drawTowers(cntx);
  }
}

export default Obstacles;
