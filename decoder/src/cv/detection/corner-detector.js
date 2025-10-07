/**
 * Corner Detector
 * Detects the 4 corner markers embedded in encoded video frames
 * Markers are 20x20 pixel blocks located 60px from edges with RGB-encoded IDs
 */

import { getOpenCV, cleanupMats } from '../opencv-loader.js';
import { isValidRectangle, orderPoints, distance } from '../utils/image-utils.js';

// Marker specifications from encoder (Phase 1)
export const MARKER_SPECS = {
  SIZE: 20, // 20x20 pixels
  EDGE_OFFSET: 60, // 60px from edges
  MIN_CONFIDENCE: 0.7, // Minimum confidence threshold
  EXPECTED_COUNT: 4 // Must find 4 corners
};

// Corner IDs based on encoder implementation
export const CORNER_IDS = {
  TOP_LEFT: 'TL',
  TOP_RIGHT: 'TR',
  BOTTOM_LEFT: 'BL',
  BOTTOM_RIGHT: 'BR'
};

/**
 * Detect corner markers in a video frame
 * @param {object} cv - OpenCV instance
 * @param {object} src - Source Mat (grayscale)
 * @param {number} width - Frame width
 * @param {number} height - Frame height
 * @returns {object} Detection result
 */
export function detectCornerMarkers(cv, src, width, height) {
  const corners = [];
  const regions = getCornerRegions(width, height);

  try {
    // Process each expected corner region
    for (const region of regions) {
      const corner = detectMarkerInRegion(cv, src, region, width, height);
      if (corner) {
        corners.push(corner);
      }
    }

    // Validate that we found 4 corners
    if (corners.length !== 4) {
      return {
        detected: false,
        corners: [],
        confidence: 0,
        reason: `Found ${corners.length} corners, expected 4`
      };
    }

    // Validate corner geometry
    const validation = validateCornerGeometry(corners);
    if (!validation.valid) {
      return {
        detected: false,
        corners: [],
        confidence: 0,
        reason: validation.reason
      };
    }

    // Order corners properly
    const orderedCorners = orderDetectedCorners(corners);

    // Calculate overall confidence
    const confidence = calculateConfidence(orderedCorners);

    return {
      detected: true,
      corners: orderedCorners,
      confidence,
      reason: 'Successfully detected all 4 corners'
    };
  } catch (error) {
    console.error('[Corner Detector] Error:', error);
    return {
      detected: false,
      corners: [],
      confidence: 0,
      reason: error.message
    };
  }
}

/**
 * Get expected corner regions based on frame dimensions
 */
function getCornerRegions(width, height) {
  const offset = MARKER_SPECS.EDGE_OFFSET;
  const size = MARKER_SPECS.SIZE;
  const searchRadius = 40; // Search area around expected position

  return [
    {
      id: CORNER_IDS.TOP_LEFT,
      x: offset,
      y: offset,
      searchX: offset - searchRadius,
      searchY: offset - searchRadius,
      searchWidth: size + searchRadius * 2,
      searchHeight: size + searchRadius * 2
    },
    {
      id: CORNER_IDS.TOP_RIGHT,
      x: width - offset - size,
      y: offset,
      searchX: width - offset - size - searchRadius,
      searchY: offset - searchRadius,
      searchWidth: size + searchRadius * 2,
      searchHeight: size + searchRadius * 2
    },
    {
      id: CORNER_IDS.BOTTOM_LEFT,
      x: offset,
      y: height - offset - size,
      searchX: offset - searchRadius,
      searchY: height - offset - size - searchRadius,
      searchWidth: size + searchRadius * 2,
      searchHeight: size + searchRadius * 2
    },
    {
      id: CORNER_IDS.BOTTOM_RIGHT,
      x: width - offset - size,
      y: height - offset - size,
      searchX: width - offset - size - searchRadius,
      searchY: height - offset - size - searchRadius,
      searchWidth: size + searchRadius * 2,
      searchHeight: size + searchRadius * 2
    }
  ];
}

/**
 * Detect marker in a specific region using corner detection
 */
