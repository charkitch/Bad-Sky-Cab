import Obstacle from './obstacle';
import * as Utilities from '../util';


class Vehicle extends Obstacle {
  constructor(options) {
    super();
    this.width = 40;
    this.height = 20;
    this.speed = 15;
  }
}

export default Vehicle;
