import FloatingPlatform from './floating_platform';

import * as Util from '../util';



class Billboard extends FloatingPlatform {
  constructor(options) {
    super();
    this.billboards = [ 'first_break', 'second_break', 'security', 'security2', 'shark_movie']
    this.width = 140;
    this.height = 80;
    this.y = -10;
    this.image.src = './assets/images/billboards/'
      + Util.sample(this.billboards) + '.png';
  }
}


export default Billboard;
