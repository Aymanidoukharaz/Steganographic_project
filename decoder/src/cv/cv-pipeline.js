/**
 * Computer Vision Pipeline Coordinator
 * Orchestrates corner detection, homography calculation, and frame processing
 */

import { loadOpenCV, getOpenCV, isOpenCVLoaded, cleanupMats } from './opencv-loader.js';
import { detectCornerMarkers, cornersToPoints } from './detection/corner-detector.js';
import { validateMarkers, calculateQualityScore } from './detection/marker-validator.js';
import { calculateHomography, isReasonablePerspective } from './detection/homography-calculator.js';
import { captureFrame, FrameRateLimiter } from './utils/frame-processor.js';
import { 
  globalPerformanceMonitor, 
  globalCPUMonitor 
} from './utils/performance-monitor.js';

/**
 * CV Pipeline State
 */
class CVPipeline {
  constructor() {
    this.isInitialized = false;
    this.isProcessing = false;
    this.cv = null;
    this.frameRateLimiter = new FrameRateLimiter(15); // Target 15 FPS for processing
    this.lastDetection = null;
    this.detectionHistory = [];
    this.maxHistorySize = 5;
  }

  /**
   * Initialize the CV pipeline
   */
  async initialize() {
    if (this.isInitialized) {
      return { success: true, message: 'Already initialized' };
    }

    try {
      console.log('[CV Pipeline] Initializing...');
      
      // Load OpenCV.js
      this.cv = await loadOpenCV();
      
      this.isInitialized = true;
      console.log('[CV Pipeline] ✅ Initialization complete');
      
      return {
        success: true,
        message: 'CV Pipeline initialized successfully'
      };
    } catch (error) {
      console.error('[CV Pipeline] Initialization failed:', error);
      return {
        success: false,
        message: 'Failed to initialize: ' + error.message
      };
    }
  }

  /**
   * Process a video frame to detect corners and calculate homography
   * @param {HTMLVideoElement} videoElement
   * @param {object} options - Processing options
   * @returns {object} Detection result
   */
  async processFrame(videoElement, options = {}) {
    // Check if should process based on frame rate limiter
    if (!this.frameRateLimiter.shouldProcessFrame()) {
      return {
        skipped: true,
        lastDetection: this.lastDetection
      };
    }

    // Check if already processing
    if (this.isProcessing) {
      return {
        busy: true,
        lastDetection: this.lastDetection
      };
    }

    // Check if initialized
    if (!this.isInitialized || !isOpenCVLoaded()) {
      return {
        error: 'CV Pipeline not initialized',
        detected: false
      };
    }

    this.isProcessing = true;
    const startTime = performance.now();

    try {
      // Capture and downscale frame
      const targetWidth = options.targetWidth || 480;
      const frameData = captureFrame(videoElement, targetWidth);

      // Convert to OpenCV Mat
      const src = this.cv.matFromImageData(frameData.imageData);
      const gray = new this.cv.Mat();

      // Convert to grayscale
      this.cv.cvtColor(src, gray, this.cv.COLOR_RGBA2GRAY);

      // Detect corner markers
      const detection = detectCornerMarkers(
        this.cv,
        gray,
        frameData.width,
        frameData.height
      );

      // Cleanup intermediate Mats
      cleanupMats(src, gray);

      // If no corners detected, return early
      if (!detection.detected) {
        this.isProcessing = false;
        
        const processingTime = performance.now() - startTime;
        globalPerformanceMonitor.recordFrame();
        globalPerformanceMonitor.recordLatency(processingTime);
        globalCPUMonitor.recordProcessingTime(processingTime);

        return {
          detected: false,
          reason: detection.reason,
          processingTime,
          frameData
        };
      }

      // Validate detected markers
      const validation = validateMarkers(
        detection.corners,
        frameData.width,
        frameData.height
      );

      if (!validation.valid) {
        this.isProcessing = false;
        
        const processingTime = performance.now() - startTime;
        globalPerformanceMonitor.recordFrame();
        globalPerformanceMonitor.recordLatency(processingTime);

        return {
          detected: false,
          reason: 'Validation failed: ' + validation.errors.join(', '),
          processingTime,
          frameData
        };
      }

      // Calculate homography
      const cornerPoints = cornersToPoints(detection.corners);
      
      // Scale corner points back to original frame size for accurate homography
      const scaleFactor = frameData.originalWidth / frameData.width;
      const scaledPoints = cornerPoints.map(p => ({
        x: p.x * scaleFactor,
        y: p.y * scaleFactor
      }));

      const homographyResult = calculateHomography(
        this.cv,
        scaledPoints,
        { width: frameData.originalWidth, height: frameData.originalHeight }
      );

      if (!homographyResult.success) {
        this.isProcessing = false;
        
        const processingTime = performance.now() - startTime;
        globalPerformanceMonitor.recordFrame();
        globalPerformanceMonitor.recordLatency(processingTime);

        return {
          detected: false,
          reason: 'Homography calculation failed: ' + homographyResult.error,
          processingTime,
          frameData
        };
      }

      // Validate perspective
      if (!isReasonablePerspective(homographyResult.matrixData)) {
        // Clean up homography matrix
        if (homographyResult.matrix) {
          cleanupMats(homographyResult.matrix);
        }

        this.isProcessing = false;
        
        const processingTime = performance.now() - startTime;
        globalPerformanceMonitor.recordFrame();
        globalPerformanceMonitor.recordLatency(processingTime);

        return {
          detected: false,
          reason: 'Unreasonable perspective detected',
          processingTime,
          frameData
        };
      }

      // Calculate quality score
      const qualityScore = calculateQualityScore(
        detection.corners,
        frameData.width,
        frameData.height
      );

      // Build successful detection result
      const result = {
        detected: true,
        corners: detection.corners,
        cornerPoints: scaledPoints, // Original frame scale
        homography: homographyResult.matrixData,
        homographyMatrix: homographyResult.matrix, // Keep Mat object
        confidence: detection.confidence,
        qualityScore,
        validation,
        processingTime: performance.now() - startTime,
        frameData,
        timestamp: Date.now()
      };

      // Update detection history
      this.lastDetection = result;
      this.detectionHistory.push(result);
      if (this.detectionHistory.length > this.maxHistorySize) {
        // Clean up old homography matrices
        const old = this.detectionHistory.shift();
        if (old.homographyMatrix) {
          cleanupMats(old.homographyMatrix);
        }
      }

      // Record performance
      globalPerformanceMonitor.recordFrame();
      globalPerformanceMonitor.recordLatency(result.processingTime);
      globalCPUMonitor.recordProcessingTime(result.processingTime);

      this.isProcessing = false;
      return result;

    } catch (error) {
      console.error('[CV Pipeline] Processing error:', error);
      this.isProcessing = false;

      const processingTime = performance.now() - startTime;
      globalPerformanceMonitor.recordFrame();
      globalPerformanceMonitor.recordLatency(processingTime);

      return {
        detected: false,
        error: error.message,
        processingTime
      };
    }
  }

