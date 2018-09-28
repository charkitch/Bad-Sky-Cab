import Tower from './tower';

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
    this.addToQ(this.randomStructure());
  }

  randomStructure() {
    return new Tower();
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
      debugger
        if (this.timer > 1000) {
          this.addObstacle();
          this.timer = 0;
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
//
//       this.towerOffsetLeft = stored - 1;
//     });
//   }
// }
