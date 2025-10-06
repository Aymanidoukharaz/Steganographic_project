# Development Plan
## Steganographic AR Subtitles System

**Project:** AR Subtitles Decoder  
**Author:** AYMAN IDOUKHARAZ  
**Plan Version:** 1.0  
**Date:** September 30, 2025  
**PRD Version:** 1.0 (Source of Truth)

---

## Overview

This development plan breaks down the Steganographic AR Subtitles System into **7 manageable phases**, each with clear deliverables, success criteria, and handoff procedures. Each phase must be completed and committed to git before moving to the next phase to maintain proper version control.

**Critical Rules:**
1. **PRD is Source of Truth** - Any fundamental changes must update PRD after my approval
2. **Phase Completion** - Each phase ends with developer feedback request and handoff prompt
3. **No Cross-Phase Work** - Developers work only on their assigned phase
4. **Version Control** - Each phase results in a git commit with working functionality
5. **Testing Required** - Each phase includes basic testing of implemented features

---

## Phase Structure

Each phase follows this structure:
- **Scope**: What will be built
- **Deliverables**: Specific files/features to create
- **Success Criteria**: How to verify completion
- **Testing Requirements**: Minimum tests needed
- **Git Commit**: What should be committed
- **Handoff**: Information for next developer

---

## Phase 1: Project Foundation & Python Encoder Core
**Developer Role:** Backend/Python Developer  
**Git Tag:** `v0.1.0-encoder-foundation`

### Scope
Set up the complete project structure and implement the core Python encoder functionality for steganographic video processing.

### Deliverables

#### 1.1 Project Structure Setup
```
stegano.ar/
├── encoder/                    # Python encoder application
│   ├── main.py                # GUI entry point
│   ├── core/
│   │   ├── __init__.py
│   │   ├── video_processor.py # Video loading/saving
│   │   ├── steganographer.py  # Core steganography logic
│   │   ├── subtitle_parser.py # SRT/VTT parsing
│   │   └── marker_generator.py # Corner marker generation
│   ├── gui/
│   │   ├── __init__.py
│   │   └── encoder_gui.py     # Tkinter interface
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_video_processor.py
│   │   ├── test_steganographer.py
│   │   └── test_subtitle_parser.py
│   ├── requirements.txt       # Python dependencies
│   └── README.md             # Encoder documentation
├── decoder/                   # PWA decoder (empty for now)
├── docs/
│   ├── PRD.md                # Existing PRD
│   └── PLAN.md               # This file
├── .gitignore
└── README.md                 # Project overview
```

#### 1.2 Python Encoder Implementation
- **Video Processor** (`video_processor.py`):
  - Load video files (MP4, AVI, MOV)
  - Extract frames for processing
  - Save processed video with H.264 codec
  - Progress tracking and validation

- **Subtitle Parser** (`subtitle_parser.py`):
  - Parse SRT files completely
  - Parse VTT files (basic support)
  - Extract timing and text data
  - Handle encoding errors gracefully

- **Marker Generator** (`marker_generator.py`):
  - Generate 4 corner detection markers (20x20 pixels each)
  - Implement unique ID + orientation encoding
  - RGB channel manipulation for robustness
  - Position markers 60px from edges

- **Steganographer** (`steganographer.py`):
  - LSB embedding in timing strip (top 5 rows)
  - LSB embedding in subtitle region (bottom 10%)
  - Frame number and timestamp encoding
  - Compress subtitle text with LZ4
  - Basic error correction implementation

- **GUI Interface** (`encoder_gui.py`):
  - File selection for video and subtitles
  - Progress indicator during encoding
  - Basic validation and error messages
  - Output file selection

#### 1.3 Core Dependencies Setup
Create `requirements.txt` with exact versions:
```
opencv-python==4.8.1.78
numpy==1.24.3
Pillow==10.0.1
pysrt==1.1.2
webvtt-py==0.4.6
lz4==4.3.2
```

### Success Criteria
- [ ] Python encoder GUI launches without errors
- [ ] Successfully loads test video file (MP4)
- [ ] Successfully parses test SRT file
- [ ] Embeds corner markers in all 4 corners
- [ ] Embeds timing data in top 5 pixel rows
- [ ] Embeds subtitle data in bottom region
- [ ] Outputs encoded video file that plays normally
- [ ] All unit tests pass (minimum 80% coverage)

### Testing Requirements
1. **Unit Tests**: Test each core module independently
2. **Integration Test**: Full encode workflow with sample files
3. **File Format Tests**: Test MP4, AVI input; SRT, VTT subtitles
4. **Error Handling**: Test invalid files, corrupted data
5. **Sample Files**: Create test video (30 sec) + SRT file

### Sample Test Files to Create
- `test_video.mp4` (30 seconds, 720p, simple content)
- `test_subtitles.srt` (5-6 subtitle entries with French text)
- `test_subtitles.vtt` (same content as SRT)

### Git Commit Requirements
```bash
# Commit message format:
# Phase 1: Python encoder foundation with steganographic embedding

# Files to include:
- All encoder/ directory files
- Updated .gitignore
- Project README.md
- Test files and documentation
- Working requirements.txt
```

### Known Limitations (Document for Next Phase)
- No advanced error correction (basic checksum only)
- No encoding strength adjustment
- No visual preview of markers
- Basic GUI (functional but not polished)

### PRD Compliance Check
- ✅ Supports MP4, AVI, MOV input (4.1.1)
- ✅ Parses SRT subtitles (4.1.1)
- ✅ Embeds corner markers (4.1.1)
- ✅ Embeds subtitle data steganographically (4.1.1)
- ✅ Embeds timing synchronization (4.1.1)
- ✅ Exports H.264 video (4.1.1)
- ✅ Simple GUI interface (4.1.1)
- ✅ Progress indicator (4.1.1)
- ❌ VTT support (P1 - basic implementation)
- ❌ Preview markers (P1 - defer to later)

