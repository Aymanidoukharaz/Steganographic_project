# Computer Vision Module - Phase 3

This module implements the computer vision foundation for the Steganographic AR Subtitles PWA, including corner detection, homography calculation, and frame processing.

## Architecture

```
src/cv/
├── opencv-loader.js              # OpenCV.js async loading & memory management
├── opencv-worker.js              # Web Worker for background processing
├── cv-pipeline.js                # Main coordinator & processing loop
├── detection/
│   ├── corner-detector.js        # Harris corner detection algorithm
│   ├── marker-validator.js       # Geometric validation & quality scoring
│   └── homography-calculator.js  # 3x3 perspective transformation
└── utils/
    ├── frame-processor.js        # Frame capture & preprocessing
    ├── image-utils.js            # Geometry calculations
    └── performance-monitor.js    # FPS & latency tracking
```

## Core Functionality

### 1. OpenCV.js Integration

**opencv-loader.js** provides:
- Async loading from CDN
- Singleton pattern for instance management
- Memory cleanup utilities
- Error handling

```javascript
import { loadOpenCV, getOpenCV, cleanupMats } from './opencv-loader';

// Load OpenCV
await loadOpenCV();

// Get instance
const cv = getOpenCV();

// Cleanup
cleanupMats(mat1, mat2, mat3);
```

### 2. Corner Detection

**corner-detector.js** detects 4 corner markers:
- Size: 20x20 pixels
- Position: 60px from frame edges
- IDs: TL, TR, BL, BR
- Algorithm: Harris corners + template matching

```javascript
import { detectCornerMarkers } from './detection/corner-detector';

const result = detectCornerMarkers(cv, grayMat, width, height);
// result: { detected, corners, confidence, reason }
```

### 3. Homography Calculation

**homography-calculator.js** computes 3x3 transformation matrix:
- Uses RANSAC for robustness
- Forward and inverse transformations
- Perspective warping
- Validation checks

```javascript
import { calculateHomography, transformPoint } from './detection/homography-calculator';

const homography = calculateHomography(cv, srcPoints, dstDimensions);
const transformed = transformPoint(homography.matrixData, point);
```

### 4. CV Pipeline

**cv-pipeline.js** orchestrates the entire detection process:

```javascript
import { initializeCVPipeline, processVideoFrame, getCVStats } from './cv-pipeline';

// Initialize
await initializeCVPipeline();

// Process frame
const result = await processVideoFrame(videoElement, { targetWidth: 480 });

// Get stats
const stats = getCVStats();
```

## React Integration

### useCVDetection Hook

```javascript
import { useCVDetection } from '../hooks/useCVDetection';

function MyComponent() {
  const videoRef = useRef();
  const {
    isInitialized,
    detectionStatus,
    confidence,
    cornerPositions,
    homography
  } = useCVDetection(videoRef);
  
  // Auto-initializes when camera is ready
  // Auto-starts detection loop
  // Updates AppContext state
}
```

### DetectionOverlay Component

```javascript
import DetectionOverlay from '../components/UI/DetectionOverlay';

function CameraView() {
  return (
    <div>
      <video ref={videoRef} />
      <DetectionOverlay />
    </div>
  );
}
```

## Performance

### Optimizations
- **Frame Rate Limiting**: 15 FPS target (vs 30 FPS camera)
- **Downscaling**: 720p → 480p (4x fewer pixels)
- **Frame Skipping**: Skip if processing is busy
- **Canvas Pooling**: Reuse canvas objects
- **Mat Cleanup**: Explicit memory management

### Targets
- Detection Latency: <100ms
- Processing FPS: 15-30 FPS
- CPU Usage: <60%
- Memory: No leaks

### Monitoring

```javascript
import { globalPerformanceMonitor, globalCPUMonitor } from './utils/performance-monitor';

const perfStats = globalPerformanceMonitor.getStats();
// { fps, averageLatency, peakLatency, frameCount }

const cpuUsage = globalCPUMonitor.getAverageUsage();
// Estimated CPU percentage
```

