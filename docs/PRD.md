# Product Requirements Document (PRD)
## Steganographic AR Subtitles System

**Project Name:** AR Subtitles Decoder  
**Author:** AYMAN IDOUKHARAZ  
**Version:** 1.0  
**Date:** September 30, 2025  
**Platform:** Progressive Web App (PWA)  
**Tech Stack:** Vite + React, OpenCV.js, Python (Encoder)

---

## 1. Executive Summary

### 1.1 Project Overview
Development of a steganographic subtitles system consisting of two components:
1. **Python Encoder (Desktop)**: Embeds subtitle data into video frames using steganographic techniques
2. **PWA Decoder (Mobile)**: Real-time AR application that detects encoded videos through device camera and overlays decoded subtitles with 3D perspective correction

### 1.2 Primary Use Case
University classroom demonstration where:
- Encoded video plays on laptop screen
- Student views laptop screen through iPhone camera via PWA
- Subtitles appear overlaid in real-world space with proper 3D positioning
- All user-facing content in French language

### 1.3 Success Criteria
- Real-time video detection and decoding (< 100ms latency)
- Accurate 3D perspective mapping of subtitles to screen plane
- Smooth 60 FPS camera feed processing on mobile devices
- CPU-optimized performance (no GPU dependencies)
- Professional, minimal French UI
- Successful classroom demonstration

---

## 2. Target Users & Context

### 2.1 Primary User
- University student (author)
- Technical competency: High
- Device: iPhone for viewing, laptop for encoding/playback
- Environment: Classroom setting with controlled lighting

### 2.2 Secondary Users
- Teacher and peers (demonstration audience)
- Viewing distance: 1-3 meters from laptop screen
- Expected duration: 5-10 minute demo

### 2.3 User Journey
1. Encode video with subtitles using Python encoder
2. Play encoded video on laptop
3. Open PWA on iPhone
4. Point camera at laptop screen
5. System detects encoded video automatically
6. Subtitles appear overlaid on screen in AR
7. Subtitles follow screen perspective as user moves

---

## 3. Technical Architecture

### 3.1 System Components

#### 3.1.1 Python Encoder (Desktop Application)
**Purpose:** Embed subtitle data steganographically into video frames

**Core Functionality:**
- Load source video file (MP4, AVI, MOV support)
- Parse subtitle file (SRT, VTT formats)
- Embed steganographic markers for:
  - Video identification/detection
  - Timing synchronization
  - Subtitle text data
  - Frame markers for 3D tracking
- Output encoded video file

**Steganographic Approach:**
- **Detection Pattern**: Visual markers in corner regions (4 corners) using specific color patterns
  - High-contrast patterns for robust detection
  - QR-code-like corner markers for homography calculation
  - Unique identifier pattern for video recognition
  
- **Data Encoding**: LSB (Least Significant Bit) steganography in specific frame regions
  - Embed in redundant areas (overscan regions)
  - Time codes synchronized with video playback
  - Compressed subtitle text data
  
- **Synchronization**: Timestamp markers embedded every N frames
  - Frame-accurate timing data
  - Drift correction mechanism

**Technical Requirements:**
- Python 3.8+
- Libraries: OpenCV, NumPy, Pillow
- Input: Video file + Subtitle file (SRT/VTT)
- Output: Encoded video file
- GUI: Simple tkinter interface for file selection

#### 3.1.2 PWA Decoder (Mobile Application)
**Purpose:** Real-time AR subtitle display with 3D perspective correction

**Core Functionality:**
- Access device camera (rear camera)
- Real-time video feed processing
- Detect encoded video presence
- Extract and decode subtitle data
- Calculate screen plane position/orientation
- Render subtitles with 3D perspective correction
- Smooth frame interpolation

**Technical Stack:**
- **Frontend Framework**: Vite + React 18
- **Computer Vision**: OpenCV.js (WebAssembly)
- **Camera Access**: WebRTC MediaStream API
- **3D Math**: Custom transformation matrices
- **State Management**: React Context + useReducer
- **Styling**: Tailwind CSS + CSS modules
- **PWA**: Workbox for service worker

