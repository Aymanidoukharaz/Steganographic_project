/**
 * Frame Processor
 * Handles frame capture and preprocessing for CV pipeline
 */

/**
 * Capture frame from video element
 * @param {HTMLVideoElement} videoElement
 * @param {number} targetWidth - Target width for processing (default: 480)
 * @returns {object} { imageData, width, height }
 */
export function captureFrame(videoElement, targetWidth = 480) {
  if (!videoElement || videoElement.readyState < 2) {
    throw new Error('Video element not ready');
  }

  const videoWidth = videoElement.videoWidth;
  const videoHeight = videoElement.videoHeight;

  if (videoWidth === 0 || videoHeight === 0) {
    throw new Error('Invalid video dimensions');
  }

  // Calculate scaled dimensions maintaining aspect ratio
  const scale = targetWidth / videoWidth;
  const scaledWidth = Math.floor(videoWidth * scale);
  const scaledHeight = Math.floor(videoHeight * scale);

  // Create canvas for frame capture
  const canvas = document.createElement('canvas');
  canvas.width = scaledWidth;
  canvas.height = scaledHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Draw video frame to canvas with downscaling
  ctx.drawImage(videoElement, 0, 0, scaledWidth, scaledHeight);

  // Get image data
  const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);

  return {
    imageData,
    width: scaledWidth,
    height: scaledHeight,
    originalWidth: videoWidth,
    originalHeight: videoHeight,
    scale
  };
}

/**
 * Canvas pool for memory efficiency
 */
class CanvasPool {
  constructor(maxSize = 5) {
    this.pool = [];
    this.maxSize = maxSize;
  }

  acquire(width, height) {
    // Try to reuse existing canvas
    const canvas = this.pool.find(
      (c) => c.width === width && c.height === height
    );

    if (canvas) {
      this.pool = this.pool.filter((c) => c !== canvas);
      return canvas;
    }

    // Create new canvas
    const newCanvas = document.createElement('canvas');
    newCanvas.width = width;
    newCanvas.height = height;
    return newCanvas;
  }

  release(canvas) {
    if (this.pool.length < this.maxSize) {
      // Clear canvas before returning to pool
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.pool.push(canvas);
    }
  }

  clear() {
    this.pool = [];
  }
}

// Singleton canvas pool
export const canvasPool = new CanvasPool(5);

/**
 * Preprocessing utilities
 */
export const preprocessing = {
  /**
   * Apply brightness/contrast adjustment
   */
  adjustBrightness(imageData, brightness = 0, contrast = 0) {
    const data = imageData.data;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
      // Apply brightness and contrast to RGB channels
      data[i] = factor * (data[i] - 128) + 128 + brightness; // R
      data[i + 1] = factor * (data[i + 1] - 128) + 128 + brightness; // G
      data[i + 2] = factor * (data[i + 2] - 128) + 128 + brightness; // B
      // Alpha channel unchanged
    }

    return imageData;
  },

  /**
   * Convert to grayscale
   */
  toGrayscale(imageData) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
      // Alpha channel unchanged
    }

    return imageData;
  },

  /**
   * Apply Gaussian blur (simple box blur approximation)
   */
  blur(imageData, radius = 1) {
    // This is a simplified blur - for production, use OpenCV's GaussianBlur
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);

    const kernelSize = radius * 2 + 1;

    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        let r = 0, g = 0, b = 0, count = 0;

        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
          }
        }

        const idx = (y * width + x) * 4;
        output[idx] = r / count;
        output[idx + 1] = g / count;
        output[idx + 2] = b / count;
      }
    }

    imageData.data.set(output);
    return imageData;
  }
};

/**
 * Frame rate limiter
 */
export class FrameRateLimiter {
  constructor(targetFPS = 30) {
    this.targetFPS = targetFPS;
    this.frameInterval = 1000 / targetFPS;
    this.lastFrameTime = 0;
  }

  shouldProcessFrame() {
    const now = performance.now();
    const elapsed = now - this.lastFrameTime;

    if (elapsed >= this.frameInterval) {
      this.lastFrameTime = now;
      return true;
    }

    return false;
  }

  setTargetFPS(fps) {
    this.targetFPS = fps;
    this.frameInterval = 1000 / fps;
  }
}

export default {
  captureFrame,
  canvasPool,
  preprocessing,
  FrameRateLimiter
};