  /**
   * Get smoothed detection (average of recent detections)
   */
  getSmoothedDetection() {
    if (this.detectionHistory.length === 0) {
      return null;
    }

    // Use most recent successful detection
    const recent = this.detectionHistory.filter(d => d.detected);
    if (recent.length === 0) {
      return null;
    }

    return recent[recent.length - 1];
  }

  /**
   * Set target processing FPS
   */
  setTargetFPS(fps) {
    this.frameRateLimiter.setTargetFPS(fps);
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      ...globalPerformanceMonitor.getStats(),
      cpuUsage: globalCPUMonitor.getAverageUsage(),
      detectionCount: this.detectionHistory.length,
      lastDetectionTime: this.lastDetection?.timestamp || null
    };
  }

  /**
   * Reset pipeline state
   */
  reset() {
    // Clean up homography matrices
    this.detectionHistory.forEach(d => {
      if (d.homographyMatrix) {
        cleanupMats(d.homographyMatrix);
      }
    });

    this.detectionHistory = [];
    this.lastDetection = null;
    globalPerformanceMonitor.reset();
  }

  /**
   * Cleanup and destroy pipeline
   */
  destroy() {
    this.reset();
    this.isInitialized = false;
    this.cv = null;
  }
}

// Singleton instance
let pipelineInstance = null;

/**
 * Get or create CV pipeline instance
 */
export function getCVPipeline() {
  if (!pipelineInstance) {
    pipelineInstance = new CVPipeline();
  }
  return pipelineInstance;
}

/**
 * Initialize CV pipeline
 */
export async function initializeCVPipeline() {
  const pipeline = getCVPipeline();
  return await pipeline.initialize();
}

/**
 * Process video frame
 */
export async function processVideoFrame(videoElement, options) {
  const pipeline = getCVPipeline();
  return await pipeline.processFrame(videoElement, options);
}

/**
 * Get pipeline statistics
 */
export function getCVStats() {
  const pipeline = getCVPipeline();
  return pipeline.getStats();
}

/**
 * Reset pipeline
 */
export function resetCVPipeline() {
  const pipeline = getCVPipeline();
  pipeline.reset();
}

export default {
  CVPipeline,
  getCVPipeline,
  initializeCVPipeline,
  processVideoFrame,
  getCVStats,
  resetCVPipeline
};
