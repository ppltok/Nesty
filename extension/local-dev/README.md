# Nesty Local Development Extension

This extension extracts product data from e-commerce sites and opens your Nesty app to add the product to your registry.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this directory: `extension/local-dev`

## Usage

1. Make sure your Vite dev server is running on `http://localhost:5173`
2. Make sure you're signed in to your Nesty app
3. Navigate to any e-commerce product page
4. Click the Nesty extension icon in your browser toolbar
5. The extension will extract product data and show a preview
6. Click "Open Nesty App" to open your dashboard
7. The AddItemModal will open automatically with the product data pre-filled
8. Edit the product details as needed and save to your registry

## Features

- Extracts product data from JSON-LD, Shopify meta tags, and ShopifyAnalytics
- Automatically opens your Nesty dashboard
- Pre-fills the AddItemModal with extracted data:
  - Product name
  - Price
  - Category
  - Brand (in notes)
  - Store name (from URL)
  - Product URL
- Fully editable before saving to your registry

## API Endpoints Expected

The extension expects these endpoints on your local server:

- `GET /api/scrape?url={productUrl}` - Scrape a product URL
- `POST /api/products` - Save product data

## Testing

Try visiting:
- Amazon product pages
- Shopify stores
- Any site with JSON-LD Product schema
