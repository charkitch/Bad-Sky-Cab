import Vehicle from './vehicle';
import * as Utilities from '../util';

const vehicles = [
  'taxi_left',
  'police_left',
  'civil_left',
  'boom',
  'delivery_left'];


class VehicleLeft extends Vehicle {
  constructor() {
    super();
    this.y = 90;
    this.speed = 15;
    this.image.src = './assets/images/vehicles/' + Utilities.sample(vehicles) + '.png';
  }
}

export default VehicleLeft;