### Phase 1 Exit Criteria
Before requesting feedback, ensure:
1. All success criteria met
2. Unit tests written and passing
3. Sample encoded video plays correctly
4. No critical bugs in encoding workflow
5. Code documented with docstrings
6. Git repository clean and committed

---

## Phase 2: PWA Foundation & Camera Setup
**Developer Role:** Frontend/React Developer  
**Git Tag:** `v0.2.0-pwa-foundation`

### Scope
Set up the Progressive Web App foundation with React/Vite, implement camera access, and create the basic UI structure in French.

### Deliverables

#### 2.1 PWA Project Setup
```
decoder/
├── public/
│   ├── icons/              # PWA icons (192x192, 512x512)
│   ├── manifest.json      # PWA manifest
│   └── index.html         # Main HTML
├── src/
│   ├── components/
│   │   ├── Camera/
│   │   │   ├── CameraView.jsx
│   │   │   └── CameraControls.jsx
│   │   ├── UI/
│   │   │   ├── Header.jsx
│   │   │   ├── StatusIndicator.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   └── Layout/
│   │       └── AppLayout.jsx
│   ├── hooks/
│   │   ├── useCamera.js
│   │   └── usePermissions.js
│   ├── contexts/
│   │   └── AppContext.jsx
│   ├── utils/
│   │   └── constants.js
│   ├── styles/
│   │   ├── globals.css
│   │   └── camera.css
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

#### 2.2 Camera Implementation
- **Camera Hook** (`useCamera.js`):
  - Request camera permissions
  - Access rear camera with optimal settings
  - Handle camera errors gracefully
  - Provide camera status and controls

- **Camera Component** (`CameraView.jsx`):
  - Full-screen camera viewfinder
  - Real-time video display
  - Overlay system for UI elements
  - Responsive layout for mobile

#### 2.3 French UI Implementation
- **Text Constants** (`constants.js`):
```javascript
export const UI_TEXT = {
  app: {
    title: "Décodeur de Sous-titres AR",
    shortTitle: "AR Subtitles"
  },
  camera: {
    permissionRequest: "Accès à la caméra requis",
    permissionDenied: "Accès à la caméra refusé",
    loading: "Initialisation de la caméra...",
    error: "Impossible d'accéder à la caméra"
  },
  status: {
    idle: "Pointez la caméra vers un écran encodé",
    searching: "Recherche en cours...",
    detecting: "Détection en cours...",
    active: "Vidéo détectée!"
  }
};
```

- **Status Indicator Component**:
  - Visual status display in French
  - Pulsing animation for "searching"
  - Color-coded states (idle/searching/active)

#### 2.4 PWA Configuration
- **Manifest** (`manifest.json`):
```json
{
  "name": "Décodeur de Sous-titres AR",
  "short_name": "AR Subtitles",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#2563EB",
  "background_color": "#0F172A",
  "start_url": "/",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512", 
      "type": "image/png"
    }
  ]
}
```

- **Service Worker**: Basic offline support for static assets
- **Vite PWA Plugin**: Configured for production builds

#### 2.5 Styling System
- **Tailwind CSS**: Configured with custom color palette
- **Dark Theme**: Primary theme as per PRD design specs
- **Typography**: Inter font family, responsive sizing
- **Mobile-First**: Responsive design for iPhone target

### Success Criteria
- [ ] PWA installs correctly on iPhone Safari
- [ ] Camera permissions requested and handled
- [ ] Rear camera access working on mobile
- [ ] Full-screen camera view displays correctly
- [ ] All UI text in French
- [ ] Status indicator shows different states
- [ ] Responsive layout works on iPhone
- [ ] App works offline after initial load
- [ ] No console errors or warnings

### Testing Requirements
1. **Camera Testing**: Test on actual iPhone device
2. **Permission Testing**: Test denied/granted scenarios
3. **PWA Testing**: Test installation and offline functionality
4. **Responsive Testing**: Test various mobile screen sizes
5. **Performance Testing**: Ensure 60 FPS camera feed

### Git Commit Requirements
```bash
# Phase 2: PWA foundation with camera access and French UI

