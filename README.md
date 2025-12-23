# Nesty - Baby Registry Platform

A modern baby registry platform with Chrome extension for easy product addition.

## Quick Start

### 1. Run the Development Server

```bash
cd nesty-web
npm install
npm run dev
```

The app will run on `http://localhost:5173`

### 2. Install the Chrome Extension

1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select: `extension/nesty-local`

### 3. Add Products to Your Registry

1. Navigate to any e-commerce product page
2. Click the "Add to Nesty (Local Dev)" extension icon
3. Edit product details in the popup
4. Click "Add to Babylist" (sends to your local Nesty server)

## Features

- 🎁 **Chrome Extension**: Beautiful popup UI for adding products from any website
- 🏠 **Dashboard**: Manage your registry items
- 👶 **Checklist**: Baby preparation tasks
- 🎉 **Gifts**: Track purchased items
- ⚙️ **Settings**: Manage your profile and preferences

## Extension Features

- Product image carousel
- Editable fields: Title, Price, Quantity, Category
- "Most wanted", "Private", "Open to secondhand" toggles
- Notes for friends and family
- Works with any e-commerce site that has structured data (JSON-LD, Shopify, etc.)

## Links

- **Chrome Web Store**: https://chromewebstore.google.com/detail/add-to-nesty-button/mkkadfpabelceniomobeaejhlfcihkll
- **Production Site**: https://ppltok.github.io/Nesty
- **Repository**: https://github.com/ppltok/Nesty

## Project Structure

```
Nesty/
├── nesty-web/              # React + Vite frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   └── lib/            # Utilities (Supabase, etc.)
│   └── vite.config.ts      # Vite config with mock API
├── extension/
│   ├── nesty-local/        # Working extension (use this one!)
│   └── local-dev/          # Alternative simple extension
├── supabase/               # Supabase config and migrations
└── Documents/              # Project documentation
```

## Documentation

- 📖 [Getting Started Guide](NESTY_GETTING_STARTED.md)
- 🔌 [Extension Setup Guide](EXTENSION_SETUP_GUIDE.md)
- 📋 [Product Requirements](NESTY_PRD.md)
- 🗄️ [Database Schema](NESTY_DATABASE_SCHEMA.md)
- 📝 [Changelog](CHANGELOG.md)

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Extension**: Chrome Extension Manifest V3
- **Deployment**: GitHub Pages (frontend)

## Development

### Mock API Endpoints

The Vite dev server provides mock API endpoints for testing:

- `GET /api/scrape?url={url}` - Mock scraping endpoint
- `POST /api/products` - Save product data (in-memory)
- `GET /api/products` - Get all saved products

### Authentication

Sign in with Supabase Auth to access protected features.

## Current Branch: bugfix/local-fixes

This branch includes:
- ✅ Working Chrome extension integration
- ✅ Fixed auth loading issues
- ✅ Extension → Dashboard → AddItemModal flow
- ✅ Mock API for local testing

**Recommendation**: Merge to main - this is a stable, working version!

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Create a pull request

## License

Private project - All rights reserved
