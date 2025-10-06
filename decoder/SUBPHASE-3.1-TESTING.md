# Sub-Phase 3.1 Testing Guide
**OpenCV.js Integration & Basic Setup**

## ✅ What Was Built

Implemented asynchronous OpenCV.js loading system with:
- OpenCV.js CDN loader with timeout and error handling
- State management integration (loading, loaded, error, version)
- French UI loading indicators
- Debug panel showing OpenCV status
- Singleton pattern for efficient loading

**Files Created:**
- `decoder/src/cv/opencv/opencv-loader.js` - Async OpenCV loader
- `decoder/src/hooks/useOpenCV.js` - React hook for OpenCV lifecycle

**Files Modified:**
- `decoder/src/contexts/AppContext.jsx` - Added OpenCV state management
- `decoder/src/components/UI/StatusIndicator.jsx` - Shows loading/error states
- `decoder/src/components/Camera/CameraControls.jsx` - Debug info with version
- `decoder/src/components/Layout/AppLayout.jsx` - Initializes OpenCV on mount

---

## 🧪 How to Test

### Step 1: Start Development Server

**Do this:**
```bash
cd "c:\ME\mes etudes\france\master\cours\IHM\stegano.ar-master\decoder"
npm run dev
```

**Expected result:** 
- Server starts on http://localhost:5173
- No console errors during build
- Browser opens automatically (or open manually)

**Success indicator:** 
- Terminal shows: `➜ Local: http://localhost:5173/`
- Browser loads the app

---

### Step 2: Verify OpenCV Loading Indicator Appears

**Do this:**
1. Open the app in browser
2. Watch the top status bar immediately after page load

**Expected result:** 
- Blue status bar appears with text: **"Chargement d'OpenCV..."**
- Below it: "Initialisation du système de vision"
- Pulsing animation (subtle blue glow)
- Loading spinner icon rotating

**Success indicator:** 
- French text displays correctly (é, è characters)
- Loading state visible for 2-10 seconds (depending on network)

**Screenshot Example:**
```
┌──────────────────────────────────────────┐
│ 🔄 Chargement d'OpenCV...                │
│    Initialisation du système de vision   │
└──────────────────────────────────────────┘
```

---

### Step 3: Check Browser Console Logs

**Do this:**
1. Open Chrome DevTools (F12 or Ctrl+Shift+I)
2. Go to Console tab
3. Look for OpenCV-related logs

**Expected result:** You should see these messages in order:
```
[useOpenCV] Initiating OpenCV load...
[OpenCV] Starting load process...
[OpenCV] Script tag added to document
[OpenCV] Script loaded, waiting for module initialization...
[OpenCV] ✅ Loaded successfully in XXXXms
[OpenCV] Build Info: Available
[useOpenCV] ✅ OpenCV ready (X.X.X)
```

**Success indicators:**
- ✅ Green checkmarks for successful load
- Load time typically 2000-8000ms
- No red error messages
- Version number appears (e.g., "4.8.0")

---

### Step 4: Verify OpenCV Loaded State

**Do this:**
1. Wait for loading to complete (status bar changes)
2. Check the top status bar

**Expected result:** 
- Loading message disappears
- Status changes to: **"Pointez la caméra vers un écran encodé"** (idle state)
- No error messages

**Success indicator:** 
- Smooth transition from loading → idle state
- No frozen or stuck loading screen

---

### Step 5: Enable Debug Info Panel

**Do this:**
1. Grant camera permission when prompted
2. Click the **bar chart icon** (📊) in bottom controls
3. Debug panel appears at bottom

**Expected result:** Debug panel shows:
```
Status: idle                    Phase: 3.1 (OpenCV Setup)
Permission: Accordée            Secure Context: Oui
Protocol: https:                PWA: Non installée
OpenCV: ✅ 4.8.0 (or version number)
```

**Success indicators:**
- ✅ "OpenCV: ✅ X.X.X" with green checkmark
- Version number displayed
- No "⏳ Chargement..." text

---

### Step 6: Test OpenCV Instance Availability

**Do this:**
1. In browser console, type:
```javascript
window.cv
```
2. Press Enter

**Expected result:** 
- Console shows: `{Mat: ƒ, matFromArray: ƒ, ...}` (OpenCV object)
- Hundreds of properties/methods listed

