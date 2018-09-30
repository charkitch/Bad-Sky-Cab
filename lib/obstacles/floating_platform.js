import Obstacle from './obstacle';
const platforms = [
  'sky_condo',
  'sushi_bar',
  'moody_sky_condo',
  'closed_craffiti',
  'train_platform'
];

function randomNumber(limiter) {
  const rando = Math.random();
  const useful = rando * limiter;
  const usefulInt = Math.floor(useful);
  return usefulInt;
}

function sample(array) {
  const randoInd = randomNumber(array.length);
  return array[randoInd];
}

class FloatingPlatform extends Obstacle {
  constructor(options) {
    super();
    this.width = 30;
    this.height = 20;
    this.y = 20;
    this.image.src = './assets/images/platforms/' + sample(platforms) + '.png';
  }
}

export default FloatingPlatform;
