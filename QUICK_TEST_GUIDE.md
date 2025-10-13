# Quick Testing Guide - OpenCV Initialization Fix

**Date:** October 13, 2025  
**Fix Commit:** `1a49f40`  
**Deployment:** Vercel (auto-deploy from master)

---

## 🚀 Quick Test (2 Minutes)

### Step 1: Wait for Deployment
```bash
# Already pushed to master
# Vercel builds automatically
# Wait ~2 minutes for deployment to complete
```

**Check deployment status:**
- Go to: https://vercel.com/[your-account]/[project-name]
- Look for: "Deployment Status: Ready"
- Or check your email for deployment notification

---

### Step 2: Open on iPhone Safari

1. **Open Safari on iPhone**
2. **Navigate to your Vercel URL:**
   - Example: `https://stegano-ar-decoder.vercel.app`
   
3. **Grant Camera Permission:**
   - Tap "Allow" when prompted
   - If denied previously, go to Settings → Safari → Camera

---

### Step 3: Verify Success ✅

**Look for these UI changes:**

| Before Fix | After Fix (Expected) |
|------------|---------------------|
| "Chargement d'OpenCV..." (forever) | "Chargement d'OpenCV..." (2-3 sec) |
| Gray "EN ATTENTE" (stuck) | → Green "ACTIF" (transitions) |
| No status change | → "Recherche en cours..." |

**Timeline:**
- **0-3 seconds:** "Chargement d'OpenCV..." (Gray)
- **3+ seconds:** "Recherche en cours..." (Green "ACTIF")

---

### Step 4: Check Console (Optional)

**Connect iPhone to Mac:**
1. Connect via USB cable
2. Mac Safari → Develop → [Your iPhone] → [Your Site]
3. Check Console tab

**Expected logs:**
```
[useCVDetection Sync] ========== STARTING INITIALIZATION ==========
[useCVDetection Sync] Polling check #1...
[useCVDetection Sync] Status: loading
[useCVDetection Sync] Polling check #2...
[OpenCV Sync] ✅ Ready after 2.9s
[useCVDetection Sync] ✅ OpenCV is ready!
[useCVDetection Sync] Setting cvInitialized = true...
[useCVDetection Sync] ========== INITIALIZATION COMPLETE ==========
```

**🚨 If still broken, you'll see:**
```
[useCVDetection Sync] Already loading...  ← Only this line, no polling
```

---

## ✅ Success Criteria (Quick Check)

### Visual Verification (30 seconds)
- [ ] Status changes from Gray → Green
- [ ] Text changes to "Recherche en cours..."
- [ ] Green dot appears next to "ACTIF"
- [ ] Camera feed remains live and smooth

### Behavioral Verification (1 minute)
- [ ] UI transitions happen within 3 seconds
- [ ] No console errors visible
- [ ] Camera continues to work
- [ ] Can navigate to settings and back

**If ALL checkboxes checked → FIX SUCCESSFUL! 🎉**

---

## 🐛 If Still Broken

### Quick Diagnostics

**Problem:** Still shows "Chargement d'OpenCV..." forever

**Check:**
1. **Is deployment complete?** 
   - Vercel should show green checkmark
   - May take up to 5 minutes

2. **Hard refresh browser:**
   - Safari → Hold Refresh button
   - Or close tab completely and reopen

3. **Clear cache:**
   - Settings → Safari → Clear History and Website Data
   - Reopen app

4. **Check console logs:**
   - Look for "Already loading..." (means bug still exists)
   - Look for polling logs (means fix is working)

**If polling logs appear but UI doesn't change:**
- Check `AppContext.jsx` reducer
- Check `StatusIndicator.jsx` rendering
- Verify `DETECTION_STATUS` constants

**If no polling logs at all:**
- Fix didn't deploy yet
- Cache issue (hard refresh needed)
- Different bug (check error logs)

---

## 📊 Performance Check

**After successful initialization:**

- **CPU Usage:** Should be < 60%
  - Check: Settings → Battery (background activity)
  
- **Memory:** Stable, not increasing
  - App should stay under 150 MB
  
- **FPS:** Camera feed smooth (30+ FPS)
  - No visible lag or stutter
  
- **Battery:** Normal usage
  - ~20% per hour expected

---

## 🎯 Next Steps After Success

### If Fix Works:
1. ✅ Mark Phase 3 Exit Criteria complete
2. 📝 Update PHASE3_HANDOFF.md with success notes
3. 🚀 Ready to begin Phase 4 (Steganographic Decoding)
4. 🎉 Celebrate fixing a tricky state management bug!

### If Fix Doesn't Work:
1. 📋 Document exact symptoms
2. 📸 Screenshot console logs
3. 🔍 Check OPENCV_STATE_FIX.md for deeper analysis
4. 💬 Report findings with console evidence

---

## 🔧 Rollback (If Needed)

```bash
# Revert to previous commit
git revert 1a49f40
git push origin master

# Or reset to specific commit
git reset --hard 41b7f7c  # Previous working commit
git push origin master --force
```

**⚠️ Only rollback if fix causes new critical bugs!**

---

## 📝 Test Results Template

**Date:** ___________  
**Tester:** ___________  
**Device:** iPhone _____ (iOS ___)  
**Browser:** Safari _____

**Results:**

- [ ] ✅ UI transitions correctly
- [ ] ✅ Console logs show polling
- [ ] ✅ Initialization completes in < 5 seconds
- [ ] ✅ No errors in console
- [ ] ✅ Performance acceptable

**Notes:**
```
[Your observations here]
```

**Status:** ✅ PASS / ❌ FAIL  
**Next Action:** ___________

---

**Quick Reference:**
- 🟢 Green "ACTIF" = Success
- 🟡 Gray "EN ATTENTE" = Still loading (wait)
- 🔴 Red "ERREUR" = Failed (check console)

**Time to test:** ~2 minutes  
**Expected result:** Green status within 5 seconds of opening app
