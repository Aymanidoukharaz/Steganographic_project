/**
 * OpenCV.js Async Loader
 * Handles loading OpenCV.js WebAssembly module with proper error handling
 * and loading state management
 */

let opencvLoadPromise = null;
let opencvInstance = null;

/**
 * Load OpenCV.js asynchronously
 * @returns {Promise<Object>} OpenCV.js cv object
 * @throws {Error} If OpenCV.js fails to load
 */
export async function loadOpenCV() {
  // Return cached instance if already loaded
  if (opencvInstance) {
    console.log('[OpenCV] Already loaded, returning cached instance');
    return opencvInstance;
  }
  
  // Return existing promise if already loading
  if (opencvLoadPromise) {
    console.log('[OpenCV] Load in progress, waiting...');
    return opencvLoadPromise;
  }
  
  console.log('[OpenCV] Starting load process...');
  const startTime = performance.now();
  
  opencvLoadPromise = new Promise((resolve, reject) => {
    // Timeout after 15 seconds (reduced from 30 for faster failure)
    const timeout = setTimeout(() => {
      console.warn('[OpenCV] ⚠️ Load timeout (15s) - App will continue without CV features');
      reject(new Error('OpenCV.js load timeout (15s exceeded)'));
    }, 15000);
    
    try {
      // Create script element for OpenCV.js
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
      
      // Handle successful load
      script.onload = () => {
        console.log('[OpenCV] Script loaded, waiting for module initialization...');
        
        // OpenCV.js requires cv to be ready
        if (window.cv && typeof window.cv.Mat === 'function') {
          clearTimeout(timeout);
          const loadTime = performance.now() - startTime;
          
          opencvInstance = window.cv;
          console.log(`[OpenCV] ✅ Loaded successfully in ${loadTime.toFixed(0)}ms`);
          console.log(`[OpenCV] Version: ${opencvInstance.getBuildInformation ? 'Available' : 'N/A'}`);
          
          resolve(opencvInstance);
        } else {
          // Wait for cv.onRuntimeInitialized callback
          window.cv = window.cv || {};
          window.cv.onRuntimeInitialized = () => {
            clearTimeout(timeout);
            const loadTime = performance.now() - startTime;
            
            opencvInstance = window.cv;
            console.log(`[OpenCV] ✅ Loaded successfully in ${loadTime.toFixed(0)}ms`);
            console.log(`[OpenCV] Build Info: ${opencvInstance.getBuildInformation ? 'Available' : 'N/A'}`);
            
            resolve(opencvInstance);
          };
        }
      };
      
      // Handle load failure
      script.onerror = (error) => {
        clearTimeout(timeout);
        const errorMsg = 'Failed to load OpenCV.js script from CDN';
        console.error(`[OpenCV] ❌ ${errorMsg}`, error);
        reject(new Error(errorMsg));
      };
      
      // Add script to document
      document.head.appendChild(script);
      console.log('[OpenCV] Script tag added to document');
      
    } catch (error) {
      clearTimeout(timeout);
      console.error('[OpenCV] ❌ Unexpected error during load:', error);
      reject(error);
    }
  });
  
  return opencvLoadPromise;
}

/**
 * Check if OpenCV.js is loaded
 * @returns {boolean} True if loaded and ready
 */
export function isOpenCVLoaded() {
  return opencvInstance !== null && typeof opencvInstance.Mat === 'function';
}

/**
 * Get OpenCV.js instance (synchronous)
 * @returns {Object|null} OpenCV.js cv object or null if not loaded
 */
export function getOpenCV() {
  return opencvInstance;
}

/**
 * Get OpenCV.js version information
 * @returns {string} Version information
 */
export function getOpenCVVersion() {
  if (!opencvInstance) {
    return 'Not loaded';
  }
  
  try {
    // Try to get build information if available
    if (typeof opencvInstance.getBuildInformation === 'function') {
      const buildInfo = opencvInstance.getBuildInformation();
      // Extract version from build info (first line usually contains version)
      const versionMatch = buildInfo.match(/OpenCV\s+(\d+\.\d+\.\d+)/);
      return versionMatch ? versionMatch[1] : 'Unknown version';
    }
  } catch (e) {
    console.warn('[OpenCV] Could not retrieve version info:', e);
  }
  
  return 'Loaded (version unknown)';
}

/**
 * Unload OpenCV.js (for testing/cleanup)
 * Not typically needed in production
 */
export function unloadOpenCV() {
  if (opencvInstance) {
    console.log('[OpenCV] Unloading instance');
    opencvInstance = null;
    opencvLoadPromise = null;
    if (window.cv) {
      delete window.cv;
    }
  }
}
