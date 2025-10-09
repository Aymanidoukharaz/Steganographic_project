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
  console.log('[OpenCV Loader] loadOpenCV() called');
  console.log('[OpenCV Loader] opencvInstance exists:', !!opencvInstance);
  console.log('[OpenCV Loader] loadingPromise exists:', !!loadingPromise);
  
  // Return existing instance if already loaded
  if (opencvInstance) {
    console.log('[OpenCV Loader] Returning cached instance immediately');
    return Promise.resolve(opencvInstance); // Ensure we return a promise
  }
  
  // Check if OpenCV is already globally available (edge case)
  if (window.cv && window.cv.Mat) {
    console.log('[OpenCV Loader] OpenCV found globally, caching and returning');
    opencvInstance = window.cv;
    return Promise.resolve(opencvInstance); // Ensure we return a promise
  }

  // Return existing loading promise if already loading
  if (loadingPromise) {
    console.log('[OpenCV Loader] Returning existing loading promise');
    return loadingPromise;
  }

  loadStartTime = performance.now();
  console.log('[OpenCV Loader] Starting NEW Promise for OpenCV.js load...');

  loadingPromise = new Promise((resolve, reject) => {
    // Check if OpenCV is already available globally
    if (typeof window !== 'undefined' && window.cv && window.cv.Mat) {
      console.log('[OpenCV Loader] OpenCV already loaded globally');
      opencvInstance = window.cv;
      resolve(window.cv);
      return;
    }

    const MAX_WAIT_TIME = 30000; // 30 seconds timeout
    const POLL_INTERVAL = 100; // Check every 100ms
    let timeoutId = null;
    let pollIntervalId = null;

    /**
     * Check if OpenCV is ready by polling
     * More reliable on iOS Safari than onRuntimeInitialized callback
     */
    const checkOpenCVReady = () => {
      if (window.cv && window.cv.Mat) {
        const loadTime = (performance.now() - loadStartTime).toFixed(2);
        console.log(`[OpenCV Loader] ✅ OpenCV.js ready via polling (${loadTime}ms)`);
        console.log(`[OpenCV Loader] About to resolve promise...`);
        
        clearTimeout(timeoutId);
        clearInterval(pollIntervalId);
        
        opencvInstance = window.cv;
        loadingPromise = null; // CRITICAL: Clear to prevent caching resolved promise
        
        // Use setTimeout to ensure resolution happens in next tick
        setTimeout(() => {
          try {
            console.log(`[OpenCV Loader] Calling resolve(window.cv)...`);
            resolve(window.cv);
            console.log(`[OpenCV Loader] ✓ Promise resolved successfully`);
          } catch (err) {
            console.error(`[OpenCV Loader] ✗ Error resolving promise:`, err);
          }
        }, 0);
        
        return true;
      }
      return false;
    };

    // Create script element
    const script = document.createElement('script');
    script.src = OPENCV_URL;
    script.async = true;

    // Setup onload handler
    script.onload = () => {
      console.log('[OpenCV Loader] Script loaded, initializing OpenCV...');
      
      // Try callback method first (works on some browsers)
      if (window.cv && typeof window.cv.onRuntimeInitialized !== 'undefined') {
        window.cv.onRuntimeInitialized = () => {
          const loadTime = (performance.now() - loadStartTime).toFixed(2);
          console.log(`[OpenCV Loader] ✅ OpenCV.js ready via callback (${loadTime}ms)`);
          
          clearTimeout(timeoutId);
          clearInterval(pollIntervalId);
          
          opencvInstance = window.cv;
          resolve(window.cv);
        };
      }

      // Start polling as backup (essential for iOS Safari)
      pollIntervalId = setInterval(() => {
        if (checkOpenCVReady()) {
          clearInterval(pollIntervalId);
        }
      }, POLL_INTERVAL);

      // Timeout if loading takes too long
      timeoutId = setTimeout(() => {
        clearInterval(pollIntervalId);
        console.error('[OpenCV Loader] ❌ Timeout waiting for OpenCV.js initialization');
        loadingPromise = null;
        reject(new Error(`OpenCV.js initialization timeout after ${MAX_WAIT_TIME}ms`));
      }, MAX_WAIT_TIME);
    };

    // Setup error handler
    script.onerror = (error) => {
      console.error('[OpenCV Loader] ❌ Failed to load OpenCV.js script', error);
      clearTimeout(timeoutId);
      clearInterval(pollIntervalId);
      loadingPromise = null;
      reject(new Error('Failed to load OpenCV.js from CDN'));
    };

    // Add script to document
    console.log('[OpenCV Loader] Adding script to document...');
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
