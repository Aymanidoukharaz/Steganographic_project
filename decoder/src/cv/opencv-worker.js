/**
 * OpenCV Web Worker
 * Processes video frames in background thread to prevent main thread blocking
 */

// Import OpenCV.js in worker context
importScripts('https://docs.opencv.org/4.8.0/opencv.js');

let cv = null;
let isInitialized = false;

// Initialize OpenCV in worker
function initializeOpenCV() {
  return new Promise((resolve) => {
    if (isInitialized && cv) {
      resolve();
      return;
    }

    if (typeof cv !== 'undefined' && cv.Mat) {
      isInitialized = true;
      console.log('[CV Worker] OpenCV already available');
      resolve();
      return;
    }

    // Wait for OpenCV runtime
    self.cv = {
      onRuntimeInitialized: () => {
        cv = self.cv;
        isInitialized = true;
        console.log('[CV Worker] ✅ OpenCV initialized in worker');
        resolve();
      }
    };
  });
}

// Process detection request
async function processFrame(imageData, width, height) {
  if (!isInitialized) {
    await initializeOpenCV();
  }

  try {
    // Create Mat from ImageData
    const src = cv.matFromImageData(imageData);
    const gray = new cv.Mat();
    const corners = new cv.Mat();

    // Convert to grayscale
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Detect corners using Harris corner detection
    cv.cornerHarris(gray, corners, 2, 3, 0.04, cv.BORDER_DEFAULT);

    // Threshold and find corner locations
    const threshold = 0.01;
    const detectedCorners = [];

    for (let y = 0; y < corners.rows; y++) {
      for (let x = 0; x < corners.cols; x++) {
        const value = corners.floatAt(y, x);
        if (value > threshold) {
          detectedCorners.push({ x, y, strength: value });
        }
      }
    }

    // Sort by strength and take top corners
    detectedCorners.sort((a, b) => b.strength - a.strength);
    const topCorners = detectedCorners.slice(0, 100); // Limit to top 100

    // Cleanup
    src.delete();
    gray.delete();
    corners.delete();

    return {
      success: true,
      corners: topCorners,
      processingTime: 0
    };
  } catch (error) {
    console.error('[CV Worker] Error processing frame:', error);
    return {
      success: false,
      error: error.message,
      corners: []
    };
  }
}

// Handle messages from main thread
self.onmessage = async (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'INIT':
      await initializeOpenCV();
      self.postMessage({ type: 'INIT_COMPLETE', success: true });
      break;

    case 'PROCESS_FRAME':
      const startTime = performance.now();
      const result = await processFrame(
        data.imageData,
        data.width,
        data.height
      );
      result.processingTime = performance.now() - startTime;
      self.postMessage({ type: 'FRAME_PROCESSED', data: result });
      break;

    case 'CLEANUP':
      // Cleanup resources if needed
      self.postMessage({ type: 'CLEANUP_COMPLETE', success: true });
      break;

    default:
      console.warn('[CV Worker] Unknown message type:', type);
  }
};

// Signal worker is ready
self.postMessage({ type: 'WORKER_READY' });
