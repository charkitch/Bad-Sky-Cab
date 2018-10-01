import Vehicle from './vehicle';
import * as Utilities from '../util';

const vehicles = ['taxi', 'police', 'civil', 'boom', 'delivery_truck'];


class VehicleRight extends Vehicle {
  constructor() {
    super();
    this.y = 50;
    this.x = -31;
    this.image.src = './assets/images/vehicles/' + Utilities.sample(vehicles) + '.png';
  }
}

export default VehicleRight;