**Performance Optimization:**
- Web Workers for video processing
- Frame skipping for CPU efficiency
- Adaptive resolution scaling
- RequestAnimationFrame optimization
- Canvas-based rendering
- Memory pool for object reuse

---

## 4. Feature Requirements

### 4.1 Python Encoder Features

#### 4.1.1 Must-Have (P0)
- [ ] Load video files (MP4, AVI, MOV)
- [ ] Parse SRT subtitle files
- [ ] Embed corner detection markers (4 corners)
- [ ] Embed subtitle text data steganographically
- [ ] Embed timing synchronization data
- [ ] Export encoded video (H.264 codec)
- [ ] Simple GUI for file selection
- [ ] Progress indicator during encoding
- [ ] Preview of detection markers (debug mode)

#### 4.1.2 Should-Have (P1)
- [ ] Support VTT subtitle format
- [ ] Adjustable encoding strength parameter
- [ ] Batch processing multiple videos
- [ ] Validation of encoded output

#### 4.1.3 Nice-to-Have (P2)
- [ ] Visual preview of embedded markers
- [ ] Encoding quality settings
- [ ] Custom marker styling options

### 4.2 PWA Decoder Features

#### 4.2.1 Must-Have (P0)
- [ ] Camera access and live feed display
- [ ] Real-time corner marker detection
- [ ] Screen plane homography calculation
- [ ] Subtitle data extraction and decoding
- [ ] 3D perspective-corrected subtitle rendering
- [ ] Automatic video detection trigger
- [ ] Smooth subtitle animations
- [ ] French language UI
- [ ] Responsive layout (mobile-first)
- [ ] PWA installation capability
- [ ] Offline functionality for core features

#### 4.2.2 Should-Have (P1)
- [ ] Frame stabilization for shaky camera
- [ ] Adaptive brightness correction
- [ ] Manual calibration mode
- [ ] Performance metrics display (FPS, latency)
- [ ] Multiple video detection (if multiple screens)
- [ ] Subtitle style customization (font size, color)

#### 4.2.3 Nice-to-Have (P2)
- [ ] Screenshot capture with subtitles
- [ ] Detection confidence indicator
- [ ] Tutorial/onboarding flow
- [ ] Settings persistence (localStorage)
- [ ] Haptic feedback on detection

---

## 5. User Interface Design

### 5.1 Design Principles
- **Minimal**: Clean, distraction-free interface
- **Professional**: Modern, polished aesthetics
- **Intuitive**: Self-explanatory interactions
- **French**: All text in French language
- **Performance**: No UI lag, smooth 60 FPS

### 5.2 PWA Screens

#### 5.2.1 Home Screen
**Elements:**
- Large camera viewfinder (full screen)
- Subtle detection status indicator (top)
- AR guidance overlay (when no video detected)
- Settings icon (top right)
- Info button (bottom right)

**States:**
- Idle: "Pointez la caméra vers un écran encodé"
- Detecting: Pulsing indicator
- Active: Corner markers highlighted + subtitles displayed

**French UI Text:**
- Title: "Décodeur de Sous-titres AR"
- Status: "Recherche en cours...", "Vidéo détectée!", "Décodage..."
- Permission: "Accès à la caméra requis"
- Error: "Impossible d'accéder à la caméra"

#### 5.2.2 Settings Screen
**Elements:**
- Subtitle style options
  - Taille du texte (Small, Medium, Large)
  - Couleur (White, Yellow, Cyan)
  - Fond (Transparent, Semi-transparent, Solid)
- Performance options
  - Qualité de traitement (Low, Medium, High)
  - Afficher les FPS (toggle)
- About section
  - Version
  - Auteur: AYMAN IDOUKHARAZ
  - License

**French UI Text:**
- "Paramètres"
- "Style des sous-titres"
- "Performance"
- "À propos"
- Buttons: "Enregistrer", "Annuler", "Réinitialiser"

#### 5.2.3 Info/Tutorial Screen
**Elements:**
- Step-by-step visual guide
  - 1. Encoder une vidéo (desktop)
  - 2. Lire la vidéo encodée
  - 3. Pointer la caméra vers l'écran
  - 4. Les sous-titres apparaissent automatiquement
- Troubleshooting tips
- Demo video (optional)

### 5.3 Visual Design Specifications

