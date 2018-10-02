import Obstacle from './obstacle';

class Train extends Obstacle {
  constructor() {
    super();
    this.width = 400;
    this.height = 20;
    this.y = 70;
    this.image.src = './assets/images/vehicles/train_center.png';
    this.damage = 4;
  }
}


export default Train;
