/**
 * Performance Analysis Tools
 * Statistical analysis and visualization for benchmark results
 */

class PerformanceAnalyzer {
  constructor() {
    this.results = null;
  }

  loadResults(resultsData) {
    this.results = resultsData;
    return this;
  }

  generateStatisticalSummary() {
    if (!this.results) return null;

    const summary = {
      testEnvironment: this.results.testEnvironment,
      overallWinner: this.determineOverallWinner(),
      detailedAnalysis: {},
      recommendations: this.generateRecommendations()
    };

    // Analyze each scenario
    const scenarios = ['light', 'medium', 'heavy', 'endurance'];
    for (const scenario of scenarios) {
      summary.detailedAnalysis[scenario] = this.analyzeScenario(scenario);
    }

    return summary;
  }

  analyzeScenario(scenario) {
    const jsData = this.results.javascript[scenario]?.profileData?.stats;
    const rustData = this.results.rust[scenario]?.profileData?.stats;
    const comparison = this.results.comparison[scenario];

    if (!jsData || !rustData) {
      return { error: 'Missing data for scenario: ' + scenario };
    }

    return {
      scenario: scenario,
      metrics: {
        frameTime: this.analyzeMetric('frameTime', jsData.frameTime, rustData.frameTime, false),
        renderTime: this.analyzeMetric('renderTime', jsData.renderTime, rustData.renderTime, false),
        fps: this.analyzeMetric('fps', { avg: jsData.averageFPS }, { avg: rustData.averageFPS }, true),
        entityCount: this.analyzeMetric('entityCount', jsData.entityCount, rustData.entityCount, false),
        memoryUsage: this.analyzeMetric('memoryUsage', jsData.memoryUsage, rustData.memoryUsage, false)
      },
      winner: this.determineScenarioWinner(comparison),
      confidence: this.calculateStatisticalConfidence(jsData, rustData)
    };
  }

  analyzeMetric(name, jsMetric, rustMetric, higherIsBetter) {
    const jsValue = jsMetric?.avg || 0;
    const rustValue = rustMetric?.avg || 0;
    
    const difference = rustValue - jsValue;
    const percentChange = jsValue !== 0 ? Math.abs(difference / jsValue) * 100 : 0;
    
    let improvement;
    if (higherIsBetter) {
      improvement = difference > 0 ? percentChange : -percentChange;
    } else {
      improvement = difference < 0 ? percentChange : -percentChange;
    }

    return {
      javascript: {
        avg: jsValue,
        min: jsMetric?.min || 0,
        max: jsMetric?.max || 0,
        stdDev: jsMetric?.stdDev || 0,
        variance: jsMetric?.variance || 0
      },
      rust: {
        avg: rustValue,
        min: rustMetric?.min || 0,
        max: rustMetric?.max || 0,
        stdDev: rustMetric?.stdDev || 0,
        variance: rustMetric?.variance || 0
      },
      improvement: improvement,
      winner: improvement > 0 ? 'rust' : (improvement < 0 ? 'javascript' : 'tie'),
      significance: this.classifySignificance(improvement),
      stability: this.compareStability(jsMetric, rustMetric)
    };
  }

  classifySignificance(improvement) {
    const abs = Math.abs(improvement);
    if (abs >= 20) return 'major';
    if (abs >= 10) return 'significant';
    if (abs >= 5) return 'moderate';
    if (abs >= 1) return 'minor';
    return 'negligible';
  }

  compareStability(jsMetric, rustMetric) {
    const jsCv = jsMetric?.avg ? (jsMetric.stdDev / jsMetric.avg) : 0;
    const rustCv = rustMetric?.avg ? (rustMetric.stdDev / rustMetric.avg) : 0;
    
    const stabilityDiff = jsCv - rustCv;
    
    return {
      javascriptCV: jsCv,
      rustCV: rustCv,
      moreStable: stabilityDiff > 0.05 ? 'rust' : (stabilityDiff < -0.05 ? 'javascript' : 'similar'),
      stabilityImprovement: Math.abs(stabilityDiff) * 100
    };
  }