**Success indicator:** 
- `window.cv.Mat` is a function
- No `undefined` or `null`

**Additional test:**
```javascript
typeof window.cv.Mat === 'function'
```
Should return: `true`

---

### Step 7: Verify Version Information

**Do this:**
In console, type:
```javascript
window.cv.getBuildInformation ? window.cv.getBuildInformation() : 'Not available'
```

**Expected result:** 
- Long string with OpenCV build details
- First line contains version (e.g., "OpenCV 4.8.0")

**Success indicator:** 
- Build information available
- Matches version shown in debug panel

---

### Step 8: Test Error Handling (Simulate Load Failure)

**Do this:**
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Reload the page (Ctrl+R)

**Expected result:** 
- Red error status bar appears
- Text: **"Erreur OpenCV"**
- Below: "Failed to load OpenCV.js script from CDN" or similar

**Success indicator:** 
- App doesn't crash
- Error message in French
- Clear red color coding

---

### Step 9: Test Reload After Successful Load

**Do this:**
1. Make sure OpenCV loaded successfully (Step 4)
2. Reload page (Ctrl+R)
3. Watch console logs

**Expected result:** 
- OpenCV loads again (not cached in localStorage)
- Same loading sequence as Step 3
- Successfully loads second time

**Success indicator:** 
- Consistent behavior on reload
- No "already loaded" errors
- Clean re-initialization

---

### Step 10: Performance Check - Load Time

**Do this:**
1. Open DevTools → Console
2. Reload page
3. Note the load time in console: "[OpenCV] ✅ Loaded successfully in XXXXms"

**Expected result:** 
- Load time: 2000-10000ms (2-10 seconds)
- Depends on internet speed

**Success indicators:**
- ✅ Load completes within 30 seconds (timeout threshold)
- ✅ No timeout errors
- ✅ Faster on subsequent loads (browser cache)

**Benchmark:**
- Fast connection: 2-4 seconds
- Slow connection: 8-15 seconds
- Offline: Timeout after 30 seconds

---

## 📸 Visual Verification

### Loading State (Step 2)
```
┌────────────────────────────────────────────┐
│ [Rotating Spinner] Chargement d'OpenCV... │
│                   Initialisation du...     │
└────────────────────────────────────────────┘
Blue background, pulsing animation
```

### Loaded State (Debug Panel - Step 5)
```
┌──────────────────────────────────────┐
│ OpenCV: ✅ 4.8.0                     │
└──────────────────────────────────────┘
Green checkmark, version number
```

### Error State (Step 8)
```
┌────────────────────────────────────────┐
│ ⚠️ Erreur OpenCV                      │
│    Failed to load OpenCV.js script... │
└────────────────────────────────────────┘
Red background, warning icon
```

---

## 📊 Performance Validation

### Expected Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Load Time** | < 10s (typical) | Console log timestamp |
| **Memory Impact** | ~30-50 MB | DevTools → Memory → Heap snapshot |
| **Script Size** | ~8 MB | Network tab → opencv.js file size |
| **Timeout Threshold** | 30 seconds | Hardcoded in loader |
| **UI Responsiveness** | No lag | Page remains interactive during load |

### How to Check Memory Impact

**Do this:**
1. DevTools → Performance Monitor (Ctrl+Shift+P → "Performance Monitor")
2. Watch "JS Heap Size" before and after OpenCV loads

**Expected result:** 
- Before: ~10-20 MB
- After: ~40-70 MB
- Increase: ~30-50 MB

---

## 🐛 Common Issues & Solutions

### Issue 1: Infinite Loading

**Symptoms:** 
- "Chargement d'OpenCV..." never disappears
- No console logs after "Script tag added"

**Solution:**
1. Check internet connection
2. Check if blocked by adblocker
3. Try different browser
4. Check console for CORS errors

**Diagnostic:**
```javascript
// In console
document.querySelector('script[src*="opencv"]')
```
Should show: `<script async src="https://...opencv.js"></script>`

---

### Issue 2: Timeout Error

**Symptoms:** 
- Error: "OpenCV.js load timeout (30s exceeded)"

**Solution:**
- Slow internet connection
- Try refreshing page
- Check Network tab for stalled requests

---

### Issue 3: Version Shows "Unknown"

**Symptoms:** 
- Debug panel shows "OpenCV: ✅ Loaded (version unknown)"

