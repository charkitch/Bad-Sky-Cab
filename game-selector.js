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
    
    this.bindEvents();
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
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillStyle = '#444466';
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

    // Render traffic lanes with vehicles
    if (state.background?.traffic_vehicles) {
      state.background.traffic_vehicles.forEach(vehicle => {
        // Different colors for different vehicle types and directions
        let color = '#ffcc00'; // Default yellow
        switch (vehicle.vehicle_type) {
          case 'Police':
            color = vehicle.moving_right ? '#0066ff' : '#004499';
            break;
          case 'Civil':
            color = vehicle.moving_right ? '#888888' : '#666666';
            break;
          case 'Delivery':
            color = vehicle.moving_right ? '#ff6600' : '#dd4400';
            break;
          case 'Taxi':
          default:
            color = vehicle.moving_right ? '#ffcc00' : '#ddaa00';
            break;
        }
        
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = 0.7;
        this.ctx.fillRect(vehicle.x, vehicle.y, vehicle.width, vehicle.height);
        
        // Add direction indicators (simple arrows)
        this.ctx.fillStyle = 'white';
        this.ctx.globalAlpha = 1.0;
        this.ctx.font = '12px Arial';
        this.ctx.fillText(
          vehicle.moving_right ? '→' : '←',
          vehicle.x + vehicle.width/2 - 6,
          vehicle.y + vehicle.height/2 + 4
        );
      });
      this.ctx.globalAlpha = 1.0;
    }

    // Render game obstacles (foreground)
    if (state.obstacles) {
      state.obstacles.forEach(obstacle => {
        // Different colors for different obstacle types
        let color = '#ff4444';
        switch (obstacle.obstacle_type) {
          case 'Train':
            color = '#666666';
            break;
          case 'Billboard':
            color = '#00ccff';
            break;
          case 'FloatingPlatform':
            color = '#88ff88';
            break;
          case 'TallTower':
          case 'WideTower':
          case 'BuildingTop':
            color = '#994444';
            break;
          default:
            color = '#ff4444';
        }
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Add a border for better visibility
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      });
    }
    
    // Render player (always on top)
    if (state.player) {
      this.ctx.fillStyle = '#ffff00';
      this.ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
      
      // Add player border
      this.ctx.strokeStyle = '#ff6600';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(state.player.x, state.player.y, state.player.width, state.player.height);
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
    
    // Damage with outline
    const damageText = `Damage: ${Math.floor(state.player?.damage || 0)}`;
    this.ctx.strokeText(damageText, 10, 60);
    this.ctx.fillText(damageText, 10, 60);
    
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