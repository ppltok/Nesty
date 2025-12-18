# Nesty Changelog

## [Unreleased] - Local Development Branch (bugfix/local-fixes)

### Added
- **Chrome Extension Integration**: Modified Babylist extension (`extension/nesty-local/`) to work with local Nesty server
  - Beautiful popup UI with product image carousel
  - Editable fields: Title, Price, Quantity, Category
  - Toggles: Most wanted, Private, Open to secondhand
  - Notes text area
  - API interceptor redirects to `localhost:5173/api/products`

- **Dashboard Extension Support**:
  - Automatically detects product data from extension
  - Opens AddItemModal with pre-filled data from extension
  - URL parameter `?addProduct=true` triggers extension flow

- **AddItemModal Enhancements**:
  - Expanded `prefilledData` interface to support more fields
  - Supports: name, category, price, brand, storeName, originalUrl
  - Brand automatically added to notes field

- **Vite Development Server**:
  - Mock API endpoints for testing:
    - `GET /api/scrape?url={url}` - Mock scraping endpoint
    - `POST /api/products` - Save product data
    - `GET /api/products` - Retrieve all saved products
  - CORS enabled for extension communication
  - In-memory storage for scraped products

- **Documentation**:
  - `EXTENSION_SETUP_GUIDE.md` - Complete setup guide for extension
  - `extension/nesty-local/README.md` - Extension-specific documentation
  - `extension/local-dev/README.md` - Alternative simple extension docs

### Fixed
- **Auth Loading Issues**:
  - Fixed infinite loading on AuthCallback page
  - Improved auth state management in AuthContext
  - Better error handling during OAuth flow

- **Checklist Loading**:
  - Fixed infinite loading issues
  - Better state management

### Changed
- Vite config: Added mock API middleware plugin
- Dashboard: Added extension product data detection
- AddItemModal: Enhanced to accept more prefill data

### Technical Details

#### Extension Architecture
```
Product Page → Extension Click → Babylist UI Popup → Edit Fields →
"Add to Babylist" → API Interceptor → localhost:5173/api/products →
Nesty Server (Mock API)
```

#### Files Modified
- `nesty-web/src/components/AddItemModal.tsx`
- `nesty-web/src/pages/Dashboard.tsx`
- `nesty-web/src/pages/auth/AuthCallback.tsx`
- `nesty-web/vite.config.ts`

#### New Files/Directories
- `extension/nesty-local/` - Main working extension
- `extension/local-dev/` - Alternative simple extension
- `EXTENSION_SETUP_GUIDE.md`
- `Documents/fix-checklist-loading.md`
- `Documents/nesty-clerk-migration-plan.md`

## Recommendation

**This branch should be merged to main** because:
1. ✅ Working Chrome extension integration with beautiful UI
2. ✅ Auth fixes are stable
3. ✅ Extension → Dashboard → AddItemModal flow works end-to-end
4. ✅ No breaking changes to existing functionality
5. ✅ Good foundation for future development

## Testing Checklist

- [x] Extension loads and shows popup
- [x] Product data extraction works
- [x] API interceptor redirects to localhost
- [x] Dashboard opens with ?addProduct=true
- [x] AddItemModal receives and displays prefilled data
- [x] All fields are editable
- [x] Auth flow works correctly
- [x] Vite dev server runs on port 5173
- [x] Mock API endpoints respond correctly

## Next Steps (Post-Merge)

1. Connect real backend API (replace mock endpoints)
2. Implement actual product scraping logic
3. Save to Supabase database
4. Add image upload/storage
5. Category mapping/auto-detection
6. Store name recognition
7. Price tracking
8. Product deduplication
