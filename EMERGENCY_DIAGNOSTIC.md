# 🚨 EMERGENCY DIAGNOSTIC - UI Freeze Issue

## Problem
After OpenCV loads successfully (~1.5s), the entire UI becomes unresponsive/unclickable.

## Console Evidence
```
[OpenCV Loader] ✅ OpenCV.js ready via polling (1500.40ms)
[useCVDetection] ✅ CV pipeline ready
[CV Pipeline] ✅ Initialization complete
```
Then: **UI completely freezes** - nothing clickable

## Root Cause Analysis

### Theory 1: Infinite Loop in useEffect ❌ FIXED
- **Issue**: startDetection/stopDetection in useEffect dependencies
- **Fix Applied**: Removed from deps, added detectionStartedRef
- **Status**: Fixed but UI still freezes

### Theory 2: Async Processing Loop Blocking ⚠️ LIKELY
- **Issue**: processingLoop calls processFrame() 60 times/sec without waiting
- **Fix Applied**: Made processingLoop async, awaits processFrame()
- **Status**: Committed but not deployed yet

### Theory 3: Auto-Start Triggering Too Early ⚠️ TESTING
- **Issue**: Detection loop starts immediately after init, before UI ready
- **Fix Applied**: TEMPORARILY disabled auto-start in latest commit
- **Status**: Ready to deploy for testing

## Emergency Fixes Applied (Not Yet Deployed)

### Commit 1: Async Loop Fix
```javascript
// OLD (causes 60 parallel operations)
const processingLoop = useCallback(() => {
  processFrame(); // Fire and forget!
  animationFrameRef.current = requestAnimationFrame(processingLoop);
}, [processFrame]);

// NEW (sequential processing)
const processingLoop = useCallback(async () => {
  await processFrame(); // Wait for completion
  animationFrameRef.current = requestAnimationFrame(processingLoop);
}, [processFrame]);
```

### Commit 2: Disable Auto-Start (Diagnostic)
```javascript
// TEMPORARILY disabled to test if processing loop is the issue
/*
if (state.cvInitialized && state.cameraStream && !detectionStartedRef.current) {
  startDetection(); // THIS MIGHT BE CAUSING FREEZE
}
*/
```

## Next Steps

### Test 1: Deploy Disabled Auto-Start
1. Push emergency diagnostic build
2. Test on iPhone
3. If UI responsive → processing loop is the issue
4. If UI still frozen → something else is blocking

### Test 2: Check for Memory Leak
Look for:
- Excessive Mat allocations
- Canvas creation loop
- Event listener accumulation

### Test 3: Profile with Safari DevTools
- Timeline recording during freeze
- JavaScript profiler
- Memory snapshots

## Deployment Command
```bash
cd decoder
git add -A
git commit -m "EMERGENCY: Disable detection loop for diagnosis"
git push origin master
# Wait 2 min for Vercel rebuild
```

## Expected Behavior After Emergency Fix

### If Auto-Start Was The Issue:
✅ OpenCV loads
✅ Status shows "Recherche en cours..."
✅ UI remains responsive
✅ Can click buttons
❌ No actual detection (disabled)

### If Something Else Is Blocking:
✅ OpenCV loads  
❌ UI still frozen
🔍 Need deeper investigation

## Rollback Plan
If emergency fix doesn't work, suspect:
1. OpenCV WASM blocking main thread during initialization
2. React state update storm
3. Canvas rendering loop issue
4. Service worker interference

---

**Status**: Awaiting deployment and testing
**Critical**: Deploy ASAP to unblock user
