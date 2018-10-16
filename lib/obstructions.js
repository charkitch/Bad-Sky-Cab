import WideTower from './obstacles/wide_tower';
import FloatingPlatform from './obstacles/floating_platform';
import TallTower from './obstacles/tall_tower.js';
import Train from './obstacles/train.js';
import VehicleRight from './obstacles/vehicle_right';
import VehicleLeft from './obstacles/vehicle_left';
import * as Util from './util';
import DeliveryRight from './obstacles/delivery_right';
import DeliveryLeft from './obstacles/delivery_left';
import Billboard from './obstacles/billboard';
import BuildingTop from './obstacles/building_top';

class Obstructions {
  constructor() {
    this.allObstructions = [];
    this.obstructionCount = 50;
    this.timer = 300;
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
    let possibility = Util.randomNumber(100);
    if (possibility < 13) {
      return new WideTower();
    } else if (possibility < 30) {
      return new TallTower();
    } else if (possibility < 20) {
      return new FloatingPlatform();
    } else if (possibility < 55) {
      return new Train();
    } else if (possibility < 68) {
      return new VehicleLeft();
    } else if (possibility < 82) {
      return new VehicleRight();
    } else if (possibility < 83) {
      return new DeliveryRight();
    } else if (possibility < 85) {
      return new DeliveryLeft();
    } else if (possibility < 93) {
      return new Billboard();
    } else if (possibility < 100) {
      return new BuildingTop();
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
        if (this.timer > 50) {
          let density = Util.randomNumber(100);
          if (density > 10) {
            this.addObstruction();
            this.timer = 25;
          }
        }
    }
  }

  travel(obstacle, speed = 4) {
    if (obstacle.constructor.name === "VehicleRight") {
      obstacle.x += 15;
      return;
    }
    obstacle.x -= obstacle.speed;
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
      // this.timer += 1;
    });
  }
}

export default Obstructions;
