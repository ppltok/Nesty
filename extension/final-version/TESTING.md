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
  🚀 Nesty Extension - Loading...
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
- Should show login prompt modal

### Step 3: Expected Behavior

**If Logged In:**
1. Extension fetches your registry
2. Extracts product data (name, price 59.90, image)
3. Shows form with:
   - Product image
   - Title: "מכנסיים ארוכים"
   - Price: 59.90
   - Category dropdown
   - Quantity selector
   - Toggles
   - Notes field

**If Not Logged In:**
1. Shows modal with "נדרשת התחברות" (Login required)
2. Button to open login page

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
- Check localStorage in DevTools → Application → Local Storage
- Look for keys containing "sb-" and "-auth-token"

### Problem: Form doesn't submit
- Check console for API errors
- Verify Supabase credentials in config
- Make sure you have a registry created in Nesty

## Success Criteria

✅ Extension loads without errors
✅ Detects login status correctly
✅ Shows appropriate UI (login prompt or product form)
✅ Extracts correct product data (59.90 ILS, not 159.90)
✅ Displays product image
✅ Form submits to Supabase successfully
✅ Item appears in Nesty dashboard
