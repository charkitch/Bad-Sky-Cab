import Obstacle from './obstacle';

class TallTower extends Obstacle {
  constructor() {
    super();
    this.width = 30;
    this.height = 250;
    this.y = 120;
    this.image.src = './assets/images/buildings/wide_building.png';
  }
}

export default TallTower;