# Must include:
- Complete decoder/ directory structure
- Working camera implementation
- French UI with status indicators
- PWA configuration (manifest, service worker)
- Responsive styling system
```

### Dependencies Added
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.17.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### Phase 2 Exit Criteria
Before requesting feedback, ensure:
1. PWA runs on iPhone Safari without issues
2. Camera feed displays at 30+ FPS
3. All French text renders correctly
4. App installs as PWA successfully
5. Basic offline functionality works
6. Code follows React best practices

---

## Phase 3: Computer Vision Foundation
**Developer Role:** Computer Vision/JavaScript Developer  
**Git Tag:** `v0.3.0-cv-foundation`

### Scope
Integrate OpenCV.js and implement the core computer vision pipeline for corner marker detection and homography calculation.

### Deliverables

#### 3.1 OpenCV.js Integration
- **OpenCV Setup**:
  - Integrate OpenCV.js WebAssembly
  - Configure Web Workers for CV processing
  - Implement frame capture from camera stream
  - Set up efficient memory management

#### 3.2 Computer Vision Pipeline
```
src/cv/
├── opencv/
│   ├── opencv-loader.js       # OpenCV.js async loading
│   └── opencv-worker.js       # Web Worker for CV processing
├── detection/
│   ├── corner-detector.js     # Corner marker detection
│   ├── marker-validator.js    # Marker validation logic
│   └── homography-calculator.js # 3D transformation math
├── utils/
│   ├── frame-processor.js     # Frame capture and preprocessing
│   ├── image-utils.js         # Image manipulation utilities
│   └── performance-monitor.js # FPS and latency tracking
└── cv-pipeline.js            # Main CV processing coordinator
```

#### 3.3 Corner Detection Implementation
- **Marker Template Matching**:
  - Define expected corner marker patterns
  - Implement template matching algorithm
  - Sub-pixel accuracy for corner positions
  - Handle various lighting conditions

- **Detection Algorithm**:
```javascript
// Expected marker pattern (from encoder Phase 1)
const CORNER_PATTERNS = {
  TOP_LEFT: { id: 'TL', position: [60, 60] },
  TOP_RIGHT: { id: 'TR', position: [-60, 60] },
  BOTTOM_LEFT: { id: 'BL', position: [60, -60] }, 
  BOTTOM_RIGHT: { id: 'BR', position: [-60, -60] }
};
```

- **Validation Logic**:
  - Verify 4 corners form valid rectangle
  - Check marker ID consistency
  - Calculate detection confidence score
  - Filter false positives

#### 3.4 Homography Calculation
- **3D Transformation**:
  - Calculate 3x3 homography matrix
  - Use RANSAC for robust estimation
  - Handle perspective distortion
  - Provide screen plane coordinates

- **Performance Optimization**:
  - Process frames at 720p → 480p
  - Skip frames if CPU saturated
  - Use RequestAnimationFrame timing
  - Implement frame pooling

#### 3.5 Integration with PWA
- **CV Context**:
```javascript
// New context for computer vision state
const CVContext = {
  isDetecting: false,
  cornersDetected: [],
  homographyMatrix: null,
  detectionConfidence: 0,
  processingFPS: 0
};
```

- **Status Integration**:
  - Update UI status based on detection
  - Show corner highlights when detected
  - Display processing performance metrics

### Success Criteria
- [ ] OpenCV.js loads without errors on iPhone
- [ ] Camera frames processed at 15+ FPS
- [ ] Corner markers detected when viewing encoded video
- [ ] Homography matrix calculated correctly
- [ ] Detection confidence > 90% in good conditions
- [ ] Corner highlights overlay correctly on detected screen
- [ ] Performance stays within target (< 60% CPU)
- [ ] No memory leaks during extended use

### Testing Requirements
1. **Detection Testing**: Use encoded video from Phase 1
2. **Performance Testing**: Monitor FPS and CPU usage
3. **Accuracy Testing**: Verify homography correctness
4. **Robustness Testing**: Test various angles and distances
5. **Error Handling**: Test with non-encoded videos

### Required Test Setup
- Use encoded video from Phase 1 on laptop screen
- Test detection at 1-3 meter distances
- Test various viewing angles (0° to 45°)
- Test different lighting conditions

### Git Commit Requirements
```bash
# Phase 3: Computer vision pipeline with corner detection

# Must include:
- OpenCV.js integration and Web Worker setup
- Complete corner detection algorithm
- Homography calculation implementation
- Performance monitoring and optimization
- Updated UI with detection visualization
```

### Performance Targets
- **Detection Latency**: < 100ms from frame to result
- **Processing FPS**: 15-30 FPS sustained
- **Memory Usage**: < 100 MB additional
- **Detection Range**: 0.5m - 3m from screen
- **Angle Tolerance**: ±45° from perpendicular

### Phase 3 Exit Criteria
Before requesting feedback, ensure:
1. Successfully detects corners from Phase 1 encoded video
2. Homography matrix calculation is mathematically correct
3. Performance targets met on target iPhone device
4. UI updates smoothly with detection status
5. No crashes or memory leaks during 5-minute test
6. Detection works at demo distance (1-2 meters)

---

## Phase 4: Steganographic Decoding
**Developer Role:** Computer Vision/Cryptography Developer  
**Git Tag:** `v0.4.0-stego-decoder`

### Scope
Implement the steganographic data extraction and decoding system to retrieve subtitle information from detected video frames.

### Deliverables

#### 4.1 Steganographic Decoder System
```
src/decoder/
├── steganography/
│   ├── lsb-extractor.js       # LSB bit extraction
│   ├── data-decompressor.js   # LZ4 decompression
│   ├── error-correction.js    # Checksum validation
│   └── timing-sync.js         # Frame timing coordination
├── subtitle/
│   ├── subtitle-parser.js     # Parse extracted subtitle data
│   ├── timing-manager.js      # Subtitle timing coordination
│   └── subtitle-cache.js      # Cache for decoded subtitles
├── frame/
│   ├── region-extractor.js    # Extract data regions from frame
│   └── perspective-warper.js  # Warp frame to frontal view
└── decoder-pipeline.js       # Main decoding coordinator
```

#### 4.2 LSB Data Extraction
- **Region Extraction**:
  - Apply homography to get frontal view of screen
  - Extract timing strip (top 5 pixel rows)
  - Extract subtitle region (bottom 10% of frame)
  - Handle perspective correction accurately

- **Bit Extraction**:
```javascript
// Extract embedded data from frame regions
class LSBExtractor {
  extractTimingData(frameRegion) {
    // Extract frame number (32-bit)
    // Extract timestamp (32-bit) 
    // Extract checksum (16-bit)
    // Return timing information
  }
  
