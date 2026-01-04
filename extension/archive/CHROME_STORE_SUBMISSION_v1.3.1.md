# Chrome Web Store Submission - Version 1.3.1

**Date:** December 23, 2025
**Package:** `extension/nesty-extension-v1.3.1-chrome-store.zip`
**Extension ID:** mkkadfpabelceniomobeaejhlfcihkll

---

## What's New in v1.3.1

### New Features:
- ✅ Extension detection on web app dashboard
- ✅ ExtensionBanner component prompts users to install extension
- ✅ ExtensionGuideModal shows "how it works" when adding items without extension
- ✅ "Don't show again" option for guide modal
- ✅ Automatic detection via detector.js content script
- ✅ Extension status badge in AddItemModal

### Bug Fixes:
- ✅ Improved close button clickability in modals (z-index fixes)
- ✅ Better spacing in extension banner (padding adjustments)
- ✅ User-friendly modal copy (removed technical jargon)

### Technical Changes:
- Added detector.js for automatic extension detection
- Added content_scripts configuration in manifest.json
- Updated content.js to set detection markers
- Version bumped from 1.3.0 to 1.3.1

---

## Pre-Submission Checklist

### Extension Package ✅
- [x] Version updated to 1.3.1 in manifest.json
- [x] Localhost removed from host_permissions
- [x] Localhost removed from content_scripts matches
- [x] ENV set to 'production' in config.js
- [x] WEB_URL set to 'https://nestyil.com'
- [x] ZIP package created: `nesty-extension-v1.3.1-chrome-store.zip`
- [x] Localhost restored to manifest.json for continued development

### Required Files in ZIP ✅
- [x] manifest.json (v1.3.1, no localhost)
- [x] background.js
- [x] content.js
- [x] detector.js (NEW)
- [x] config.js
- [x] supabase-client.js
- [x] page-script.js
- [x] popup-styles.css
- [x] icon16.png
- [x] icon48.png
- [x] icon128.png

### Testing Requirements ⚠️
Before uploading, test on production:
- [ ] Visit https://nestyil.com with extension installed
- [ ] Verify extension detection works on dashboard
- [ ] Test adding items from e-commerce sites
- [ ] Verify product extraction (name, price, image)
- [ ] Test authentication flow
- [ ] Confirm extension badge appears in AddItemModal
- [ ] Test "don't show again" functionality

---

## Chrome Web Store Submission Steps

### 1. Access Developer Dashboard
- Go to: https://chrome.google.com/webstore/devconsole
- Sign in with your Google account
- Locate existing extension: "Add to Nesty Button"

### 2. Upload New Version
1. Click on the extension name
2. Click "Package" tab
3. Click "Upload new package"
4. Select: `extension/nesty-extension-v1.3.1-chrome-store.zip`
5. Wait for upload to complete

### 3. Update Store Listing (if needed)

**English Description:**
Add products from any e-commerce site to your Nesty baby registry. Extract products from current page with one click using our smart JSON-LD extraction.

**Hebrew Description:**
הוסיפו מוצרים מכל אתר קניות לרשימת התינוקות שלכם ב-Nesty. חלצו מוצרים מהדף הנוכחי בלחיצה אחת עם טכנולוגיית JSON-LD חכמה.

**Version 1.3.1 Release Notes:**
- Added automatic extension detection on web app
- New "how it works" guide modal for first-time users
- Improved user experience with extension banners
- Better close button accessibility
- User-friendly copy (removed technical jargon)

### 4. Privacy Tab
- **Privacy Policy:** https://nestyil.com/privacy-policy.html
- **Single Purpose:** Allow users to add products to their Nesty baby registry
- **Data Usage:** Extension only accesses product data when user clicks the icon
- **Justifications:** (already provided, no changes needed)

### 5. Submit for Review
1. Review all information
2. Click "Submit for Review"
3. Wait 1-3 business days for review

---

## Permission Justifications (Reference)

These are already in the store listing, included here for reference:

### activeTab
Allows the extension to access the current tab only when the user clicks the extension icon. Used to extract product information (name, price, image) from e-commerce websites using JSON-LD structured data.

### scripting
Required to inject content scripts into the active tab and into the Nesty web app tab (nestyil.com). Used to extract product data and to read the authentication session from the web app.

### storage
Used to cache the user's authentication session from the Nesty web app. This prevents the need to fetch the session on every product extraction, improving performance.

### Host Permissions
- **nestyil.com:** Required to detect if the user is logged in and to read their authentication session. The extension executes a script in the nestyil.com tab to access localStorage and retrieve the Supabase session token.

---

## Post-Submission Actions

### After Approval:
1. Extension will be live within a few hours
2. Update documentation with v1.3.1 references
3. Announce update to users
4. Monitor reviews and feedback

### If Rejected:
1. Review rejection reason carefully
2. Address the specific issue
3. Update package and resubmit
4. Common reasons:
   - Permissions not justified
   - Privacy policy issues
   - Functionality unclear

---

## Important Notes

### Development vs Production
- **Development manifest.json:** includes `http://localhost:5173/*`
- **Chrome Store manifest.json:** excludes localhost (in the ZIP)
- **Current state:** Localhost restored for development
- **Never commit:** Chrome Store version without localhost

### Version Management
- Current version in repo: 1.3.1 (with localhost)
- Chrome Store package: 1.3.1 (without localhost)
- Next version: 1.3.2 (when new features added)

### Extension Detection Feature
The new extension detection system allows the web app to:
1. Detect if user has extension installed
2. Show helpful prompts if not installed
3. Display "extension active" badge when present
4. Guide users through installation process

This improves user onboarding and reduces support requests.

---

## Testing Checklist for Production

Once approved and live:

### Installation Test
- [ ] Install from Chrome Web Store
- [ ] Verify icon appears in browser toolbar
- [ ] Check version number is 1.3.1

### Web App Integration
- [ ] Visit https://nestyil.com/dashboard
- [ ] Extension banner should NOT appear (extension detected)
- [ ] Click "הוסף פריט" - guide modal should NOT appear
- [ ] Verify "תוסף פעיל" badge shows in AddItemModal

### Product Extraction
- [ ] Visit e-commerce site (e.g., shilav.co.il)
- [ ] Click extension icon
- [ ] Verify product data extracted correctly
- [ ] Submit to registry
- [ ] Confirm item appears in dashboard

### Without Extension (Incognito)
- [ ] Open incognito window
- [ ] Visit https://nestyil.com/dashboard (logged in)
- [ ] Extension banner SHOULD appear
- [ ] Click "הוסף פריט" - guide modal SHOULD appear
- [ ] Click "התקן תוסף" - links to Chrome Store

---

## Contact & Support

**Chrome Web Store URL:**
https://chromewebstore.google.com/detail/add-to-nesty-button/mkkadfpabelceniomobeaejhlfcihkll

**Support Email:** (Add your support email)

**Documentation:**
- extension/chrome-store/STORE_LISTING.md
- extension/final-version/DEVELOPMENT_LOG.md
- EXTENSION_DETECTION_IMPLEMENTATION.md

---

## Quick Reference

**Package Location:** `extension/nesty-extension-v1.3.1-chrome-store.zip`
**Version:** 1.3.1
**Previous Version:** 1.3.0
**Manifest Version:** 3
**Production URL:** https://nestyil.com
**Chrome Store ID:** mkkadfpabelceniomobeaejhlfcihkll

---

**Status:** ✅ Ready for Chrome Web Store Submission
**Package Created:** December 23, 2025
**Next Steps:** Upload to Chrome Web Store Developer Dashboard
