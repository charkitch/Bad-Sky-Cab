/**
 * Automated Performance Benchmark Suite
 * Compares JavaScript vs Rust WASM game performance
 */

class BenchmarkRunner {
  constructor() {
    this.results = {
      javascript: {},
      rust: {},
      comparison: {},
      testEnvironment: this.getEnvironmentInfo()
    };
    
    this.scenarios = [
      { name: 'light', duration: 60000, description: 'Light load - 60 seconds' },
      { name: 'medium', duration: 60000, description: 'Medium load - 60 seconds' },
      { name: 'heavy', duration: 60000, description: 'Heavy load - 60 seconds' },
      { name: 'endurance', duration: 300000, description: 'Endurance test - 5 minutes' }
    ];
  }

  getEnvironmentInfo() {
    const nav = navigator;
    return {
      userAgent: nav.userAgent,
      platform: nav.platform,
      language: nav.language,
      hardwareConcurrency: nav.hardwareConcurrency || 'unknown',
      memory: nav.deviceMemory ? `${nav.deviceMemory}GB` : 'unknown',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      screenResolution: `${screen.width}x${screen.height}`,
      pixelRatio: window.devicePixelRatio
    };
  }

  async runBenchmark() {
    console.log('🚀 Starting Performance Benchmark Suite');
    console.log('Environment:', this.results.testEnvironment);
    
    // Create UI for benchmark progress
    this.createBenchmarkUI();
    
    try {
      // Run JavaScript benchmarks
      this.updateProgress('Testing JavaScript version...');
      this.results.javascript = await this.runJavaScriptBenchmarks();
      
      // Wait between tests
      await this.wait(2000);
      
      // Run Rust WASM benchmarks
      this.updateProgress('Testing Rust WASM version...');
      this.results.rust = await this.runRustBenchmarks();
      
      // Generate comparison
      this.results.comparison = this.generateComparison();
      
      // Display results
      this.displayResults();
      
      // Export data
      this.exportResults();
      
    } catch (error) {
      console.error('Benchmark failed:', error);
      this.updateProgress('Benchmark failed: ' + error.message);
    }
  }

  createBenchmarkUI() {
    // Create overlay for benchmark UI
    const overlay = document.createElement('div');
    overlay.id = 'benchmark-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      color: white;
      font-family: monospace;
      padding: 20px;
      box-sizing: border-box;
      z-index: 10000;
      overflow: auto;
    `;
    
    overlay.innerHTML = `
      <h1>🔬 Performance Benchmark Suite</h1>
      <div id="benchmark-progress">Initializing...</div>
      <div id="benchmark-results" style="margin-top: 20px;"></div>
      <button id="close-benchmark" style="position: absolute; top: 20px; right: 20px; padding: 10px;">Close</button>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('close-benchmark').onclick = () => {
      document.body.removeChild(overlay);
    };
  }

  updateProgress(message) {
    const progressElement = document.getElementById('benchmark-progress');
    if (progressElement) {
      progressElement.innerHTML = message;
    }
    console.log(message);
  }

  async runJavaScriptBenchmarks() {
    const results = {};
    
    for (const scenario of this.scenarios) {
      this.updateProgress(`JavaScript - ${scenario.description}`);
      
      // Force JavaScript version
      const url = new URL(window.location);
      url.searchParams.set('profile', 'true');
      url.searchParams.set('force', 'js');
      
      const data = await this.runScenario('javascript', scenario, url.toString());
      results[scenario.name] = data;
      
      await this.wait(1000); // Brief pause between scenarios
    }
    
    return results;
  }

  async runRustBenchmarks() {
    const results = {};
    
    for (const scenario of this.scenarios) {
      this.updateProgress(`Rust WASM - ${scenario.description}`);
      
      // Force Rust version
      const url = new URL(window.location);
      url.searchParams.set('profile', 'true');
      url.searchParams.set('force', 'rust');
      
      const data = await this.runScenario('rust', scenario, url.toString());
      results[scenario.name] = data;
      
      await this.wait(1000); // Brief pause between scenarios
    }
    
    return results;
  }

  async runScenario(version, scenario, url) {
    return new Promise((resolve, reject) => {
      // Create hidden iframe for isolated testing
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position: absolute; left: -9999px; width: 800px; height: 600px;';
      iframe.src = url;
      
      document.body.appendChild(iframe);
      
      let startTime = Date.now();
      let timeoutId;
      let profileData = null;
      
      const cleanup = () => {
        document.body.removeChild(iframe);
        if (timeoutId) clearTimeout(timeoutId);
      };
      
      iframe.onload = () => {
        // Wait for game to initialize
        setTimeout(() => {
          // Start the appropriate game version
          const gameSelector = iframe.contentWindow.gameSelector;
          if (version === 'javascript') {
            gameSelector.loadJavaScriptGame();
          } else {
            gameSelector.loadRustGame();
          }
          
          // Set timeout for scenario duration
          timeoutId = setTimeout(() => {
            try {
              // Get profiling data
              if (version === 'javascript' && gameSelector.currentGame) {
                profileData = gameSelector.currentGame.getProfileData();
              } else if (version === 'rust' && gameSelector.currentGame) {
                profileData = gameSelector.currentGame.getProfileData();
              }
              
              cleanup();
              resolve({
                scenario: scenario.name,
                version: version,
                duration: scenario.duration,
                profileData: profileData,
                timestamp: new Date().toISOString()
              });
            } catch (error) {
              cleanup();
              reject(error);
            }
          }, scenario.duration);
          
        }, 2000); // Wait for game to load
      };
      
      iframe.onerror = (error) => {
        cleanup();
        reject(error);
      };
    });
  }

