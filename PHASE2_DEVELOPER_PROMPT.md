# Phase 2 Developer Prompt
## PWA Foundation & Camera Setup

**Welcome, PWA/Frontend Developer!** 

You are now taking over Phase 2 of the Steganographic AR Subtitles System. Phase 1 has been completed successfully, and you have a fully functional Python encoder to work with.

---

## 🎯 Your Mission

Implement the Progressive Web App foundation with React/Vite, camera access, and French UI interface. This phase focuses on creating the mobile application structure that will later integrate with computer vision for AR subtitle decoding.

## 📋 What You're Building

You will create a PWA that:
- Runs on iPhone Safari as a standalone application
- Accesses the rear camera with full-screen viewfinder
- Provides French UI with status indicators
- Works offline after initial installation
- Serves as the foundation for AR computer vision (Phase 3)

## 🔧 Phase 1 Handoff Context

### What's Already Done ✅
- **Complete Python Encoder**: Fully functional desktop application in `encoder/` directory
- **Steganographic System**: LSB embedding with corner markers working
- **Test Files**: French subtitles and encoded video ready for testing
- **Technical Specs**: Detailed encoding format documented in `PHASE1_HANDOFF.md`

### Key Technical Details from Phase 1
- **Corner Markers**: 4 markers, 20x20px each, 60px from edges
- **Steganographic Regions**: Timing data in top 5 rows, subtitles in bottom 10%
- **French Text**: Full UTF-8 support with accented characters (é, è, à, ç, ê, ô)
- **Video Output**: H.264 encoded MP4 files
- **Test Video**: 30-second 1280x720 demo video available

