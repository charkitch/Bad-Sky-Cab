import Obstacle from './obstacle';


class Vehicle extends Obstacle {
  constructor(options) {
    super();
    this.width = 40;
    this.height = 20;
    this.speed = 15;
  }
}

export default Vehicle;
