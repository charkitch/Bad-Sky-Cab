import Obstacle from './obstacle';
import * as Util from '../util';

const platforms = [
  'sky_condo',
  'sushi_bar',
  'moody_sky_condo',
  'closed_craffiti',
  'drone',
  // 'chipper_shop'
];


class FloatingPlatform extends Obstacle {
  constructor(options) {
    super();
    this.width = 50;
    this.height = 30;
    this.y = 20;
    this.image.src = './assets/images/platforms/'
      + Util.sample(platforms) + '.png';
  }
}

export default FloatingPlatform;