#### Color Palette
- **Primary**: #2563EB (Blue 600) - Accent, buttons
- **Secondary**: #10B981 (Emerald 500) - Success states
- **Background**: #0F172A (Slate 900) - Dark theme
- **Surface**: #1E293B (Slate 800) - Cards, panels
- **Text Primary**: #F8FAFC (Slate 50)
- **Text Secondary**: #94A3B8 (Slate 400)
- **Error**: #EF4444 (Red 500)
- **Warning**: #F59E0B (Amber 500)

#### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: 
  - H1: 32px, Bold (600)
  - H2: 24px, Semibold (600)
  - H3: 18px, Medium (500)
- **Body**: 16px, Regular (400)
- **Caption**: 14px, Regular (400)
- **Subtitles (AR Overlay)**:
  - Font: Arial Black, sans-serif (high readability)
  - Size: 24-32px (adaptive to distance)
  - Stroke: 2px black outline
  - Shadow: 0 2px 8px rgba(0,0,0,0.8)

#### Spacing & Layout
- Base unit: 8px
- Padding: 16px, 24px, 32px
- Border radius: 8px (buttons), 16px (cards)
- Camera viewfinder: 100% viewport
- Subtitle container: Bottom 1/3 of detected screen area

### 5.4 Animations & Interactions
- **Detection pulse**: 1s ease-in-out loop
- **Subtitle fade-in**: 300ms ease-out
- **Subtitle transition**: 200ms ease-in-out
- **Screen corner highlights**: Animated stroke
- **Button press**: Scale 0.95, 100ms
- **Haptic feedback**: On detection (if available)

---

## 6. Technical Specifications

### 6.1 Computer Vision Pipeline

#### 6.1.1 Detection Phase
```
Camera Frame Input (720p @ 30fps)
↓
Grayscale Conversion
↓
Corner Detection (Custom markers)
  - Harris corner detection
  - Template matching for unique patterns
  - Sub-pixel accuracy refinement
↓
Marker Validation
  - Verify 4-corner geometry
  - Check marker ID consistency
  - Calculate confidence score
↓
Homography Calculation
  - RANSAC for robust estimation
  - 3x3 perspective transformation matrix
↓
Trigger Decoding Pipeline
```

#### 6.1.2 Decoding Phase
```
Validated Screen Region
↓
Perspective Warp to Frontal View
↓
Extract Steganographic Data Regions
  - Timestamp region
  - Subtitle data region
↓
LSB Extraction
↓
Data Decompression
↓
Subtitle Text + Timing
↓
Display with 3D Transformation
```

#### 6.1.3 Rendering Phase
```
Current Timestamp
↓
Lookup Active Subtitle
↓
Calculate 3D Position
  - Apply inverse homography
  - Project to bottom-third of screen
  - Calculate perspective-correct scale
↓
Render on Canvas Overlay
  - Apply text styling
  - Smooth interpolation
  - Frame blending for stability
```

### 6.2 Steganographic Encoding Scheme

#### Corner Markers (Detection)
- **Position**: 20x20 pixel blocks in each corner (60px from edges)
- **Pattern**: Binary-coded unique ID + orientation marker
  ```
  Top-Left:    [ID][Orientation: TL]
  Top-Right:   [ID][Orientation: TR]
  Bottom-Left: [ID][Orientation: BL]
  Bottom-Right:[ID][Orientation: BR]
  ```
- **Color Encoding**: RGB channel manipulation for robustness
  - R channel: Pattern data
  - G channel: Error correction
  - B channel: Checksum

#### Data Embedding Regions
- **Timing Strip**: Top 5 rows of pixels (full width)
  - Frame number (32-bit)
  - Timestamp milliseconds (32-bit)
  - Checksum (16-bit)
  
- **Subtitle Data**: Bottom 10% of frame (overscan region)
  - Compressed UTF-8 text
  - Start/end timestamps
  - Style metadata (optional)
  - Reed-Solomon error correction

#### Encoding Parameters
- **LSB Depth**: 2 bits per color channel
- **Capacity**: ~100 characters per frame at 1080p
- **Compression**: LZ4 for text data
- **Error Correction**: Reed-Solomon (255,223)

