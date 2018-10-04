import Obstacle from './obstacle';


class Delivery extends Obstacle {
  constructor(options) {
    super();
    this.width = 40;
    this.height = 30;
    this.speed = 15;
  }
}

export default Delivery;
