# Nesty - Product Scraper Extension

## Final Version - Complete Integration

This extension combines **working product extraction** with **full Nesty authentication and registry integration**.

## Features

✅ **Authentication** - Automatically checks if user is logged in to Nesty (localhost:5173)
✅ **Login Prompt** - Shows Hebrew login modal if user is not authenticated
✅ **Accurate Product Detection** - Extracts data from Product and ProductGroup JSON-LD schemas
✅ **Complete Form UI** - Full Hebrew interface with RTL support
✅ **Registry Integration** - Fetches user's registry from Supabase automatically
✅ **Category Selection** - 10 Hebrew categories for proper organization
✅ **Preferences** - Most wanted (הכי רציתי), Private (פרטי), Open to secondhand (פתוח למשומש) toggles
✅ **Direct Save** - Adds items directly to your Nesty registry database via Supabase API

## Installation

1. Open Chrome/Edge and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `extension/final-version` folder
5. The extension icon will appear in your toolbar!

## How to Use

### Prerequisites
- You must be logged in to Nesty at http://localhost:5173
- You must have created a registry in your Nesty account
- **Keep the Nesty tab (localhost:5173) open** while using the extension

### Steps
1. **Log in to Nesty** at http://localhost:5173 (keep this tab open)
2. **Open a new tab** and navigate to any product page (e.g., https://www.shilav.co.il/collections/easy-to-wear/products/מכנסיים-ארוכים-49)
3. **Click the extension icon** in your browser toolbar
4. The extension will:
   - Detect your session from the open Nesty tab
   - Extract product data from the current page
   - Show the Hebrew product form
5. **Fill in the form:**
   - Product name (pre-filled)
   - Price (pre-filled)
   - Category (select from dropdown)
   - Quantity (use +/- buttons)
   - Preferences (toggle switches)
   - Notes (optional)
6. **Click "הוסף לרשימה"** (Add to Registry)
7. Item is saved to your Nesty registry!

### How Authentication Works
The extension uses a smart session detection system:
1. **First time:** Reads your Supabase session from the open localhost:5173 tab
2. **Caches it:** Saves the session to chrome.storage for faster access
3. **Reuses it:** On subsequent uses, reads from cache (no need to query the tab again)
4. **Auto-refreshes:** If session expires, fetches a new one from localhost:5173

## Configuration

The extension is configured for local development by default. To switch to production:

1. Open `config.js`
2. Change `const ENV = 'development'` to `const ENV = 'production'`
3. Update production URL in config if needed

## Architecture

- **config.js** - Environment configuration (localhost vs production)
- **background.js** - Service worker that injects content script on icon click
- **page-script.js** - Injected into page to read Supabase session from localStorage
- **content.js** - Main script with auth, extraction, UI, and API integration
- **popup-styles.css** - Hebrew RTL styling

## Testing

Test on these Shopify pages:
- ✅ https://www.shilav.co.il/collections/easy-to-wear/products/מכנסיים-ארוכים-49 (ProductGroup with variants)
- ✅ Any other Shopify store with JSON-LD structured data

Expected behavior:
- Correctly extracts 59.90 ILS (not 159.90)
- Shows product name in Hebrew
- Displays product image
- Fetches your registry
- Saves to Supabase items table

Made with ❤️ for Nesty
