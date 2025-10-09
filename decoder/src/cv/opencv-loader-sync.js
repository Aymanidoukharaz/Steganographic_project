/**
 * OpenCV.js Synchronous Loader (iOS Safari Compatible)
 * Completely redesigned to avoid async/await promise issues
 */

const OPENCV_URL = 'https://docs.opencv.org/4.8.0/opencv.js';
const CHECK_INTERVAL = 200; // Check every 200ms
const MAX_CHECKS = 150; // 30 seconds max (150 * 200ms)

let loadingState = {
  status: 'idle', // idle, loading, loaded, error
  checksCount: 0,
  error: null,
  startTime: null
};

/**
 * Start loading OpenCV.js (non-blocking)
 * Returns immediately, check status with isOpenCVReady()
 */
export function startOpenCVLoad() {
  // Already loaded
  if (window.cv && window.cv.Mat) {
    console.log('[OpenCV Sync] Already loaded');
    loadingState.status = 'loaded';
    return;
  }

  // Already loading
  if (loadingState.status === 'loading') {
    console.log('[OpenCV Sync] Already loading...');
    return;
  }

  // Check if script already exists
  if (document.querySelector('script[src*="opencv.js"]')) {
    console.log('[OpenCV Sync] Script already in document, starting polling');
    loadingState.status = 'loading';
    loadingState.startTime = performance.now();
    return;
  }

  console.log('[OpenCV Sync] Starting load...');
  loadingState.status = 'loading';
  loadingState.startTime = performance.now();
  loadingState.checksCount = 0;

  // Create and add script
  const script = document.createElement('script');
  script.src = OPENCV_URL;
  script.async = true;
  
  script.onerror = () => {
    console.error('[OpenCV Sync] Script load error');
    loadingState.status = 'error';
    loadingState.error = 'Failed to load script';
  };

  document.head.appendChild(script);
  console.log('[OpenCV Sync] Script added to document');
}

/**
 * Check if OpenCV is ready (synchronous)
 * @returns {boolean}
 */
export function isOpenCVReady() {
  if (loadingState.status === 'loaded') {
    return true;
  }

  if (loadingState.status === 'error') {
    return false;
  }

  // Check if available
  if (window.cv && window.cv.Mat) {
    const loadTime = ((performance.now() - loadingState.startTime) / 1000).toFixed(2);
    console.log(`[OpenCV Sync] ✅ Ready after ${loadTime}s`);
    loadingState.status = 'loaded';
    return true;
  }

  // Timeout check
  loadingState.checksCount++;
  if (loadingState.checksCount > MAX_CHECKS) {
    console.error('[OpenCV Sync] Timeout after 30 seconds');
    loadingState.status = 'error';
    loadingState.error = 'Timeout';
    return false;
  }

  return false;
}

/**
 * Get OpenCV instance (only call if isOpenCVReady() returns true)
 * @returns {object|null}
 */
export function getOpenCVInstance() {
  if (window.cv && window.cv.Mat) {
    return window.cv;
  }
  return null;
}

/**
 * Get loading status
 * @returns {string} idle, loading, loaded, error
 */
export function getLoadingStatus() {
  return loadingState.status;
}

/**
 * Get error message if any
 * @returns {string|null}
 */
export function getLoadingError() {
  return loadingState.error;
}

/**
 * Reset loading state
 */
export function resetLoadingState() {
  loadingState = {
    status: 'idle',
    checksCount: 0,
    error: null,
    startTime: null
  };
}
