/**
 * Decoder Pipeline
 * Main orchestrator for steganographic subtitle decoding
 * Coordinates extraction → decompression → parsing → display
 */

import { extractDataRegions, validateHomography } from './frame/region-extractor.js';
import { extractLSBData, logDataStats } from './steganography/lsb-extractor.js';
import { decompressWithFallback } from './steganography/data-decompressor.js';
import { validateChecksum, validateSubtitleStructure, analyzeErrors } from './steganography/error-correction.js';
import { parseTimingData, globalTimingManager as timingSync } from './steganography/timing-sync.js';
import { parseSubtitle, validateSubtitle, formatSubtitleText } from './subtitle/subtitle-parser.js';
import { globalSubtitleCache } from './subtitle/subtitle-cache.js';
import { globalTimingManager } from './subtitle/timing-manager.js';

/**
 * Performance monitoring
 */
const perfStats = {
  totalFrames: 0,
  successfulDecodes: 0,
  failedDecodes: 0,
  avgDecodeTime: 0,
  lastDecodeTime: 0
};

/**
 * Decode a video frame to extract subtitle data
 * Main entry point for the decoding pipeline
 * 
 * @param {object} cv - OpenCV instance
 * @param {cv.Mat} frame - Current video frame
 * @param {cv.Mat} homography - Homography matrix from corner detection
 * @param {Array} corners - Detected corner points (for logging)
 * @returns {object} Decoded subtitle data or error
 */
export async function decodeFrame(cv, frame, homography, corners) {
  const startTime = performance.now();
  perfStats.totalFrames++;
  
  let regions = null;
  
  try {
    console.log('[Decoder Pipeline] ▶️ Starting decode...');
    
    // 0. Validate inputs
    if (!cv || !frame || !homography) {
      throw new Error('Missing required parameters');
    }
    
    if (!validateHomography(homography)) {
      throw new Error('Invalid homography matrix');
    }
    
    // 1. Extract data regions (timing + subtitle areas)
    regions = extractDataRegions(cv, frame, homography);
    
    if (!regions.timing || !regions.subtitle) {
      throw new Error('Failed to extract data regions');
    }
    
    // 2. Extract LSB data from timing strip (top 5 rows)
    console.log('[Decoder Pipeline] Extracting timing data...');
    const timingBytes = extractLSBData(regions.timing);
    
    if (!timingBytes || timingBytes.length < 10) {
      throw new Error(`Insufficient timing data: ${timingBytes?.length || 0} bytes`);
    }
    
    logDataStats(timingBytes, 'Timing bytes');
    
    // 3. Parse timing data
    const timingData = parseTimingData(timingBytes);
    
    // 4. Validate timing checksum
    if (!validateChecksum(timingData)) {
      throw new Error('Timing checksum validation failed');
    }
    
    // Update global timing synchronization
    timingSync.updateTiming(timingData);
    
    // 5. Extract LSB data from subtitle region (bottom 10%)
    console.log('[Decoder Pipeline] Extracting subtitle data...');
    const subtitleBytes = extractLSBData(regions.subtitle);
    
    if (!subtitleBytes || subtitleBytes.length === 0) {
      throw new Error('No subtitle data extracted');
    }
    
    logDataStats(subtitleBytes, 'Subtitle bytes');
    
    // Analyze data quality
    const errorAnalysis = analyzeErrors(subtitleBytes);
    if (errorAnalysis.hasErrors) {
      console.warn('[Decoder Pipeline] ⚠️ Data quality issue:', errorAnalysis.reason);
    }
    
    // 6. Decompress LZ4 data
    console.log('[Decoder Pipeline] Decompressing...');
    const decompressResult = decompressWithFallback(subtitleBytes);
    
    if (!decompressResult.success) {
      throw new Error(`Decompression failed: ${decompressResult.error}`);
    }
    
    const decompressedText = decompressResult.text;
    
    if (decompressResult.partial) {
      console.warn('[Decoder Pipeline] ⚠️ Partial decompression - data may be incomplete');
    }
    
    // Validate subtitle structure
    if (!validateSubtitleStructure(decompressedText)) {
      throw new Error('Invalid subtitle structure after decompression');
    }
    
    // 7. Parse subtitle text and timing
    console.log('[Decoder Pipeline] Parsing subtitle...');
    const subtitle = parseSubtitle(decompressedText, timingData.timestamp);
    
    // 8. Validate parsed subtitle
    if (!validateSubtitle(subtitle)) {
      throw new Error('Subtitle validation failed after parsing');
    }
    
    // 9. Format text for display
    subtitle.text = formatSubtitleText(subtitle);
    
    // 10. Cache the subtitle
    globalSubtitleCache.set(subtitle.id, subtitle);
    
    // 11. Add to timing manager
    globalTimingManager.addSubtitle(subtitle);
    
    // Calculate decode time
    const decodeTime = performance.now() - startTime;
    perfStats.lastDecodeTime = decodeTime;
    perfStats.successfulDecodes++;
    perfStats.avgDecodeTime = 
      (perfStats.avgDecodeTime * (perfStats.successfulDecodes - 1) + decodeTime) / 
      perfStats.successfulDecodes;
    
    console.log(`[Decoder Pipeline] ✅ SUCCESS in ${decodeTime.toFixed(2)}ms`);
    console.log('[Decoder Pipeline] 📝 Subtitle:', {
      id: subtitle.id,
      text: subtitle.text,
      timing: `${subtitle.startTime}ms - ${subtitle.endTime}ms`
    });
    
    return {
      success: true,
      subtitle: subtitle,
      timestamp: timingData.timestamp,
      frameNumber: timingData.frameNumber,
      decodeTime: decodeTime,
      partial: decompressResult.partial
    };
    
  } catch (error) {
    perfStats.failedDecodes++;
    const decodeTime = performance.now() - startTime;
    
    console.error('[Decoder Pipeline] ❌ FAILED:', error.message);
    console.error('[Decoder Pipeline] Error details:', error);
    
    return {
      success: false,
      error: error.message,
      decodeTime: decodeTime
    };
    
  } finally {
    // CRITICAL: Cleanup OpenCV Mats to prevent memory leaks
    if (regions && regions.cleanup) {
      try {
        regions.cleanup();
        console.log('[Decoder Pipeline] 🧹 Cleanup completed');
      } catch (cleanupError) {
        console.error('[Decoder Pipeline] Cleanup error:', cleanupError);
      }
    }
  }
}

