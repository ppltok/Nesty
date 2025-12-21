# Nesty Chrome Extension - Development Log

**Purpose:** This document serves as organizational memory, tracking what was built, problems encountered, solutions implemented, and lessons learned. It helps avoid repeating mistakes and provides context for future development.

**⚠️ IMPORTANT:** Update this document at every milestone, after solving major issues, or when implementing new features.

---

## Table of Contents
- [2024-12-21: Initial Development](#2024-12-21-initial-development)
- [2024-12-21: Authentication Integration](#2024-12-21-authentication-integration)

---

## 2024-12-21: Initial Development

### Milestone: Working Product Extraction & UI

**Goal:** Create Chrome extension that extracts product data and shows a form UI.

### Problems & Solutions

#### Problem 1: Price Detection Bug (159.90 vs 59.90)
**Symptom:** Extension showed 159.90 ILS instead of correct price 59.90 ILS on Shilav product pages.

**Root Cause:**
- Product extraction only checked for `@type === "Product"` in JSON-LD
- Shopify uses `ProductGroup` type for products with variants
- Price was being read from wrong location in data structure

**Solution:**
```javascript
// Added extraction for ProductGroup type
function extractFromProductGroup(data) {
  const variants = data.hasVariant || [];
  const firstVariant = Array.isArray(variants) ? variants[0] : variants;
  const offer = firstVariant?.offers; // Correct price location

  return {
    name: data.name || '',
    price: offer?.price || '', // ✅ Gets correct price (59.90)
    // ...
  };
}
```

**Lesson Learned:** Shopify uses ProductGroup JSON-LD schema for variant products. Always check both Product and ProductGroup types.

**Files Modified:** `content.js` - Added `extractFromProductGroup()` function

---

#### Problem 2: Double Injection Error
**Symptom:** "Uncaught SyntaxError: Identifier 'CONFIG' has already been declared" when clicking extension icon multiple times.

**Root Cause:** Content script being injected multiple times into the same page.

**Solution:**
```javascript
// Prevent double execution
if (window.nestyExtensionLoaded) {
  console.log('⚠️ Extension already loaded, exiting');
} else {
  window.nestyExtensionLoaded = true;
  // ... rest of code
}
```

**Lesson Learned:** Always use a flag to prevent double injection. Early return is better than throwing errors.

**Files Modified:** `content.js` - Added double-injection check

---

#### Problem 3: UI Scrolling Issue
**Symptom:** Product form modal required scrolling, "Add to Babylist" button was cropped.

**Root Cause:** Too much vertical spacing in layout (padding, margins, font sizes).

**Solution:**
- Reduced image size: 200px → 160px
- Reduced padding throughout: 24px → 20px, 16px → 12px
- Reduced font sizes: 14px → 13px (inputs), 13px → 12px (labels)
- Used flexbox with `flex-shrink: 0` on header/footer
- Made notes textarea 2 rows with `resize: none`

**Lesson Learned:** Compact modal layouts require systematic reduction of all spacing. Use flexbox with shrink controls.

**Files Modified:** `content.js` - Updated inline styles in modal HTML

---

### Commits
- `67a854c` - Initial working version with product extraction and form UI
- `dbc8e7f` - Previous PWA-related work (context from git log)

---

## 2024-12-21: Authentication Integration

### Milestone: Full Authentication with Session Detection

**Goal:** Detect if user is logged in to Nesty, show login prompt if not, fetch registry if authenticated.

### Problems & Solutions

#### Problem 1: Cross-Origin localStorage Access
**Symptom:** User logged in to localhost:5173 but extension showed "login required" prompt.

**Root Cause:**
- Supabase session stored in localStorage at `localhost:5173`
- Extension running on different domain (e.g., `shilav.co.il`)
- Browser security (same-origin policy) prevents cross-origin localStorage access
- Initial approach tried to read localStorage from wrong origin

**Investigation:**
```
Console output showed:
📦 Current origin: https://www.shilav.co.il  ❌ Wrong origin!
📦 localStorage keys: [39 items from shilav.co.il]
❌ No Supabase session found in localStorage
```

**Attempted Solutions (Failed):**
1. ❌ Inject page-script.js into current page → Only reads current page's localStorage
2. ❌ Use content script to access localStorage → Content scripts can't access localStorage
3. ❌ Multiple search patterns → Couldn't find session because wrong origin

**Working Solution:**
Use background script with chrome.tabs API to query localhost:5173 tab:

```javascript
// background.js
async function getSupabaseSession() {
  // 1. Check cache first
  const result = await chrome.storage.local.get(['nesty_session']);
  if (result.nesty_session && !isExpired(result.nesty_session)) {
    return result.nesty_session;
  }

  // 2. Query for localhost:5173 tabs
  const tabs = await chrome.tabs.query({ url: 'http://localhost:5173/*' });

  if (tabs.length > 0) {
    // 3. Execute script in localhost:5173 context
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        // ✅ This runs in localhost:5173 context
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-') && key.includes('-auth-token')) {
            return JSON.parse(localStorage.getItem(key));
          }
        }
        return null;
      }
    });

    // 4. Cache for future use
    await chrome.storage.local.set({ nesty_session: results[0].result });
    return results[0].result;
  }
}
```

**Why This Works:**
- Background script has access to `chrome.tabs` API (content scripts don't)
- `chrome.scripting.executeScript` runs in the target tab's context
- Target tab is localhost:5173, so localStorage access works
- Session cached in chrome.storage.local (accessible from all contexts)

**Lesson Learned:**
- localStorage is domain-specific and cannot be accessed cross-origin
- Background scripts have more permissions than content scripts
- Use background script for operations requiring chrome.tabs or chrome.scripting
- Cache expensive operations (tab queries) in chrome.storage

**Architecture (Manifest V3):**
```
Product Page (shilav.co.il)
    ↓
Content Script (content.js)
    ↓ chrome.runtime.sendMessage({ type: 'GET_SESSION' })
Background Script (background.js) [has chrome.tabs access]
    ↓ chrome.tabs.query({ url: 'http://localhost:5173/*' })
    ↓ chrome.scripting.executeScript(localhost:5173 tab)
localhost:5173 Tab Context
    ↓ Read localStorage for Supabase session
    ↓ Return session
Background Script
    ↓ Cache in chrome.storage.local
    ↓ sendResponse({ session })
Content Script
    ↓ Use session to fetch registry
    ✓ Show product form
```

**Files Modified:**
- `background.js` - Added GET_SESSION message handler and session fetching
- `content.js` - Simplified to request session from background
- `manifest.json` - Added `tabs` permission, removed `cookies`

---

#### Problem 2: Content Script Can't Access chrome.tabs
**Symptom:** "TypeError: Cannot read properties of undefined (reading 'query')" when trying to use `chrome.tabs.query()` in content script.

**Root Cause:** Content scripts have limited API access. Only background scripts can access `chrome.tabs` API.

**Solution:** Move all tab-related operations to background script and use message passing.

**Lesson Learned:**
- Know the API limitations of content scripts vs background scripts
- Content scripts: DOM access, limited Chrome APIs
- Background scripts: Full Chrome API access, no DOM access
- Use message passing to coordinate between them

**Chrome Extension API Access:**
| Feature | Content Script | Background Script |
|---------|---------------|-------------------|
| DOM Access | ✅ Yes | ❌ No |
| chrome.runtime | ✅ Limited | ✅ Full |
| chrome.storage | ✅ Yes | ✅ Yes |
| chrome.tabs | ❌ No | ✅ Yes |
| chrome.scripting | ❌ No | ✅ Yes |
| localStorage | ❌ No | ❌ No (use chrome.storage) |

---

### Features Implemented

#### Hebrew UI Modals
**Login Prompt:**
- Lock icon (🔒)
- "נדרשת התחברות" (Login required)
- "כדי להוסיף מוצרים לרשימה שלך, עליך להתחבר ל-Nesty"
- "התחבר ל-Nesty" button (opens localhost:5173)

**Error Modal:**
- Warning icon (⚠️)
- Hebrew error messages
- "סגור" button

**Product Form:**
- All labels in Hebrew
- RTL support
- Categories in Hebrew: עגלות וטיולים, בטיחות ברכב, etc.
- Toggles: הכי רציתי, פרטי, פתוח למשומש
- Submit button: "הוסף לרשימה"

#### Session Management
- Smart caching in chrome.storage.local
- Session expiry checking
- Auto-refresh from localhost:5173 when expired
- Cached session persists across extension reloads

#### Registry Integration
- Fetches user's registry from Supabase
- Uses session access_token for authentication
- Shows error if no registry found
- Validates registry ownership

---

### Testing Approach

**Prerequisites:**
1. User must be logged in to Nesty at localhost:5173
2. Keep localhost:5173 tab open
3. User must have a registry created

**Test Cases:**
1. ✅ Logged in user → Shows product form
2. ✅ Logged out user → Shows login prompt
3. ✅ Session cached → Fast loading (no tab query)
4. ✅ Session expired → Auto-refresh from localhost:5173
5. ✅ No registry → Shows error modal
6. ✅ Product extraction → Correct price (59.90 not 159.90)
7. ✅ Form submission → Item added to Supabase

---

### Commits
- `7ed6827` - Full authentication integration with session detection

---

## Technical Decisions & Rationale

### Why chrome.storage Instead of Cookies?
**Babylist Approach:** Uses cookies with `chrome.cookies` API
- ✅ Works because Babylist owns babylist.com domain
- ✅ Can set cookies on their domain
- ✅ Can read cookies with `chrome.cookies.getAll({ domain: 'babylist.com' })`

**Nesty Constraint:** Cannot use cookies
- ❌ Supabase stores session in localStorage, not cookies
- ❌ localhost:5173 is development environment, not production domain
- ❌ Can't set cookies on arbitrary domains from extension

**Our Solution:** chrome.storage.local + chrome.tabs API
- ✅ Works with any storage mechanism (localStorage, sessionStorage, etc.)
- ✅ Accessible from all extension contexts
- ✅ Persists across browser sessions
- ✅ No domain ownership required

### Why Background Script for Session Fetching?
**Requirement:** Need to read localStorage from localhost:5173 while running on different domains

**Only Option:** Use chrome.tabs API to:
1. Query for localhost:5173 tabs
2. Execute script in that tab's context
3. Read localStorage in the correct origin

**Constraint:** Only background scripts have chrome.tabs access

**Result:** Background script is the only viable architecture

---

## Common Issues & Solutions

### Issue: "Extension already loaded" warning
**Cause:** Clicking extension icon multiple times
**Solution:** Check `window.nestyExtensionLoaded` flag before executing
**Code:** Early return if flag is set

### Issue: Session not found but user is logged in
**Possible Causes:**
1. localStorage key format changed
2. localhost:5173 tab not open
3. User logged in on 127.0.0.1 instead of localhost
4. Session expired

**Debug Steps:**
1. Check if localhost:5173 tab is open
2. Inspect localStorage in localhost:5173 DevTools
3. Look for keys containing "sb-" and "-auth-token"
4. Check session expiry timestamp

### Issue: Form doesn't submit
**Possible Causes:**
1. Supabase credentials incorrect
2. No registry created
3. Items table doesn't exist
4. RLS policies block insertion

**Debug Steps:**
1. Check console for API errors
2. Verify NESTY_CONFIG credentials
3. Check if user has a registry
4. Verify Supabase table structure and RLS policies

---

## Code Patterns & Best Practices

### Pattern: Message Passing Between Scripts
```javascript
// Content script (sender)
const response = await chrome.runtime.sendMessage({
  type: 'GET_SESSION'
});

// Background script (receiver)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SESSION') {
    getSupabaseSession().then(sendResponse);
    return true; // ⚠️ Required for async response
  }
});
```

**Important:** Return `true` from listener to indicate async response!

### Pattern: Session Caching
```javascript
// Check cache first (fast)
const cached = await chrome.storage.local.get(['nesty_session']);
if (cached.nesty_session && !isExpired(cached.nesty_session)) {
  return cached.nesty_session;
}

// Fetch fresh session (slow)
const freshSession = await fetchSession();

// Update cache
await chrome.storage.local.set({ nesty_session: freshSession });

return freshSession;
```

### Pattern: Double-Injection Prevention
```javascript
if (window.nestyExtensionLoaded) {
  console.log('⚠️ Extension already loaded, exiting');
  return; // ✅ Early return, don't throw error
} else {
  window.nestyExtensionLoaded = true;
  // ... rest of code
}
```

---

## Future Improvements

### Potential Enhancements
- [ ] Support for multiple registries (dropdown selection)
- [ ] Image carousel for products with multiple images
- [ ] Price tracking and alerts
- [ ] Offline support with queued submissions
- [ ] Analytics tracking (items added, sources, etc.)
- [ ] Support for more e-commerce platforms beyond Shopify
- [ ] Browser compatibility (Firefox, Safari with their extension APIs)

### Technical Debt
- [ ] Add comprehensive error handling for network failures
- [ ] Implement retry logic for failed API calls
- [ ] Add telemetry for debugging user issues
- [ ] Create automated tests for product extraction
- [ ] Add session refresh mechanism (when access token expires but refresh token valid)

---

## Resources & References

### Documentation
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Extension APIs](https://developer.chrome.com/docs/extensions/reference/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [JSON-LD Schema.org](https://schema.org/)

### Related Files
- `README.md` - User-facing installation and usage guide
- `TESTING.md` - Testing procedures and expected behavior
- `manifest.json` - Extension configuration
- `content.js` - Main extension logic (runs on product pages)
- `background.js` - Service worker (handles permissions and tab operations)

---

## 2024-12-21: Item Submission Fix

### Milestone: Working Item Submission to Database

**Goal:** Fix 400 Bad Request error when submitting items to Supabase.

### Problems & Solutions

#### Problem: 400 Bad Request on Item Submission
**Symptom:** When clicking "הוסף לרשימה" (Add to Registry), got 400 error:
```
POST https://wopsrjfdaovlyibivijl.supabase.co/rest/v1/items 400 (Bad Request)
❌ Error adding item: Error: Failed to add item to registry
```

**Root Cause:**
Data structure mismatch between what we were sending and what the database schema expects.

**Issues Found:**
1. ❌ Sending `open_to_secondhand` field that doesn't exist in database
2. ❌ Missing `quantity_received` field (required, not nullable)
3. ❌ Missing other fields that might not have database defaults

**Investigation:**
Compared submitted data with Item interface in `nesty-web/src/types/index.ts`:

```typescript
// Database schema (Item interface)
export interface Item {
  id: string
  registry_id: string
  name: string
  price: number
  image_url: string | null
  original_url: string | null
  store_name: string
  category: ItemCategory
  quantity: number
  quantity_received: number  // ❌ We were missing this!
  is_most_wanted: boolean
  is_private: boolean
  notes: string | null
  cheaper_alternative_url: string | null
  cheaper_alternative_price: number | null
  cheaper_alternative_store: string | null
  price_alert_sent: boolean
  enable_chip_in: boolean
  chip_in_goal: number | null
  created_at: string
  updated_at: string
}
```

**What we were sending (WRONG):**
```javascript
{
  name: 'בקבוק נטורל ריספונס',
  price: 90.9,
  quantity: 1,
  category: 'general',
  notes: '',
  is_most_wanted: false,
  is_private: false,
  open_to_secondhand: false,  // ❌ Field doesn't exist!
  image_url: imageUrl,
  original_url: window.location.href,
  store_name: window.location.hostname,
  registry_id: userRegistry.id
  // ❌ Missing quantity_received and other fields
}
```

**Solution:**
Updated formData to match exact database schema:

```javascript
const formData = {
  registry_id: userRegistry.id,
  name: document.getElementById('nesty-title').value,
  price: parseFloat(document.getElementById('nesty-price').value) || 0,
  image_url: imageUrl || null,
  original_url: window.location.href,
  store_name: window.location.hostname,
  category: document.getElementById('nesty-category').value || 'strollers',
  quantity: quantity,
  quantity_received: 0,  // ✅ Added required field
  is_most_wanted: isMostWanted,
  is_private: isPrivate,
  notes: document.getElementById('nesty-notes').value || null,
  // ✅ Added all remaining fields with appropriate defaults
  cheaper_alternative_url: null,
  cheaper_alternative_price: null,
  cheaper_alternative_store: null,
  price_alert_sent: false,
  enable_chip_in: false,
  chip_in_goal: null
};
```

**Why This Works:**
- All required fields are now present
- Field names match database columns exactly
- Data types match (string, number, boolean, null)
- No extra fields that don't exist in schema
- Nullable fields properly set to null (not empty string)

**Lesson Learned:**
- Always check the database schema/TypeScript interface FIRST before creating API payloads
- Supabase 400 errors usually mean schema mismatch
- Use TypeScript interfaces as source of truth for data structure
- Test with actual database insertion early in development
- Don't assume field names - verify against backend code

**Debugging Addition:**
Added console logs to verify button attachment and clicks:
```javascript
const submitButton = document.getElementById('nesty-submit');
console.log('🔘 Submit button found:', submitButton ? 'Yes' : 'No');

submitButton.addEventListener('click', async () => {
  console.log('🖱️ Submit button clicked!');
  // ... rest of handler
});
```

**Files Modified:**
- `content.js` - Updated formData structure and added debugging logs

**Testing Results:**
- ✅ Item submitted successfully to Supabase
- ✅ Item appears in dashboard with all correct data
- ✅ Image, price, name, category all correct
- ✅ Toggles (most wanted, private) work
- ✅ Success message displays: "נוסף! ✓"
- ✅ Modal closes after 1.5 seconds

---

### Commits
- `[pending]` - Fix item submission data structure and add debugging

---

## Change Log

### Version 1.0.0 (2024-12-21)
- ✅ Initial product extraction with ProductGroup support
- ✅ Complete Hebrew UI with RTL support
- ✅ Full authentication integration
- ✅ Session caching with chrome.storage
- ✅ Registry fetching from Supabase
- ✅ Item submission to database (FIXED)
- ✅ Error handling and user feedback
- ✅ Debugging logs for troubleshooting

---

**Last Updated:** 2024-12-21
**Maintainer:** Development Team
**Status:** Active Development

---

## Update Instructions

**When to Update This Document:**
1. ✅ After solving a major technical issue
2. ✅ After implementing a new feature
3. ✅ After discovering a bug and fixing it
4. ✅ After making architectural decisions
5. ✅ When learning something important about the codebase
6. ✅ After user testing reveals issues

**What to Include:**
- **Problem:** Clear description of what wasn't working
- **Symptoms:** How the problem manifested (error messages, behavior)
- **Root Cause:** Why the problem occurred
- **Solution:** How it was fixed (with code examples)
- **Lesson Learned:** Key takeaway to prevent future issues
- **Files Modified:** Which files were changed

**Format:**
Use the existing section structure. Add new entries chronologically. Use clear headings and code blocks for readability.