  extractSubtitleData(frameRegion) {
    // Extract compressed subtitle text
    // Extract start/end timestamps
    // Extract style metadata
    // Return raw subtitle data
  }
}
```

#### 4.3 Data Processing Pipeline
- **Decompression**:
  - Implement LZ4 decompression in JavaScript
  - Handle corrupted or incomplete data
  - Validate data integrity with checksums

- **Timing Synchronization**:
  - Match frame timestamps with video playback
  - Handle timing drift correction
  - Interpolate missing frames

- **Subtitle Processing**:
  - Parse decoded text data
  - Apply timing information
  - Handle French text encoding (UTF-8)
  - Cache processed subtitles for performance

#### 4.4 Integration with Detection System
- **Decoding Trigger**:
```javascript
// Integrate with CV pipeline from Phase 3
const decodingPipeline = {
  onCornerDetection: (homography) => {
    // Trigger steganographic extraction
    extractAndDecodeFrame(currentFrame, homography);
  },
  
  onSubtitleDecoded: (subtitle, timestamp) => {
    // Update subtitle display system
    updateActiveSubtitle(subtitle, timestamp);
  }
};
```

- **Performance Optimization**:
  - Decode only when corners detected
  - Cache decoded subtitles to avoid re-processing
  - Skip decoding if same frame already processed

#### 4.5 Subtitle State Management
- **Subtitle Context**:
```javascript
const SubtitleContext = {
  currentSubtitle: null,
  subtitleHistory: [],
  isDecoding: false,
  decodingErrors: 0,
  syncTimestamp: 0
};
```

- **Error Handling**:
  - Handle decoding failures gracefully
  - Provide fallback for corrupted data
  - Log errors for debugging without crashing

### Success Criteria
- [ ] Successfully extracts LSB data from encoded video
- [ ] Decompresses subtitle text correctly
- [ ] Timing synchronization works accurately
- [ ] French subtitle text displays correctly
- [ ] Decoding latency < 50ms per frame
- [ ] Handles corrupted/missing data gracefully
- [ ] Subtitle timing matches video playback
- [ ] No decoding errors with test video

### Testing Requirements
1. **Decoding Accuracy**: Verify extracted text matches original SRT
2. **Timing Precision**: Verify subtitle timing accuracy (±100ms)
3. **Error Handling**: Test with corrupted/incomplete frames
4. **Performance**: Measure decoding latency and memory usage
5. **Integration**: Test full pipeline from detection to display

### Required Test Data
- Use encoded video from Phase 1
- Create test cases with known subtitle content
- Test with various compression artifacts
- Verify French text rendering correctly

### Git Commit Requirements
```bash
# Phase 4: Steganographic decoder with subtitle extraction

# Must include:
- Complete LSB extraction implementation
- LZ4 decompression system
- Timing synchronization logic
- Subtitle parsing and caching
- Integration with CV detection pipeline
```

### Performance Targets
- **Decoding Latency**: < 50ms from detection to subtitle
- **Accuracy**: 100% text accuracy in ideal conditions
- **Timing Precision**: ±100ms subtitle synchronization
- **Error Rate**: < 1% decoding failures
- **Memory Efficiency**: No memory leaks during long sessions

### Phase 4 Exit Criteria
Before requesting feedback, ensure:
1. Successfully decodes subtitles from Phase 1 test video
2. Subtitle text matches original SRT file exactly
3. Timing synchronization accurate within ±100ms
4. French text renders correctly without encoding issues
5. Performance targets met consistently
6. Error handling works for edge cases
7. Full pipeline (detection → decoding) works end-to-end

---

## Phase 5: 3D AR Subtitle Rendering
**Developer Role:** 3D Graphics/Frontend Developer  
**Git Tag:** `v0.5.0-ar-rendering`

### Scope
Implement the 3D perspective-corrected subtitle rendering system with smooth animations and proper positioning in AR space.

### Deliverables

#### 5.1 3D Rendering System
```
src/rendering/
├── 3d/
│   ├── perspective-calculator.js  # 3D position calculations
│   ├── transformation-matrix.js   # 3D transformation math
│   └── viewport-mapper.js         # Screen space mapping
├── subtitle/
│   ├── subtitle-renderer.js       # Canvas-based subtitle rendering
│   ├── text-styler.js            # Typography and styling
│   └── animation-controller.js    # Smooth transitions
├── ar/
│   ├── ar-overlay.js             # AR overlay canvas management
│   ├── stabilization.js          # Frame stabilization
│   └── tracking-smoother.js      # Smooth tracking interpolation
└── render-pipeline.js            # Main rendering coordinator
```

#### 5.2 3D Perspective Mathematics
- **Position Calculation**:
```javascript
class PerspectiveCalculator {
  calculateSubtitlePosition(homographyMatrix, screenBounds) {
    // Define subtitle position in screen space (bottom-center)
    const screenSpacePos = {
      x: screenBounds.width * 0.5,    // Center horizontally
      y: screenBounds.height * 0.75   // 75% down from top
    };
    
    // Apply inverse homography to get camera space position
    const cameraSpacePos = this.applyHomography(
      homographyMatrix, 
      screenSpacePos
    );
    
    // Calculate perspective scale factor
    const scaleFactor = this.calculateScale(homographyMatrix);
    
    return { position: cameraSpacePos, scale: scaleFactor };
  }
}
```

- **Scale Calculation**:
  - Calculate distance-based font scaling
  - Maintain readability at 1-3 meter range
  - Handle extreme viewing angles gracefully

#### 5.3 AR Overlay System
- **Canvas Management**:
  - Overlay canvas on camera feed
  - Handle high-DPI displays correctly
  - Maintain 60 FPS rendering performance

- **Subtitle Rendering**:
```javascript
class SubtitleRenderer {
  renderSubtitle(context, subtitle, position, scale) {
    // Apply French typography settings
    const fontSize = this.baseFontSize * scale;
    context.font = `${fontSize}px 'Arial Black', sans-serif`;
    
    // Apply stroke and shadow for readability
    context.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    context.lineWidth = 2;
    context.shadowColor = 'rgba(0, 0, 0, 0.8)';
    context.shadowBlur = 8;
    
    // Render text with proper French character support
    context.fillStyle = 'white';
    context.fillText(subtitle.text, position.x, position.y);
    context.strokeText(subtitle.text, position.x, position.y);
  }
}
```

#### 5.4 Animation and Smoothing
- **Smooth Transitions**:
  - Interpolate position changes over time
  - Fade in/out animations for subtitle changes
  - Stabilize jittery camera movement

- **Frame Stabilization**:
```javascript
class TrackingSmoother {
  smoothPosition(newPosition, previousPositions) {
    // Apply exponential moving average
    const smoothingFactor = 0.7;
    const smoothedX = this.smoothValue(newPosition.x, previousPositions.x);
    const smoothedY = this.smoothValue(newPosition.y, previousPositions.y);
    
    return { x: smoothedX, y: smoothedY };
  }
  
