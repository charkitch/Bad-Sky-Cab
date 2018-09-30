import Obstacle from './obstacle';

class WideTower extends Obstacle {
  constructor() {
    super();
    this.width = 80;
    this.height = 200;
    this.y = 160;
    this.image.src = './assets/images/buildings/wide_building.png';
  }

}


export default WideTower;
