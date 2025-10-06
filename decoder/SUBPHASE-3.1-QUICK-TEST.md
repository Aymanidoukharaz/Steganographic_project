# Sub-Phase 3.1 - Quick Test Checklist ✅

## 🚀 Quick Start
```bash
cd decoder
npm run dev
```

## ✅ 5-Minute Verification

### 1. Visual Check (30 seconds)
- [ ] Blue loading bar appears: "Chargement d'OpenCV..."
- [ ] Changes to normal status after 2-10 seconds

### 2. Console Check (30 seconds)
Press F12, look for:
```
[OpenCV] ✅ Loaded successfully in XXXXms
```

### 3. Debug Panel Check (1 minute)
- [ ] Grant camera permission
- [ ] Click 📊 icon (bottom bar)
- [ ] See: `OpenCV: ✅ 4.8.0` (or similar)

### 4. Console Test (30 seconds)
Type in console:
```javascript
typeof window.cv.Mat === 'function'
```
Should return: `true`

### 5. Error Test (2 minutes)
- [ ] DevTools → Network → Set "Offline"
- [ ] Reload page
- [ ] Red error bar appears: "Erreur OpenCV"

## ✅ All Green? → Ready for Sub-Phase 3.2!

---

## 📸 Expected Screenshots

**Loading:**
![Blue bar with "Chargement d'OpenCV..."]

**Loaded:**
![Debug panel showing "OpenCV: ✅ 4.8.0"]

**Error:**
![Red bar with "Erreur OpenCV"]

---

## 🐛 Quick Fixes

**Stuck loading?** → Reload page, check internet

**No version shown?** → OK if checkmark appears

**Timeout?** → Normal on slow connection, retry

---

## 📊 Expected Performance
- **Load Time:** 2-10 seconds
- **Memory:** +30-50 MB
- **No UI lag:** Page stays responsive

---

For detailed testing: See `SUBPHASE-3.1-TESTING.md`
