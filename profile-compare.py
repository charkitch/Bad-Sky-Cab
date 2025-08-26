#!/usr/bin/env python3
"""
Profile Comparison Script
Analyzes JavaScript vs Rust WASM performance data
"""

import re
import statistics
from pathlib import Path

# Optional matplotlib import
try:
    import matplotlib.pyplot as plt
    import numpy as np
    HAS_MATPLOTLIB = True
except ImportError:
    HAS_MATPLOTLIB = False

def parse_profile_data(filename):
    """Parse the tab-separated profile data"""
    data = {
        'cpu': [],
        'memory': [],
        'fps': [],
        'timestamps': []
    }
    
    current_section = None
    
    with open(filename, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
                
            if line in ['cpu', 'memory', 'fps', 'timestamps']:
                current_section = line
                continue
            elif line in ['duration', 'averages', 'peaks', 'environment']:
                current_section = None
                continue
            
            if current_section and '\t' in line:
                try:
                    index, value = line.split('\t')
                    data[current_section].append(float(value))
                except ValueError:
                    continue
    
    return data

def analyze_metrics(js_data, rust_data):
    """Analyze and compare the metrics"""
    
    def calc_stats(values):
        if not values:
            return {'mean': 0, 'median': 0, 'std': 0, 'min': 0, 'max': 0}
        return {
            'mean': statistics.mean(values),
            'median': statistics.median(values),
            'std': statistics.stdev(values) if len(values) > 1 else 0,
            'min': min(values),
            'max': max(values),
            'count': len(values)
        }
    
    js_stats = {
        'cpu': calc_stats(js_data['cpu']),
        'memory': calc_stats(js_data['memory']),
        'fps': calc_stats(js_data['fps'])
    }
    
    rust_stats = {
        'cpu': calc_stats(rust_data['cpu']),
        'memory': calc_stats(rust_data['memory']),
        'fps': calc_stats(rust_data['fps'])
    }
    
    return js_stats, rust_stats

def calculate_improvements(js_stats, rust_stats):
    """Calculate percentage improvements"""
    improvements = {}
    
    for metric in ['cpu', 'memory', 'fps']:
        js_mean = js_stats[metric]['mean']
        rust_mean = rust_stats[metric]['mean']
        
        if js_mean == 0:
            improvements[metric] = 0
        else:
            if metric == 'fps':  # Higher is better for FPS
                improvement = ((rust_mean - js_mean) / js_mean) * 100
            else:  # Lower is better for CPU and memory
                improvement = ((js_mean - rust_mean) / js_mean) * 100
            improvements[metric] = improvement
    
    return improvements

def create_comparison_chart(js_data, rust_data, js_stats, rust_stats):
    """Create visualization charts"""
    if not HAS_MATPLOTLIB:
        return None
    
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle('JavaScript vs Rust WASM Performance Comparison', fontsize=16, fontweight='bold')
    
    # CPU Usage over time
    ax1 = axes[0, 0]
    time_js = list(range(len(js_data['cpu'])))
    time_rust = list(range(len(rust_data['cpu'])))
    ax1.plot(time_js, js_data['cpu'], label='JavaScript', color='orange', alpha=0.7)
    ax1.plot(time_rust, rust_data['cpu'], label='Rust WASM', color='red', alpha=0.7)
    ax1.set_title('CPU Usage Over Time')
    ax1.set_xlabel('Time (seconds)')
    ax1.set_ylabel('CPU Usage (%)')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # Memory Usage over time
    ax2 = axes[0, 1]
    ax2.plot(time_js, js_data['memory'], label='JavaScript', color='blue', alpha=0.7)
    ax2.plot(time_rust, rust_data['memory'], label='Rust WASM', color='green', alpha=0.7)
    ax2.set_title('Memory Usage Over Time')
    ax2.set_xlabel('Time (seconds)')
    ax2.set_ylabel('Memory Usage (MB)')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    # FPS over time
    ax3 = axes[1, 0]
    ax3.plot(time_js, js_data['fps'], label='JavaScript', color='purple', alpha=0.7)
    ax3.plot(time_rust, rust_data['fps'], label='Rust WASM', color='cyan', alpha=0.7)
    ax3.set_title('FPS Over Time')
    ax3.set_xlabel('Time (seconds)')
    ax3.set_ylabel('Frames Per Second')
    ax3.legend()
    ax3.grid(True, alpha=0.3)
    
    # Summary comparison bars
    ax4 = axes[1, 1]
    metrics = ['CPU (%)', 'Memory (MB)', 'FPS']
    js_means = [js_stats['cpu']['mean'], js_stats['memory']['mean'], js_stats['fps']['mean']]
    rust_means = [rust_stats['cpu']['mean'], rust_stats['memory']['mean'], rust_stats['fps']['mean']]
    
    x = np.arange(len(metrics))
    width = 0.35
    
    bars1 = ax4.bar(x - width/2, js_means, width, label='JavaScript', color='orange', alpha=0.7)
    bars2 = ax4.bar(x + width/2, rust_means, width, label='Rust WASM', color='red', alpha=0.7)
    
    ax4.set_title('Average Performance Metrics')
    ax4.set_ylabel('Values')
    ax4.set_xticks(x)
    ax4.set_xticklabels(metrics)
    ax4.legend()
    ax4.grid(True, alpha=0.3, axis='y')
    
    # Add value labels on bars
    def autolabel(bars):
        for bar in bars:
            height = bar.get_height()
            ax4.annotate(f'{height:.1f}',
                        xy=(bar.get_x() + bar.get_width() / 2, height),
                        xytext=(0, 3),
                        textcoords="offset points",
                        ha='center', va='bottom', fontsize=9)
    
    autolabel(bars1)
    autolabel(bars2)
    
    plt.tight_layout()
    plt.savefig('performance_comparison.png', dpi=300, bbox_inches='tight')
    print("📊 Chart saved as 'performance_comparison.png'")
    return fig

def generate_report(js_stats, rust_stats, improvements):
    """Generate detailed text report"""
    
    report = f"""
🔬 PERFORMANCE ANALYSIS REPORT
{'='*50}

📊 SUMMARY STATISTICS
{'='*20}

JavaScript Engine:
  CPU Usage:    {js_stats['cpu']['mean']:.1f}% (σ={js_stats['cpu']['std']:.1f})
  Memory Usage: {js_stats['memory']['mean']:.1f}MB (σ={js_stats['memory']['std']:.1f})
  Frame Rate:   {js_stats['fps']['mean']:.1f}fps (σ={js_stats['fps']['std']:.1f})
  Duration:     {js_stats['cpu']['count']} seconds

Rust WASM Engine:
  CPU Usage:    {rust_stats['cpu']['mean']:.1f}% (σ={rust_stats['cpu']['std']:.1f})
  Memory Usage: {rust_stats['memory']['mean']:.1f}MB (σ={rust_stats['memory']['std']:.1f})
  Frame Rate:   {rust_stats['fps']['mean']:.1f}fps (σ={rust_stats['fps']['std']:.1f})
  Duration:     {rust_stats['cpu']['count']} seconds

⚡ PERFORMANCE DIFFERENCES
{'='*25}

CPU Usage:    {improvements['cpu']:+.1f}% {'✅' if improvements['cpu'] > 0 else '❌' if improvements['cpu'] < -5 else '➖'}
Memory Usage: {improvements['memory']:+.1f}% {'✅' if improvements['memory'] > 0 else '❌' if improvements['memory'] < -10 else '➖'}
Frame Rate:   {improvements['fps']:+.1f}% {'✅' if improvements['fps'] > 0 else '❌' if improvements['fps'] < -5 else '➖'}

📈 DETAILED ANALYSIS
{'='*18}

CPU Performance:
  • JavaScript: {js_stats['cpu']['min']:.0f}%-{js_stats['cpu']['max']:.0f}% (median: {js_stats['cpu']['median']:.1f}%)
  • Rust WASM:  {rust_stats['cpu']['min']:.0f}%-{rust_stats['cpu']['max']:.0f}% (median: {rust_stats['cpu']['median']:.1f}%)
  • Consistency: {"Rust more stable" if rust_stats['cpu']['std'] < js_stats['cpu']['std'] else "JavaScript more stable" if js_stats['cpu']['std'] < rust_stats['cpu']['std'] else "Similar stability"}

Memory Performance:
  • JavaScript: {js_stats['memory']['min']:.0f}MB-{js_stats['memory']['max']:.0f}MB (median: {js_stats['memory']['median']:.1f}MB)
  • Rust WASM:  {rust_stats['memory']['min']:.0f}MB-{rust_stats['memory']['max']:.0f}MB (median: {rust_stats['memory']['median']:.1f}MB)
  • Consistency: {"Rust more stable" if rust_stats['memory']['std'] < js_stats['memory']['std'] else "JavaScript more stable" if js_stats['memory']['std'] < rust_stats['memory']['std'] else "Similar stability"}

Frame Rate Performance:
  • JavaScript: {js_stats['fps']['min']:.0f}-{js_stats['fps']['max']:.0f}fps (median: {js_stats['fps']['median']:.1f}fps)
  • Rust WASM:  {rust_stats['fps']['min']:.0f}-{rust_stats['fps']['max']:.0f}fps (median: {rust_stats['fps']['median']:.1f}fps)
  • Consistency: {"Rust more stable" if rust_stats['fps']['std'] < js_stats['fps']['std'] else "JavaScript more stable" if js_stats['fps']['std'] < rust_stats['fps']['std'] else "Similar stability"}

🎯 KEY INSIGHTS
{'='*14}

"""

    # Add specific insights based on the data
    if abs(improvements['cpu']) < 5:
        report += "• CPU usage is virtually identical between versions\n"
    elif improvements['cpu'] > 5:
        report += f"• Rust WASM shows {improvements['cpu']:.1f}% better CPU efficiency\n"
    else:
        report += f"• JavaScript shows {-improvements['cpu']:.1f}% better CPU efficiency\n"
    
    if abs(improvements['memory']) < 10:
        report += "• Memory usage is comparable between versions\n"
    elif improvements['memory'] > 10:
        report += f"• Rust WASM uses {improvements['memory']:.1f}% less memory\n"
    else:
        report += f"• JavaScript uses {-improvements['memory']:.1f}% less memory\n"
    
    if abs(improvements['fps']) < 2:
        report += "• Frame rates are nearly identical\n"
    elif improvements['fps'] > 2:
        report += f"• Rust WASM delivers {improvements['fps']:.1f}% higher frame rates\n"
    else:
        report += f"• JavaScript delivers {-improvements['fps']:.1f}% higher frame rates\n"
    
    # Overall winner
    score = sum([
        1 if improvements['cpu'] > 5 else -1 if improvements['cpu'] < -5 else 0,
        1 if improvements['memory'] > 10 else -1 if improvements['memory'] < -10 else 0,
        1 if improvements['fps'] > 2 else -1 if improvements['fps'] < -2 else 0
    ])
    
    report += f"\n🏆 OVERALL WINNER: "
    if score > 0:
        report += "Rust WASM 🦀\n"
    elif score < 0:
        report += "JavaScript 🟨\n"
    else:
        report += "TIE - Performance is equivalent 🤝\n"
    
    report += f"\n{'='*50}\n"
    report += "Report generated by profile-compare.py\n"
    
    return report

def main():
    """Main analysis function"""
    # Check if files exist
    js_file = Path('javascript_profile.txt')
    rust_file = Path('rust_profile.txt')
    
    if not js_file.exists():
        print("❌ javascript_profile.txt not found!")
        return
    
    if not rust_file.exists():
        print("❌ rust_profile.txt not found!")
        return
    
    print("📝 Loading profile data...")
    js_data = parse_profile_data('javascript_profile.txt')
    rust_data = parse_profile_data('rust_profile.txt')
    
    print(f"✅ JavaScript: {len(js_data['cpu'])} data points")
    print(f"✅ Rust WASM: {len(rust_data['cpu'])} data points")
    
    print("\n📊 Analyzing metrics...")
    js_stats, rust_stats = analyze_metrics(js_data, rust_data)
    improvements = calculate_improvements(js_stats, rust_stats)
    
    print("📈 Generating report...")
    report = generate_report(js_stats, rust_stats, improvements)
    
    # Save report
    with open('performance_report.txt', 'w') as f:
        f.write(report)
    
    print(report)
    
    try:
        print("📊 Creating visualization...")
        create_comparison_chart(js_data, rust_data, js_stats, rust_stats)
        print("📄 Report saved as 'performance_report.txt'")
    except ImportError:
        print("⚠️  Matplotlib not available - skipping chart generation")
        print("   Install with: pip install matplotlib")
    
    print("\n✨ Analysis complete!")

if __name__ == "__main__":
    main()