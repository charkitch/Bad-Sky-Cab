/**
 * Simple Test Runner for Performance Profiling
 * Provides manual controls for running individual tests
 */

class TestRunner {
  constructor() {
    this.currentTest = null;
    this.testData = {};
    this.createUI();
  }

  createUI() {
    // Check if already exists
    if (document.getElementById('test-runner-ui')) return;

    const ui = document.createElement('div');
    ui.id = 'test-runner-ui';
    ui.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      font-family: monospace;
      font-size: 12px;
      padding: 15px;
      border-radius: 8px;
      z-index: 9999;
      max-width: 300px;
      display: none;
    `;

    ui.innerHTML = `
      <div style="margin-bottom: 10px; font-weight: bold;">🔬 Performance Profiler</div>
      
      <div style="margin-bottom: 10px;">
        <strong>Current:</strong> <span id="current-version">None</span><br>
        <strong>Runtime:</strong> <span id="runtime">0s</span><br>
        <strong>FPS:</strong> <span id="current-fps">0</span><br>
        <strong>Frame Time:</strong> <span id="frame-time">0ms</span>
      </div>

      <div style="margin-bottom: 10px;">
        <button onclick="testRunner.startTest('javascript')" style="padding: 5px; margin: 2px;">Test JS</button>
        <button onclick="testRunner.startTest('rust')" style="padding: 5px; margin: 2px;">Test Rust</button>
      </div>

      <div style="margin-bottom: 10px;">
        <button onclick="testRunner.stopTest()" style="padding: 5px; margin: 2px;">Stop</button>
        <button onclick="testRunner.exportData()" style="padding: 5px; margin: 2px;">Export</button>
        <button onclick="testRunner.toggleUI()" style="padding: 5px; margin: 2px;">Hide</button>
      </div>

      <div id="test-status" style="font-size: 11px; color: #888;"></div>
    `;

    document.body.appendChild(ui);
    
    // Show/hide based on URL parameter
    if (window.location.search.includes('profile=true')) {
      ui.style.display = 'block';
    }

    // Start monitoring
    this.startMonitoring();
  }

  toggleUI() {
    const ui = document.getElementById('test-runner-ui');
    if (ui) {
      ui.style.display = ui.style.display === 'none' ? 'block' : 'none';
    }
  }

  async startTest(version) {
    try {
      this.updateStatus(`Starting ${version} test...`);
      
      // Reset current data
      this.currentTest = {
        version: version,
        startTime: Date.now(),
        data: null
      };

      // Switch to the appropriate game version
      const gameSelector = window.gameSelector;
      if (!gameSelector) {
        throw new Error('Game selector not found');
      }

      // Stop current game if running
      if (gameSelector.currentGame) {
        gameSelector.backToMenu();
        await this.wait(1000);
      }

      // Enable profiling
      const url = new URL(window.location);
      url.searchParams.set('profile', 'true');
      if (url.toString() !== window.location.toString()) {
        window.history.replaceState({}, '', url.toString());
      }

      // Start the appropriate version
      if (version === 'javascript') {
        gameSelector.loadJSGame();
      } else {
        await gameSelector.loadRustGame();
      }

      this.updateStatus(`${version} test running...`);
      document.getElementById('current-version').textContent = version;

    } catch (error) {
      this.updateStatus(`Test failed: ${error.message}`);
      console.error('Test start failed:', error);
    }
  }

  stopTest() {
    if (!this.currentTest) {
      this.updateStatus('No test running');
      return;
    }

    try {
      // Get profiling data from current game
      const gameSelector = window.gameSelector;
      let profileData = null;

      if (gameSelector && gameSelector.currentGame) {
        if (typeof gameSelector.currentGame.getProfileData === 'function') {
          profileData = gameSelector.currentGame.getProfileData();
        }
      }

      // Store test results
      const testResult = {
        version: this.currentTest.version,
        duration: Date.now() - this.currentTest.startTime,
        timestamp: new Date().toISOString(),
        profileData: profileData
      };

      this.testData[`${this.currentTest.version}_${Date.now()}`] = testResult;
      
      this.updateStatus(`Test stopped. Duration: ${(testResult.duration / 1000).toFixed(1)}s`);
      document.getElementById('current-version').textContent = 'None';
      
      this.currentTest = null;

    } catch (error) {
      this.updateStatus(`Stop failed: ${error.message}`);
      console.error('Test stop failed:', error);
    }
  }

  startMonitoring() {
    setInterval(() => {
      this.updateMonitoringData();
    }, 1000);
  }

  updateMonitoringData() {
    if (!this.currentTest) return;

    const runtime = Math.floor((Date.now() - this.currentTest.startTime) / 1000);
    document.getElementById('runtime').textContent = `${runtime}s`;

    // Try to get real-time stats from current game
    try {
      const gameSelector = window.gameSelector;
      if (gameSelector && gameSelector.currentGame) {
        const game = gameSelector.currentGame;
        
        if (game.profiler && game.profilingEnabled) {
          const stats = game.profiler.getStats();
          if (stats) {
            document.getElementById('current-fps').textContent = stats.averageFPS.toFixed(1);
            if (stats.frameTime && stats.frameTime.avg) {
              document.getElementById('frame-time').textContent = stats.frameTime.avg.toFixed(2) + 'ms';
            }
          }
        } else if (game.getProfileData) {
          // For Rust version
          const data = game.getProfileData();
          if (data && data.average_fps) {
            document.getElementById('current-fps').textContent = data.average_fps.toFixed(1);
            if (data.frame_time && data.frame_time.avg) {
              document.getElementById('frame-time').textContent = data.frame_time.avg.toFixed(2) + 'ms';
            }
          }
        }
      }
    } catch (error) {
      // Silent fail for monitoring updates
    }
  }

  exportData() {
    if (Object.keys(this.testData).length === 0) {
      this.updateStatus('No test data to export');
      return;
    }

    const exportData = {
      testData: this.testData,
      environment: this.getEnvironmentInfo(),
      exportTime: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `profile-data-${Date.now()}.json`;
    link.click();

    this.updateStatus(`Exported ${Object.keys(this.testData).length} test results`);
  }

  getEnvironmentInfo() {
    const nav = navigator;
    return {
      userAgent: nav.userAgent,
      platform: nav.platform,
      hardwareConcurrency: nav.hardwareConcurrency,
      memory: nav.deviceMemory,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
  }

  updateStatus(message) {
    const statusEl = document.getElementById('test-status');
    if (statusEl) {
      statusEl.textContent = message;
    }
    console.log('TestRunner:', message);
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Quick test methods
  async quickTest(version, duration = 30000) {
    await this.startTest(version);
    setTimeout(() => {
      this.stopTest();
    }, duration);
  }

  async compareVersions(duration = 60000) {
    this.updateStatus('Starting comparison test...');
    
    // Test JavaScript version
    await this.quickTest('javascript', duration);
    await this.wait(2000);
    
    // Test Rust version  
    await this.quickTest('rust', duration);
    await this.wait(1000);
    
    this.updateStatus('Comparison complete. Check exported data.');
  }
}

// Auto-initialize when profiling is enabled
if (window.location.search.includes('profile=true')) {
  document.addEventListener('DOMContentLoaded', () => {
    window.testRunner = new TestRunner();
  });
}

// Make available globally
window.TestRunner = TestRunner;