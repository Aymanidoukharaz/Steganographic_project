/**
 * Performance Monitor
 * Tracks FPS, latency, and other performance metrics
 */

export class PerformanceMonitor {
  constructor(sampleSize = 60) {
    this.sampleSize = sampleSize;
    this.frameTimes = [];
    this.latencyTimes = [];
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.startTime = performance.now();
  }

  /**
   * Record a frame
   */
  recordFrame() {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    this.frameCount++;

    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.sampleSize) {
      this.frameTimes.shift();
    }
  }

  /**
   * Record processing latency
   */
  recordLatency(latency) {
    this.latencyTimes.push(latency);
    if (this.latencyTimes.length > this.sampleSize) {
      this.latencyTimes.shift();
    }
  }

  /**
   * Get current FPS
   */
  getFPS() {
    if (this.frameTimes.length === 0) return 0;

    const avgFrameTime =
      this.frameTimes.reduce((sum, t) => sum + t, 0) / this.frameTimes.length;

    return avgFrameTime > 0 ? Math.round(1000 / avgFrameTime) : 0;
  }

  /**
   * Get average latency
   */
  getAverageLatency() {
    if (this.latencyTimes.length === 0) return 0;

    return (
      this.latencyTimes.reduce((sum, t) => sum + t, 0) /
      this.latencyTimes.length
    );
  }

  /**
   * Get peak latency
   */
  getPeakLatency() {
    if (this.latencyTimes.length === 0) return 0;
    return Math.max(...this.latencyTimes);
  }

  /**
   * Get min latency
   */
  getMinLatency() {
    if (this.latencyTimes.length === 0) return 0;
    return Math.min(...this.latencyTimes);
  }

  /**
   * Get detailed stats
   */
  getStats() {
    const elapsed = (performance.now() - this.startTime) / 1000;

    return {
      fps: this.getFPS(),
      averageLatency: Math.round(this.getAverageLatency()),
      peakLatency: Math.round(this.getPeakLatency()),
      minLatency: Math.round(this.getMinLatency()),
      frameCount: this.frameCount,
      elapsed: Math.round(elapsed),
      averageFPS: elapsed > 0 ? Math.round(this.frameCount / elapsed) : 0
    };
  }

  /**
   * Reset statistics
   */
  reset() {
    this.frameTimes = [];
    this.latencyTimes = [];
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.startTime = performance.now();
  }

  /**
   * Format stats for display
   */
  formatStats() {
    const stats = this.getStats();
    return `FPS: ${stats.fps} | Latency: ${stats.averageLatency}ms (${stats.minLatency}-${stats.peakLatency}ms)`;
  }
}

/**
 * CPU usage estimator (rough approximation)
 */
export class CPUMonitor {
  constructor() {
    this.samples = [];
    this.maxSamples = 10;
  }

  /**
   * Estimate CPU usage based on processing time vs frame time
   */
  recordProcessingTime(processingTime, frameInterval = 33.33) {
    const usage = (processingTime / frameInterval) * 100;
    this.samples.push(Math.min(100, Math.max(0, usage)));

    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  /**
   * Get average CPU usage estimate
   */
  getAverageUsage() {
    if (this.samples.length === 0) return 0;
    return Math.round(
      this.samples.reduce((sum, u) => sum + u, 0) / this.samples.length
    );
  }

  /**
   * Check if CPU usage is critical
   */
  isCritical(threshold = 80) {
    return this.getAverageUsage() > threshold;
  }
}

/**
 * Memory usage tracker
 */
export class MemoryMonitor {
  constructor() {
    this.samples = [];
    this.maxSamples = 20;
  }

  /**
   * Record memory usage if available
   */
  recordUsage() {
    if (performance.memory) {
      const usage = {
        used: performance.memory.usedJSHeapSize / 1048576, // MB
        total: performance.memory.totalJSHeapSize / 1048576, // MB
        limit: performance.memory.jsHeapSizeLimit / 1048576, // MB
        timestamp: performance.now()
      };

      this.samples.push(usage);
      if (this.samples.length > this.maxSamples) {
        this.samples.shift();
      }

      return usage;
    }

    return null;
  }

  /**
   * Get latest memory stats
   */
  getLatestStats() {
    if (this.samples.length === 0) return null;
    return this.samples[this.samples.length - 1];
  }

  /**
   * Get average memory usage
   */
  getAverageUsage() {
    if (this.samples.length === 0) return 0;

    const avgUsed =
      this.samples.reduce((sum, s) => sum + s.used, 0) / this.samples.length;

    return Math.round(avgUsed);
  }

  /**
   * Check if memory usage is critical
   */
  isCritical(thresholdPercent = 80) {
    const latest = this.getLatestStats();
    if (!latest) return false;

    const usagePercent = (latest.used / latest.limit) * 100;
    return usagePercent > thresholdPercent;
  }
}

/**
 * Global performance monitor instance
 */
export const globalPerformanceMonitor = new PerformanceMonitor();
export const globalCPUMonitor = new CPUMonitor();
export const globalMemoryMonitor = new MemoryMonitor();

export default {
  PerformanceMonitor,
  CPUMonitor,
  MemoryMonitor,
  globalPerformanceMonitor,
  globalCPUMonitor,
  globalMemoryMonitor
};