/**
 * Get active subtitle based on current time
 * Uses timing manager to determine what should be displayed
 * 
 * @param {number} currentTime - Current video timestamp
 * @returns {object|null} Active subtitle or null
 */
export function getActiveSubtitle(currentTime) {
  const active = globalTimingManager.update(currentTime);
  
  if (active) {
    console.log('[Decoder Pipeline] 🎬 Active subtitle at', currentTime, ':', {
      id: active.id,
      text: active.text.substring(0, 40)
    });
  }
  
  return active;
}

/**
 * Get decoder performance statistics
 * @returns {object} Performance stats
 */
export function getDecoderStats() {
  const successRate = perfStats.totalFrames > 0
    ? (perfStats.successfulDecodes / perfStats.totalFrames * 100).toFixed(2)
    : 0;
  
  return {
    totalFrames: perfStats.totalFrames,
    successful: perfStats.successfulDecodes,
    failed: perfStats.failedDecodes,
    successRate: `${successRate}%`,
    avgDecodeTime: `${perfStats.avgDecodeTime.toFixed(2)}ms`,
    lastDecodeTime: `${perfStats.lastDecodeTime.toFixed(2)}ms`,
    cache: globalSubtitleCache.getStats(),
    timing: globalTimingManager.getStats(),
    timingSync: timingSync.getStats()
  };
}

/**
 * Reset decoder state
 * Clears all caches and resets counters
 */
export function resetDecoder() {
  globalSubtitleCache.clear();
  globalTimingManager.reset();
  timingSync.reset();
  
  perfStats.totalFrames = 0;
  perfStats.successfulDecodes = 0;
  perfStats.failedDecodes = 0;
  perfStats.avgDecodeTime = 0;
  perfStats.lastDecodeTime = 0;
  
  console.log('[Decoder Pipeline] 🔄 Full reset completed');
}

/**
 * Check if decoder is ready
 * @param {object} cv - OpenCV instance
 * @returns {boolean} True if ready to decode
 */
export function isDecoderReady(cv) {
  if (!cv) {
    console.warn('[Decoder Pipeline] OpenCV not loaded');
    return false;
  }
  
  if (!cv.Mat || !cv.warpPerspective) {
    console.warn('[Decoder Pipeline] Required OpenCV functions not available');
    return false;
  }
  
  return true;
}

/**
 * Log decoder status summary
 */
export function logDecoderStatus() {
  const stats = getDecoderStats();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 DECODER PIPELINE STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Total frames processed:', stats.totalFrames);
  console.log('Successful decodes:', stats.successful);
  console.log('Failed decodes:', stats.failed);
  console.log('Success rate:', stats.successRate);
  console.log('Avg decode time:', stats.avgDecodeTime);
  console.log('Last decode time:', stats.lastDecodeTime);
  console.log('─────────────────────────────────');
  console.log('Cache stats:', stats.cache);
  console.log('Timing manager:', stats.timing);
  console.log('Timing sync:', stats.timingSync);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Export global instances for external access
export { globalSubtitleCache, globalTimingManager, timingSync };
