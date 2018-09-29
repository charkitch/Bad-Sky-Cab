import Tower from './tower';
import FloatingPlatform from './floating_platform';
import TallTower from './tall_tower.js';

class Obstacles {
  constructor() {
    this.allObstacles = [];
    this.obstacleCount = 5;
    this.timer = 0;
  }

  obstacleGenerator() {
    for (let i = 0; i < this.obstacleCount; i++) {
      this.allObstacles[i] = this.randomStructure();
    }
  }

  addObstacle() {
    let newby = this.randomStructure();
    if (newby) {
      this.addToQ(this.randomStructure());
    }
  }

  randomStructure() {
    let possibility = randomNumber(3);
    switch (possibility) {
      case 0:
        return new Tower();
      case 1:
        return new TallTower();
      case 2:
        return new FloatingPlatform();
    }
  }

  clearAndGo() {
    this.clearFromQ();
  }


  addToQ(obstacle) {
    this.allObstacles.push(obstacle);
  }

  clearFromQ() {
    this.allObstacles.shift();
  }

  checkObstacles() {
    if (this.allObstacles.length < this.obstacleCount) {
        if (this.timer > 1000) {
          let density = randomNumber(100);
          if (density > 85) {
            this.addObstacle();
            this.timer = 0;
          }
        }
    }
  }

  travel(obstacle, speed = 1) {
    obstacle.offsetLeft -= speed;
  }

  drawObstacles(cntx) {
    this.checkObstacles();
    this.allObstacles.forEach( (obstacle) => {
      this.travel(obstacle);
      let stored = obstacle.offsetLeft;
      if (obstacle.offsetLeft + obstacle.width < 0) {
        this.clearAndGo();
      }
      obstacle.draw(cntx);
      obstacle.x = obstacle.offsetLeft;
      this.timer += 1;
    });
  }
}

export default Obstacles;

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
