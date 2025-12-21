# Extension Testing Guide

## Setup

1. **Reload Extension:**
   - Go to `chrome://extensions/`
   - Find "Nesty - Product Scraper"
   - Click the refresh icon (or remove and re-add)

2. **Open Test Page:**
   - Go to: https://www.shilav.co.il/collections/easy-to-wear/products/מכנסיים-ארוכים-49

3. **Open DevTools:**
   - Press F12
   - Go to Console tab
   - Clear console (Ctrl+L)

## Testing Steps

### Step 1: Click Extension Icon
- Click the extension icon in your toolbar
- **Expected Console Output:**
  ```
  🚀 Nesty Extension - Starting...
  ✅ First load, continuing...
  📍 Current URL: https://www.shilav.co.il/...
  💅 Injecting styles...
  🔑 Getting Supabase session...
  🔍 Setting up session listener...
  💉 Injecting page-script.js...
  ✅ Page script loaded
  🔐 Page script executing...
  📦 localStorage keys: [...]
  🔍 Searching for Supabase session in localStorage...
  ```

### Step 2: Check Session Detection

**If you're logged in to Nesty (localhost:5173):**
```
✅ Found Supabase auth key: sb-...
✅ Session parsed successfully, user: your@email.com
📤 Posting message to content script: Session found
📨 Received message: NESTY_SUPABASE_SESSION
✅ Got session message: Session exists
📦 Session data: ✅ Found
✅ User authenticated: your@email.com
📥 Fetching user registry...
✅ Registry found: [Your Registry Title]
🔍 Extracting product data...
✅ Product data extracted, showing form
```

**If you're NOT logged in:**
```
❌ No Supabase session found in localStorage
📤 Posting message to content script: No session
📨 Received message: NESTY_SUPABASE_SESSION
✅ Got session message: No session
📦 Session data: ❌ Not found
❌ User not authenticated
```
- Should show Hebrew login prompt modal with lock icon (🔒)

### Step 3: Expected Behavior

**If Logged In:**
1. Extension fetches your registry from Supabase
2. Extracts product data (name, price 59.90, image)
3. Shows Hebrew form with:
   - Product image (160x160, left side)
   - שם המוצר (Product name): "מכנסיים ארוכים"
   - מחיר (Price): 59.90
   - כמות (Quantity): 1 with +/- buttons
   - קטגוריה (Category): 10 Hebrew categories dropdown
   - Three toggles: הכי רציתי (Most wanted), פרטי (Private), פתוח למשומש (Open to secondhand)
   - הערות (Notes): Text area for notes
   - הוסף לרשימה (Add to registry) button

**If Not Logged In:**
1. Shows Hebrew modal with:
   - Lock icon (🔒)
   - Header: "נדרשת התחברות" (Login required)
   - Message: "כדי להוסיף מוצרים לרשימה שלך, עליך להתחבר ל-Nesty"
   - "התחבר ל-Nesty" button (opens localhost:5173 in new tab)
   - "סגור" button (closes modal)

## Troubleshooting

### Problem: Nothing happens when clicking icon
- Check console for errors
- Look for "Extension already loaded" - means it was injected multiple times (should be prevented now)
- Check if content.js is being injected (look for 🚀 emoji in console)

### Problem: "NESTY_CONFIG already declared"
- This should be fixed with IIFE wrapper
- If still happening, clear browser cache and reload extension

### Problem: Session not found but you're logged in
- Make sure you're logged in at http://localhost:5173 (not 127.0.0.1)
- Check localStorage in DevTools → Application → Local Storage → http://localhost:5173
- Look for keys containing "sb-" and "-auth-token"
- Try logging out and logging back in to Nesty

### Problem: Form doesn't submit
- Check console for API errors
- Verify Supabase credentials in content.js (NESTY_CONFIG)
- Make sure you have a registry created in Nesty
- Check that the items table exists in Supabase
- Verify you have the correct permissions in Supabase RLS policies

## Success Criteria

✅ Extension loads without errors
✅ Detects login status correctly (checks Supabase session in localStorage)
✅ Shows appropriate UI:
   - If logged in: Hebrew product form with all fields
   - If not logged in: Hebrew login prompt modal
✅ Extracts correct product data (59.90 ILS, not 159.90)
✅ Displays product image (160x160)
✅ All form controls work (quantity buttons, toggles, inputs)
✅ Form submits to Supabase items table successfully
✅ Item appears in Nesty dashboard with all details
✅ Success feedback shown: "נוסף! ✓" (Added!)
✅ Modal closes automatically after successful submission