  stabilizeScale(newScale, previousScales) {
    // Prevent rapid scale changes that cause flickering
    const maxScaleChange = 0.1;
    return this.clampChange(newScale, previousScales.last, maxScaleChange);
  }
}
```

#### 5.5 Typography for AR
- **French Text Optimization**:
  - Handle accented characters properly
  - Optimize font weight for AR viewing
  - Support text wrapping for long subtitles

- **Styling System**:
```javascript
const SUBTITLE_STYLES = {
  default: {
    fontFamily: 'Arial Black, sans-serif',
    fontSize: 24,        // Base size, scaled by distance
    fontWeight: '900',   // Maximum weight for readability
    color: 'white',
    strokeColor: 'black',
    strokeWidth: 2,
    shadowBlur: 8,
    shadowColor: 'rgba(0, 0, 0, 0.8)',
    maxWidth: 0.8        // 80% of screen width maximum
  }
};
```

### Success Criteria
- [ ] Subtitles render with correct 3D perspective
- [ ] Text positioned in bottom area of detected screen
- [ ] Smooth animations without jitter or lag
- [ ] French characters render correctly (accents, etc.)
- [ ] Readable from 1-3 meter viewing distance
- [ ] Maintains 30+ FPS rendering performance
- [ ] Subtitles follow screen movement smoothly
- [ ] Proper fade in/out transitions

### Testing Requirements
1. **3D Accuracy**: Verify subtitle positioning matches screen plane
2. **Readability**: Test text clarity at various distances/angles
3. **Performance**: Ensure smooth 30+ FPS with subtitles active
4. **French Text**: Verify all French characters render correctly
5. **Animation**: Test smooth transitions and stabilization

### Visual Verification Tests
- Subtitles appear "attached" to bottom of detected screen
- Text remains horizontal relative to screen orientation
- Scaling feels natural as camera moves closer/farther
- No text jitter or position jumping
- Smooth fade transitions between different subtitles

### Git Commit Requirements
```bash
# Phase 5: 3D AR subtitle rendering with perspective correction

# Must include:
- Complete 3D perspective calculation system
- Canvas-based subtitle rendering with proper typography
- Animation and stabilization system
- AR overlay management
- French text support with proper character handling
```

### Performance Targets
- **Rendering FPS**: 30+ FPS with active subtitles
- **Position Accuracy**: < 5px error in subtitle positioning
- **Animation Smoothness**: No visible jitter or lag
- **Memory Usage**: < 50 MB additional for rendering system
- **Text Clarity**: Readable at 1-3 meter range

### Phase 5 Exit Criteria
Before requesting feedback, ensure:
1. Subtitles appear correctly positioned in 3D space
2. French text renders perfectly with all accents
3. Smooth animations and transitions work properly
4. Performance remains above 30 FPS consistently
5. Text remains readable at demo distances
6. Stabilization reduces camera shake effects
7. Full AR experience feels polished and professional

---

## Phase 6: UI Polish & Settings
**Developer Role:** UI/UX Developer  
**Git Tag:** `v0.6.0-ui-polish`

### Scope
Implement the complete French UI with settings screen, improve visual design, and add all user-facing features for a polished experience.

### Deliverables

#### 6.1 Complete UI Implementation
```
src/components/
├── screens/
│   ├── HomeScreen.jsx           # Main camera view
│   ├── SettingsScreen.jsx       # Settings and customization
│   └── InfoScreen.jsx           # Tutorial and about
├── navigation/
│   ├── Navigation.jsx           # Screen navigation
│   └── TabBar.jsx              # Bottom navigation tabs
├── settings/
│   ├── SubtitleSettings.jsx     # Subtitle appearance options
│   ├── PerformanceSettings.jsx  # Performance tuning
│   └── AboutSection.jsx         # Version and credits
└── feedback/
    ├── ToastNotifications.jsx   # Success/error messages
    └── HelpOverlay.jsx         # Contextual help
