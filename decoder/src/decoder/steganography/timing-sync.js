/**
 * Timing Synchronization
 * Parses and manages timing data from steganographic stream
 */

import { extractBytes, bytesToInt32, bytesToInt16 } from './lsb-extractor.js';

/**
 * Parse timing data from extracted bytes
 * Format: [frameNumber(4 bytes) | timestamp(4 bytes) | checksum(2 bytes)]
 * @param {Uint8Array} timingBytes - Raw timing data (minimum 10 bytes)
 * @returns {object} Parsed timing information
 */
export function parseTimingData(timingBytes) {
  try {
    if (!timingBytes || timingBytes.length < 10) {
      throw new Error(`Insufficient timing data: ${timingBytes?.length || 0} bytes (need 10)`);
    }
    
    // Extract frame number (bytes 0-3)
    const frameNumberBytes = extractBytes(timingBytes, 0, 4);
    const frameNumber = bytesToInt32(frameNumberBytes);
    
    // Extract timestamp (bytes 4-7)
    const timestampBytes = extractBytes(timingBytes, 4, 4);
    const timestamp = bytesToInt32(timestampBytes);
    
    // Extract checksum (bytes 8-9)
    const checksumBytes = extractBytes(timingBytes, 8, 2);
    const checksum = bytesToInt16(checksumBytes);
    
    console.log('[Timing Sync] Parsed timing:', {
      frameNumber,
      timestamp: `${timestamp}ms`,
      checksum: `0x${checksum.toString(16)}`
    });
    
    return {
      frameNumber,
      timestamp,
      checksum,
      rawData: timingBytes
    };
    
  } catch (error) {
    console.error('[Timing Sync] Parse failed:', error);
    throw new Error(`Timing data parse failed: ${error.message}`);
  }
}

/**
 * Synchronization manager for subtitle timing
 * Handles drift correction and frame interpolation
 */
export class TimingManager {
  constructor() {
    this.baseTimestamp = 0;
    this.lastFrameNumber = -1;
    this.timestampHistory = [];
    this.maxHistorySize = 10;
  }
  
  /**
   * Update timing state with new frame data
   * @param {object} timingData - Parsed timing data
   */
  updateTiming(timingData) {
    const { frameNumber, timestamp } = timingData;
    
    // First frame - establish baseline
    if (this.lastFrameNumber === -1) {
      this.baseTimestamp = timestamp;
      console.log('[Timing Sync] Baseline established:', timestamp);
    }
    
    // Detect frame jumps (video seeking or corruption)
    const frameDelta = frameNumber - this.lastFrameNumber;
    if (frameDelta > 2 && this.lastFrameNumber !== -1) {
      console.warn('[Timing Sync] Frame jump detected:', {
        from: this.lastFrameNumber,
        to: frameNumber,
        delta: frameDelta
      });
    }
    
    // Update history
    this.timestampHistory.push({
      frameNumber,
      timestamp,
      receivedAt: performance.now()
    });
    
    // Limit history size
    if (this.timestampHistory.length > this.maxHistorySize) {
      this.timestampHistory.shift();
    }
    
    this.lastFrameNumber = frameNumber;
  }
  
  /**
   * Get current synchronized timestamp
   * @returns {number} Current timestamp in milliseconds
   */
  getCurrentTimestamp() {
    if (this.timestampHistory.length === 0) {
      return 0;
    }
    
    // Return most recent timestamp
    return this.timestampHistory[this.timestampHistory.length - 1].timestamp;
  }
  
  /**
   * Calculate drift between expected and actual timing
   * @returns {number} Drift in milliseconds
   */
  calculateDrift() {
    if (this.timestampHistory.length < 2) {
      return 0;
    }
    
    const oldest = this.timestampHistory[0];
    const newest = this.timestampHistory[this.timestampHistory.length - 1];
    
    const actualDuration = newest.timestamp - oldest.timestamp;
    const expectedDuration = newest.receivedAt - oldest.receivedAt;
    
    const drift = actualDuration - expectedDuration;
    
    if (Math.abs(drift) > 500) {
      console.warn('[Timing Sync] Significant drift detected:', drift.toFixed(2), 'ms');
    }
    
    return drift;
  }
  
  /**
   * Reset timing synchronization
   */
  reset() {
    this.baseTimestamp = 0;
    this.lastFrameNumber = -1;
    this.timestampHistory = [];
    console.log('[Timing Sync] Reset');
  }
  
  /**
   * Get timing statistics
   * @returns {object} Timing stats
   */
  getStats() {
    return {
      baseTimestamp: this.baseTimestamp,
      currentFrame: this.lastFrameNumber,
      currentTimestamp: this.getCurrentTimestamp(),
      drift: this.calculateDrift(),
      historySize: this.timestampHistory.length
    };
  }
}

/**
 * Global timing manager instance
 */
export const globalTimingManager = new TimingManager();

/**
 * Check if subtitle should be displayed at current time
 * @param {object} subtitle - Subtitle with startTime and endTime
 * @param {number} currentTime - Current video timestamp
 * @returns {boolean} True if subtitle should be shown
 */
export function shouldDisplaySubtitle(subtitle, currentTime) {
  if (!subtitle) return false;
  
  return currentTime >= subtitle.startTime && currentTime <= subtitle.endTime;
}

/**
 * Interpolate timestamp for smooth playback
 * @param {number} lastTimestamp - Last known timestamp
 * @param {number} frameRate - Expected frame rate
 * @returns {number} Interpolated timestamp
 */
export function interpolateTimestamp(lastTimestamp, frameRate = 25) {
  const frameDuration = 1000 / frameRate; // ms per frame
  return lastTimestamp + frameDuration;
}