### What You DON'T Need to Worry About Yet
- Computer vision detection (that's Phase 3)
- Steganographic decoding (that's Phase 4) 
- 3D AR rendering (that's Phase 5)
- Focus only on PWA foundation and camera access

---

## 📱 Technical Requirements

### Target Platform
- **Primary**: iPhone Safari (iOS 15+)
- **Secondary**: Chrome/Firefox mobile
- **Installation**: Must work as installed PWA

### Technology Stack (Required)
- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS with dark theme
- **PWA**: Vite PWA plugin for service worker
- **Language**: All UI text in French

### Performance Targets
- **Camera FPS**: 30+ FPS sustained
- **Load Time**: < 3 seconds on 4G
- **Battery Impact**: Minimal when camera active
- **Responsive**: Works on iPhone sizes (375px to 428px width)

---

## 📁 Required Project Structure

Create this exact structure in `decoder/` directory:

```
decoder/
├── public/
│   ├── icons/              # PWA icons (192x192, 512x512)
│   ├── manifest.json      # PWA manifest in French
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

---

## 🎨 UI Requirements (All in French)

### Required French Text Constants
Create these exact constants in `src/utils/constants.js`:

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
  },
  buttons: {
    retry: "Réessayer",
    settings: "Paramètres",
    help: "Aide"
  }
};
```

### Visual Design Requirements
- **Theme**: Dark theme with blue accent colors (PRD Section 5.3)
- **Font**: Inter font family
- **Colors**: 
  - Background: `#0F172A` (slate-900)
  - Accent: `#2563EB` (blue-600)
  - Text: `#F8FAFC` (slate-50)
  - Success: `#10B981` (emerald-500)
  - Warning: `#F59E0B` (amber-500)

### Status Indicator States
Create visual indicators for these states:
1. **Idle** (gray): "Pointez la caméra vers un écran encodé"
2. **Searching** (blue, pulsing): "Recherche en cours..."  
3. **Detecting** (yellow): "Détection en cours..."
4. **Active** (green): "Vidéo détectée!"

---

## 🎥 Camera Implementation Requirements

### Camera Hook (`useCamera.js`)
Must implement these functions:
```javascript
const useCamera = () => {
  // Request camera permissions
  const requestPermission = async () => { ... }
  
  // Start camera with rear camera preference
  const startCamera = async () => { 
    // Use rear camera: { video: { facingMode: 'environment' } }
    // Target resolution: 1280x720 or highest available
  }
  
  // Stop camera and cleanup
  const stopCamera = () => { ... }
  
  return {
    stream,
    isLoading,
    error,
    hasPermission,
    requestPermission,
    startCamera,
    stopCamera
  };
};
```

### Camera Component (`CameraView.jsx`)
Must provide:
- Full-screen camera viewfinder
- Overlay system for UI elements (prepare for AR in Phase 3)
- Proper aspect ratio handling
- Touch-to-focus support (if possible)

---

## 📱 PWA Configuration

### Manifest (`public/manifest.json`)
```json
{
  "name": "Décodeur de Sous-titres AR",
  "short_name": "AR Subtitles",
  "description": "Décodeur de sous-titres en réalité augmentée",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#2563EB",
  "background_color": "#0F172A",
  "start_url": "/",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512", 
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Required Dependencies
Add these to `package.json`:
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

---

## ✅ Phase 2 Success Criteria

You must achieve ALL of these before requesting feedback:

### Core Functionality
- [ ] PWA installs correctly on iPhone Safari
- [ ] Camera permissions requested and handled gracefully
- [ ] Rear camera access working with full-screen view
- [ ] All UI text displays in French (zero English)
- [ ] Status indicator shows all 4 states correctly
- [ ] App works offline after initial installation

### Performance Requirements  
- [ ] Camera feed displays at 30+ FPS on iPhone
- [ ] App loads in under 3 seconds on mobile
- [ ] No console errors or warnings
- [ ] Responsive layout works on iPhone screen sizes
- [ ] Smooth animations and transitions

### Technical Validation
- [ ] Service worker registered for offline support
- [ ] PWA manifest validates correctly
- [ ] Camera stream accessible for future CV processing
- [ ] React components properly structured
- [ ] Tailwind CSS configured and working

---

## 🧪 Testing Requirements

### Device Testing (Critical)
- **Must test on actual iPhone with Safari** (not just desktop)
- Test PWA installation flow
- Verify camera permissions work correctly
- Confirm full-screen camera view

### Browser Testing
- iPhone Safari (primary target)
- Chrome mobile (secondary)
- Test both portrait and landscape orientations

### Performance Testing
- Measure camera FPS using browser dev tools
- Verify smooth UI performance
- Test for 5+ minutes continuous camera use
- Monitor memory usage and battery impact

---

## 📚 Resources Available

### From Phase 1
- **PHASE1_HANDOFF.md**: Complete technical specifications
- **encoder/**: Working Python encoder for testing
- **Test files**: French subtitles and encoded video
- **PRD.md**: Complete requirements document
- **PLAN.md**: Full development plan

### Development Resources
- **Vite Documentation**: https://vitejs.dev/
- **React 18 Docs**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **PWA Best Practices**: https://web.dev/progressive-web-apps/
- **Camera API**: MDN WebRTC getUserMedia documentation

---

## 🚀 Getting Started

### Step 1: Environment Setup
1. Navigate to `c:\DEV\stegano.ar\`
2. Create `decoder/` directory
3. Initialize Vite + React project
4. Install required dependencies
5. Configure Tailwind CSS and PWA plugin

### Step 2: Basic Structure
1. Create the required directory structure
2. Set up French text constants
3. Implement basic app layout with header
4. Add Tailwind dark theme configuration

### Step 3: Camera Implementation
1. Create `useCamera` hook for camera access
2. Implement `CameraView` component
3. Add permission handling and error states
4. Test camera on actual iPhone device

### Step 4: PWA Features
1. Configure PWA manifest and service worker
2. Create app icons (192x192 and 512x512)
3. Test PWA installation on iPhone
4. Verify offline functionality

### Step 5: UI Polish
1. Implement status indicator with 4 states
2. Add loading spinners and error messages
3. Ensure all text is in French
4. Test responsive design on various screen sizes

---

## 🎯 Phase 2 Deliverables Summary

When you request feedback, ensure you have:

1. **Working PWA**: Installs and runs on iPhone Safari
2. **Camera Access**: Full-screen rear camera view at 30+ FPS
3. **French UI**: Complete interface with status indicators
4. **Offline Support**: Basic PWA functionality working
5. **Clean Code**: Well-structured React components
6. **Documentation**: Updated README with setup instructions

## 🔄 Handoff to Phase 3

After Phase 2 completion, you'll hand off to a Computer Vision developer who will:
- Integrate OpenCV.js for corner detection
- Implement homography calculation
- Add real-time frame processing
- Use your camera system as the foundation

Make sure your camera implementation provides clean access to video frames for CV processing!

---

## ⚠️ Important Notes

### What NOT to Include
- Don't implement any computer vision yet (that's Phase 3)
- Don't try to decode steganographic data (that's Phase 4)
- Don't implement settings screens yet (that's Phase 6)
- Focus only on PWA foundation and camera access

### Critical Success Factors
- **iPhone Testing**: Must work on actual iPhone device
- **French UI**: Zero English text allowed
- **Performance**: 30+ FPS camera feed is mandatory
- **PWA Installation**: Must install correctly as standalone app

### Communication
When you request feedback, include:
1. **Demo video**: Screen recording of PWA working on iPhone
2. **Performance metrics**: FPS measurements and load times
3. **Issue log**: Any problems encountered and solutions
4. **Next phase prep**: Notes for Computer Vision developer

---

**Ready to build an amazing PWA foundation? Let's create the camera interface that will become an AR subtitle decoder!**

*Remember: You have the complete Phase 1 encoder working and test files ready. Focus on the mobile PWA experience and camera access. The computer vision magic comes in Phase 3.*