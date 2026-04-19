# Pre-Release Testing Checklist

**Use this checklist before EVERY release or significant code change**

---

## 🔴 CRITICAL: Test These FIRST (Regression Tests)

These sites MUST work before you can release:

### Test 1: shilav.co.il (Baseline)
```
URL: https://www.shilav.co.il/collections/breast-feeding-accessories/products/מנורת-לילה-חכמה

Expected Results:
[ ] Extension icon clickable
[ ] Modal opens
[ ] Name: "מנורת לילה חכמה"
[ ] Price: "139.90"
[ ] Image: Present (not thumbnail)
[ ] Brand: "שילב Shilav"
[ ] Category: "הנקה והאכלה"
[ ] Can click "הוסף לרשימה"
[ ] No red errors in console
```

### Test 2: la-mer.co.il (Fallback Test)
```
URL: https://la-mer.co.il/products/מנשא-בד-lamer-x-soft

Expected Results:
[ ] Extension works (despite broken JSON-LD)
[ ] Name: "מנשא לתינוק Lamer X Soft"
[ ] Price: "549" or "549.00"
[ ] Image: Present
[ ] Console shows fallback method used
[ ] Form submittable
```

---

## ⚠️ Authentication Tests

### Test 3: Logged In
```
Prerequisites:
[ ] Open https://nestyil.com in another tab
[ ] Log in with valid account
[ ] User has created a registry

Test:
[ ] Click extension on product page
[ ] Modal shows product form (not login prompt)
[ ] Registry name shown in logs: "הרשימה של [name]"
```

### Test 4: Not Logged In
```
Prerequisites:
[ ] Run: chrome.storage.local.clear() in Service Worker console
[ ] Close nestyil.com tab (or log out)

Test:
[ ] Click extension on product page
[ ] Shows login prompt modal (🔒 icon)
[ ] "התחבר ל-Nesty" button present
[ ] Clicking button opens nestyil.com
```

---

## 🎯 Feature Tests

### Test 5: URL Paste Mode
```
[ ] Click extension on homepage (non-product page)
[ ] Shows "הדבק קישור" mode
[ ] Paste product URL
[ ] Click "חלץ מוצר"
[ ] Product extracts successfully
[ ] Form populates with data
[ ] Switches to form view
```

### Test 6: Image Quality
```
[ ] Open extension on product page
[ ] Check image in modal
[ ] Image is NOT tiny thumbnail
[ ] Image is high-resolution
[ ] Check console for: filterAndPrioritizeImages logs
```

### Test 7: Submit to Registry
```
[ ] Fill out form
[ ] Click "הוסף לרשימה"
[ ] Button shows "מוסיף..."
[ ] Success: Button shows "נוסף! ✓"
[ ] Modal closes after 1.5 seconds
[ ] Item appears in nestyil.com registry
```

---

## 🔍 Console Log Verification

### ✅ Expected Logs (Good)
```
🚀 Nesty Extension - Starting...
✅ Config loaded: https://nestyil.com
✅ Got session from background script
✅ Registry found: הרשימה של [name]
🔍 Extracting product data...
✅ Found Product type, extracting...
✅ Extraction result: {name: '...', price: '...', ...}
✅ Product extracted, showing form in current page mode
🔘 Submit button found: Yes
```

### ❌ Bad Logs (Stop and Fix)
```
❌ Error: Cannot read properties of undefined   ← CRITICAL
❌ 401 (Unauthorized)                           ← Session issue
❌ Failed to fetch registry                     ← Auth problem
Promise { <pending> }                           ← Missing await
TypeError: ... is not a function                ← Function changed
```

---

## 🧪 Edge Case Tests

### Test 8: Missing Image
```
Find product with no image
[ ] Extension still works
[ ] Shows placeholder or empty image area
[ ] No crashes
```

### Test 9: Missing Price
```
Find product with no price
[ ] Extension still works
[ ] Price field empty or shows 0
[ ] No crashes
```

### Test 10: Product with Variants
```
Find product with multiple sizes/colors
[ ] Extracts first variant price
[ ] Or extracts in-stock variant (if available)
[ ] Shows correct price
```

---

## 🔧 Technical Checks

