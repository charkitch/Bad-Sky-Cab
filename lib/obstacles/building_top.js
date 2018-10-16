import Obstacle from './obstacle';

import { sample } from '../util';


class BuildingTop extends Obstacle {
  constructor() {
    super();
    this.ys = [250, 300, 350];
    this.width = 60;
    this.height = 120;
    this.y = sample(this.ys);
    this.image.src = './assets/images/buildings/tall_building.png';
  }
}

export default BuildingTop;
