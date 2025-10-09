# Phase 3 - Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

- [x] Duplicate files removed
- [x] All imports updated to use Phase 3 implementation
- [x] No compilation errors
- [x] Changes committed and pushed to GitHub
- [x] Git tag `v0.3.0-cv-foundation` created

## 🚀 Deployment Steps

### Option 1: Vercel CLI (Recommended)

```bash
cd decoder
npm run build
vercel --prod
```

### Option 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Select `Steganographic_project`
4. Set root directory to `decoder`
5. Deploy

## 📋 Vercel Configuration

The project already has `vercel.json` configured:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

## 🔍 What to Verify After Deployment

### 1. OpenCV Loading (Critical!)
- Open browser console
- Look for: `[OpenCV Loader] ✅ OpenCV.js ready`
- Should load within 5-10 seconds

### 2. Camera Access
- Grant camera permission
- Verify camera feed displays
- Check status changes to "Recherche en cours..."

### 3. CV Pipeline Initialization
- Console should show: `[CV Pipeline] Initializing...`
- Then: `[CV Pipeline] ✅ Initialization complete`

### 4. Performance Check
- No console errors
- Camera runs at 30 FPS
- No lag or freezing

## 🧪 Testing with Phase 1 Encoded Video

**Requirements:**
- Phase 1 encoded video playing on laptop screen
- iPhone with PWA installed
- Good lighting (classroom/office)

**Test Steps:**
1. Play encoded video on laptop (fullscreen recommended)
2. Open deployed PWA on iPhone
3. Point camera at laptop screen (1-2 meters distance)
4. Look for corner highlights to appear
5. Verify screen outline draws around detected video
6. Check confidence indicator (should be >70%)

**Expected Behavior:**
- Corner markers appear within 2 seconds
- 4 colored circles (TL, TR, BR, BL)
- Screen outline with green/yellow color
- Processing at ~15 FPS

## 🐛 Troubleshooting

### OpenCV Fails to Load
- **Symptom:** Console shows timeout error
- **Fix:** Check internet connection, reload page
- **Note:** OpenCV loads from CDN, requires internet on first load

### No Corner Detection
- **Symptom:** Camera works but no detection overlay
- **Possible causes:**
  - Not viewing Phase 1 encoded video
  - Poor lighting conditions
  - Too far from screen (>3m)
  - Extreme viewing angle (>45°)
- **Fix:** Ensure proper test setup with encoded video

### Performance Issues
- **Symptom:** Low FPS, lag, freezing
- **Check:** iPhone model and iOS version
- **Note:** Requires iOS 15+ for optimal performance
- **Workaround:** Close other apps, restart browser

## 📊 Expected Performance Metrics

| Metric | Target | Acceptable |
|--------|--------|-----------|
| OpenCV Load Time | 2-5s | <10s |
| Camera FPS | 30 FPS | 20+ FPS |
| Processing FPS | 15 FPS | 10+ FPS |
| Detection Latency | <100ms | <200ms |
| Memory Usage | +50MB | <100MB |

## 🎯 Success Criteria

Phase 3 deployment is successful if:

- ✅ PWA installs on iPhone
- ✅ OpenCV loads without errors
- ✅ Camera feed displays smoothly
- ✅ CV pipeline initializes
- ✅ No console errors during normal operation
- ⏳ Corner detection works (requires encoded video)
- ⏳ Homography calculated correctly (requires encoded video)

## 📝 Deployment URL

After deployment, Vercel will provide a URL like:
```
https://decoder-xxxxx.vercel.app
```

**Save this URL** for:
- iPhone testing
- Phase 4 handoff
- Demonstration preparation

## 🔗 Next Steps After Deployment

1. **Test on iPhone** with encoded video
2. **Document performance** metrics
3. **Create issues** for any bugs found
4. **Update PHASE3_HANDOFF.md** with deployment URL
5. **Begin Phase 4** (Steganographic Decoding)

## 📱 iPhone Installation

1. Open deployment URL in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Open app from home screen
5. Grant camera permission
6. Test CV detection

---

**Deployment Ready:** All Phase 3 code is committed and pushed to `master` branch with tag `v0.3.0-cv-foundation`

**Last Commit:** Clean up duplicate OpenCV loaders - keep Phase 3 implementation
