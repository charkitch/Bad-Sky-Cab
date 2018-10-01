import Obstacle from './obstacle';
import * as Utilities from '../util';

const vehicles = ['taxi', 'police', 'civil', 'boom'];

class DeliveryTruck extends Obstacle {
  constructor(options) {
    super();
    this.width = 30;
    this.height = 20;
    this.y = 50;
    this.x = -100;
    this.image.src = './assets/images/vehicles/' + Utilities.sample(vehicles) + '.png';
  }
}

export default DeliveryTruck;
