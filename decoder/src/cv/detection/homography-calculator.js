/**
 * Homography Calculator
 * Calculates 3x3 perspective transformation matrix using RANSAC
 */

import { getOpenCV, cleanupMats } from '../opencv-loader.js';

/**
 * Calculate homography matrix from detected corners to reference rectangle
 * @param {object} cv - OpenCV instance
 * @param {array} srcPoints - Detected corner points [{x, y}, ...]
 * @param {object} dstDimensions - Target dimensions {width, height}
 * @returns {object} Homography result
 */
export function calculateHomography(cv, srcPoints, dstDimensions = null) {
  if (!srcPoints || srcPoints.length !== 4) {
    throw new Error('calculateHomography requires exactly 4 source points');
  }

  try {
    // Default destination is a normalized rectangle (0,0) to (1,1)
    // or use provided dimensions
    const dstWidth = dstDimensions?.width || 1;
    const dstHeight = dstDimensions?.height || 1;

    const dstPoints = [
      { x: 0, y: 0 }, // Top-left
      { x: dstWidth, y: 0 }, // Top-right
      { x: dstWidth, y: dstHeight }, // Bottom-right
      { x: 0, y: dstHeight } // Bottom-left
    ];

    // Convert points to OpenCV format
    const srcMat = cv.matFromArray(4, 1, cv.CV_32FC2, [
      srcPoints[0].x, srcPoints[0].y,
      srcPoints[1].x, srcPoints[1].y,
      srcPoints[2].x, srcPoints[2].y,
      srcPoints[3].x, srcPoints[3].y
    ]);

    const dstMat = cv.matFromArray(4, 1, cv.CV_32FC2, [
      dstPoints[0].x, dstPoints[0].y,
      dstPoints[1].x, dstPoints[1].y,
      dstPoints[2].x, dstPoints[2].y,
      dstPoints[3].x, dstPoints[3].y
    ]);

    // Calculate homography using RANSAC
    const homography = cv.findHomography(
      srcMat,
      dstMat,
      cv.RANSAC,
      5.0 // RANSAC threshold
    );

    // Extract matrix data
    const matrixData = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        matrixData.push(homography.doubleAt(i, j));
      }
    }

    // Cleanup
    srcMat.delete();
    dstMat.delete();

    // Validate matrix
    const validation = validateHomography(matrixData);

    return {
      success: true,
      matrix: homography, // Keep OpenCV Mat for further use
      matrixData, // 3x3 array [h00, h01, h02, h10, h11, h12, h20, h21, h22]
      isValid: validation.valid,
      validationMessage: validation.message
    };
  } catch (error) {
    console.error('[Homography Calculator] Error:', error);
    return {
      success: false,
      matrix: null,
      matrixData: null,
      error: error.message
    };
  }
}

/**
 * Apply homography to transform a point
 * @param {array} matrixData - 3x3 homography matrix as flat array
 * @param {object} point - Point to transform {x, y}
 * @returns {object} Transformed point {x, y}
 */
export function transformPoint(matrixData, point) {
  if (!matrixData || matrixData.length !== 9) {
    throw new Error('Invalid homography matrix');
  }

  const x = point.x;
  const y = point.y;

  // Apply homography transformation
  // [x', y', w'] = H * [x, y, 1]
  const xPrime = matrixData[0] * x + matrixData[1] * y + matrixData[2];
  const yPrime = matrixData[3] * x + matrixData[4] * y + matrixData[5];
  const w = matrixData[6] * x + matrixData[7] * y + matrixData[8];

  // Normalize by w
  if (Math.abs(w) < 1e-6) {
    throw new Error('Division by zero in homography transformation');
  }

  return {
    x: xPrime / w,
    y: yPrime / w
  };
}

/**
 * Apply inverse homography to transform from destination to source
 * @param {object} cv - OpenCV instance
 * @param {object} matrix - OpenCV homography Mat
 * @param {object} point - Point in destination space {x, y}
 * @returns {object} Point in source space {x, y}
 */