  generateComparison() {
    const comparison = {};
    
    for (const scenario of this.scenarios) {
      const jsData = this.results.javascript[scenario.name]?.profileData;
      const rustData = this.results.rust[scenario.name]?.profileData;
      
      if (jsData && rustData) {
        comparison[scenario.name] = {
          frameTime: this.compareMetric(jsData.stats?.frameTime, rustData.stats?.frameTime),
          renderTime: this.compareMetric(jsData.stats?.renderTime, rustData.stats?.renderTime),
          fps: this.compareMetric({ avg: jsData.stats?.averageFPS }, { avg: rustData.stats?.averageFPS }, true),
          entityCount: this.compareMetric(jsData.stats?.entityCount, rustData.stats?.entityCount),
          memoryUsage: this.compareMetric(jsData.stats?.memoryUsage, rustData.stats?.memoryUsage)
        };
      }
    }
    
    return comparison;
  }

  compareMetric(jsMetric, rustMetric, higherIsBetter = false) {
    if (!jsMetric || !rustMetric) return null;
    
    const jsValue = jsMetric.avg || 0;
    const rustValue = rustMetric.avg || 0;
    
    const difference = rustValue - jsValue;
    const percentChange = jsValue !== 0 ? (difference / jsValue) * 100 : 0;
    
    let improvement;
    if (higherIsBetter) {
      improvement = percentChange; // Positive = better for FPS
    } else {
      improvement = -percentChange; // Negative difference = improvement for time/memory
    }
    
    return {
      javascript: jsValue,
      rust: rustValue,
      difference: difference,
      percentImprovement: improvement,
      winner: improvement > 0 ? 'rust' : (improvement < 0 ? 'javascript' : 'tie')
    };
  }

  displayResults() {
    const resultsElement = document.getElementById('benchmark-results');
    if (!resultsElement) return;
    
    let html = '<h2>📊 Benchmark Results</h2>';
    
    // Summary table
    html += '<h3>Performance Summary</h3>';
    html += '<table style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
    html += '<tr style="background: #333;"><th style="border: 1px solid #666; padding: 8px;">Metric</th>';
    
    for (const scenario of this.scenarios) {
      html += `<th style="border: 1px solid #666; padding: 8px;">${scenario.name}</th>`;
    }
    html += '</tr>';
    
    const metrics = ['frameTime', 'renderTime', 'fps'];
    for (const metric of metrics) {
      html += `<tr><td style="border: 1px solid #666; padding: 8px;">${metric}</td>`;
      
      for (const scenario of this.scenarios) {
        const comparison = this.results.comparison[scenario.name]?.[metric];
        if (comparison) {
          const color = comparison.winner === 'rust' ? '#4CAF50' : 
                       comparison.winner === 'javascript' ? '#f44336' : '#FFC107';
          html += `<td style="border: 1px solid #666; padding: 8px; color: ${color};">
            ${comparison.percentImprovement.toFixed(1)}% (${comparison.winner})
          </td>`;
        } else {
          html += '<td style="border: 1px solid #666; padding: 8px;">N/A</td>';
        }
      }
      html += '</tr>';
    }
    html += '</table>';
    
    // Export button
    html += '<button onclick="window.benchmarkRunner.downloadResults()" style="padding: 10px; margin: 10px;">📥 Download Results</button>';
    
    resultsElement.innerHTML = html;
    
    // Also log to console
    console.log('📊 Benchmark Results:', this.results);
  }

  exportResults() {
    // Save to localStorage for persistence
    localStorage.setItem('benchmarkResults', JSON.stringify(this.results));
    
    // Make results globally available
    window.benchmarkResults = this.results;
    window.benchmarkRunner = this;
  }

  downloadResults() {
    const dataStr = JSON.stringify(this.results, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `benchmark-results-${Date.now()}.json`;
    link.click();
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Auto-start benchmark if URL parameter is present
if (window.location.search.includes('benchmark=true')) {
  document.addEventListener('DOMContentLoaded', () => {
    const runner = new BenchmarkRunner();
    runner.runBenchmark();
  });
}

// Make runner available globally
window.BenchmarkRunner = BenchmarkRunner;