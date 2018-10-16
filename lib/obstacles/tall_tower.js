import Obstacle from './obstacle';

import { sample } from '../util';

let heights = [250, 300, 350];
let ys = [ 120, 140, 160, 180, 200]

class TallTower extends Obstacle {
  constructor() {
    super();
    this.width = 60;
    this.height = sample(heights);
    this.y = sample(ys);
    this.image.src = './assets/images/buildings/wide_building.png';
  }
}

export default TallTower;
