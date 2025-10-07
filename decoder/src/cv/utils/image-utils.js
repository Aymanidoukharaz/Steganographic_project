/**
 * Image Utilities
 * Helper functions for image manipulation and coordinate transformations
 */

/**
 * Calculate Euclidean distance between two points
 */
export function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle between three points
 */
export function angle(p1, p2, p3) {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

  return Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);
}

/**
 * Check if point is inside polygon
 */
export function isPointInPolygon(point, polygon) {
  let inside = false;
  const x = point.x;
  const y = point.y;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Calculate polygon area
 */
export function polygonArea(points) {
  let area = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }

  return Math.abs(area / 2);
}

/**
 * Calculate centroid of polygon
 */
export function calculateCentroid(points) {
  const n = points.length;
  let cx = 0;
  let cy = 0;

  points.forEach((p) => {
    cx += p.x;
    cy += p.y;
  });

  return {
    x: cx / n,
    y: cy / n
  };
}

/**
 * Order points in clockwise direction starting from top-left
 */
export function orderPoints(points) {
  if (points.length !== 4) {
    throw new Error('orderPoints expects exactly 4 points');
  }

  // Calculate centroid
  const centroid = calculateCentroid(points);

  // Sort points by angle from centroid
  const sorted = points.map((p) => ({
    ...p,
    angle: Math.atan2(p.y - centroid.y, p.x - centroid.x)
  }));

  sorted.sort((a, b) => a.angle - b.angle);

  // Find top-left corner (smallest x + y sum)
  let minSum = Infinity;
  let topLeftIdx = 0;

  sorted.forEach((p, idx) => {
    const sum = p.x + p.y;
    if (sum < minSum) {
      minSum = sum;
      topLeftIdx = idx;
    }
  });

  // Reorder starting from top-left
  const ordered = [];
  for (let i = 0; i < 4; i++) {
    const idx = (topLeftIdx + i) % 4;
    ordered.push({ x: sorted[idx].x, y: sorted[idx].y });
  }

  return {
    topLeft: ordered[0],
    topRight: ordered[1],
    bottomRight: ordered[2],
    bottomLeft: ordered[3]
  };
}

/**
 * Scale point coordinates
 */
export function scalePoint(point, scaleX, scaleY = scaleX) {
  return {
    x: point.x * scaleX,
    y: point.y * scaleY
  };
}

/**
 * Scale points array
 */
export function scalePoints(points, scaleX, scaleY = scaleX) {
  return points.map((p) => scalePoint(p, scaleX, scaleY));
}

/**
 * Check if four points form a valid rectangle
 */
export function isValidRectangle(points, toleranceAngle = 20) {
  if (points.length !== 4) return false;

  try {
    const ordered = orderPoints(points);
    const corners = [
      ordered.topLeft,
      ordered.topRight,
      ordered.bottomRight,
      ordered.bottomLeft
    ];

    // Check if angles are approximately 90 degrees
    for (let i = 0; i < 4; i++) {
      const p1 = corners[i];
      const p2 = corners[(i + 1) % 4];
      const p3 = corners[(i + 2) % 4];

      const ang = angle(p1, p2, p3);
      if (Math.abs(ang - 90) > toleranceAngle) {
        return false;
      }
    }

    // Check if opposite sides are roughly equal
    const side1 = distance(corners[0], corners[1]);
    const side2 = distance(corners[1], corners[2]);
    const side3 = distance(corners[2], corners[3]);
    const side4 = distance(corners[3], corners[0]);

    const tolerance = 0.3; // 30% tolerance
    const ratio1 = Math.abs(side1 - side3) / Math.max(side1, side3);
    const ratio2 = Math.abs(side2 - side4) / Math.max(side2, side4);

    if (ratio1 > tolerance || ratio2 > tolerance) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Normalize coordinate to 0-1 range
 */
export function normalizeCoordinate(value, max) {
  return Math.max(0, Math.min(1, value / max));
}

/**
 * Denormalize coordinate from 0-1 range
 */
export function denormalizeCoordinate(normalized, max) {
  return normalized * max;
}

/**
 * Linear interpolation
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Smooth interpolation (ease in-out)
 */
export function smoothstep(start, end, t) {
  const x = Math.max(0, Math.min(1, t));
  const smoothT = x * x * (3 - 2 * x);
  return lerp(start, end, smoothT);
}

export default {
  distance,
  angle,
  isPointInPolygon,
  polygonArea,
  calculateCentroid,
  orderPoints,
  scalePoint,
  scalePoints,
  isValidRectangle,
  normalizeCoordinate,
  denormalizeCoordinate,
  lerp,
  smoothstep
};
