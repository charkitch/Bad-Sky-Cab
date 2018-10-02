import WideTower from './obstacles/wide_tower';
import FloatingPlatform from './obstacles/floating_platform';
import TallTower from './obstacles/tall_tower.js';
import Train from './obstacles/train.js';
import VehicleRight from './obstacles/vehicle_right';
import VehicleLeft from './obstacles/vehicle_left';

class Obstructions {
  constructor() {
    this.allObstructions = [];
    this.obstructionCount = 40;
    this.timer = 0;
  }

  obstacleGenerator() {
    for (let i = 0; i < this.obstructionCount; i++) {
      this.allObstructions[i] = this.randomStructure();
    }
  }

  addObstruction() {
    let newby = this.randomStructure();
    if (newby) {
      this.addToQ(this.randomStructure());
    }
  }

  randomStructure() {
    let possibility = randomNumber(10);
    switch (possibility) {
      case 0:
      case 3:
        return new WideTower();
      case 1:
      case 9:
        return new TallTower();
      case 2:
        return new FloatingPlatform();
      case 4:
        return new Train();
      case 5:
      case 6:
      return new VehicleLeft();
      case 7:
      case 8:
        return new VehicleRight();

    }
  }

  clearAndGo() {
    this.clearFromQ();
  }


  addToQ(obstacle) {
    this.allObstructions.push(obstacle);
  }

  clearFromQ() {
    this.allObstructions.shift();
  }

  checkObstacles() {
    if (this.allObstructions.length < this.obstructionCount) {
        if (this.timer > 240) {
          let density = randomNumber(100);
          if (density > 85) {
            this.addObstruction();
            this.timer = 0;
          }
        }
    }
  }

  travel(obstacle, speed = 4) {
    if (obstacle.constructor.name === "Train") {
      obstacle.x -= 20;
      return;
    } else if (obstacle.constructor.name === "VehicleRight") {
      obstacle.x += 15;
    } else if (obstacle.constructor.name === "VehicleLeft") {
      obstacle.x -= 15;
    }
    obstacle.x -= speed;
  }

  drawObstacles(cntx) {
    this.checkObstacles();
    this.allObstructions.forEach( (obstacle) => {
      this.travel(obstacle);
      let stored = obstacle.x;
      if (obstacle.x + obstacle.width < -10000 || obstacle.x > 10000 ) {
        this.clearAndGo();
      }
      obstacle.draw(cntx);
      this.timer += 1;
    });
  }
}

export default Obstructions;

function randomNumber(limiter) {
  const rando = Math.random();
  const useful = rando * limiter;
  const usefulInt = Math.floor(useful);
  return usefulInt;
}

function randomRange(max, min) {
  const rando = Math.random();
  const rangified = rando * (max - min) + min;
  const usefulInt = Math.floor(rangified);
  return usefulInt;
}