  determineScenarioWinner(comparison) {
    if (!comparison) return 'unknown';

    const rustWins = Object.values(comparison).filter(metric => 
      metric && metric.winner === 'rust'
    ).length;

    const jsWins = Object.values(comparison).filter(metric => 
      metric && metric.winner === 'javascript'
    ).length;

    if (rustWins > jsWins) return 'rust';
    if (jsWins > rustWins) return 'javascript';
    return 'tie';
  }

  determineOverallWinner() {
    if (!this.results?.comparison) return 'unknown';

    let rustWins = 0;
    let jsWins = 0;

    Object.values(this.results.comparison).forEach(scenario => {
      Object.values(scenario).forEach(metric => {
        if (metric && metric.winner === 'rust') rustWins++;
        if (metric && metric.winner === 'javascript') jsWins++;
      });
    });

    if (rustWins > jsWins) return 'rust';
    if (jsWins > rustWins) return 'javascript';
    return 'tie';
  }

  calculateStatisticalConfidence(jsData, rustData) {
    // Simple confidence calculation based on variance
    const avgVariance = ((jsData.frameTime?.variance || 0) + (rustData.frameTime?.variance || 0)) / 2;
    
    if (avgVariance < 1) return 'high';
    if (avgVariance < 5) return 'medium';
    return 'low';
  }