### 6.3 Performance Targets

#### Mobile PWA
- **Frame Rate**: 30 FPS minimum, 60 FPS target
- **Detection Latency**: < 100ms from frame to detection
- **Decode Latency**: < 50ms from detection to display
- **Memory Usage**: < 150 MB
- **CPU Usage**: < 60% single core
- **Battery Impact**: < 20% per hour

#### Processing Optimizations
- Frame downscaling: 720p → 480p for processing
- Adaptive processing: Skip frames if CPU saturated
- Web Worker offloading: CV processing in background thread
- Canvas pooling: Reuse canvas objects
- Typed Arrays: Efficient memory access
- WASM: OpenCV.js compiled to WebAssembly

### 6.4 3D Perspective Mathematics

#### Homography Estimation
```
Given 4 corner points:
  Screen corners: [s1, s2, s3, s4] (detected in camera frame)
  Reference corners: [r1, r2, r3, r4] (known rectangle)

Compute 3x3 homography matrix H:
  H * [rx, ry, 1]^T = λ * [sx, sy, 1]^T

Using OpenCV.js:
  H = cv.findHomography(referencePoints, screenPoints, cv.RANSAC)
```

#### Subtitle Positioning
```
1. Define subtitle position in screen space:
   - Bottom-center of screen
   - Y position: 75% down from top
   - X position: centered

2. Apply homography transform:
   [sx, sy, 1]^T = H * [rx, ry, 1]^T
   
3. Convert to camera frame coordinates:
   camera_x = sx / s
   camera_y = sy / s
   (where s is scaling factor)

4. Apply perspective scale:
   font_size = base_size * scale_factor
   scale_factor = distance_metric from homography
```

---

## 7. Development Milestones

### Phase 1: Core Infrastructure (Week 1)
- [ ] Python encoder base implementation
- [ ] Steganographic marker embedding
- [ ] React + Vite PWA setup
- [ ] Camera access implementation
- [ ] OpenCV.js integration

### Phase 2: Detection System (Week 2)
- [ ] Corner marker detection algorithm
- [ ] Homography calculation
- [ ] Frame stabilization
- [ ] Detection validation logic

### Phase 3: Decoding & Rendering (Week 3)
- [ ] LSB extraction implementation
- [ ] Subtitle data parsing
- [ ] 3D perspective rendering
- [ ] Smooth animation system

### Phase 4: UI & UX Polish (Week 4)
- [ ] French language UI implementation
- [ ] Settings screen
- [ ] Tutorial/info screen
- [ ] Visual design refinement
- [ ] Performance optimization

### Phase 5: Testing & Demo Prep (Week 5)
- [ ] End-to-end testing
- [ ] Classroom environment testing
- [ ] iPhone compatibility verification
- [ ] Demo video encoding
- [ ] Presentation preparation

---

## 8. Technical Constraints & Requirements

### 8.1 Browser Requirements
- **Minimum**: iOS Safari 15+, Chrome 90+
- **APIs Required**:
  - MediaStream (camera access)
  - WebAssembly (OpenCV.js)
  - Canvas API
  - Service Workers (PWA)
  - Web Workers

### 8.2 Device Requirements
- **Mobile**: iPhone with rear camera (demo device)
- **Desktop**: Laptop with Python 3.8+ for encoding
- **Screen**: 13-15" laptop display for playback
- **Lighting**: Classroom lighting (adequate, not dim)

### 8.3 Network Requirements
- **Initial Load**: Internet required for PWA download
- **Runtime**: Fully offline (all processing local)
- **Deployment**: Vercel free tier hosting

### 8.4 File Format Support
- **Video Input**: MP4, AVI, MOV
- **Subtitle Input**: SRT, VTT
- **Video Output**: MP4 (H.264)

---

## 9. Non-Functional Requirements

### 9.1 Performance
- Real-time processing (< 100ms total latency)
- Smooth 60 FPS camera feed
- No dropped frames
- Instant video detection (< 500ms)

### 9.2 Reliability
- Robust marker detection (99% accuracy in good lighting)
- Error correction for data decoding
- Graceful degradation if performance drops

### 9.3 Usability
- Zero-configuration for end user
- Automatic detection (no manual triggering)
- Clear visual feedback
- Self-explanatory French UI

