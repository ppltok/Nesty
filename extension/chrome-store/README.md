# Chrome Web Store Submission Package

This directory contains everything you need to submit the Nesty extension to the Chrome Web Store.

## 📦 What's Included

1. **nesty-extension-v1.0.0.zip** - The extension package ready for upload
2. **STORE_LISTING.md** - Complete guide for filling out the Chrome Web Store listing
3. **privacy-policy.html** - Privacy policy page (needs to be hosted)
4. **Extension files** (in this directory):
   - manifest.json
   - background.js
   - content.js
   - config.js
   - Icons (16, 48, 128 px)
   - Supporting files

## 🚀 Quick Start - Submission Steps

### 1. Host the Privacy Policy
Upload `privacy-policy.html` to your GitHub Pages:
```bash
# Copy privacy policy to your docs folder or root
cp privacy-policy.html ../../docs/privacy-policy.html
# Or commit it to your gh-pages branch
```

The URL should be: `https://ppltok.github.io/Nesty/privacy-policy.html`

### 2. Create Screenshots
You need 1-5 screenshots (1280x800 or 640x400):
- Screenshot 1: Extension popup on a product page (REQUIRED)
- Screenshot 2: Before/After comparison
- Screenshot 3: Items in Nesty dashboard
- Screenshot 4: Hebrew interface with categories
- Screenshot 5: Login prompt

See `STORE_LISTING.md` section 8 for detailed screenshot requirements.

### 3. Set Up Developer Account
1. Go to: https://chrome.google.com/webstore/devconsole
2. Sign in with your Google account
3. Pay $5 one-time registration fee
4. Complete developer profile

### 4. Upload Extension
1. Click "New Item" in the Developer Dashboard
2. Upload `nesty-extension-v1.0.0.zip`
3. Wait for upload to complete

### 5. Fill Out Store Listing
Use the content from `STORE_LISTING.md`:

**Store Listing Tab:**
- Copy English description (section 2)
- Add Hebrew description below it (section 3)
- Category: Shopping
- Language: Hebrew (primary), English (secondary)
- Upload screenshots

**Privacy Tab:**
- Privacy policy URL: `https://ppltok.github.io/Nesty/privacy-policy.html`
- Single purpose: "Allow users to add products to their Nesty baby registry"

**Permissions Tab:**
Copy justifications from `STORE_LISTING.md` section 7:
- Host permissions: Explain authentication and product extraction
- Storage: Explain session caching
- Scripting: Explain content injection
- ActiveTab: Explain product page access

### 6. Submit for Review
1. Review all information
2. Click "Submit for Review"
3. Wait 1-3 business days for review

## 📝 Important Notes

### ⚠️ CRITICAL: Prepare manifest.json for Chrome Store

**Before creating the ZIP file for Chrome Store, you MUST remove localhost from host_permissions:**

1. Open `extension/final-version/manifest.json`
2. Remove `"http://localhost:5173/*"` from the `host_permissions` array
3. Keep only production URLs:
   ```json
   "host_permissions": [
     "https://nestyil.com/*"
   ]
   ```
4. Create the ZIP file for Chrome Store
5. After upload, restore localhost for development:
   ```json
   "host_permissions": [
     "http://localhost:5173/*",
     "https://nestyil.com/*"
   ]
   ```

**Why?** Users don't need localhost access and it triggers an unnecessary permission warning during installation. Keep localhost only in your development version.

### Before Submitting - Checklist
- [ ] **REMOVED localhost from manifest.json host_permissions** ⚠️ CRITICAL
- [ ] Privacy policy hosted at `https://nestyil.com/privacy-policy.html`
- [ ] All screenshots created (1280x800)
- [ ] Store description ready (English + Hebrew)
- [ ] Permission justifications prepared
- [ ] Support email/URL set up
- [ ] Developer account verified ($5 paid)
- [ ] Tested extension locally one final time
- [ ] Config.js ENV set to 'production'

### Key Points for Approval
✅ **Be transparent** about all permissions
✅ **Explain clearly** why each permission is needed
✅ **Include working** privacy policy URL
✅ **Use real screenshots** showing actual functionality
✅ **Respond quickly** to any reviewer questions

❌ **Don't** use misleading descriptions
❌ **Don't** request unnecessary permissions
❌ **Don't** include obfuscated code

### What Makes This Extension Low-Risk for Rejection

1. **Clear Purpose**: Single, well-defined purpose (add products to registry)
2. **User-Initiated**: Only runs when user clicks the icon
3. **Transparent Permissions**: All permissions clearly justified
4. **Privacy Policy**: Comprehensive privacy policy included
5. **No Data Mining**: Doesn't track or collect browsing data
6. **Open Source**: Code is transparent (can mention GitHub repo)

## 🔧 If You Get Rejected

Common rejection reasons and fixes:

### "Permissions not justified"
→ Use the detailed justifications from `STORE_LISTING.md` section 7

### "Privacy policy missing or incomplete"
→ Ensure `privacy-policy.html` is accessible at the URL you provided

### "Functionality unclear"
→ Add more screenshots showing the complete workflow

### "Misleading description"
→ Make sure screenshots match exactly what the extension does

## 📞 Support

If you have questions during submission:
- Read full guide: `STORE_LISTING.md`
- Chrome Web Store Help: https://developer.chrome.com/docs/webstore/
- Google Support: https://support.google.com/chrome_webstore/

## 📁 File Structure

```
chrome-store/
├── nesty-extension-v1.0.0.zip    # Upload this to Chrome Web Store
├── STORE_LISTING.md               # Complete submission guide
├── privacy-policy.html            # Host this on GitHub Pages
├── README.md                      # This file
└── [Extension files]              # Source files included in zip
```

## 🎯 After Approval

Once approved:
1. Extension will be live within a few hours
2. Share the Chrome Web Store link with users
3. Monitor reviews and respond to user feedback
4. Keep extension updated as needed

## 📊 Maintenance

For future updates:
1. **REMOVE localhost from manifest.json** (see critical section above)
2. Update version number in `manifest.json` (e.g., 1.0.0 → 1.0.1)
3. Ensure config.js ENV is set to 'production'
4. Test all changes locally
5. Create new zip file (without localhost permission)
6. Upload to Chrome Web Store Developer Dashboard
7. Submit for review (updates also require review)
8. **RESTORE localhost to manifest.json** for continued development

---

**Good luck with your submission!** 🍀

The extension is well-built and transparent, which are the key factors for Chrome Web Store approval.
