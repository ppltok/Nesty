# Nesty Extension + Local Server Setup Guide

Your extension and local development environment are now ready to test!

## Current Status

- ✅ Vite dev server running on `http://localhost:5173`
- ✅ Mock API endpoints configured
- ✅ Chrome extension ready to load

## Step 1: Load the Extension in Chrome

1. Open Chrome and navigate to: `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Navigate to and select: `C:\Users\User\Desktop\Projects\Nesty\Nesty\extension\local-dev`
5. The extension should now appear in your extensions list

## Step 2: Test the Extension

1. Navigate to any e-commerce product page (Amazon, Shopify store, etc.)
2. Click the **Nesty extension icon** in your Chrome toolbar
3. A modal will appear showing the extracted product data
4. You can:
   - **Copy JSON**: Copy the product data to clipboard
   - **Send to API**: Send the data to your local server (localhost:5173/api/products)
   - **Close**: Close the modal

## Available Mock API Endpoints

Your local Vite dev server now has these endpoints:

### GET /api/scrape
Scrape a product URL (mock endpoint for now)
```bash
http://localhost:5173/api/scrape?url=https://example.com/product
```

### POST /api/products
Save extracted product data
```json
{
  "url": "https://example.com/product",
  "productData": {
    "name": "Product Name",
    "category": "Category",
    "price": "29.99",
    "priceCurrency": "USD",
    "brand": "Brand Name",
    "imageUrls": ["https://..."]
  }
}
```

### GET /api/products
Get all saved products
```bash
http://localhost:5173/api/products
```

## How It Works

1. **Extension** (`extension/local-dev/`):
   - Runs as a Chrome extension
   - Extracts product data from web pages
   - Communicates with your local server

2. **Local Server** (Vite on port 5173):
   - Serves your React app
   - Hosts mock API endpoints
   - Stores scraped products in memory

3. **Data Flow**:
   ```
   Product Page → Extension → Extract Data → Display Modal → Send to API → Local Server
   ```

## Testing Different Product Pages

Try the extension on:
- **Amazon**: https://www.amazon.com (any product page)
- **Shopify Stores**: e.g., https://www.allbirds.com/products/...
- **Any site with JSON-LD Product schema**

## Viewing API Logs

All API requests are logged in your terminal where the Vite server is running. You'll see:
```
[Mock API] Product saved: {...}
[Mock API] Total products: 1
```

## Next Steps

### 1. Connect to Real Backend
Replace the mock API in `vite.config.ts` with your actual backend:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://your-real-api.com',
      changeOrigin: true,
    }
  }
}
```

### 2. Implement Real Scraping
The extension currently extracts data client-side. For server-side scraping:
- Create a Supabase Edge Function
- Use the Babylist API
- Implement your own scraping service

### 3. Add More Features
- User authentication
- Save to database
- Product comparison
- Price tracking
- Registry creation

## Troubleshooting

### Extension not showing data
- Check browser console (F12) for errors
- Make sure you're on a product page with JSON-LD data
- Verify the page has `<script type="application/ld+json">` tags

### API requests failing
- Ensure Vite dev server is running on port 5173
- Check CORS is enabled in `vite.config.ts`
- Look for errors in terminal where Vite is running

### Extension won't load
- Make sure Developer mode is enabled
- Check for errors in `chrome://extensions/`
- Verify all files are present in `extension/local-dev/`

## Files Created

```
extension/local-dev/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js            # Content script for data extraction
├── icon.png             # Extension icon
└── README.md            # Extension documentation

nesty-web/
└── vite.config.ts        # Updated with mock API plugin
```

## Stop the Server

When you're done testing:
```bash
# Press Ctrl+C in the terminal where Vite is running
# Or use the task manager
```

Happy testing! 🎉
