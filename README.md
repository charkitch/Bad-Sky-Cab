[Start flying the unfriendly skies.](https://www.charles.kitchen/Bad-Sky-Cab/)

# Bad-Sky-Cab

## What it is
An airborne sidescroller in a city of the future. Zoom past towering structures, avoid speeding delivery trucks and head onwards ever to the right!

## A quick history

The original game came out of a weekend project at App Academy in 2018. I made a few major mistakes at the time, the most serious being coupling the game world to the render state ([see line 281 in lib/game.js](lib/game.js#L281)). Meaning that now, on my relatively old M2 laptop, the vehicles zoom by at speeds never intended.

## The Vibe Rerelease

WASM is one of my blind spots, an area of the browser environment I have never interacted with. I am interested in LLM assisted code generation, but thus far I have always used it collaboratively, and in areas I was familiar with. It occurred to me that it would be very interesting to see: how quickly could Claude Code, operating inside a repository with an existing game, spin up a new version of that game in a language entirely unknown to me (Rust) and environment unknown to me (Web Assembly).

The answer was about 4 hours of back and forth.

## Performance Analysis

### Architectural Improvements in Rust WASM Version

The Rust WASM version addresses several fundamental issues present in the original JavaScript implementation:

**Fixed Frame Rate Coupling**: The JavaScript version's score system increments every frame (`this.score += 1 * this.scoreMultiplier` at [lib/game.js:281](lib/game.js#L281)), causing wildly different gameplay speeds on different devices. The Rust version uses deterministic timestep-based updates.

**Memory Management**: Rust's ownership system eliminates the memory leaks present in the JavaScript version, which accumulates event listeners and sound objects without proper cleanup.

**Predictable Performance**: The Rust version maintains consistent collision detection and entity management across all devices, while the JavaScript version's performance varies significantly based on hardware refresh rates.

### Profiling Tools

This repository includes comprehensive performance profiling tools for scientific comparison:

**Automated Benchmarking**: 
- Run with `?benchmark=true` in URL for full automated comparison
- Tests both versions across multiple load scenarios
- Exports statistical analysis in JSON format

**Manual Profiling**:
- Add `?profile=true` to URL for real-time performance monitoring
- In-browser profiler UI for manual testing
- Individual game version testing and comparison

**System Monitor** (New):
- Real-time CPU, Memory, and FPS tracking in unified interface
- Automatic comparison testing between versions
- Comprehensive system resource monitoring

**Metrics Tracked**:
- Frame time consistency and average FPS
- Memory usage patterns
- Collision detection performance  
- Entity count vs performance correlation
- Render time optimization

### Running Your Own Benchmarks

1. **Automated Full Suite**:
   ```
   https://your-site.com/?benchmark=true
   ```

2. **Manual Testing**:
   ```
   https://your-site.com/?profile=true
   ```

3. **System Monitor**:
   ```
   https://your-site.com/
   # Click JS or Rust buttons in system monitor (top-left)
   # Or via console: systemMonitor.quickCompare(30000)
   ```

4. **Analyze Results**:
   ```javascript
   // In browser console after benchmark
   const analysis = analyzeResults(benchmarkResults);
   console.log(analysis.readmeContent);
   ```

*Benchmark data will be populated here after running tests on production environment*

## In the future of the future

A future feature to implement will be fares with dialogue boxes. A small icon indicating a person, a blurb of text with items pulled from a career array and a destination array ("I'm a robotics tycoon and need to get to the cheese zeppelin-restaurant") on pickup. With destinations always either being a building, a floater platform, or an entertainment dirigible based on a randomized decision at pickup. Once the mechanics are set, a transition in background (from run-down to upscale cloud apartments or rural) would deepen immersion. A retro opening text box or scroll would be ideal but will follow functional implementation of core game mechanics. 