```

#### 6.2 Settings Screen Implementation
- **Subtitle Style Options** (All in French):
```javascript
const SUBTITLE_OPTIONS = {
  taille: {
    label: 'Taille du texte',
    options: [
      { value: 'small', label: 'Petit', multiplier: 0.8 },
      { value: 'medium', label: 'Moyen', multiplier: 1.0 },
      { value: 'large', label: 'Grand', multiplier: 1.3 }
    ]
  },
  couleur: {
    label: 'Couleur',
    options: [
      { value: 'white', label: 'Blanc', color: '#FFFFFF' },
      { value: 'yellow', label: 'Jaune', color: '#FEF08A' },
      { value: 'cyan', label: 'Cyan', color: '#67E8F9' }
    ]
  },
  fond: {
    label: 'Arrière-plan',
    options: [
      { value: 'none', label: 'Transparent' },
      { value: 'semi', label: 'Semi-transparent' },
      { value: 'solid', label: 'Opaque' }
    ]
  }
};
```

- **Performance Options**:
```javascript
const PERFORMANCE_OPTIONS = {
  qualite: {
    label: 'Qualité de traitement',
    options: [
      { value: 'low', label: 'Faible', fps: 15, resolution: 480 },
      { value: 'medium', label: 'Moyenne', fps: 30, resolution: 720 },
      { value: 'high', label: 'Élevée', fps: 60, resolution: 1080 }
    ]
  },
  afficherFPS: {
    label: 'Afficher les FPS',
    type: 'toggle'
  }
};
```

#### 6.3 Enhanced Home Screen
- **Status Indicators**:
  - Improved visual feedback for detection states
  - Animated pulsing for "searching" state
  - Corner highlights when screen detected
  - Performance metrics overlay (if enabled)

- **Help Integration**:
  - Contextual hints when no video detected
  - Visual guide for proper positioning
  - Error messages in French with solutions

#### 6.4 Info/Tutorial Screen
- **Step-by-Step Guide** (in French):
```javascript
const TUTORIAL_STEPS = [
  {
    title: "1. Encoder une vidéo",
    description: "Utilisez l'encodeur Python pour intégrer les sous-titres",
    icon: "desktop"
  },
  {
    title: "2. Lire la vidéo encodée",
    description: "Lancez la vidéo encodée sur votre écran d'ordinateur",
    icon: "play"
  },
  {
    title: "3. Pointer la caméra",
    description: "Dirigez la caméra de votre téléphone vers l'écran",
    icon: "camera"
  },
  {
    title: "4. Voir les sous-titres",
    description: "Les sous-titres apparaissent automatiquement en réalité augmentée",
    icon: "subtitles"
  }
];
```

- **Troubleshooting Section**:
  - Common issues and solutions in French
  - Camera permission problems
  - Detection difficulties
  - Performance issues

#### 6.5 Visual Design Refinement
- **Design System Implementation**:
  - Consistent color palette (PRD Section 5.3)
  - Typography hierarchy with Inter font
  - Proper spacing and layout grid
  - Dark theme with high contrast

- **Micro-interactions**:
  - Button press feedback (scale animation)
  - Loading states with spinners
  - Smooth transitions between screens
  - Haptic feedback (if available on device)

#### 6.6 Settings Persistence
- **LocalStorage Integration**:
```javascript
class SettingsManager {
  saveSettings(settings) {
    localStorage.setItem('ar-subtitles-settings', JSON.stringify(settings));
  }
  
  loadSettings() {
    const saved = localStorage.getItem('ar-subtitles-settings');
    return saved ? JSON.parse(saved) : this.getDefaultSettings();
  }
  
  getDefaultSettings() {
    return {
      subtitle: { size: 'medium', color: 'white', background: 'none' },
      performance: { quality: 'medium', showFPS: false }
    };
  }
}
```

### Success Criteria
- [ ] Complete French UI with no English text
- [ ] Settings screen fully functional with live preview
- [ ] All settings persist between app sessions
- [ ] Tutorial screen clear and helpful
- [ ] Visual design matches PRD specifications
- [ ] Smooth navigation between all screens
- [ ] Responsive layout works on various mobile sizes
- [ ] Performance settings actually affect app behavior
- [ ] About section shows correct version and credits

### Testing Requirements
1. **UI Testing**: Verify all French text displays correctly
2. **Settings Testing**: Confirm all options work and persist
3. **Navigation Testing**: Test smooth transitions between screens
4. **Responsive Testing**: Test on different screen sizes
5. **Accessibility Testing**: Ensure good contrast and readability

### Visual Design Validation
- Matches color palette from PRD Section 5.3
- Typography uses Inter font family as specified
- Dark theme with proper contrast ratios
- Button and card styling consistent throughout
- Loading states and animations feel polished

### Git Commit Requirements
```bash
# Phase 6: Complete French UI with settings and polish

# Must include:
- Complete settings screen with all options
- Tutorial/info screen with French guide
- Enhanced home screen with better status indicators
- Settings persistence system
- Visual design refinement matching PRD specs
- Navigation system between all screens
```

### UI Components Checklist
- [ ] Header with app title "Décodeur de Sous-titres AR"
- [ ] Status indicator with French status messages
- [ ] Settings button and navigation
- [ ] Settings screen with subtitle and performance options
- [ ] About section with version and author credit
- [ ] Tutorial screen with 4-step guide
- [ ] Toast notifications for errors/success
- [ ] Loading spinners and progress indicators

### Phase 6 Exit Criteria
Before requesting feedback, ensure:
1. All UI text is in proper French with correct accents
2. Settings work and immediately affect subtitle appearance
3. Navigation between screens is smooth and intuitive
4. Visual design feels professional and polished
5. Settings persist correctly after app restart
6. Tutorial is clear and helpful for new users
7. App feels complete and ready for demonstration
8. Performance settings visibly impact app behavior

---

## Phase 7: Testing, Optimization & Demo Preparation
**Developer Role:** QA/Integration Developer  
**Git Tag:** `v1.0.0-demo-ready`

### Scope
Comprehensive testing, performance optimization, bug fixes, and final preparation for the classroom demonstration.

### Deliverables

#### 7.1 Comprehensive Testing Suite
```
tests/
├── integration/
│   ├── full-pipeline-test.js    # End-to-end workflow testing
│   ├── encoder-decoder-test.js  # Cross-component testing
│   └── demo-scenario-test.js    # Classroom demo simulation
├── performance/
│   ├── fps-benchmark.js         # Frame rate testing
│   ├── memory-profiling.js      # Memory usage analysis
│   └── battery-impact-test.js   # Power consumption testing
├── device/
│   ├── iphone-compatibility.js  # Target device testing
│   ├── safari-specific-test.js  # Browser compatibility
│   └── pwa-functionality-test.js # PWA features testing
└── user-acceptance/
    ├── french-ui-test.js        # Language and UX testing
    └── accessibility-test.js    # Accessibility compliance
