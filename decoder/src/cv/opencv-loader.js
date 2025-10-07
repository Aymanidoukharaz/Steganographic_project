/**
 * OpenCV.js Async Loader
 * Handles loading OpenCV.js WebAssembly module with error handling and state management
 */

const OPENCV_URL = 'https://docs.opencv.org/4.8.0/opencv.js';

let opencvInstance = null;
let loadingPromise = null;
let loadStartTime = null;

/**
 * Load OpenCV.js asynchronously
 * @returns {Promise<object>} OpenCV.js module
 */
export async function loadOpenCV() {
  // Return existing instance if already loaded
  if (opencvInstance) {
    return opencvInstance;
  }

  // Return existing loading promise if already loading
  if (loadingPromise) {
    return loadingPromise;
  }

  loadStartTime = performance.now();
  console.log('[OpenCV Loader] Starting OpenCV.js load...');

  loadingPromise = new Promise((resolve, reject) => {
    // Check if OpenCV is already available globally
    if (typeof window !== 'undefined' && window.cv && window.cv.Mat) {
      console.log('[OpenCV Loader] OpenCV already loaded globally');
      opencvInstance = window.cv;
      resolve(window.cv);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = OPENCV_URL;
    script.async = true;

    // Setup onload handler
    script.onload = () => {
      console.log('[OpenCV Loader] Script loaded, waiting for cv.onRuntimeInitialized...');
      
      // Wait for OpenCV runtime to initialize
      if (window.cv && window.cv.onRuntimeInitialized) {
        window.cv.onRuntimeInitialized = () => {
          const loadTime = (performance.now() - loadStartTime).toFixed(2);
          console.log(`[OpenCV Loader] ✅ OpenCV.js ready (${loadTime}ms)`);
          opencvInstance = window.cv;
          resolve(window.cv);
        };
      } else {
        reject(new Error('OpenCV.js loaded but cv.onRuntimeInitialized not found'));
      }
    };

    // Setup error handler
    script.onerror = (error) => {
      console.error('[OpenCV Loader] ❌ Failed to load OpenCV.js', error);
      loadingPromise = null;
      reject(new Error('Failed to load OpenCV.js from CDN'));
    };

    // Add script to document
    document.head.appendChild(script);
  });

  return loadingPromise;
}

/**
 * Check if OpenCV is loaded
 * @returns {boolean}
 */
export function isOpenCVLoaded() {
  return opencvInstance !== null && typeof opencvInstance.Mat === 'function';
}

/**
 * Get OpenCV instance (throws if not loaded)
 * @returns {object} OpenCV.js module
 */
export function getOpenCV() {
  if (!opencvInstance) {
    throw new Error('OpenCV.js not loaded. Call loadOpenCV() first.');
  }
  return opencvInstance;
}

/**
 * Memory cleanup utility
 * Deletes OpenCV Mat objects safely
 * @param {...object} mats - OpenCV Mat objects to delete
 */
export function cleanupMats(...mats) {
  mats.forEach((mat) => {
    if (mat && typeof mat.delete === 'function') {
      try {
        mat.delete();
      } catch (error) {
        console.warn('[OpenCV Loader] Error deleting Mat:', error);
      }
    }
  });
}

/**
 * Create Mat with automatic cleanup tracking
 * @param {number} rows
 * @param {number} cols
 * @param {number} type
 * @returns {object} OpenCV Mat
 */
export function createMat(rows, cols, type) {
  const cv = getOpenCV();
  return new cv.Mat(rows, cols, type);
}

/**
 * Get OpenCV memory usage
 * @returns {object} Memory stats
 */
export function getMemoryStats() {
  if (!isOpenCVLoaded()) {
    return { allocated: 0, available: 0 };
  }

  try {
    const cv = getOpenCV();
    // Note: OpenCV.js doesn't expose detailed memory stats
    // This is a placeholder for future implementation
    return {
      allocated: 0,
      available: 0,
      isLoaded: true
    };
  } catch (error) {
    console.warn('[OpenCV Loader] Error getting memory stats:', error);
    return { allocated: 0, available: 0, isLoaded: false };
  }
}

export default {
  loadOpenCV,
  isOpenCVLoaded,
  getOpenCV,
  cleanupMats,
  createMat,
  getMemoryStats
};
