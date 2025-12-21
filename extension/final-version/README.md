# Nesty - Product Scraper Extension

## Final Version - Complete Integration

This extension combines **working product extraction** with **full Nesty authentication and registry integration**.

## Features

✅ **Authentication** - Checks if user is logged in to Nesty (localhost:5173)
✅ **Accurate Product Detection** - Extracts data from Product and ProductGroup JSON-LD schemas
✅ **Complete Form UI** - Full Hebrew interface matching the Nesty design
✅ **Registry Integration** - Fetches user's registry from Supabase
✅ **Category Selection** - 10 Hebrew categories for proper organization
✅ **Preferences** - Most wanted, Private, Open to secondhand toggles
✅ **Direct Save** - Adds items directly to your Nesty registry database

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

### Steps
1. **Log in to Nesty** at http://localhost:5173 (if not already logged in)
2. **Navigate to any product page** (e.g., https://www.shilav.co.il/collections/easy-to-wear/products/מכנסיים-ארוכים-49)
3. **Click the extension icon** in your browser toolbar
4. **Fill in the form:**
   - Product name (pre-filled)
   - Price (pre-filled)
   - Category (required)
   - Quantity (default: 1)
   - Preferences (optional)
   - Notes (optional)
5. **Click "הוסף לרשימה"** (Add to Registry)
6. Item is saved to your Nesty registry!

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