```

#### 7.2 Performance Optimization
- **Comprehensive Profiling**:
  - CPU usage analysis during full operation
  - Memory leak detection and fixes
  - Frame rate optimization under load
  - Battery consumption measurement

- **Optimization Targets**:
```javascript
const PERFORMANCE_TARGETS = {
  fps: {
    minimum: 30,
    target: 60,
    measurement: 'sustained over 5 minutes'
  },
  latency: {
    detection: 100,    // ms from frame to detection
    decoding: 50,      // ms from detection to subtitle
    rendering: 16.67   // ms for 60 FPS rendering
  },
  memory: {
    baseline: 150,     // MB baseline usage
    maximum: 200,      // MB maximum during operation
    leakTolerance: 5   // MB growth over 10 minutes
  },
  battery: {
    target: 20,        // % drain per hour maximum
    measurement: 'continuous 1-hour usage'
  }
};
```

#### 7.3 Demo Preparation Package
- **Demo Assets**:
  - Create demo video (2-3 minutes) with French subtitles
  - Encode demo video using Phase 1 encoder
  - Test video on target laptop screen
  - Backup videos with different content

- **Demo Documentation**:
```
demo/
├── assets/
│   ├── demo-video.mp4           # Original demo video
│   ├── demo-video-encoded.mp4   # Steganographically encoded
│   ├── demo-subtitles.srt       # French subtitles file
│   └── backup-videos/           # Alternative demo content
├── setup/
│   ├── demo-checklist.md        # Pre-demo setup steps
│   ├── troubleshooting.md       # Common issues & fixes
│   └── presentation-script.md   # Demo narrative in French
└── results/
    ├── performance-report.md    # Final performance analysis
    └── test-results.md         # Comprehensive test results
```

#### 7.4 Bug Fixes and Edge Cases
- **Robustness Improvements**:
  - Handle poor lighting conditions
  - Graceful degradation when performance drops
  - Recovery from temporary detection loss
  - Proper error handling for all failure modes

- **Edge Case Handling**:
```javascript
const EDGE_CASES = {
  lighting: {
    tooLight: 'Adjust detection sensitivity',
    tooDark: 'Increase gain and reduce threshold',
    uneven: 'Use adaptive thresholding'
  },
  distance: {
    tooClose: 'Handle partial screen visibility',
    tooFar: 'Reduce processing resolution',
    extreme: 'Provide user feedback'
  },
  angle: {
    steep: 'Warn user about perspective limits',
    moving: 'Implement motion prediction',
    unstable: 'Increase smoothing factor'
  }
};
```

#### 7.5 Final Integration Testing
- **Complete Workflow Validation**:
  1. Encode test video with subtitles
  2. Deploy PWA to production URL
  3. Test on actual iPhone in classroom-like environment
  4. Verify all features work end-to-end
  5. Performance testing under demo conditions
  6. Backup plan validation

- **Classroom Environment Simulation**:
  - Test with classroom lighting
  - Test at typical viewing distances (1-2 meters)
  - Test with potential interference (other screens)
  - Verify audio doesn't interfere with camera
  - Test multiple viewing angles

#### 7.6 Production Deployment
- **Vercel Deployment**:
  - Configure production build settings
  - Optimize bundle size and loading speed
  - Set up HTTPS and PWA manifest correctly
  - Test PWA installation on iPhone

- **Performance Monitoring**:
  - Set up basic error tracking
  - Monitor performance metrics
  - Ensure offline functionality works

### Success Criteria
- [ ] All performance targets met consistently
- [ ] Zero critical bugs in demo scenario
- [ ] Complete end-to-end workflow tested
- [ ] Demo runs smoothly for 10+ minutes
- [ ] PWA deploys and installs correctly
- [ ] All French text perfect (no typos/errors)
- [ ] Backup plans tested and working
- [ ] Documentation complete and accurate

### Testing Requirements
1. **Stress Testing**: 30-minute continuous operation
2. **Device Testing**: Actual iPhone with target iOS version  
3. **Environment Testing**: Classroom lighting and distance
4. **Integration Testing**: Full encoder → PWA workflow
5. **Performance Testing**: All metrics within targets
6. **User Testing**: Non-technical person can use app

### Demo Rehearsal Checklist
- [ ] Demo video encodes without errors
- [ ] PWA loads quickly on iPhone Safari
- [ ] Camera permissions granted smoothly
- [ ] Detection triggers within 2 seconds
- [ ] Subtitles appear accurately positioned
- [ ] No crashes or freezes during full demo
- [ ] Settings screen demonstrates customization
- [ ] Performance remains smooth throughout
- [ ] Backup video ready if primary fails

### Git Commit Requirements
```bash
# Phase 7: Final testing, optimization, and demo preparation

# Must include:
- Comprehensive test suite with all passing tests
- Performance optimization and validation
- Demo assets and documentation
- Bug fixes and edge case handling
- Production deployment configuration
- Complete user documentation
```

### Final Deliverables
1. **Working System**: Complete encoder + PWA
2. **Demo Package**: Ready-to-use demo materials
3. **Documentation**: User guide and technical docs
4. **Test Results**: Performance validation report
5. **Deployment**: Live PWA on Vercel with HTTPS

### Phase 7 Exit Criteria
Before requesting final approval, ensure:
1. All performance targets consistently achieved
2. Demo rehearsal successful multiple times
3. No critical bugs or crashes
4. All documentation complete and accurate
5. PWA deployed and accessible via HTTPS
6. Backup plans tested and verified
7. French UI perfect with zero language errors
8. Ready for classroom demonstration

---

## Version Control Strategy

### Git Workflow
Each phase should follow this git workflow:

```bash
# Start new phase
git checkout main
git pull origin main
git checkout -b phase-X-description

# During development
git add .
git commit -m "Phase X: Specific feature implementation"

# End of phase
git checkout main
git merge phase-X-description
git tag vX.X.X-phase-name
git push origin main --tags

# Create handoff documentation
git log --oneline > phase-X-summary.txt
```

### Commit Message Convention
```
Phase X: Brief description of main changes

- Specific feature implemented
- Important bug fixes
- Performance improvements
- Documentation updates

