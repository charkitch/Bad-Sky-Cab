import SpeakerIcon from './lib/interface/speaker_icon.js';
import Sound from './lib/audio/sound.js';

class GameSelector {
  constructor() {
    this.gameContainer = document.getElementById('game-container');
    this.gameSelector = document.querySelector('.game-selector');
    this.jsBtn = document.getElementById('js-version');
    this.rustBtn = document.getElementById('rust-version');
    this.backBtn = document.getElementById('back-to-menu');
    this.currentGame = null;
    
    this.bindEvents();
  }

  bindEvents() {
    this.jsBtn.addEventListener('click', () => this.startJSVersion());
    this.rustBtn.addEventListener('click', () => this.startRustVersion());
    this.backBtn.addEventListener('click', () => this.backToMenu());
    
    // Listen for back to menu events from game
    window.addEventListener('backToMenu', () => this.backToMenu());
  }

  startJSVersion() {
    this.showGameContainer();
    this.loadJSGame();
  }

  async startRustVersion() {
    this.showGameContainer();
    await this.loadRustGame();
  }

  showGameContainer() {
    this.gameSelector.style.display = 'none';
    this.gameContainer.style.display = 'flex';
  }

  backToMenu() {
    if (this.currentGame && this.currentGame.cleanup) {
      this.currentGame.cleanup();
    }
    if (this.currentGame && this.currentGame.themeSound) {
        this.currentGame.themeSound.stop();
    }
    this.currentGame = null;
    this.gameContainer.style.display = 'none';
    this.gameSelector.style.display = 'flex';
    
    // Clear canvas
    const canvas = document.getElementById('game-world');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  loadJSGame() {
    // Import and start the original JavaScript game
    import('./lib/game.js').then(GameModule => {
      const canvas = document.getElementById('game-world');
      const context = canvas.getContext('2d');
      this.currentGame = new GameModule.default(canvas, context);
      this.currentGame.render();
    });
  }

  async loadRustGame() {
    try {
      // Load the Rust WASM module
      const wasm = await import('./rust-game/pkg/rust_game.js');
      await wasm.default();
      
      // Create Rust game wrapper
      this.currentGame = new RustGameWrapper(wasm);
      await this.currentGame.loadAllImages();
      this.currentGame.start();
    } catch (error) {
      console.error('Failed to load Rust game:', error);
      alert('Rust version not yet available. Please try the JavaScript version.');
      this.backToMenu();
    }
  }
}

class RustGameWrapper {
  constructor(wasmModule) {
    this.wasm = wasmModule;
    this.canvas = document.getElementById('game-world');
    this.ctx = this.canvas.getContext('2d');
    this.gameState = null;
    this.running = false;
    this.soundPaused = true;
    this.speakerIcon = new SpeakerIcon();
    this.themeSound = new Sound({
        src: './assets/audio/317363.mp3',
        loopStatus: true
    });
    
    // Load vehicle images
    this.vehicleImages = {};
    
    // Load orb image
    this.orbImage = new Image();
    this.orbImage.src = './assets/images/vehicles/boom.png';
    
    // Load player image (yellow taxi)
    this.playerImage = new Image();
    this.playerImage.src = './assets/images/vehicles/taxi.png';
    
    // Load billboard images
    this.billboardImages = {};
    
    // Load building and platform images
    this.buildingImages = {};

    // Load obstacle images
    this.obstacleImages = {};
    
    this.bindEvents();
  }

  async loadAllImages() {
    await Promise.all([
        this.loadVehicleImages(),
        this.loadBillboardImages(),
        this.loadBuildingImages(),
        this.loadObstacleImages(),
    ]);
  }