## Detection Flow

1. **Frame Capture**
   - Capture from video element
   - Downscale to 480p
   - Convert to ImageData

2. **Preprocessing**
   - Convert to grayscale
   - Optional brightness adjustment

3. **Corner Detection**
   - Harris corner detection in expected regions
   - Extract corner positions
   - Validate 4-corner geometry

4. **Validation**
   - Check rectangle geometry
   - Verify corner strengths
   - Calculate confidence score

5. **Homography**
   - Calculate 3x3 matrix using RANSAC
   - Validate transformation
   - Check perspective reasonableness

6. **State Update**
   - Update AppContext with results
   - Trigger DetectionOverlay re-render
   - Update performance metrics

## Error Handling

All functions handle errors gracefully:

```javascript
const result = await processVideoFrame(videoElement);

if (result.error) {
  console.error('Processing error:', result.error);
}

if (!result.detected) {
  console.log('No detection:', result.reason);
}

if (result.detected) {
  // Use result.corners, result.homography
}
```

## Debug Features

### Console Logging

Enable detailed logs in browser console:
- `[OpenCV Loader]` - Loading progress
- `[CV Pipeline]` - Processing results
- `[Corner Detector]` - Detection details

### Debug Overlay

Toggle `showDebugInfo` in AppContext to display:
- Detection status
- Confidence percentage
- Processing FPS
- Corner count

## Testing

### Unit Testing

Each module is independently testable:

```javascript
// Test corner detection
const mockMat = createTestMat();
const result = detectCornerMarkers(cv, mockMat, 640, 480);
expect(result.detected).toBe(true);

// Test homography
const points = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }];
const homography = calculateHomography(cv, points);
expect(homography.success).toBe(true);
```

### Integration Testing

Test full pipeline with encoded video:

1. Display Phase 1 encoded video on screen
2. Point camera at screen (1-2m distance)
3. Verify corner detection
4. Verify homography calculation
5. Check performance metrics

## Known Limitations

1. **Requires Encoded Video**: Only works with Phase 1 corner markers
2. **Lighting Sensitive**: Needs good lighting for detection
3. **Distance Limited**: Works best at 1-2m
4. **Angle Sensitive**: Best at 0-30°, may fail >45°
5. **Web Worker**: Created but not currently active (future optimization)

## Future Improvements (Phase 4+)

1. **Active Web Worker**: Move processing to background thread
2. **Adaptive Thresholds**: Auto-adjust for lighting conditions
3. **Multi-frame Averaging**: Smooth detection across frames
4. **Deep Learning**: Replace Harris corners with neural network
5. **Edge Cases**: Better handling of partial occlusion

## API Reference

### opencv-loader.js
- `loadOpenCV()` - Load OpenCV.js
- `getOpenCV()` - Get instance
- `isOpenCVLoaded()` - Check if loaded
- `cleanupMats(...mats)` - Delete Mats

### cv-pipeline.js
- `initializeCVPipeline()` - Initialize
- `processVideoFrame(video, options)` - Process frame
- `getCVStats()` - Get statistics
- `resetCVPipeline()` - Reset state

### corner-detector.js
- `detectCornerMarkers(cv, src, width, height)` - Detect corners
- `cornersToPoints(orderedCorners)` - Convert to points array

### homography-calculator.js
- `calculateHomography(cv, srcPoints, dstDimensions)` - Calculate matrix
- `transformPoint(matrixData, point)` - Transform point
- `warpPerspective(cv, src, matrix, dstSize)` - Warp image

### marker-validator.js
- `validateMarkers(corners, width, height)` - Validate detection
- `calculateQualityScore(corners, width, height)` - Get quality score

## Dependencies

- OpenCV.js 4.8.0 (loaded from CDN)
- React 18.2+ (for hooks)
- No additional npm packages required

## License

Part of the Steganographic AR Subtitles System
© 2025 AYMAN IDOUKHARAZ