### Code Quality
```
[ ] No console.error() left in code
[ ] No console.log() for sensitive data
[ ] All TODOs resolved or documented
[ ] No debugging code (debugger statements)
[ ] Version number updated in manifest.json
```

### Async/Await Verification
```
[ ] All async functions have 'async' keyword
[ ] All async calls have 'await'
[ ] No missing 'await' (check for Promise in logs)
[ ] Call chain is complete (caller → callee all async)
```

### Null Safety
```
[ ] Optional chaining used for nested properties
[ ] Fallback values provided (|| '', || [])
[ ] No direct array access without checks
[ ] ImageUrls handled: product?.imageUrls?.[0] || ''
```

---

## 📦 Pre-Package Checks

### Configuration
```
[ ] config.js: ENV = 'production'
[ ] config.js: WEB_URL = 'https://nestyil.com'
[ ] manifest.json: version number incremented
[ ] manifest.json: NO localhost in host_permissions
```

### Documentation
```
[ ] CHANGELOG.md updated with changes
[ ] README.md reflects current features
[ ] New features documented
[ ] Known issues documented
```

### Files to Include
```
[ ] manifest.json (production, no localhost)
[ ] config.js (production mode)
[ ] content.js
[ ] background.js
[ ] popup-styles.css
[ ] icons/ (all sizes)
[ ] PRIVACY_POLICY.md (if required)
```

---

## 🚀 Chrome Store Submission

### Before Upload
```
[ ] Create new .zip file
[ ] manifest.json: localhost removed
[ ] Test the .zip in a clean Chrome profile
[ ] All smoke tests pass
[ ] No console errors
```

### After Upload
```
[ ] RESTORE localhost to manifest.json for dev
[ ] Commit production manifest to git
[ ] Tag release: git tag -a v1.x.x
[ ] Push tags: git push --tags
```

---

## 📊 Performance Check

```
[ ] Extension loads in < 1 second
[ ] Modal appears in < 2 seconds
[ ] Form is responsive (no lag)
[ ] Image loads quickly
[ ] Submit completes in < 3 seconds
[ ] No memory leaks (test with 10+ uses)
```

---

## 🔐 Security Check

```
[ ] No API keys in code (use environment config)
[ ] No user data logged to console
[ ] Session handled securely
[ ] HTTPS only for web app
[ ] No eval() or innerHTML with user input
```

---

## 📝 Quick Debug Commands

### Clear Extension Cache
```javascript
// Run in Service Worker console (chrome://extensions/ → Service Worker)
chrome.storage.local.clear()
```

### Check Session
```javascript
// Run in Service Worker console
chrome.storage.local.get(['nesty_session'], (result) => {
  console.log(result.nesty_session);
});
```

### Reload Extension
```
chrome://extensions/
→ Find Nesty
→ Click Reload button
```

---

## ✅ Final Sign-Off

Before releasing, check off ALL of these:

```
Regression Tests:
[ ] shilav.co.il works
[ ] la-mer.co.il works

Auth Tests:
[ ] Logged in flow works
[ ] Not logged in shows prompt

Feature Tests:
[ ] URL paste works
[ ] Image quality good
[ ] Submit to registry works

Edge Cases:
[ ] Missing image handled
[ ] Missing price handled
[ ] Variants handled

Technical:
[ ] No async bugs
[ ] Null safety implemented
[ ] Console clean (no errors)

Package:
[ ] Config = production
[ ] Manifest version updated
[ ] Localhost removed
[ ] Documentation updated

Performance:
[ ] Loads fast
[ ] Responsive
[ ] No leaks

Security:
[ ] No exposed secrets
[ ] HTTPS only
[ ] No security warnings
```

**If ALL boxes are checked: ✅ READY TO RELEASE**

**If ANY box is unchecked: ❌ DO NOT RELEASE**

---

## 🆘 If Something Breaks

1. **Don't panic**
2. **Check this file** for the test that failed
3. **Review LESSONS_LEARNED.md** for similar issues
4. **Fix the issue**
5. **Re-run ALL tests** (don't skip)
6. **Document the fix** in CHANGELOG.md

---

**Version:** 1.0
**Last Updated:** 2025-12-23
**Maintainer:** Update this checklist as you add features
