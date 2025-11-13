/**
 * Perspective Warper
 * Utility functions for perspective correction and transformation
 */

/**
 * Calculate inverse homography matrix
 * Used to map from warped coordinates back to original
 * @param {object} cv - OpenCV instance
 * @param {cv.Mat} homography - Original homography matrix
 * @returns {cv.Mat} Inverse homography matrix
 */
export function calculateInverseHomography(cv, homography) {
  try {
    const inverse = new cv.Mat();
    
    // Compute matrix inverse
    cv.invert(homography, inverse, cv.DECOMP_SVD);
    
    console.log('[Perspective Warper] Inverse homography calculated');
    
    return inverse;
    
  } catch (error) {
    console.error('[Perspective Warper] Inverse calculation failed:', error);
    throw new Error(`Inverse homography failed: ${error.message}`);
  }
}

/**
 * Transform point using homography
 * @param {object} cv - OpenCV instance
 * @param {object} point - {x, y} point to transform
 * @param {cv.Mat} homography - Homography matrix
 * @returns {object} Transformed {x, y} point
 */
export function transformPoint(cv, point, homography) {
  try {
    const { x, y } = point;
    
    // Create point matrix [x, y, 1]
    const srcPoint = cv.matFromArray(3, 1, cv.CV_64F, [x, y, 1]);
    
    // Multiply: dst = H * src
    const dstPoint = new cv.Mat();
    cv.gemm(homography, srcPoint, 1, new cv.Mat(), 0, dstPoint);
    
    // Normalize homogeneous coordinates
    const w = dstPoint.data64F[2];
    const transformedX = dstPoint.data64F[0] / w;
    const transformedY = dstPoint.data64F[1] / w;
    
    // Cleanup
    srcPoint.delete();
    dstPoint.delete();
    
    return { x: transformedX, y: transformedY };
    
  } catch (error) {
    console.error('[Perspective Warper] Point transformation failed:', error);
    return point; // Return original on error
  }
}

/**
 * Calculate perspective scale factor
 * Used for scaling subtitle size based on distance/angle
 * @param {cv.Mat} homography - Homography matrix
 * @returns {number} Scale factor
 */
export function calculatePerspectiveScale(homography) {
  try {
    if (!homography || homography.empty()) {
      return 1.0;
    }
    
    // Extract scale from homography matrix
    // Simplified: use determinant as approximation
    const data = homography.data64F || homography.data32F;
    
    if (!data || data.length < 9) {
      return 1.0;
    }
    
    // Calculate determinant of 2x2 upper-left submatrix
    const a = data[0];
    const b = data[1];
    const c = data[3];
    const d = data[4];
    
    const det = a * d - b * c;
    const scale = Math.sqrt(Math.abs(det));
    
    // Clamp scale to reasonable range
    const clampedScale = Math.max(0.5, Math.min(2.0, scale));
    
    return clampedScale;
    
  } catch (error) {
    console.error('[Perspective Warper] Scale calculation failed:', error);
    return 1.0;
  }
}

/**
 * Estimate viewing angle from homography
 * Returns approximate angle in degrees
 * @param {cv.Mat} homography - Homography matrix
 * @returns {number} Viewing angle in degrees (0 = frontal)
 */
export function estimateViewingAngle(homography) {
  try {
    const data = homography.data64F || homography.data32F;
    
    if (!data || data.length < 9) {
      return 0;
    }
    
    // Simplified angle estimation based on off-diagonal elements
    const h01 = data[1];
    const h10 = data[3];
    
    const avgSkew = (Math.abs(h01) + Math.abs(h10)) / 2;
    const angle = Math.atan(avgSkew) * (180 / Math.PI);
    
    return Math.min(angle, 90); // Cap at 90 degrees
    
  } catch (error) {
    console.error('[Perspective Warper] Angle estimation failed:', error);
    return 0;
  }
}

/**
 * Check if homography represents valid perspective
 * @param {cv.Mat} homography - Homography matrix to validate
 * @returns {boolean} True if perspective seems valid
 */
export function isValidPerspective(homography) {
  try {
    const scale = calculatePerspectiveScale(homography);
    const angle = estimateViewingAngle(homography);
    
    // Check reasonable bounds
    const scaleValid = scale > 0.3 && scale < 3.0;
    const angleValid = angle < 60; // Less than 60 degrees
    
    const isValid = scaleValid && angleValid;
    
    if (!isValid) {
      console.warn('[Perspective Warper] Invalid perspective:', {
        scale,
        angle,
        scaleValid,
        angleValid
      });
    }
    
    return isValid;
    
  } catch (error) {
    console.error('[Perspective Warper] Validation failed:', error);
    return false;
  }
}
