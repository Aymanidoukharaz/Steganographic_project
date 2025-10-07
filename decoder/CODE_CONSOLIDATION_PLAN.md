# Code Consolidation Plan - Phase 3

## Current Situation

We have **two parallel implementations** that were merged:

### Implementation A (Remote - in `opencv/` subfolder)
```
src/cv/opencv/opencv-loader.js
src/hooks/useOpenCV.js
```
- Focus: Basic OpenCV loading
- Features: AppContext integration, timeout, delayed loading
- Status: Simpler, production-ready for loading only

### Implementation B (Our Phase 3 - in `cv/` root)
```
src/cv/opencv-loader.js
src/hooks/useCVDetection.js
src/cv/cv-pipeline.js
+ Full detection system
```
- Focus: Complete CV pipeline
- Features: Detection, homography, full pipeline
- Status: Complete Phase 3 implementation

## Recommendation: Keep Both (They Serve Different Purposes)

### Option 1: Use Both (Recommended) ✅

**Keep `opencv/opencv-loader.js`** for:
- Simple OpenCV loading in isolation
- Testing OpenCV availability
- Future sub-phases that only need OpenCV

**Keep `cv/opencv-loader.js`** for:
- Full CV pipeline integration
- Memory management for detection
- Phase 3 complete implementation

**Action Required:**
- Update imports to use the correct loader based on context
- Document which one to use when

### Option 2: Merge Into One (More Work)

Create `src/cv/opencv-loader.js` that combines:
- Delayed loading from Implementation A
- Memory management from Implementation B
- AppContext integration from Implementation A

**Action Required:**
- Refactor both implementations
- Update all imports
- Test thoroughly

## Immediate Action: Fix Import Conflicts

### Current Problem

`useOpenCV.js` imports from `opencv/opencv-loader.js`:
```javascript
import { loadOpenCV, isOpenCVLoaded, getOpenCV, getOpenCVVersion } from '../cv/opencv/opencv-loader';
```

`useCVDetection.js` imports from `cv/opencv-loader.js`:
```javascript
import { loadOpenCV, getOpenCV, isOpenCVLoaded, cleanupMats } from '../cv/opencv-loader';
```

### Solution: Verify Compatibility

Check if both loaders export compatible functions. If yes, no immediate action needed. If no, consolidate.

## Testing Priority

1. **Test Current State** (as-is after merge)
   - Run `npm run dev`
   - Check if both hooks work
   - Verify no conflicts

2. **If Issues Found**
   - Decide on consolidation approach
   - Implement chosen option

3. **If No Issues**
   - Document the two-loader approach
   - Update README with usage guidelines

## Next Steps

1. Run quick test: `npm run dev`
2. Check browser console for errors
3. Verify both implementations can coexist
4. If needed, consolidate based on Option 1 or 2

---

**Decision Needed:** Which option do you prefer?
- Keep both (minimal work, documents usage)
- Merge into one (cleaner, more work)
