/**
 * System Monitor - Real-time CPU, Memory, and FPS tracking
 */

class SystemMonitor {
  constructor() {
    this.isRunning = false;
    this.startTime = 0;
    this.maxDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
    this.data = {
      cpu: [],
      memory: [],
      fps: [],
      timestamps: []
    };
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.fpsHistory = [];
    
    // CPU monitoring via performance observer
    this.cpuUsage = 0;
    this.lastCpuTime = 0;
    
    this.createUI();
    this.bindEvents();
  }

  createUI() {
    if (document.getElementById('system-monitor')) return;

    const monitor = document.createElement('div');
    monitor.id = 'system-monitor';
    monitor.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.9);
      color: #00ff00;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      padding: 10px;
      border-radius: 5px;
      z-index: 10000;
      min-width: 220px;
      border: 1px solid #333;
    `;

    monitor.innerHTML = `
      <div style="color: #fff; font-weight: bold; margin-bottom: 8px;">📊 SYSTEM MONITOR</div>
      <div>Version: <span id="current-version">None</span></div>
      <div>Time: <span id="elapsed-time">00:00</span> / 10:00</div>
      <div>CPU: <span id="cpu-usage">0%</span></div>
      <div>Memory: <span id="memory-usage">0 MB</span></div>
      <div>FPS: <span id="fps-display">0</span></div>
      <div>Frame Time: <span id="frame-time">0ms</span></div>
      <hr style="margin: 8px 0; border: 1px solid #333;">
      <div style="font-size: 10px;">
        <button onclick="systemMonitor.startMonitoring('javascript')" style="padding: 3px; margin: 1px; font-size: 10px;">JS</button>
        <button onclick="systemMonitor.startMonitoring('rust')" style="padding: 3px; margin: 1px; font-size: 10px;">Rust</button>
        <button onclick="systemMonitor.stopMonitoring()" style="padding: 3px; margin: 1px; font-size: 10px;">Stop</button>
        <button onclick="systemMonitor.exportData()" style="padding: 3px; margin: 1px; font-size: 10px;">Export</button>
      </div>
    `;

    document.body.appendChild(monitor);
  }

  bindEvents() {
    // Track frame rate using RAF
    const trackFPS = () => {
      if (!this.isRunning) return;
      
      const now = performance.now();
      const frameTime = now - this.lastFrameTime;
      this.lastFrameTime = now;
      
      this.frameCount++;
      this.fpsHistory.push(1000 / frameTime);
      
      if (this.fpsHistory.length > 60) { // Keep last 60 frames
        this.fpsHistory.shift();
      }
      
      requestAnimationFrame(trackFPS);
    };
    
    this.trackFPS = trackFPS;
  }

  async startMonitoring(version = 'unknown') {
    this.isRunning = true;
    this.startTime = Date.now();
    this.data = { cpu: [], memory: [], fps: [], timestamps: [] };
    
    document.getElementById('current-version').textContent = version;
    document.getElementById('elapsed-time').textContent = '00:00';
    
    // Start game if version specified
    if (version === 'javascript') {
      window.gameSelector?.loadJSGame();
    } else if (version === 'rust') {
      await window.gameSelector?.loadRustGame();
    }
    
    // Start FPS tracking
    this.trackFPS();
    
    // Start system monitoring loop
    this.monitoringLoop = setInterval(() => {
      this.collectMetrics();
    }, 1000); // Collect every second
    
    console.log(`System monitoring started for ${version} (10 minute limit)`);
  }

  stopMonitoring() {
    this.isRunning = false;
    if (this.monitoringLoop) {
      clearInterval(this.monitoringLoop);
    }
    
    document.getElementById('current-version').textContent = 'Stopped';
    console.log('System monitoring stopped');
  }

  async collectMetrics() {
    if (!this.isRunning) return;

    const timestamp = Date.now();
    const elapsed = timestamp - this.startTime;
    
    // Check if 10 minutes have passed
    if (elapsed >= this.maxDuration) {
      console.log('10-minute monitoring period completed. Auto-stopping.');
      this.stopMonitoring();
      return;
    }
    
    // Memory usage
    const memoryMB = this.getMemoryUsage();
    
    // CPU usage (estimated)
    const cpuPercent = this.getCPUUsage();
    
    // FPS calculation
    const currentFPS = this.getCurrentFPS();
    const frameTime = currentFPS > 0 ? (1000 / currentFPS) : 0;
    
    // Store data
    this.data.timestamps.push(timestamp);
    this.data.memory.push(memoryMB);
    this.data.cpu.push(cpuPercent);
    this.data.fps.push(currentFPS);
    
    // Keep only last 600 points (10 minutes at 1s intervals)
    if (this.data.timestamps.length > 600) {
      this.data.timestamps.shift();
      this.data.memory.shift();
      this.data.cpu.shift();
      this.data.fps.shift();
    }
    
    // Update UI with elapsed time
    this.updateDisplay(cpuPercent, memoryMB, currentFPS, frameTime, elapsed);
  }

  getMemoryUsage() {
    if (performance.memory) {
      return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
    }
    
    // Fallback estimation based on game state
    const gameSelector = window.gameSelector;
    if (gameSelector?.currentGame) {
      // Rough estimate: base JS heap + game objects
      return Math.round(20 + (this.frameCount * 0.001)); // Very rough estimate
    }
    
    return 0;
  }

  getCPUUsage() {
    // Estimate CPU usage based on frame timing consistency
    if (this.fpsHistory.length < 10) return 0;
    
    const recent = this.fpsHistory.slice(-10);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const variance = recent.reduce((acc, fps) => acc + Math.pow(fps - avg, 2), 0) / recent.length;
    
    // Higher variance + lower FPS = higher estimated CPU load
    const baseLoad = Math.max(0, (60 - avg) * 2); // Higher load when FPS drops below 60
    const varianceLoad = Math.min(variance * 2, 30); // Add load for inconsistent frame times
    
    return Math.min(Math.round(baseLoad + varianceLoad), 100);
  }

  getCurrentFPS() {
    if (this.fpsHistory.length === 0) return 0;
    
    // Average of last 10 frames for smoothing
    const recent = this.fpsHistory.slice(-10);
    return Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
  }

  updateDisplay(cpu, memory, fps, frameTime, elapsed = 0) {
    document.getElementById('cpu-usage').textContent = `${cpu}%`;
    document.getElementById('memory-usage').textContent = `${memory} MB`;
    document.getElementById('fps-display').textContent = fps;
    document.getElementById('frame-time').textContent = `${frameTime.toFixed(1)}ms`;
    
    // Update elapsed time display
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    document.getElementById('elapsed-time').textContent = 
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Color coding for performance
    const fpsElement = document.getElementById('fps-display');
    if (fps >= 55) fpsElement.style.color = '#00ff00';
    else if (fps >= 30) fpsElement.style.color = '#ffaa00';
    else fpsElement.style.color = '#ff0000';
    
    // Color coding for time (warning when approaching 10 minutes)
    const timeElement = document.getElementById('elapsed-time');
    if (elapsed >= 9 * 60 * 1000) timeElement.style.color = '#ff6600'; // Orange at 9 minutes
    else if (elapsed >= 8 * 60 * 1000) timeElement.style.color = '#ffaa00'; // Yellow at 8 minutes
    else timeElement.style.color = '#00ff00'; // Green
  }

  exportData() {
    if (this.data.timestamps.length === 0) {
      console.log('No data to export');
      return;
    }

    const exportData = {
      systemMetrics: {
        ...this.data,
        duration: this.data.timestamps.length,
        averages: {
          cpu: this.data.cpu.reduce((a, b) => a + b, 0) / this.data.cpu.length,
          memory: this.data.memory.reduce((a, b) => a + b, 0) / this.data.memory.length,
          fps: this.data.fps.reduce((a, b) => a + b, 0) / this.data.fps.length
        },
        peaks: {
          maxCPU: Math.max(...this.data.cpu),
          maxMemory: Math.max(...this.data.memory),
          minFPS: Math.min(...this.data.fps.filter(f => f > 0))
        }
      },
      environment: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
        timestamp: new Date().toISOString()
      }
    };

    // Download as JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('System metrics exported:', exportData.systemMetrics.averages);
  }

  // Store results for manual comparison
  storeResults(version) {
    if (this.data.timestamps.length === 0) {
      console.log('No data to store');
      return;
    }

    const results = {
      version: version,
      duration: this.data.timestamps.length,
      avgCPU: Math.round(this.data.cpu.reduce((a, b) => a + b, 0) / this.data.cpu.length),
      avgMemory: Math.round(this.data.memory.reduce((a, b) => a + b, 0) / this.data.memory.length),
      avgFPS: Math.round(this.data.fps.reduce((a, b) => a + b, 0) / this.data.fps.length),
      maxCPU: Math.max(...this.data.cpu),
      maxMemory: Math.max(...this.data.memory),
      minFPS: Math.min(...this.data.fps.filter(f => f > 0)),
      rawData: { ...this.data }
    };

    // Store in localStorage for comparison
    localStorage.setItem(`monitor_${version}_${Date.now()}`, JSON.stringify(results));
    console.log(`${version} results stored:`, results);
    
    return results;
  }

  // Compare stored results
  compareStoredResults() {
    const stored = Object.keys(localStorage)
      .filter(key => key.startsWith('monitor_'))
      .map(key => JSON.parse(localStorage.getItem(key)))
      .sort((a, b) => a.version.localeCompare(b.version));

    if (stored.length < 2) {
      console.log('Need at least 2 stored results to compare. Current stored:', stored.length);
      return;
    }

    const js = stored.find(r => r.version === 'javascript');
    const rust = stored.find(r => r.version === 'rust');

    if (js && rust) {
      const comparison = {
        javascript: {
          avgCPU: js.avgCPU,
          avgMemory: js.avgMemory,
          avgFPS: js.avgFPS,
          duration: `${js.duration} seconds`
        },
        rust: {
          avgCPU: rust.avgCPU,
          avgMemory: rust.avgMemory,
          avgFPS: rust.avgFPS,
          duration: `${rust.duration} seconds`
        },
        differences: {
          cpuChange: rust.avgCPU - js.avgCPU,
          memoryChange: rust.avgMemory - js.avgMemory,
          fpsChange: rust.avgFPS - js.avgFPS
        }
      };

      console.log('🔬 COMPARISON RESULTS:', comparison);
      return comparison;
    }
  }

  // Clear stored results
  clearStoredResults() {
    Object.keys(localStorage)
      .filter(key => key.startsWith('monitor_'))
      .forEach(key => localStorage.removeItem(key));
    console.log('Stored results cleared');
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  if (!window.systemMonitor) {
    window.systemMonitor = new SystemMonitor();
  }
});