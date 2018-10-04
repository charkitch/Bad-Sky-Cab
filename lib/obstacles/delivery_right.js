import Vehicle from './vehicle';
import * as Utilities from '../util';



class DeliveryRight extends Vehicle {
  constructor() {
    super();
    this.y = 50;
    this.x = -31;
    this.image.src = './assets/images/vehicles/delivery_truck.png';
  }
}

export default DeliveryRight;
