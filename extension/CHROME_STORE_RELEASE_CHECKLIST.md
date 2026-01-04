# Chrome Store Release Checklist

**CRITICAL: Follow this checklist EXACTLY before every Chrome Store submission!**

## Pre-Release Verification (MANDATORY)

### 1. Version Check
- [ ] Verify current Chrome Store version number
- [ ] Bump version to NEXT version (not current)
- [ ] Update `manifest.json` version
- [ ] Update `content.js` data-nesty-extension-version attribute

### 2. Create Chrome Store Directory
- [ ] Copy `final-version/` to `chrome-store-vX.X.X/`
- [ ] **CRITICAL:** Remove localhost from `manifest.json`
  - [ ] Remove `http://localhost:5173/*` from `host_permissions`
  - [ ] Remove `http://localhost:5173/*` from `content_scripts.matches`

### 3. **CRITICAL: Set Production Mode**
- [ ] Open `chrome-store-vX.X.X/config.js`
- [ ] **VERIFY** `const ENV = 'production'` (NOT 'development')
- [ ] Double-check WEB_URL will be 'https://nestyil.com'

### 4. Automated Verification Script
Run the verification script:
```bash
node extension/verify-chrome-store-package.js chrome-store-vX.X.X
```

### 5. Manual Verification
- [ ] Open `chrome-store-vX.X.X/config.js`
- [ ] Confirm line 6 shows: `const ENV = 'production'`
- [ ] Open `chrome-store-vX.X.X/manifest.json`
- [ ] Confirm NO localhost URLs anywhere
- [ ] Confirm version number is correct

### 6. Create Package
- [ ] Create zip: `nesty-extension-vX.X.X.zip`
- [ ] Extract zip to temporary folder
- [ ] Open extracted `config.js`
- [ ] **VERIFY AGAIN:** `const ENV = 'production'`

### 7. Test Package Locally
- [ ] Load unpacked extension from chrome-store-vX.X.X/
- [ ] Go to https://nestyil.com and log in
- [ ] Keep tab open
- [ ] Test on a product page (e.g., mommyshop.co.il)
- [ ] Verify NO errors in console
- [ ] Verify extension works correctly

### 8. Final Checks
- [ ] Create RELEASE_NOTES_vX.X.X.md
- [ ] Commit all changes to git
- [ ] Push to GitHub
- [ ] Tag release: `git tag vX.X.X && git push origin vX.X.X`

### 9. Upload to Chrome Store
- [ ] Upload `nesty-extension-vX.X.X.zip`
- [ ] Fill in "What's new" from RELEASE_NOTES
- [ ] Submit for review

## Common Mistakes to AVOID

❌ **NEVER do this:**
1. Upload a package with `ENV = 'development'`
2. Upload a package with localhost URLs in manifest.json
3. Skip the verification steps
4. Assume the config is correct without checking

✅ **ALWAYS do this:**
1. Run the verification script
2. Manually verify config.js shows 'production'
3. Test the package locally first
4. Extract the zip and verify contents before upload

## What Went Wrong (January 4, 2026)

**Issue:** chrome-store-v1.4.4 was packaged with `ENV = 'development'`

**Impact:** Extension would try to read sessions from localhost:5173, causing 401 errors for all users

**Root Cause:** Copied from final-version without changing config.js

**Fix Applied:** Added this checklist + verification script

**Lesson:** NEVER skip the config verification step

---

**Last Updated:** January 4, 2026
**Critical Level:** 🔴 HIGH - Follow every step