### 9.4 Compatibility
- iPhone Safari primary target
- Android Chrome secondary support
- Laptop encoder: Windows/Mac/Linux

### 9.5 Security & Privacy
- Camera access only (no recording/storage)
- No data transmission to servers
- All processing local
- No user tracking or analytics

---

## 10. Deployment & Hosting

### 10.1 Deployment Strategy
- **Platform**: Vercel
- **Plan**: Free tier
- **Domain**: Vercel-provided subdomain (*.vercel.app)
- **SSL**: Automatic HTTPS
- **Build**: Vite production build

### 10.2 PWA Configuration
- **Manifest**: app.webmanifest
  - Name: "Décodeur de Sous-titres AR"
  - Short name: "AR Subtitles"
  - Icons: 192x192, 512x512
  - Display: standalone
  - Orientation: portrait
  - Theme color: #2563EB
  
- **Service Worker**: Workbox
  - Cache-first for static assets
  - Network-first for OpenCV.js
  - Offline fallback page

### 10.3 Build Configuration
```json
{
  "vite": {
    "build": {
      "target": "es2020",
      "rollupOptions": {
        "output": {
          "manualChunks": {
            "opencv": ["opencv.js"],
            "vendor": ["react", "react-dom"]
          }
        }
      }
    },
    "optimizeDeps": {
      "exclude": ["opencv.js"]
    }
  }
}
```

---

## 11. Testing Strategy

### 11.1 Unit Tests
- Homography calculation functions
- Subtitle timing parsing
- Data extraction/compression
- 3D transformation math

### 11.2 Integration Tests
- Camera → Detection pipeline
- Detection → Decoding pipeline
- Decoding → Rendering pipeline
- End-to-end workflow

### 11.3 Device Testing
- iPhone Safari (primary)
- iPad Safari
- Android Chrome (secondary)
- Various lighting conditions
- Various distances (0.5m - 3m)
- Various angles (0° - 45° tilt)

### 11.4 Demo Rehearsal
- Full classroom simulation
- Timing verification
- Backup plans for failures
- Troubleshooting guide

---

## 12. Risk Assessment & Mitigation

### 12.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Performance too slow on iPhone | Medium | High | Implement aggressive optimization, frame skipping, lower resolution |
| Detection fails in classroom lighting | Low | High | Test in actual classroom beforehand, adjust detection thresholds |
| Decoding errors due to video compression | Medium | Medium | Use robust error correction, test with various video codecs |
| Browser compatibility issues | Low | Medium | Test on actual demo devices, have fallback browser ready |
| PWA installation issues | Low | Low | Provide direct URL access as backup |

### 12.2 Demo-Specific Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| WiFi not available for initial load | Low | High | Pre-load PWA before demo, works offline |
| Laptop screen glare | Medium | Medium | Adjust screen brightness, test angle beforehand |
| Camera shake during demo | High | Low | Implement frame stabilization, practice steady hand |
| Subtitle sync drift | Low | Medium | Use robust timestamp synchronization with drift correction |

---

## 13. Success Metrics

### 13.1 Technical Metrics
- [ ] Detection success rate > 95%
- [ ] Frame rate > 30 FPS sustained
- [ ] Total latency < 100ms
- [ ] Subtitle positioning accuracy < 5px error
- [ ] Zero crashes during 10-minute demo

### 13.2 UX Metrics
- [ ] Detection triggers automatically within 2 seconds
- [ ] Subtitles readable from 1-2 meters
- [ ] Smooth subtitle transitions (no jitter)
- [ ] UI understandable without explanation

### 13.3 Demo Success Criteria
- [ ] Successfully demonstrates encoding process
- [ ] Successfully displays decoded subtitles in AR
- [ ] Subtitles correctly positioned in 3D space
- [ ] System works reliably throughout presentation
- [ ] Teacher and peers impressed by demonstration

---

## 14. Future Enhancements (Post-Demo)

### 14.1 Phase 2 Features
- Multiple language support (beyond French)
- Cloud-based encoding service
- Pre-encoded video library
- Real-time collaboration (multiple viewers)
- Advanced subtitle styling (animations, emojis)