Tests: All tests passing
Performance: Meets target metrics
Ready for: Next phase / Demo (if final)
```

### Branch Protection
- Main branch requires working code only
- Each phase must pass basic smoke tests
- No commits directly to main during development
- Tags mark stable releases

---

## Phase Handoff Protocol

### End of Phase Checklist
Each developer must complete this before requesting feedback:

1. **Functionality Check**:
   - [ ] All phase success criteria met
   - [ ] No critical bugs or crashes
   - [ ] Performance within acceptable range

2. **Code Quality**:
   - [ ] Code documented with comments
   - [ ] No console errors or warnings
   - [ ] Follows established coding patterns

3. **Testing**:
   - [ ] Phase-specific tests written and passing
   - [ ] Manual testing completed
   - [ ] Edge cases handled appropriately

4. **Documentation**:
   - [ ] README updated with new features
   - [ ] Any architecture changes documented
   - [ ] Known issues/limitations noted

5. **Git Repository**:
   - [ ] All changes committed with proper messages
   - [ ] Tagged with appropriate version
   - [ ] Clean working directory

### Handoff Information Required
When requesting feedback and providing next phase prompt, include:

1. **Completion Summary**: What was accomplished
2. **Technical Details**: Key implementation decisions
3. **Known Issues**: Any limitations or bugs to address
4. **Performance Notes**: Current performance characteristics  
5. **Next Phase Context**: What the next developer needs to know
6. **Testing Instructions**: How to verify the phase works

---

## Quality Assurance Standards

### Code Quality Requirements
- **Documentation**: All functions have JSDoc/docstring comments
- **Error Handling**: Graceful error handling throughout
- **Performance**: No blocking operations on main thread
- **Memory Management**: No memory leaks detectable
- **Browser Compatibility**: Works on target iOS Safari

### Testing Standards
- **Unit Tests**: Critical functions have unit tests
- **Integration Tests**: Key workflows tested end-to-end
- **Performance Tests**: Frame rate and latency measured
- **Device Tests**: Tested on actual target device
- **Error Scenarios**: Edge cases and failures handled

### User Experience Standards
- **Responsiveness**: UI responds within 100ms to user input
- **Visual Feedback**: Clear indication of app state at all times
- **Error Messages**: Helpful French error messages with solutions
- **Performance**: Smooth 30+ FPS throughout operation
- **Reliability**: Works consistently in demo environment

---

## Risk Mitigation by Phase

### Phase 1 Risks
- **Risk**: Steganographic encoding too complex
  - **Mitigation**: Start with simple LSB, optimize later
- **Risk**: Video format compatibility issues  
  - **Mitigation**: Use widely supported H.264/MP4

### Phase 2 Risks
- **Risk**: Camera permissions denied on iPhone
  - **Mitigation**: Clear permission request UX
- **Risk**: PWA installation problems
  - **Mitigation**: Test on actual device early

### Phase 3 Risks
- **Risk**: OpenCV.js performance too slow
  - **Mitigation**: Aggressive optimization, frame skipping
- **Risk**: Corner detection unreliable
  - **Mitigation**: Multiple detection algorithms, robust validation

### Phase 4 Risks
- **Risk**: LSB extraction fails with video compression
  - **Mitigation**: Error correction, multiple encoding regions
- **Risk**: Timing synchronization drift
  - **Mitigation**: Multiple timing reference points

### Phase 5 Risks
- **Risk**: 3D positioning calculations incorrect
  - **Mitigation**: Mathematical verification, visual validation
- **Risk**: Rendering performance too slow
  - **Mitigation**: Canvas optimization, adaptive quality

### Phase 6 Risks
- **Risk**: French UI translation errors
  - **Mitigation**: Native French speaker review
- **Risk**: Settings complexity confuses users
  - **Mitigation**: Simple defaults, clear labels

### Phase 7 Risks
- **Risk**: Demo environment differs from development
  - **Mitigation**: Actual classroom testing
- **Risk**: Performance degrades under stress
  - **Mitigation**: Comprehensive stress testing

---

## Success Metrics by Phase

### Phase 1: Python Encoder
- Encodes 30-second video in < 2 minutes
- Output video plays without visual artifacts
- Markers visible in debug mode
- SRT parsing 100% accurate

### Phase 2: PWA Foundation  
- Camera feed 30+ FPS on iPhone
- PWA installs successfully
- All UI text in French
- Offline functionality works

### Phase 3: Computer Vision
- Corner detection 95%+ accuracy in good light
- Processing 15+ FPS sustained
- Homography calculation mathematically correct
- Detection range 0.5-3 meters

### Phase 4: Steganographic Decoding
- 100% text accuracy in ideal conditions
- Decoding latency < 50ms
- Timing synchronization ±100ms
- Handles 99% of encoded frames

### Phase 5: 3D AR Rendering
- Subtitle positioning < 5px error
- Rendering 30+ FPS with active subtitles
- Smooth animations, no jitter
- French text renders perfectly

### Phase 6: UI Polish
- Complete French UI, zero English
- All settings functional and persistent
- Professional visual design
- Intuitive navigation

### Phase 7: Demo Ready
- 10+ minute demo without issues
- All performance targets met
- Zero critical bugs
- Classroom environment validated

---

## Final Notes

### Communication Protocol
- Each phase ends with feedback request to AYMAN IDOUKHARAZ
- Next phase prompt provided in chat (copy-paste ready)
- No developer works on multiple phases
- PRD updates require explicit approval

### Quality Gates
Each phase must pass quality gates before progression:
1. **Functional**: All features work as specified
2. **Performance**: Meets phase-specific targets  
3. **Integration**: Works with previous phases
4. **Documentation**: Complete and accurate
5. **Testing**: Comprehensive validation completed

### Emergency Protocols
If major issues discovered:
1. Document issue clearly with reproduction steps
2. Assess impact on project timeline
3. Propose solution or workaround
4. Get approval before fundamental changes
5. Update PRD if architecture changes needed

---

**End of Development Plan**

This plan ensures systematic, trackable development with clear handoffs between phases, maintaining code quality and project momentum toward the successful classroom demonstration goal.