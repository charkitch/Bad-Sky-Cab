import Delivery from './delivery';
import * as Utilities from '../util';

const vehicles = [

  'delivery_left'];


class VehicleLeft extends Delivery {
  constructor() {
    super();
    this.y = 90;
    this.speed = 15;
    this.image.src = './assets/images/vehicles/delivery_left.png';
  }
}

export default VehicleLeft;