  generateRecommendations() {
    if (!this.results) return [];

    const recommendations = [];
    const overallWinner = this.determineOverallWinner();

    // Performance recommendations
    if (overallWinner === 'rust') {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Rust WASM Shows Superior Performance',
        description: 'Rust WASM version consistently outperforms JavaScript across multiple metrics.',
        action: 'Consider using Rust WASM for production deployment.'
      });
    }

    // Check for memory usage patterns
    const memoryComparison = this.analyzeMemoryUsage();
    if (memoryComparison.significantImprovement) {
      recommendations.push({
        type: 'memory',
        priority: 'medium',
        title: 'Memory Usage Optimization Detected',
        description: `${memoryComparison.winner} version uses ${memoryComparison.improvement.toFixed(1)}% less memory.`,
        action: 'Consider this for memory-constrained environments.'
      });
    }

    // Frame rate stability
    const stabilityAnalysis = this.analyzeStability();
    if (stabilityAnalysis.moreStable !== 'similar') {
      recommendations.push({
        type: 'stability',
        priority: 'medium',
        title: 'Frame Rate Stability Difference',
        description: `${stabilityAnalysis.moreStable} version provides more consistent frame rates.`,
        action: 'Important for smooth user experience, especially on lower-end devices.'
      });
    }

    return recommendations;
  }

  analyzeMemoryUsage() {
    // Aggregate memory usage analysis across scenarios
    let rustTotal = 0, jsTotal = 0, count = 0;

    Object.values(this.results.comparison || {}).forEach(scenario => {
      if (scenario.memoryUsage) {
        rustTotal += scenario.memoryUsage.rust;
        jsTotal += scenario.memoryUsage.javascript;
        count++;
      }
    });

    if (count === 0) return { significantImprovement: false };

    const avgRust = rustTotal / count;
    const avgJs = jsTotal / count;
    const improvement = Math.abs((avgJs - avgRust) / avgJs) * 100;

    return {
      significantImprovement: improvement > 10,
      winner: avgRust < avgJs ? 'rust' : 'javascript',
      improvement: improvement
    };
  }

  analyzeStability() {
    // Analyze frame time variance across scenarios
    const scenarios = ['light', 'medium', 'heavy'];
    let rustVarianceSum = 0, jsVarianceSum = 0, count = 0;

    scenarios.forEach(scenario => {
      const jsData = this.results.javascript[scenario]?.profileData?.stats?.frameTime;
      const rustData = this.results.rust[scenario]?.profileData?.stats?.frameTime;

      if (jsData && rustData) {
        rustVarianceSum += rustData.variance || 0;
        jsVarianceSum += jsData.variance || 0;
        count++;
      }
    });

    if (count === 0) return { moreStable: 'similar' };

    const avgRustVariance = rustVarianceSum / count;
    const avgJsVariance = jsVarianceSum / count;
    
    const varianceDiff = (avgJsVariance - avgRustVariance) / Math.max(avgJsVariance, avgRustVariance);

    return {
      moreStable: varianceDiff > 0.1 ? 'rust' : (varianceDiff < -0.1 ? 'javascript' : 'similar'),
      rustVariance: avgRustVariance,
      javascriptVariance: avgJsVariance
    };
  }

  generateReadmeContent() {
    const analysis = this.generateStatisticalSummary();
    if (!analysis) return '';

    let content = `## Performance Analysis

### Test Environment
- **Browser**: ${analysis.testEnvironment.userAgent?.split(' ')[0] || 'Unknown'}
- **Platform**: ${analysis.testEnvironment.platform || 'Unknown'}
- **CPU Cores**: ${analysis.testEnvironment.hardwareConcurrency || 'Unknown'}
- **Memory**: ${analysis.testEnvironment.memory || 'Unknown'}
- **Screen**: ${analysis.testEnvironment.screenResolution || 'Unknown'}
- **Test Date**: ${new Date(analysis.testEnvironment.timestamp).toLocaleDateString()}

### Executive Summary
**Overall Winner**: ${analysis.overallWinner.toUpperCase()} 🏆

`;

    // Performance summary table
    content += `### Performance Comparison

| Metric | Light Load | Medium Load | Heavy Load | Endurance |
|--------|------------|-------------|------------|-----------|
`;

    const metrics = ['frameTime', 'renderTime', 'fps'];
    for (const metric of metrics) {
      const row = [metric];
      ['light', 'medium', 'heavy', 'endurance'].forEach(scenario => {
        const data = analysis.detailedAnalysis[scenario]?.metrics[metric];
        if (data) {
          const sign = data.improvement > 0 ? '+' : '';
          const color = data.winner === 'rust' ? '🟢' : data.winner === 'javascript' ? '🔴' : '🟡';
          row.push(`${sign}${data.improvement.toFixed(1)}% ${color}`);
        } else {
          row.push('N/A');
        }
      });
      content += `| ${row.join(' | ')} |\\n`;
    }

    // Key findings
    content += `
### Key Findings

`;

    analysis.recommendations.forEach((rec, index) => {
      const priority = rec.priority === 'high' ? '🔥' : rec.priority === 'medium' ? '⚡' : 'ℹ️';
      content += `${index + 1}. **${rec.title}** ${priority}
   - ${rec.description}
   - ${rec.action}

`;
    });

    // Detailed metrics
    content += `### Detailed Metrics

`;

    ['light', 'medium', 'heavy'].forEach(scenario => {
      const data = analysis.detailedAnalysis[scenario];
      if (data && !data.error) {
        content += `#### ${scenario.charAt(0).toUpperCase() + scenario.slice(1)} Load Scenario

| Metric | JavaScript | Rust WASM | Improvement | Winner |
|--------|------------|-----------|-------------|---------|
`;

        Object.entries(data.metrics).forEach(([metric, values]) => {
          const improvement = values.improvement > 0 ? `+${values.improvement.toFixed(1)}%` : `${values.improvement.toFixed(1)}%`;
          const winner = values.winner === 'rust' ? '🦀 Rust' : values.winner === 'javascript' ? '🟨 JS' : '🤝 Tie';
          content += `| ${metric} | ${values.javascript.avg.toFixed(2)} | ${values.rust.avg.toFixed(2)} | ${improvement} | ${winner} |\\n`;
        });

        content += `\\n`;
      }
    });

    content += `### Methodology

Tests were conducted using automated benchmarking with the following approach:
- Each version tested in isolation for 60 seconds per scenario
- Performance metrics collected using high-resolution timers
- Memory usage tracked where supported by the browser
- Results averaged over multiple game loops for statistical significance

*Generated automatically by performance analysis tools*
`;

    return content;
  }

  exportAnalysis() {
    const analysis = this.generateStatisticalSummary();
    
    return {
      summary: analysis,
      readmeContent: this.generateReadmeContent(),
      rawData: this.results,
      timestamp: new Date().toISOString()
    };
  }
}

// Make analyzer globally available
window.PerformanceAnalyzer = PerformanceAnalyzer;

// Utility function to analyze existing results
window.analyzeResults = function(resultsData) {
  const analyzer = new PerformanceAnalyzer();
  return analyzer.loadResults(resultsData).exportAnalysis();
};