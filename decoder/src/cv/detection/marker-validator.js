/**
 * Marker Validator
 * Additional validation logic for detected corner markers
 */

import { distance, angle, calculateCentroid } from '../utils/image-utils.js';

/**
 * Validate marker consistency and quality
 */
export function validateMarkers(orderedCorners, frameWidth, frameHeight) {
  const validation = {
    valid: true,
    errors: [],
    warnings: [],
    score: 1.0
  };

  try {
    const corners = [
      orderedCorners.topLeft,
      orderedCorners.topRight,
      orderedCorners.bottomRight,
      orderedCorners.bottomLeft
    ];

    // Check 1: All corners present
    if (corners.some((c) => !c)) {
      validation.valid = false;
      validation.errors.push('Missing corner markers');
      validation.score = 0;
      return validation;
    }

    // Check 2: Corners within frame bounds
    const boundsCheck = checkBounds(corners, frameWidth, frameHeight);
    if (!boundsCheck.valid) {
      validation.valid = false;
      validation.errors.push(boundsCheck.error);
      validation.score *= 0.5;
    }

    // Check 3: Corner strength consistency
    const strengthCheck = checkStrengthConsistency(corners);
    if (!strengthCheck.valid) {
      validation.warnings.push(strengthCheck.warning);
      validation.score *= 0.9;
    }

    // Check 4: Geometric consistency
    const geometryCheck = checkGeometry(corners);
    if (!geometryCheck.valid) {
      validation.valid = false;
      validation.errors.push(geometryCheck.error);
      validation.score *= 0.6;
    } else if (geometryCheck.warning) {
      validation.warnings.push(geometryCheck.warning);
      validation.score *= 0.95;
    }

    // Check 5: Size reasonableness
    const sizeCheck = checkSize(corners, frameWidth, frameHeight);
    if (!sizeCheck.valid) {
      validation.warnings.push(sizeCheck.warning);
      validation.score *= 0.9;
    }

    return validation;
  } catch (error) {
    console.error('[Marker Validator] Validation error:', error);
    return {
      valid: false,
      errors: ['Validation exception: ' + error.message],
      warnings: [],
      score: 0
    };
  }
}

/**
 * Check if all corners are within frame bounds
 */
function checkBounds(corners, width, height) {
  for (const corner of corners) {
    if (
      corner.x < 0 ||
      corner.x >= width ||
      corner.y < 0 ||
      corner.y >= height
    ) {
      return {
        valid: false,
        error: `Corner ${corner.id} out of bounds: (${corner.x}, ${corner.y})`
      };
    }
  }
  return { valid: true };
}

/**
 * Check consistency of corner detection strengths
 */
function checkStrengthConsistency(corners) {
  const strengths = corners.map((c) => c.strength);
  const avgStrength = strengths.reduce((sum, s) => sum + s, 0) / strengths.length;
  const minStrength = Math.min(...strengths);
  const maxStrength = Math.max(...strengths);

  // Check for large variance in strengths
  const variance = maxStrength - minStrength;
  const ratio = variance / avgStrength;

  if (ratio > 2.0) {
    return {
      valid: false,
      warning: `High variance in corner strengths (ratio: ${ratio.toFixed(2)})`
    };
  }

  return { valid: true };
}

/**
 * Check geometric properties of detected rectangle
 */
function checkGeometry(corners) {
  const points = corners.map((c) => ({ x: c.x, y: c.y }));

  // Check angles at each corner
  const angles = [];
  for (let i = 0; i < 4; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % 4];
    const p3 = points[(i + 2) % 4];
    const ang = angle(p1, p2, p3);
    angles.push(ang);
  }

  // All angles should be close to 90 degrees
  const angleDeviations = angles.map((a) => Math.abs(a - 90));
  const maxDeviation = Math.max(...angleDeviations);

  if (maxDeviation > 40) {
    return {
      valid: false,
      error: `Invalid corner angles (max deviation: ${maxDeviation.toFixed(1)}°)`
    };
  }

  if (maxDeviation > 25) {
    return {
      valid: true,
      warning: `Corner angles have moderate deviation (${maxDeviation.toFixed(1)}°)`
    };
  }

  // Check if opposite sides are roughly parallel
  const side1 = { x: points[1].x - points[0].x, y: points[1].y - points[0].y };
  const side3 = { x: points[3].x - points[2].x, y: points[3].y - points[2].y };
  
  const dotProduct = side1.x * side3.x + side1.y * side3.y;
  const mag1 = Math.sqrt(side1.x * side1.x + side1.y * side1.y);
  const mag3 = Math.sqrt(side3.x * side3.x + side3.y * side3.y);
  
  const parallelAngle = Math.acos(dotProduct / (mag1 * mag3)) * (180 / Math.PI);

  if (parallelAngle > 20) {
    return {
      valid: true,
      warning: `Opposite sides not quite parallel (${parallelAngle.toFixed(1)}°)`
    };
  }

  return { valid: true };
}

/**
 * Check if detected rectangle size is reasonable
 */
function checkSize(corners, frameWidth, frameHeight) {
  const points = corners.map((c) => ({ x: c.x, y: c.y }));

  // Calculate width and height
  const width = distance(points[0], points[1]);
  const height = distance(points[0], points[3]);

  // Check if too small
  const minSize = Math.min(frameWidth, frameHeight) * 0.15; // At least 15% of frame
  if (width < minSize || height < minSize) {
    return {
      valid: false,
      warning: `Detected screen too small (${width.toFixed(0)}x${height.toFixed(0)})`
    };
  }

  // Check if too large (should not exceed frame)
  if (width > frameWidth * 0.95 || height > frameHeight * 0.95) {
    return {
      valid: false,
      warning: `Detected screen too large (${width.toFixed(0)}x${height.toFixed(0)})`
    };
  }

  return { valid: true };
}

/**
 * Calculate quality score for detection
 */
export function calculateQualityScore(orderedCorners, frameWidth, frameHeight) {
  const validation = validateMarkers(orderedCorners, frameWidth, frameHeight);
  
  if (!validation.valid) {
    return 0;
  }

  // Start with validation score
  let score = validation.score;

  // Adjust based on corner confidences
  const corners = [
    orderedCorners.topLeft,
    orderedCorners.topRight,
    orderedCorners.bottomRight,
    orderedCorners.bottomLeft
  ];

  const avgConfidence =
    corners.reduce((sum, c) => sum + (c.confidence || 0), 0) / corners.length;

  score *= avgConfidence;

  // Penalize warnings
  score *= Math.pow(0.98, validation.warnings.length);

  return Math.max(0, Math.min(1, score));
}

/**
 * Filter and select best detection from multiple candidates
 */
export function selectBestDetection(detections, frameWidth, frameHeight) {
  if (!detections || detections.length === 0) {
    return null;
  }

  // Score each detection
  const scored = detections.map((detection) => ({
    detection,
    score: calculateQualityScore(detection.corners, frameWidth, frameHeight)
  }));

  // Sort by score
  scored.sort((a, b) => b.score - a.score);

  // Return best if score is above threshold
  const best = scored[0];
  if (best.score > 0.5) {
    return {
      ...best.detection,
      qualityScore: best.score
    };
  }

  return null;
}

export default {
  validateMarkers,
  calculateQualityScore,
  selectBestDetection
};
