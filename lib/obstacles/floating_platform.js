import Obstacle from './obstacle';
import * as Util from '../util';

const platforms = [
  'sky_condo',
  'sushi_bar',
  'moody_sky_condo',
  'closed_craffiti',
  'train_platform',
  'drone'
];


class FloatingPlatform extends Obstacle {
  constructor(options) {
    super();
    this.width = 30;
    this.height = 20;
    this.y = 20;
    this.image.src = './assets/images/platforms/' + Util.sample(platforms) + '.png';
  }
}

export default FloatingPlatform;