function detectMarkerInRegion(cv, src, region, frameWidth, frameHeight) {
  try {
    // Ensure search region is within frame bounds
    const x = Math.max(0, Math.min(region.searchX, frameWidth - region.searchWidth));
    const y = Math.max(0, Math.min(region.searchY, frameHeight - region.searchHeight));
    const w = Math.min(region.searchWidth, frameWidth - x);
    const h = Math.min(region.searchHeight, frameHeight - y);

    if (w <= 0 || h <= 0) return null;

    // Extract ROI
    const rect = new cv.Rect(x, y, w, h);
    const roi = src.roi(rect);
    
    // Apply corner detection (Harris)
    const corners = new cv.Mat();
    const blockSize = 2;
    const ksize = 3;
    const k = 0.04;

    cv.cornerHarris(roi, corners, blockSize, ksize, k, cv.BORDER_DEFAULT);

    // Dilate to enhance corners
    const dilated = new cv.Mat();
    const kernel = cv.Mat.ones(3, 3, cv.CV_8U);
    cv.dilate(corners, dilated, kernel);

    // Find local maxima
    let maxVal = 0;
    let maxLoc = { x: 0, y: 0 };

    for (let i = 0; i < dilated.rows; i++) {
      for (let j = 0; j < dilated.cols; j++) {
        const val = dilated.floatAt(i, j);
        if (val > maxVal) {
          maxVal = val;
          maxLoc = { x: j, y: i };
        }
      }
    }

    // Cleanup
    roi.delete();
    corners.delete();
    dilated.delete();
    kernel.delete();

    // Check if corner strength is sufficient
    const threshold = 0.01; // Adjust based on testing
    if (maxVal < threshold) {
      return null;
    }

    // Convert ROI coordinates to frame coordinates
    const cornerX = x + maxLoc.x;
    const cornerY = y + maxLoc.y;

    return {
      id: region.id,
      x: cornerX,
      y: cornerY,
      strength: maxVal,
      confidence: Math.min(1.0, maxVal / 0.1) // Normalize to 0-1
    };
  } catch (error) {
    console.error(`[Corner Detector] Error in region ${region.id}:`, error);
    return null;
  }
}

/**
 * Validate that detected corners form a valid rectangle
 */
function validateCornerGeometry(corners) {
  if (corners.length !== 4) {
    return { valid: false, reason: 'Not exactly 4 corners' };
  }

  // Convert to points array
  const points = corners.map((c) => ({ x: c.x, y: c.y }));

  // Check if they form a valid rectangle
  if (!isValidRectangle(points, 30)) {
    // 30 degree tolerance
    return { valid: false, reason: 'Corners do not form a valid rectangle' };
  }

  // Check minimum size
  const ordered = orderPoints(points);
  const width = distance(ordered.topLeft, ordered.topRight);
  const height = distance(ordered.topLeft, ordered.bottomLeft);

  const minSize = 100; // Minimum screen detection size in pixels
  if (width < minSize || height < minSize) {
    return { valid: false, reason: 'Detected rectangle too small' };
  }

  // Check aspect ratio (screens are typically 16:9 or 16:10, allow wide range)
  const aspectRatio = width / height;
  if (aspectRatio < 0.5 || aspectRatio > 3.0) {
    return { valid: false, reason: 'Invalid aspect ratio' };
  }

  return { valid: true };
}

/**
 * Order corners based on their IDs
 */
function orderDetectedCorners(corners) {
  const cornerMap = {};
  corners.forEach((c) => {
    cornerMap[c.id] = c;
  });

  return {
    topLeft: cornerMap[CORNER_IDS.TOP_LEFT],
    topRight: cornerMap[CORNER_IDS.TOP_RIGHT],
    bottomRight: cornerMap[CORNER_IDS.BOTTOM_RIGHT],
    bottomLeft: cornerMap[CORNER_IDS.BOTTOM_LEFT]
  };
}

/**
 * Calculate overall detection confidence
 */
function calculateConfidence(orderedCorners) {
  const corners = [
    orderedCorners.topLeft,
    orderedCorners.topRight,
    orderedCorners.bottomRight,
    orderedCorners.bottomLeft
  ];

  // Average of individual corner confidences
  const avgConfidence =
    corners.reduce((sum, c) => sum + c.confidence, 0) / corners.length;

  // Penalize if any corner has low confidence
  const minConfidence = Math.min(...corners.map((c) => c.confidence));

  // Combined confidence (weighted average)
  return avgConfidence * 0.7 + minConfidence * 0.3;
}

/**
 * Convert ordered corners to points array for homography
 */
export function cornersToPoints(orderedCorners) {
  return [
    { x: orderedCorners.topLeft.x, y: orderedCorners.topLeft.y },
    { x: orderedCorners.topRight.x, y: orderedCorners.topRight.y },
    { x: orderedCorners.bottomRight.x, y: orderedCorners.bottomRight.y },
    { x: orderedCorners.bottomLeft.x, y: orderedCorners.bottomLeft.y }
  ];
}

export default {
  detectCornerMarkers,
  cornersToPoints,
  MARKER_SPECS,
  CORNER_IDS
};