**Solution:**
- This is OK! Some OpenCV builds don't expose version info
- As long as checkmark appears, it's loaded correctly

**Verify:**
```javascript
typeof window.cv.Mat === 'function'  // Should be true
```

---

### Issue 4: Console Shows Warnings

**Common warning:**
```
This application (or a library it uses) is using the AppCache...
```

**Solution:** 
- This is normal, safe to ignore
- Related to PWA features, not OpenCV

---

### Issue 5: "cv is not defined" in Console

**Symptoms:** 
- Typing `window.cv` shows `undefined`

**Solution:**
1. Make sure loading completed (check status bar)
2. Wait for green checkmark in debug panel
3. Check console for error messages
4. Reload page and retry

---

## ✅ Sign-off Criteria

Before moving to Sub-Phase 3.2, verify ALL of these:

- [ ] ✅ OpenCV loads successfully on first page load
- [ ] ✅ Loading indicator displays in French correctly
- [ ] ✅ Console shows complete log sequence with timestamps
- [ ] ✅ Debug panel shows OpenCV version with green checkmark
- [ ] ✅ `window.cv.Mat` is a function (test in console)
- [ ] ✅ Load time is under 30 seconds
- [ ] ✅ Error handling works (offline test shows red error)
- [ ] ✅ Page reload works correctly (loads again)
- [ ] ✅ No console errors or warnings (except AppCache warning)
- [ ] ✅ UI remains responsive during loading

---

## 🎓 Testing on iPhone (Real Device)

### Why iPhone Testing Matters
OpenCV.js WASM may behave differently on mobile Safari vs desktop Chrome.

### How to Test on iPhone

**Do this:**
1. Build production version:
   ```bash
   npm run build
   npm run preview
   ```
2. Get your computer's local IP:
   ```bash
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.xxx)
   ```
3. On iPhone Safari, visit: `http://YOUR_IP:4173`
4. Allow insecure content if needed (Settings → Safari)

**Expected result:** 
- Same loading behavior as desktop
- May take slightly longer (5-15 seconds)
- French text renders correctly

**Success indicators:**
- ✅ OpenCV loads on mobile Safari
- ✅ No mobile-specific errors
- ✅ Debug panel accessible and readable

---

## 📊 Performance Monitoring Commands

Run these in browser console for detailed analysis:

### Check if OpenCV is loaded
```javascript
window.cv ? '✅ Loaded' : '❌ Not loaded'
```

### Get OpenCV build info
```javascript
window.cv?.getBuildInformation?.()
```

### Check available OpenCV functions
```javascript
Object.keys(window.cv).filter(k => typeof window.cv[k] === 'function')
```

### Measure load time manually
```javascript
// Before load
const start = performance.now();

// After load (in console when loaded)
const loadTime = performance.now() - start;
console.log(`Load time: ${loadTime.toFixed(0)}ms`);
```

---

## 🚀 Next Steps

Once ALL sign-off criteria are met:

1. **Document Results:**
   - Screenshot of debug panel with OpenCV version
   - Console log showing successful load
   - Load time measurement

2. **Report Back:**
   - Confirm all tests passed
   - Note any issues encountered
   - Share load time on your device

3. **Proceed to Sub-Phase 3.2:**
   - Frame Capture System
   - Only after approval!

---

## 📝 Test Results Template

```markdown
## Sub-Phase 3.1 Test Results

**Date:** [Your date]
**Browser:** [e.g., Chrome 120.0.6099.109]
**Device:** [e.g., Desktop Windows 11]

### Results
- ✅/❌ Loading indicator appeared
- ✅/❌ Console logs showed complete sequence
- ✅/❌ OpenCV version displayed: [version]
- ✅/❌ Load time: [XXXXms]
- ✅/❌ Error handling tested successfully
- ✅/❌ iPhone test completed: [Yes/No]

### Screenshots
[Attach screenshots of:]
- Loading state
- Debug panel with version
- Console logs

### Issues Encountered
[None / List any issues]

### Ready for Sub-Phase 3.2?
[Yes / No - explain if No]
```

---

**🎯 Summary:** This sub-phase successfully loads OpenCV.js asynchronously, displays loading state in French, handles errors gracefully, and exposes the `cv` object for use in next phases. All functionality can be verified through browser console and visual UI indicators.

**⏱️ Expected Testing Time:** 15-20 minutes for complete verification