### 14.2 Advanced Computer Vision
- Deep learning-based detection
- Automatic lighting correction
- Motion prediction for smoother tracking
- Support for curved screens (TVs)

### 14.3 Accessibility
- Voice-over integration
- High contrast mode
- Larger text options
- Haptic feedback for deaf users

---

## 15. Documentation Requirements

### 15.1 Developer Documentation
- [ ] Architecture overview diagram
- [ ] API documentation (encoder functions)
- [ ] Computer vision pipeline explanation
- [ ] Setup and installation guide
- [ ] Contribution guidelines

### 15.2 User Documentation (French)
- [ ] Guide d'utilisation (user guide)
- [ ] FAQ
- [ ] Troubleshooting guide
- [ ] Video tutorial

### 15.3 Demo Documentation
- [ ] Setup checklist
- [ ] Demo script
- [ ] Troubleshooting quick reference
- [ ] Technical Q&A preparation

---

## 16. Dependencies & Libraries

### 16.1 Python Encoder
```python
# requirements.txt
opencv-python>=4.8.0
numpy>=1.24.0
Pillow>=10.0.0
pysrt>=1.1.2  # SRT parsing
webvtt-py>=0.4.6  # VTT parsing
```

### 16.2 PWA Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "opencv.js": "^4.8.0"
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

---

## 17. License & Attribution

### 17.1 Project License
- **Type**: MIT License (open source for educational use)
- **Copyright**: © 2025 AYMAN IDOUKHARAZ

### 17.2 Third-Party Licenses
- OpenCV: Apache 2.0 License
- React: MIT License
- Other dependencies: See respective licenses

### 17.3 Attribution Requirements
- Credits screen in PWA
- README.md with acknowledgments
- Demo presentation slide with attributions

---

## 18. Appendices

### Appendix A: Glossary
- **Steganography**: Hiding data within other data (video frames)
- **Homography**: 3x3 transformation matrix for perspective warping
- **LSB**: Least Significant Bit encoding technique
- **PWA**: Progressive Web App (installable web application)
- **AR**: Augmented Reality (overlay digital content on real world)
- **SRT/VTT**: Subtitle file formats

### Appendix B: Reference Materials
- OpenCV.js documentation: https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html
- WebRTC MediaStream API: https://developer.mozilla.org/en-US/docs/Web/API/MediaStream
- PWA Best Practices: https://web.dev/progressive-web-apps/
- Homography estimation: https://docs.opencv.org/4.x/d9/dab/tutorial_homography.html

### Appendix C: Contact Information
- **Project Author**: AYMAN IDOUKHARAZ
- **Institution**: [University Name]
- **Course**: [Course Name/Number]
- **Demo Date**: [TBD - Classroom demonstration]

---

## Phase 1 Implementation Notes

### Test Files Created for Development
During Phase 1 implementation, the following test files were manually created for development and validation:

- **test_video.mp4**: 30-second demonstration video (1280x720, 25fps) manually provided by developer
- **test_subtitles.srt**: French subtitle file with proper UTF-8 encoding and accent handling
  - Contains 7 subtitle entries timed to match test video
  - Includes French characters: é, è, à, ç, ê, ô
- **test_subtitles.vtt**: WebVTT version of same subtitle content for web compatibility

### Phase 1 Validation Results
- ✅ Complete Python encoder implementation with Tkinter GUI
- ✅ Steganographic LSB embedding (2 bits per RGB channel)
- ✅ Corner marker generation (4x20x20px markers, 60px from edges)
- ✅ French text support with UTF-8 preservation
- ✅ Comprehensive test suite with unit and integration tests
- ✅ Video encoding pipeline producing valid H.264 MP4 output

**Phase 1 Status:** COMPLETED - Ready for Phase 2 PWA development

---

## Document Approval

**Prepared by:** AYMAN IDOUKHARAZ  
**Date:** September 30, 2025  
**Version:** 1.1 - Updated with Phase 1 completion notes  
**Status:** Phase 1 Complete, Phase 2 Ready

---

**End of PRD**

This comprehensive PRD provides all necessary information for the planner to create a detailed development plan. The document covers all aspects from technical architecture to UI design, performance requirements, and demo-specific considerations for the classroom presentation.