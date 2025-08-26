class PerformanceProfiler {
  constructor(name = 'Game') {
    this.name = name;
    this.frameStartTime = 0;
    this.frameEndTime = 0;
    this.frameTimes = [];
    this.renderTimes = [];
    this.collisionTimes = [];
    this.updateTimes = [];
    this.entityCounts = [];
    this.memoryUsages = [];
    
    // Metrics
    this.startTime = performance.now();
    this.totalFrames = 0;
    this.maxSamples = 1000; // Keep last 1000 samples
    
    // Memory monitoring
    this.memorySupported = 'measureUserAgentSpecificMemory' in performance;
  }

  startFrame() {
    this.frameStartTime = performance.now();
  }

  endFrame() {
    this.frameEndTime = performance.now();
    const frameTime = this.frameEndTime - this.frameStartTime;
    
    this.frameTimes.push(frameTime);
    this.totalFrames++;
    
    // Keep only recent samples to prevent memory bloat
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
  }

  startRender() {
    this.renderStartTime = performance.now();
  }

  endRender() {
    const renderTime = performance.now() - this.renderStartTime;
    this.renderTimes.push(renderTime);
    
    if (this.renderTimes.length > this.maxSamples) {
      this.renderTimes.shift();
    }
  }

  startCollisionDetection() {
    this.collisionStartTime = performance.now();
  }

  endCollisionDetection() {
    const collisionTime = performance.now() - this.collisionStartTime;
    this.collisionTimes.push(collisionTime);
    
    if (this.collisionTimes.length > this.maxSamples) {
      this.collisionTimes.shift();
    }
  }

  startUpdate() {
    this.updateStartTime = performance.now();
  }

  endUpdate() {
    const updateTime = performance.now() - this.updateStartTime;
    this.updateTimes.push(updateTime);
    
    if (this.updateTimes.length > this.maxSamples) {
      this.updateTimes.shift();
    }
  }

  recordEntityCount(count) {
    this.entityCounts.push(count);
    
    if (this.entityCounts.length > this.maxSamples) {
      this.entityCounts.shift();
    }
  }

  async recordMemoryUsage() {
    if (this.memorySupported) {
      try {
        const memInfo = await performance.measureUserAgentSpecificMemory();
        const totalBytes = memInfo.bytes;
        this.memoryUsages.push(totalBytes / 1024 / 1024); // Convert to MB
        
        if (this.memoryUsages.length > this.maxSamples) {
          this.memoryUsages.shift();
        }
      } catch (e) {
        // Fallback to basic memory estimation
        this.memoryUsages.push(this.estimateMemoryUsage());
      }
    } else {
      this.memoryUsages.push(this.estimateMemoryUsage());
    }
  }

  estimateMemoryUsage() {
    // Rough estimation based on performance.memory if available
    if (performance.memory) {
      return performance.memory.usedJSHeapSize / 1024 / 1024;
    }
    return 0; // Unknown
  }

  getStats() {
    const runtime = performance.now() - this.startTime;
    
    return {
      name: this.name,
      runtime: runtime,
      totalFrames: this.totalFrames,
      averageFPS: this.totalFrames / (runtime / 1000),
      
      frameTime: this.calculateStats(this.frameTimes),
      renderTime: this.calculateStats(this.renderTimes),
      collisionTime: this.calculateStats(this.collisionTimes),
      updateTime: this.calculateStats(this.updateTimes),
      entityCount: this.calculateStats(this.entityCounts),
      memoryUsage: this.calculateStats(this.memoryUsages),
    };
  }

  calculateStats(array) {
    if (array.length === 0) return { avg: 0, min: 0, max: 0, p95: 0, variance: 0 };
    
    const sorted = [...array].sort((a, b) => a - b);
    const sum = array.reduce((a, b) => a + b, 0);
    const avg = sum / array.length;
    
    // Calculate variance
    const variance = array.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / array.length;
    
    return {
      avg: avg,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      variance: variance,
      stdDev: Math.sqrt(variance)
    };
  }

  exportData() {
    return {
      timestamp: new Date().toISOString(),
      stats: this.getStats(),
      rawData: {
        frameTimes: [...this.frameTimes],
        renderTimes: [...this.renderTimes],
        collisionTimes: [...this.collisionTimes],
        updateTimes: [...this.updateTimes],
        entityCounts: [...this.entityCounts],
        memoryUsages: [...this.memoryUsages]
      }
    };
  }

  reset() {
    this.frameTimes = [];
    this.renderTimes = [];
    this.collisionTimes = [];
    this.updateTimes = [];
    this.entityCounts = [];
    this.memoryUsages = [];
    this.startTime = performance.now();
    this.totalFrames = 0;
  }
}

export default PerformanceProfiler;