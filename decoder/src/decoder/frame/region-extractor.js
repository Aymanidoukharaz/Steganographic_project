/**
 * Region Extractor
 * Extracts data regions from detected video frames
 * - Timing strip: top 5 rows
 * - Subtitle region: bottom 10%
 */

/**
 * Extract steganographic data regions from detected frame
 * @param {object} cv - OpenCV instance
 * @param {cv.Mat} frame - Current video frame
 * @param {cv.Mat} homography - Homography matrix from corner detection
 * @returns {object} Extracted regions with cleanup function
 */
export function extractDataRegions(cv, frame, homography) {
  let warpedFrame = null;
  let timingRegion = null;
  let subtitleRegion = null;
  
  try {
    // 1. Warp frame to frontal view using homography
    warpedFrame = warpPerspective(cv, frame, homography);
    
    if (!warpedFrame || warpedFrame.empty()) {
      throw new Error('Warped frame is empty');
    }
    
    const width = warpedFrame.cols;
    const height = warpedFrame.rows;
    
    console.log('[Region Extractor] Warped frame size:', { width, height });
    
    // 2. Extract timing strip (top 5 rows)
    timingRegion = warpedFrame.roi(new cv.Rect(
      0, 0,        // x, y
      width, 5     // width, height
    ));
    
    // 3. Extract subtitle region (bottom 10% of frame)
    const subtitleHeight = Math.floor(height * 0.10);
    const subtitleY = height - subtitleHeight;
    
    subtitleRegion = warpedFrame.roi(new cv.Rect(
      0, subtitleY,           // x, y
      width, subtitleHeight   // width, height
    ));
    
    console.log('[Region Extractor] ✅ Extracted regions:', {
      timing: { width, height: 5 },
      subtitle: { width, height: subtitleHeight, y: subtitleY }
    });
    
    return {
      timing: timingRegion,
      subtitle: subtitleRegion,
      warpedFrame: warpedFrame,
      cleanup: () => {
        try {
          if (timingRegion) timingRegion.delete();
          if (subtitleRegion) subtitleRegion.delete();
          if (warpedFrame) warpedFrame.delete();
        } catch (e) {
          console.warn('[Region Extractor] Cleanup error:', e);
        }
      }
    };
    
  } catch (error) {
    // Cleanup on error
    try {
      if (timingRegion) timingRegion.delete();
      if (subtitleRegion) subtitleRegion.delete();
      if (warpedFrame) warpedFrame.delete();
    } catch (e) {
      // Ignore cleanup errors
    }
    
    console.error('[Region Extractor] Extraction failed:', error);
    throw new Error(`Region extraction failed: ${error.message}`);
  }
}

/**
 * Warp perspective using homography matrix
 * Transforms skewed frame to frontal view
 * @param {object} cv - OpenCV instance
 * @param {cv.Mat} srcMat - Source frame
 * @param {cv.Mat} homographyMat - 3x3 homography matrix
 * @returns {cv.Mat} Warped frame in frontal view
 */
function warpPerspective(cv, srcMat, homographyMat) {
  try {
    // Determine output size (use original frame size)
    const dsize = new cv.Size(srcMat.cols, srcMat.rows);
    
    // Create output matrix
    const dst = new cv.Mat();
    
    // Apply perspective transformation
    // cv.warpPerspective(src, dst, M, dsize, flags, borderMode, borderValue)
    cv.warpPerspective(
      srcMat,
      dst,
      homographyMat,
      dsize,
      cv.INTER_LINEAR,           // Interpolation method
      cv.BORDER_CONSTANT,        // Border handling
      new cv.Scalar(0, 0, 0, 0) // Border color (black)
    );
    
    console.log('[Region Extractor] Perspective warped:', {
      input: { width: srcMat.cols, height: srcMat.rows },
      output: { width: dst.cols, height: dst.rows }
    });
    
    return dst;
    
  } catch (error) {
    console.error('[Region Extractor] Warp perspective failed:', error);
    throw new Error(`Perspective warp failed: ${error.message}`);
  }
}

/**
 * Extract specific rectangular region from Mat
 * Utility for custom region extraction
 * @param {object} cv - OpenCV instance
 * @param {cv.Mat} srcMat - Source matrix
 * @param {object} rect - Rectangle {x, y, width, height}
 * @returns {cv.Mat} Extracted region
 */
export function extractRegion(cv, srcMat, rect) {
  try {
    const { x, y, width, height } = rect;
    
    // Validate bounds
    if (x < 0 || y < 0 || 
        x + width > srcMat.cols || 
        y + height > srcMat.rows) {
      throw new Error(`Invalid region bounds: ${JSON.stringify(rect)}`);
    }
    
    // Extract ROI (Region of Interest)
    const region = srcMat.roi(new cv.Rect(x, y, width, height));
    
    return region;
    
  } catch (error) {
    console.error('[Region Extractor] Custom extraction failed:', error);
    throw new Error(`Region extraction failed: ${error.message}`);
  }
}

/**
 * Validate homography matrix
 * Checks if matrix is valid for warping
 * @param {cv.Mat} homography - Homography matrix
 * @returns {boolean} True if valid
 */
export function validateHomography(homography) {
  if (!homography || homography.empty()) {
    console.warn('[Region Extractor] Homography is null or empty');
    return false;
  }
  
  // Should be 3x3 matrix
  if (homography.rows !== 3 || homography.cols !== 3) {
    console.warn('[Region Extractor] Homography wrong size:', {
      rows: homography.rows,
      cols: homography.cols
    });
    return false;
  }
  
  // Check for all zeros (invalid)
  const data = homography.data64F || homography.data32F;
  if (!data) {
    console.warn('[Region Extractor] Homography has no data');
    return false;
  }
  
  const allZeros = Array.from(data).every(val => val === 0);
  if (allZeros) {
    console.warn('[Region Extractor] Homography is all zeros');
    return false;
  }
  
  return true;
}