  loadVehicleImages() {
    const imageNames = {
      'Taxi_right': './assets/images/vehicles/taxi.png',
      'Taxi_left': './assets/images/vehicles/taxi_left.png',
      'Police_right': './assets/images/vehicles/police.png',
      'Police_left': './assets/images/vehicles/police_left.png',
      'Civil_right': './assets/images/vehicles/civil.png',
      'Civil_left': './assets/images/vehicles/civil_left.png',
      'Delivery_right': './assets/images/vehicles/delivery_truck.png',
      'Delivery_left': './assets/images/vehicles/delivery_left.png',
      'Train_front': './assets/images/vehicles/train_front.png',
      'Train_center': './assets/images/vehicles/train_center.png',
      'Train_back': './assets/images/vehicles/train_back.png'
    };

    const promises = Object.entries(imageNames).map(([key, src]) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.vehicleImages[key] = img;
                resolve();
            };
            img.onerror = reject;
            img.src = src;
        });
    });

    return Promise.all(promises);
  }

  loadBillboardImages() {
    const billboardNames = {
      'FirstBreak': './assets/images/billboards/first_break.png',
      'SecondBreak': './assets/images/billboards/second_break.png',
      'Security': './assets/images/billboards/security.png',
      'Security2': './assets/images/billboards/security2.png',
      'SharkMovie': './assets/images/billboards/shark_movie.png'
    };

    const promises = Object.entries(billboardNames).map(([key, src]) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.billboardImages[key] = img;
                resolve();
            };
            img.onerror = reject;
            img.src = src;
        });
    });

    return Promise.all(promises);
  }

  loadBuildingImages() {
    const buildingNames = {
      // Buildings
      'TallTower': './assets/images/buildings/tall_building.png',
      'WideTower': './assets/images/buildings/wide_building.png',
      'BuildingTop': './assets/images/buildings/wide_building.png', // Use wide building for building tops
      
      // Platforms
      'FloatingPlatform': './assets/images/platforms/sky_condo.png',
      
      // Additional platforms we can use
      'ClosedShop': './assets/images/platforms/Closed-Shop-Single.png',
      'ChipperShop': './assets/images/platforms/chipper_shop.png',
      'SushiBar': './assets/images/platforms/sushi_bar.png',
      'MoodySkyCondo': './assets/images/platforms/moody_sky_condo.png',
      'Drone': './assets/images/platforms/drone.png'
    };

    const promises = Object.entries(buildingNames).map(([key, src]) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.buildingImages[key] = img;
                resolve();
            };
            img.onerror = reject;
            img.src = src;
        });
    });

    return Promise.all(promises);
  }

  loadObstacleImages() {
    const obstacleImageNames = {
        'WideTower': './assets/images/buildings/wide_building.png',
        'TallTower': './assets/images/buildings/tall_building.png',
        'BuildingTop': './assets/images/buildings/tall_building.png',
    };

    const promises = Object.entries(obstacleImageNames).map(([key, src]) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.obstacleImages[key] = img;
                resolve();
            };
            img.onerror = reject;
            img.src = src;
        });
    });

    return Promise.all(promises);
  }

  start() {
    this.gameState = new this.wasm.GameState();
    this.running = true;
    this.gameLoop();
  }

  bindEvents() {
    // Input handling will be implemented here
    document.addEventListener('keydown', (e) => this.handleInput(e, true));
    document.addEventListener('keyup', (e) => this.handleInput(e, false));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
  }

  handleMouseUp(e) {
    if (this.inSpeakerBox(e)) {
      this.soundButtonPressed();
    }
  }

  soundButtonPressed() {
    if (this.soundPaused === false) {
        this.soundPaused = true;
        this.themeSound.stop();
    } else {
        this.soundPaused = false;
        this.themeSound.play(this.soundPaused);
    }
  }

  inSpeakerBox(e) {
    let page = this.canvas.getBoundingClientRect();
    let clickX = e.clientX - page.left;
    let clickY = e.clientY - page.top;
    return clickX > this.speakerIcon.x
      && clickX < this.speakerIcon.x + 15
        && clickY > this.speakerIcon.y
         && clickY < this.speakerIcon.y + 20;
  }

  handleInput(event, pressed) {
    if (!this.gameState) return;
    
    const key = event.key;
    
    // Handle restart and escape in game over state
    if (pressed && this.gameState.is_game_over()) {
      if (key === 'r' || key === 'R') {
        this.gameState.reset();
        return;
      } else if (key === 'Escape') {
        // Go back to menu
        window.dispatchEvent(new Event('backToMenu'));
        return;
      }
    }
    
    // Regular movement controls
    if (key === 'ArrowRight' || key === 'd') {
      this.gameState.set_input('right', pressed);
    } else if (key === 'ArrowLeft' || key === 'a') {
      this.gameState.set_input('left', pressed);
    } else if (key === 'ArrowUp' || key === 'w') {
      this.gameState.set_input('up', pressed);
    } else if (key === 'ArrowDown' || key === 's') {
      this.gameState.set_input('down', pressed);
    }
  }

  gameLoop() {
    if (!this.running) return;
    
    // Update game state in Rust
    this.gameState.update();
    
    // Get serialized state from Rust
    const state = JSON.parse(this.gameState.get_state());
    
    // Render using JavaScript
    this.render(state);
    
    requestAnimationFrame(() => this.gameLoop());
  }

  render(state) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render far background buildings (parallax)
    if (state.background?.far_buildings) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.6; // Increased opacity to make buildings more visible
      this.ctx.fillStyle = '#556677'; // Lighter color for better visibility
      state.background.far_buildings.forEach(building => {
        this.ctx.fillRect(
          building.x + (state.background.far_building_offset || 0),
          building.y,
          building.width,
          building.height
        );
      });
      this.ctx.restore();
    }

    // Render traffic lanes with vehicles FIRST (background layer)
    if (state.background?.traffic_vehicles) {
      state.background.traffic_vehicles.forEach(vehicle => {
        this.renderVehicle(vehicle);
      });
      this.ctx.globalAlpha = 1.0;
      this.ctx.shadowBlur = 0;
    }

    // Render billboards AFTER traffic (foreground layer)
    if (state.background?.billboards) {
      state.background.billboards.forEach(billboard => {
        this.renderBillboard(billboard);
      });
    }

    // Render game obstacles (foreground)
    if (state.obstacles) {
      state.obstacles.forEach(obstacle => {
        this.renderObstacle(obstacle);
      });
    }
    
    // Render player (always on top) - use taxi image
    if (state.player) {
      if (this.playerImage && this.playerImage.complete) {
        this.ctx.drawImage(this.playerImage, state.player.x, state.player.y, state.player.width, state.player.height);
      } else {
        // Fallback to yellow rectangle if image not loaded
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
        
        // Add player border
        this.ctx.strokeStyle = '#ff6600';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(state.player.x, state.player.y, state.player.width, state.player.height);
      }
    }
    
    // Render UI
    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px Arial';
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 3;
    
    // Score with outline for readability
    const scoreText = `Score: ${state.score || 0}`;
    this.ctx.strokeText(scoreText, 10, 30);
    this.ctx.fillText(scoreText, 10, 30);
    
    // Color-coded damage indicator like original game
    const damage = state.player?.damage || 0;
    const structuralIntegrity = Math.floor(10 - damage);
    
    // Structural integrity label
    this.ctx.strokeText('Structural Integrity:', 10, 60);
    this.ctx.fillText('Structural Integrity:', 10, 60);
    
    // Color-coded damage value
    let damageColor;
    if (damage < 2) {
      damageColor = '#00ff00'; // Green - healthy
    } else if (damage < 6) {
      damageColor = '#daa520'; // Goldenrod - damaged  
    } else {
      damageColor = '#ff0000'; // Red - critical
    }
    
    this.ctx.strokeStyle = damageColor;
    this.ctx.fillStyle = damageColor;
    this.ctx.strokeText(`${structuralIntegrity}`, 200, 60);
    this.ctx.fillText(`${structuralIntegrity}`, 200, 60);
    
    // Reset colors for other UI elements
    this.ctx.strokeStyle = 'black';
    this.ctx.fillStyle = 'white';
    
    // Game over overlay
    if (state.game_over) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#ff0066';
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      const gameOverText = 'GAME OVER';
      this.ctx.strokeText(gameOverText, this.canvas.width/2, this.canvas.height/2);
      this.ctx.fillText(gameOverText, this.canvas.width/2, this.canvas.height/2);
      
      this.ctx.fillStyle = 'white';
      this.ctx.font = '24px Arial';
      const finalScoreText = `Final Score: ${state.score || 0}`;
      this.ctx.strokeText(finalScoreText, this.canvas.width/2, this.canvas.height/2 + 50);
      this.ctx.fillText(finalScoreText, this.canvas.width/2, this.canvas.height/2 + 50);
      
      this.ctx.font = '18px Arial';
      const restartText = 'Press R to restart or ESC for menu';
      this.ctx.strokeText(restartText, this.canvas.width/2, this.canvas.height/2 + 80);
      this.ctx.fillText(restartText, this.canvas.width/2, this.canvas.height/2 + 80);
      
      this.ctx.restore();
    }
    this.speakerIcon.draw(this.ctx, this.soundPaused);
    this.themeSound.play(this.soundPaused);
  }

  renderVehicle(vehicle) {
    if (vehicle.vehicle_type === 'Train') {
      this.renderTrain(vehicle);
    } else if (vehicle.vehicle_type === 'TrafficOrb') {
      this.renderOrb(vehicle);
    } else {
      this.renderRegularVehicle(vehicle);
    }
    
    // Add status indicators
    if (vehicle.avoiding) {
      this.ctx.fillStyle = 'yellow';
      this.ctx.font = '14px Arial';
      this.ctx.fillText('!', vehicle.x + vehicle.width/2 - 5, vehicle.y - 5);
    }
    
    // Add chase indicators
    if (vehicle.is_being_chased) {
      this.ctx.fillStyle = 'red';
      this.ctx.font = '12px Arial';
      this.ctx.fillText('🏃', vehicle.x + vehicle.width/2 - 8, vehicle.y - 8);
    }
    
    if (vehicle.is_chasing) {
      this.ctx.fillStyle = 'blue';
      this.ctx.font = '12px Arial';
      this.ctx.fillText('👮', vehicle.x + vehicle.width/2 - 8, vehicle.y - 8);
    }
  }

  renderRegularVehicle(vehicle) {
    const direction = vehicle.moving_right ? 'right' : 'left';
    let imageKey = `${vehicle.vehicle_type}_${direction}`;
    
    // Use regular police image for PoliceChase
    if (vehicle.vehicle_type === 'PoliceChase') {
      imageKey = `Police_${direction}`;
    }
    
    const image = this.vehicleImages[imageKey];
    
    if (image && image.complete) {
      // Add special effects
      if (vehicle.vehicle_type === 'PoliceChase') {
        // Flashing blue-red lights for police chase
        const time = Date.now() * 0.01;
        const flash = Math.sin(time) > 0;
        this.ctx.shadowColor = flash ? '#ff0000' : '#0000ff';
        this.ctx.shadowBlur = 12;
      } else if (vehicle.avoiding) {
        // Yellow glow for avoiding vehicles
        this.ctx.shadowColor = '#ffff00';
        this.ctx.shadowBlur = 8;
      }
      
      this.ctx.drawImage(image, vehicle.x, vehicle.y, vehicle.width, vehicle.height);
      
      // Clear shadow effects
      this.ctx.shadowBlur = 0;
    } else {
      // Fallback to colored rectangle if image not loaded
      let color = '#ffcc00';
      switch (vehicle.vehicle_type) {
        case 'Police': color = '#0066ff'; break;
        case 'PoliceChase': color = '#0044aa'; break; // Darker blue for chase car
        case 'Civil': color = '#888888'; break;
        case 'Delivery': color = '#ff6600'; break;
        case 'Taxi': color = '#ffcc00'; break;
        case 'TrafficOrb': color = '#00ccff'; break; // Cyan for orbs (handled by renderOrb)
      }
      
      this.ctx.fillStyle = color;
      this.ctx.fillRect(vehicle.x, vehicle.y, vehicle.width, vehicle.height);
    }
  }

  renderTrain(vehicle) {
    const trainLength = vehicle.width;
    const carWidth = 40; // Each train car is about 40px
    const numCars = Math.ceil(trainLength / carWidth);
    
    for (let i = 0; i < numCars; i++) {
      const carX = vehicle.x + (i * carWidth);
      const actualCarWidth = Math.min(carWidth, trainLength - (i * carWidth));
      
      let imageKey;
      if (i === 0) {
        imageKey = 'Train_front';
      } else if (i === numCars - 1) {
        imageKey = 'Train_back';
      } else {
        imageKey = 'Train_center';
      }
      
      const image = this.vehicleImages[imageKey];
      
      if (image && image.complete) {
        this.ctx.drawImage(image, carX, vehicle.y, actualCarWidth, vehicle.height);
      } else {
        // Fallback rendering
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(carX, vehicle.y, actualCarWidth, vehicle.height);
        
        // Add car dividers
        if (i > 0) {
          this.ctx.strokeStyle = '#666666';
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(carX, vehicle.y);
          this.ctx.lineTo(carX, vehicle.y + vehicle.height);
          this.ctx.stroke();
        }
      }
    }
  }

  renderOrb(vehicle) {
    if (this.orbImage && this.orbImage.complete) {
      // Add glow effect for orbs
      this.ctx.save();
      this.ctx.shadowColor = '#00ffff';
      this.ctx.shadowBlur = 8;
      
      this.ctx.drawImage(this.orbImage, vehicle.x, vehicle.y, vehicle.width, vehicle.height);
      this.ctx.restore();
    } else {
      // Fallback rendering - glowing circle
      this.ctx.save();
      this.ctx.shadowColor = '#00ffff';
      this.ctx.shadowBlur = 10;
      this.ctx.fillStyle = '#00ccff';
      this.ctx.beginPath();
      this.ctx.arc(vehicle.x + vehicle.width/2, vehicle.y + vehicle.height/2, vehicle.width/2, 0, 2 * Math.PI);
      this.ctx.fill();
      
      // Add border
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(vehicle.x + vehicle.width/2, vehicle.y + vehicle.height/2, vehicle.width/2, 0, 2 * Math.PI);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  renderBillboard(billboard) {
    const imageKey = billboard.billboard_type;
    const image = this.billboardImages[imageKey];
    
    if (image && image.complete) {
      this.ctx.drawImage(image, billboard.x, billboard.y, billboard.width, billboard.height);
    } else {
      // Fallback rendering
      this.ctx.fillStyle = '#330066';
      this.ctx.fillRect(billboard.x, billboard.y, billboard.width, billboard.height);
      
      // Add border for visibility
      this.ctx.strokeStyle = '#ff00ff';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(billboard.x, billboard.y, billboard.width, billboard.height);
      
      // Add text
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '12px Arial';
      this.ctx.fillText('AD', billboard.x + billboard.width/2 - 10, billboard.y + billboard.height/2 + 5);
    }
  }

  renderObstacle(obstacle) {
    const image = this.obstacleImages[obstacle.obstacle_type];

    if (image && image.complete) {
        this.ctx.drawImage(image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    } else {
        // Fallback rendering
        this.ctx.fillStyle = '#808080'; // Gray color for unloaded obstacles
        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
  }

  cleanup() {
    this.running = false;
    if (this.gameState) {
      this.gameState.free();
    }
  }
}

// Initialize the game selector when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new GameSelector();
});
