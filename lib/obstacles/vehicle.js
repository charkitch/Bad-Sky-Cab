import Obstacle from './obstacle';
import * as Utilities from '../util';


class Vehicle extends Obstacle {
  constructor(options) {
    super();
    this.width = 30;
    this.height = 20;
  }
}

export default Vehicle;
