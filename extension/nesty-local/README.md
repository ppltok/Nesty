# Nesty Local Development Extension

This is a modified version of the Babylist extension that works with your local Nesty server.

## Features

- **Same UI as Babylist**: Product image carousel, editable fields (Title, Price, Quantity, Category), toggles, and notes
- **Local Server Integration**: Sends data to `localhost:5173` instead of Babylist servers
- **API Interception**: Automatically redirects Babylist API calls to your local Nesty API

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select this directory: `extension/nesty-local`

## Usage

1. Make sure your Vite dev server is running on `http://localhost:5173`
2. Navigate to any e-commerce product page
3. Click the **"Add to Nesty (Local Dev)"** extension icon
4. The Babylist popup will appear with:
   - Product image(s) with carousel navigation
   - Title (editable)
   - Price (editable)
   - Quantity selector
   - Category dropdown
   - "Most wanted", "Private", "Open to secondhand" toggles
   - Notes text area
5. Edit the product details as needed
6. Click **"Add to Babylist"** (it will actually send to your local Nesty server)

## How It Works

1. The extension uses the original Babylist UI and functionality
2. The `api-interceptor.js` script intercepts all API calls to Babylist
3. Intercepted calls are redirected to `http://localhost:5173/api/products`
4. Your local Nesty server receives and processes the data

## Troubleshooting

### Extension not loading
- Make sure you selected the `extension/nesty-local` directory
- Check for errors in `chrome://extensions/`

### Popup not appearing
- Make sure you're on a product page with structured data
- Check browser console (F12) for errors

### Data not saving
- Ensure Vite dev server is running on port 5173
- Check the browser console for API errors
- Verify the API endpoint in `vite.config.ts` is configured

## API Endpoint

The extension sends POST requests to:
```
http://localhost:5173/api/products
```

With payload:
```json
{
  "url": "https://product-page-url.com",
  "productData": {
    // Babylist product data structure
  }
}
```