export function inverseTransformPoint(cv, matrix, point) {
  try {
    // Invert the homography matrix
    const invMatrix = new cv.Mat();
    cv.invert(matrix, invMatrix);

    // Extract inverse matrix data
    const invData = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        invData.push(invMatrix.doubleAt(i, j));
      }
    }

    invMatrix.delete();

    // Transform point using inverse matrix
    return transformPoint(invData, point);
  } catch (error) {
    console.error('[Homography Calculator] Inverse transform error:', error);
    throw error;
  }
}

/**
 * Warp image using homography
 * @param {object} cv - OpenCV instance
 * @param {object} src - Source Mat
 * @param {object} matrix - Homography Mat
 * @param {object} dstSize - Output size {width, height}
 * @returns {object} Warped Mat
 */
export function warpPerspective(cv, src, matrix, dstSize) {
  try {
    const dst = new cv.Mat();
    const size = new cv.Size(dstSize.width, dstSize.height);

    cv.warpPerspective(
      src,
      dst,
      matrix,
      size,
      cv.INTER_LINEAR,
      cv.BORDER_CONSTANT,
      new cv.Scalar(0, 0, 0, 0)
    );

    return dst;
  } catch (error) {
    console.error('[Homography Calculator] Warp error:', error);
    throw error;
  }
}

/**
 * Validate homography matrix
 * @param {array} matrixData - 3x3 matrix as flat array
 * @returns {object} Validation result
 */
function validateHomography(matrixData) {
  if (!matrixData || matrixData.length !== 9) {
    return {
      valid: false,
      message: 'Invalid matrix dimensions'
    };
  }

  // Check for NaN or Infinity
  if (matrixData.some((v) => !isFinite(v))) {
    return {
      valid: false,
      message: 'Matrix contains NaN or Infinity'
    };
  }

  // Check if matrix is degenerate (determinant near zero)
  const det = calculateDeterminant(matrixData);
  if (Math.abs(det) < 1e-6) {
    return {
      valid: false,
      message: 'Degenerate matrix (determinant near zero)'
    };
  }

  // Check for extreme values that might indicate bad homography
  const maxValue = Math.max(...matrixData.map(Math.abs));
  if (maxValue > 1e6) {
    return {
      valid: false,
      message: 'Matrix values too large (unstable transformation)'
    };
  }

  return {
    valid: true,
    message: 'Valid homography matrix'
  };
}

/**
 * Calculate determinant of 3x3 matrix
 */
function calculateDeterminant(matrix) {
  // For 3x3 matrix: det = a(ei - fh) - b(di - fg) + c(dh - eg)
  const [a, b, c, d, e, f, g, h, i] = matrix;

  return (
    a * (e * i - f * h) -
    b * (d * i - f * g) +
    c * (d * h - e * g)
  );
}

/**
 * Calculate scale factor from homography (approximate screen distance)
 * @param {array} matrixData - 3x3 homography matrix
 * @returns {number} Scale factor (larger = closer to screen)
 */
export function calculateScaleFactor(matrixData) {
  // Use the average of the scaling components
  const sx = Math.sqrt(matrixData[0] * matrixData[0] + matrixData[3] * matrixData[3]);
  const sy = Math.sqrt(matrixData[1] * matrixData[1] + matrixData[4] * matrixData[4]);

  return (sx + sy) / 2;
}

/**
 * Extract rotation angle from homography (in degrees)
 * @param {array} matrixData - 3x3 homography matrix
 * @returns {number} Rotation angle in degrees
 */
export function extractRotationAngle(matrixData) {
  // Approximate rotation from the matrix
  const angle = Math.atan2(matrixData[3], matrixData[0]) * (180 / Math.PI);
  return angle;
}

/**
 * Check if homography represents a reasonable perspective
 * @param {array} matrixData - 3x3 homography matrix
 * @returns {boolean} True if perspective is reasonable
 */
export function isReasonablePerspective(matrixData) {
  const scale = calculateScaleFactor(matrixData);
  const rotation = Math.abs(extractRotationAngle(matrixData));

  // Check if scale is in reasonable range (0.1 to 10)
  if (scale < 0.1 || scale > 10) {
    return false;
  }

  // Check if rotation is not too extreme (< 60 degrees)
  if (rotation > 60) {
    return false;
  }

  return true;
}

export default {
  calculateHomography,
  transformPoint,
  inverseTransformPoint,
  warpPerspective,
  calculateScaleFactor,
  extractRotationAngle,
  isReasonablePerspective
};
