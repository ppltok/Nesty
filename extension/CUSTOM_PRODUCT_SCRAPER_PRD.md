# Product Requirements Document (PRD)
## Custom Product Scraper Chrome Extension

**Version:** 1.0.0
**Document Date:** December 10, 2024
**Purpose:** Educational/Personal Learning Project

---

## 1. EXECUTIVE SUMMARY

### 1.1 Product Overview
A Chrome browser extension that leverages Babylist's scraper directives API to extract product information from any e-commerce website, displays it in an editable modal interface, and exports the data as JSON to a new browser tab.

### 1.2 Core Value Proposition
- **Learn** how directive-based web scraping works
- **Extract** product data from any e-commerce site using Babylist's proven scraping engine
- **Export** structured product data as JSON for any purpose (testing, analysis, personal projects)
- **No Backend Required** - Pure client-side extension with JSON output

### 1.3 Key Difference from Babylist Extension
Instead of saving to a Babylist registry, this extension:
- Opens a new tab with formatted JSON containing all scraped and user-entered data
- Allows manual editing of all fields before export
- Serves as a learning tool and data extraction utility

---

## 2. PRODUCT GOALS

### 2.1 Primary Goals
1. Successfully scrape products from 100+ e-commerce sites using Babylist's directives
2. Provide intuitive UI for reviewing and editing product data
3. Export clean, structured JSON for downstream use
4. Serve as educational tool for understanding web scraping

### 2.2 Success Criteria
- Scraping success rate: >90% on major retailers
- Modal load time: <2 seconds
- JSON output validates against schema
- Zero crashes or errors on supported sites

---

## 3. USER PERSONAS

### 3.1 Primary Persona: Learning Developer
- **Age:** 20-35
- **Goal:** Learn Chrome extension development and web scraping
- **Use Case:** Building portfolio project, understanding scraping patterns
- **Needs:** Clear code examples, well-documented architecture

### 3.2 Secondary Persona: Data Collector
- **Age:** 25-40
- **Goal:** Extract product data for price comparison, research, or personal tracking
- **Use Case:** Collecting product information for personal use
- **Needs:** Reliable scraping, easy export, editable fields

---

## 4. FUNCTIONAL REQUIREMENTS

### 4.1 Core Features

#### 4.1.1 Extension Activation
**Requirement:** Extension activates when user clicks browser toolbar icon

**Behavior:**
- Single click on extension icon triggers scraping
- Works on any webpage (focused on e-commerce sites)
- Visual feedback during scraping process
- Error message if not on a product page

**Technical Implementation:**
- Chrome Extension Manifest V3
- Service worker handles `chrome.action.onClicked`
- Inject content script on click

---

#### 4.1.2 Product Data Scraping via Babylist API

**Requirement:** Use Babylist's scraper directives API to extract product information

**API Integration:**
```
GET https://www.babylist.com/api/v3/scraper_directives?url={current_page_url}

Response:
{
  "directives": {
    "title": { "type": "GetText", "selector": "h1.product-title" },
    "price": { "type": "GetText", "selector": ".price" },
    "image_urls": { "type": "GetAttributeList", "selector": "img.product", "attribute": "src" },
    "brand": { "type": "GetText", "selector": ".brand" },
    "description": { "type": "GetText", "selector": ".description" }
  }
}
```

**Scraping Flow:**
1. User clicks extension icon
2. Extension gets current page URL
3. Calls Babylist API with URL parameter
4. Receives scraping directives
5. Executes directives against page DOM
6. Extracts product data
7. Displays in modal

**Fallback Strategy (if directives API fails):**
1. Parse JSON-LD structured data (`<script type="application/ld+json">`)
2. Extract OpenGraph meta tags
3. Use common CSS selectors (`.price`, `h1`, `.product-image`)
4. Allow manual entry if all automated methods fail

**Data Fields to Extract:**
| Field | Source | Required | Fallback |
|-------|--------|----------|----------|
| Title | Directive / `<title>` | Yes | Page title |
| Price | Directive / JSON-LD | Yes | Manual entry |
| Images | Directive / og:image | Yes | First large image |
| Brand | Directive / meta | No | Empty string |
| Description | Directive / meta description | No | Empty string |
| URL | window.location.href | Yes | Always available |
| Category | User input | No | "General" default |

---

#### 4.1.3 Modal User Interface

**Requirement:** Display modal matching the Babylist UI design with editable fields

**Modal Components (Based on Screenshot):**

```
┌─────────────────────────────────────────────────┐
│  Add to Babylist                            [X] │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐          Title               │
│  │             │   ┌─────────────────────────┐ │
│  │   Product   │   │ [Editable Title Field]  │ │
│  │    Image    │   └─────────────────────────┘ │
│  │   Gallery   │                               │
│  │   [< 1 >]   │   Price          Quantity     │
│  └─────────────┘   ┌──────┐      ┌──────┐     │
│                     │$159.90│      │  1   │     │
│  Selected Image     └──────┘      └──────┘     │
│  ●○○○○○○○○○                                    │
│                     Category                   │
│                     ┌─────────────────────┐    │
│                     │ General        [v]  │    │
│                     └─────────────────────┘    │
│                                                │
│  Note for friends and family                  │
│  ┌─────────────────────────────────────────┐  │
│  │ [Optional notes text area]              │  │
│  │                                         │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│  [  Cancel  ]  [ Export JSON ]                │
└─────────────────────────────────────────────────┘
```

**Detailed UI Specifications:**

**A. Header**
- Title: "Add to Babylist" (keep for consistency)
- Close button (X) in top-right
- Clean, minimal design

**B. Product Image Section (Left Side)**
- Primary image display (400x400px)
- Image carousel if multiple images available
- Navigation arrows: `<` and `>`
- Pagination dots below image (●○○○○)
- "Selected Image" label

**C. Product Information Section (Right Side)**

**1. Title Field**
- Label: "Title"
- Input: Text field, pre-filled with scraped title
- Fully editable
- Max length: 200 characters

**2. Price Field**
- Label: "Price"
- Input: Text field with currency formatting
- Pre-filled with scraped price
- Editable (supports different formats: $99.99, 99.99, etc.)
- Validation: Must be numeric or valid currency format

**3. Quantity Field**
- Label: "Quantity"
- Input: Number input
- Default: 1
- Range: 1-99
- Increment/decrement buttons (optional)

**4. Category Dropdown**
- Label: "Category"
- Input: Dropdown select
- Default: "General"
- Options:
  - General
  - Nursery
  - Feeding
  - Clothing
  - Toys
  - Gear & Furniture
  - Bath & Potty
  - Health & Safety
  - Books
  - Other
- User can change category

**5. Notes Text Area**
- Label: "Note for friends and family"
- Placeholder: "Add an optional note here to help your gift-givers. For example, what size or color would you like?"
- Multi-line text area
- Optional field
- Max length: 500 characters

**D. Action Buttons (Bottom)**
- **Cancel Button**
  - Style: White background, gray border
  - Action: Close modal without exporting
  - Position: Left side

- **Export JSON Button**
  - Style: Purple/magenta background (#7B3987 or similar)
  - Text: "Export JSON" (instead of "Add to Babylist")
  - Action: Open new tab with formatted JSON
  - Position: Right side
  - Full width on mobile

**Modal Design Specifications:**
- **Position:** Fixed center of viewport
- **Dimensions:** 900px width × auto height (responsive)
- **Z-Index:** 2147483647 (maximum)
- **Backdrop:** Semi-transparent dark overlay (rgba(0,0,0,0.6))
- **Border Radius:** 12px
- **Shadow:** 0 10px 40px rgba(0,0,0,0.3)
- **Font Family:** System default or Maax (if available)
- **Animation:** Fade in + scale (0.95 to 1.0, 250ms ease-out)

**Responsive Behavior:**
- Desktop (>1024px): Two-column layout (image left, fields right)
- Tablet (768-1023px): Single column, image on top
- Mobile (<768px): Full-width modal, 95vw

---

#### 4.1.4 JSON Export Feature

**Requirement:** When user clicks "Export JSON", open new browser tab with formatted JSON

**JSON Output Structure:**

```json
{
  "metadata": {
    "exported_at": "2024-12-10T17:03:52.000Z",
    "extension_version": "1.0.0",
    "source_url": "https://www.shilav.co.il/product/...",
    "domain": "shilav.co.il"
  },
  "product": {
    "title": "חולצה אפורה ארוכה עם הדפס - Shilav",
    "price": "$159.90",
    "price_numeric": 159.90,
    "currency": "USD",
    "quantity": 1,
    "category": "General",
    "brand": "",
    "description": "",
    "notes": ""
  },
  "images": [
    {
      "url": "https://www.shilav.co.il/.../image1.jpg",
      "is_primary": true,
      "index": 0
    },
    {
      "url": "https://www.shilav.co.il/.../image2.jpg",
      "is_primary": false,
      "index": 1
    }
  ],
  "scraping_metadata": {
    "method": "babylist_api",
    "directives_available": true,
    "fallback_used": false,
    "fields_scraped": {
      "title": true,
      "price": true,
      "images": true,
      "brand": false,
      "description": false
    }
  }
}
```

**JSON Output Display:**
- Open in new browser tab
- Use `data:` URI or `blob:` URL
- Pre-formatted with indentation (2 spaces)
- Include syntax highlighting (optional enhancement)
- Allow copy-to-clipboard functionality
- Download as .json file button (optional)

**Implementation:**
```javascript
function exportJSON(productData) {
  const json = JSON.stringify(productData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  chrome.tabs.create({ url: url });
}
```

---

### 4.2 Error Handling

#### 4.2.1 Scraping Errors

**Error Scenarios:**

1. **No Directives Available (API returns empty/404)**
   - Show warning: "Using fallback scraping method"
   - Attempt JSON-LD and OpenGraph extraction
   - Allow manual entry for missing fields
   - Log error in console for debugging

2. **Selector Not Found**
   - Mark field as "Not found"
   - Show placeholder text: "[Could not detect - please enter manually]"
   - Field remains editable

3. **Network Error (API unreachable)**
   - Display error message: "Could not connect to scraping service. Using basic extraction."
   - Fall back to generic scraping
   - Retry option available

4. **Not a Product Page**
   - Detect if page is likely not a product (no price, no images)
   - Show message: "This doesn't appear to be a product page. Continue anyway?"
   - Allow user to proceed with manual entry

**User-Facing Error Messages:**
- Error banner at top of modal (yellow/orange background)
- Clear explanation of what went wrong
- Actionable next steps ("Try again", "Enter manually", "Close")

#### 4.2.2 Validation Errors

**Before Export:**
1. **Required Fields Check:**
   - Title: Must not be empty
   - Price: Must be valid number or currency format
   - Images: At least one image URL required

2. **Validation Messages:**
   - "Please enter a product title"
   - "Please enter a valid price (e.g., 99.99 or $99.99)"
   - "At least one image is required"

3. **Export Disabled Until Valid:**
   - "Export JSON" button disabled (grayed out) if validation fails
   - Show validation errors above button

---

### 4.3 Performance Requirements

| Metric | Target | Maximum |
|--------|--------|---------|
| Extension icon click → Modal open | <1 second | 2 seconds |
| Babylist API response time | <500ms | 2 seconds |
| Scraping execution | <300ms | 1 second |
| Modal render time | <200ms | 500ms |
| JSON export (new tab open) | <100ms | 300ms |
| Extension bundle size | <500KB | 1MB |
| Memory footprint | <30MB | 60MB |

**Optimization Strategies:**
- Cache Babylist directives for same domain (15 min TTL)
- Lazy load images in modal
- Minify JavaScript bundles
- Use lightweight scraping engine (no heavy libraries)

---

## 5. TECHNICAL ARCHITECTURE

### 5.1 Technology Stack

**Chrome Extension:**
- **Manifest Version:** 3
- **Language:** JavaScript (ES6+) or TypeScript
- **UI Framework:**
  - **Option 1:** Vanilla JavaScript + HTML/CSS (lightweight)
  - **Option 2:** React (if learning React in extensions)
- **Build Tool:** Webpack, Vite, or Parcel
- **Package Manager:** npm or yarn

**No Backend Required:**
- All processing happens client-side
- JSON export via blob URLs or data URIs
- No database or server storage

---

### 5.2 File Structure

```
custom-product-scraper/
├── manifest.json              # Extension configuration
├── package.json               # Dependencies (if any)
├── webpack.config.js          # Build config (optional)
├── src/
│   ├── background/
│   │   └── serviceWorker.js   # Background service worker
│   ├── content/
│   │   ├── contentScript.js   # Main content script
│   │   ├── modal.html         # Modal template (if not using React)
│   │   ├── modal.css          # Modal styles
│   │   └── modal.js           # Modal logic
│   ├── scraper/
│   │   ├── babylistAPI.js     # Babylist API client
│   │   ├── directiveEngine.js # Execute scraping directives
│   │   ├── fallbackScraper.js # JSON-LD / OpenGraph fallback
│   │   └── dataExtractor.js   # Unified scraping interface
│   ├── exporter/
│   │   └── jsonExporter.js    # JSON formatting and export
│   └── utils/
│       ├── validation.js      # Field validation
│       ├── formatters.js      # Price/currency formatting
│       └── dom.js             # DOM helpers
├── assets/
│   ├── icons/                 # Extension icons (16, 48, 128px)
│   └── styles/                # Global CSS
└── dist/                      # Build output
```

---

### 5.3 Component Breakdown

#### 5.3.1 manifest.json

```json
{
  "manifest_version": 3,
  "name": "Product Data Scraper",
  "version": "1.0.0",
  "description": "Extract product data from any e-commerce site using Babylist's scraping engine. Exports as JSON.",
  "permissions": [
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "*://*.babylist.com/*",
    "http://*/*",
    "https://*/*"
  ],
  "background": {
    "service_worker": "serviceWorker.js",
    "type": "module"
  },
  "action": {
    "default_icon": {
      "16": "assets/icons/icon-16.png",
      "48": "assets/icons/icon-48.png",
      "128": "assets/icons/icon-128.png"
    },
    "default_title": "Extract Product Data"
  },
  "icons": {
    "16": "assets/icons/icon-16.png",
    "48": "assets/icons/icon-48.png",
    "128": "assets/icons/icon-128.png"
  },
  "web_accessible_resources": [
    {
      "resources": ["modal.html", "modal.css", "assets/*"],
      "matches": ["http://*/*", "https://*/*"]
    }
  ]
}
```

---

#### 5.3.2 Service Worker (background/serviceWorker.js)

**Responsibilities:**
- Listen for extension icon clicks
- Inject content script into active tab
- Handle message passing (minimal, if needed)

**Implementation:**
```javascript
// serviceWorker.js

chrome.action.onClicked.addListener(async (tab) => {
  // Only activate on http/https pages
  if (!tab.url.startsWith('http')) {
    console.warn('Extension only works on web pages');
    return;
  }

  try {
    // Inject content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['contentScript.js']
    });

    // Inject CSS
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['modal.css']
    });

    console.log('Content script injected successfully');
  } catch (error) {
    console.error('Failed to inject content script:', error);
  }
});

// Optional: Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXPORT_JSON') {
    // Open new tab with JSON data
    const json = JSON.stringify(message.data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    chrome.tabs.create({ url: url });
    sendResponse({ success: true });
  }
  return true; // Keep channel open for async response
});
```

---

#### 5.3.3 Content Script (content/contentScript.js)

**Responsibilities:**
- Fetch scraping directives from Babylist API
- Execute scraping on current page
- Render modal UI with scraped data
- Handle user interactions
- Export JSON on button click

**Main Flow:**
```javascript
// contentScript.js

// Prevent multiple injections
if (window.productScraperInjected) {
  console.log('Product scraper already running');
} else {
  window.productScraperInjected = true;
  init();
}

async function init() {
  try {
    // 1. Get current page URL
    const pageUrl = window.location.href;

    // 2. Fetch scraping directives from Babylist API
    const directives = await fetchBabylistDirectives(pageUrl);

    // 3. Execute scraping
    const productData = await scrapeProductData(directives, pageUrl);

    // 4. Show modal with data
    showModal(productData);

  } catch (error) {
    console.error('Scraping failed:', error);
    // Show modal with error state and manual entry option
    showModal(null, error);
  }
}

async function fetchBabylistDirectives(url) {
  const apiUrl = `https://www.babylist.com/api/v3/scraper_directives?url=${encodeURIComponent(url)}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    return data.directives || null;

  } catch (error) {
    console.warn('Babylist API failed, using fallback:', error);
    return null; // Will trigger fallback scraping
  }
}

async function scrapeProductData(directives, url) {
  let data = {};

  if (directives) {
    // Execute Babylist directives
    data = await executeDirectives(directives);
  } else {
    // Fallback: JSON-LD, OpenGraph, common selectors
    data = await fallbackScrape();
  }

  // Add metadata
  data.url = url;
  data.domain = new URL(url).hostname;
  data.scraped_at = new Date().toISOString();

  return data;
}

function showModal(productData, error = null) {
  // Create modal element
  const modal = createModalElement();

  // Populate with data (or show error)
  if (error) {
    populateModalWithError(modal, error);
  } else {
    populateModalWithData(modal, productData);
  }

  // Inject into page
  document.body.appendChild(modal);

  // Setup event listeners
  setupModalEventListeners(modal, productData);
}

// ... additional functions
```

---

#### 5.3.4 Directive Execution Engine (scraper/directiveEngine.js)

**Simplified Directive Executor:**
```javascript
// directiveEngine.js

export async function executeDirectives(directives) {
  const results = {};

  for (const [field, directive] of Object.entries(directives)) {
    try {
      results[field] = await executeDirective(directive);
    } catch (error) {
      console.warn(`Failed to execute directive for ${field}:`, error);
      results[field] = null;
    }
  }

  return results;
}

async function executeDirective(directive) {
  switch (directive.type) {
    case 'GetText':
      return getTextFromSelector(directive.selector);

    case 'GetAttribute':
      return getAttributeFromSelector(directive.selector, directive.attribute);

    case 'GetAttributeList':
      return getAttributeListFromSelector(directive.selector, directive.attribute);

    case 'Chain':
      return executeChain(directive.steps);

    case 'Literal':
      return directive.value;

    // Add other directive types as needed

    default:
      console.warn(`Unknown directive type: ${directive.type}`);
      return null;
  }
}

function getTextFromSelector(selector) {
  const element = document.querySelector(selector);
  return element ? element.textContent.trim() : null;
}

function getAttributeFromSelector(selector, attribute) {
  const element = document.querySelector(selector);
  return element ? element.getAttribute(attribute) : null;
}

function getAttributeListFromSelector(selector, attribute) {
  const elements = document.querySelectorAll(selector);
  return Array.from(elements).map(el => el.getAttribute(attribute)).filter(Boolean);
}

async function executeChain(steps) {
  let result = null;
  for (const step of steps) {
    result = await executeDirective(step);
  }
  return result;
}
```

---

#### 5.3.5 Fallback Scraper (scraper/fallbackScraper.js)

**When Babylist API Fails:**
```javascript
// fallbackScraper.js

export function fallbackScrape() {
  const data = {};

  // 1. Try JSON-LD structured data
  const jsonLd = extractJsonLd();
  if (jsonLd) {
    data.title = jsonLd.name || null;
    data.price = jsonLd.offers?.price || null;
    data.brand = jsonLd.brand?.name || null;
    data.description = jsonLd.description || null;
    data.image_urls = jsonLd.image ? [jsonLd.image] : [];
  }

  // 2. Try OpenGraph meta tags
  if (!data.title) {
    data.title = getMetaContent('og:title') || document.title;
  }
  if (!data.image_urls || data.image_urls.length === 0) {
    const ogImage = getMetaContent('og:image');
    if (ogImage) data.image_urls = [ogImage];
  }
  if (!data.price) {
    data.price = getMetaContent('product:price:amount');
  }

  // 3. Common CSS selectors as last resort
  if (!data.price) {
    data.price = findPriceInPage();
  }
  if (!data.image_urls || data.image_urls.length === 0) {
    data.image_urls = findProductImages();
  }

  return data;
}

function extractJsonLd() {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      if (data['@type'] === 'Product') {
        return data;
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

function getMetaContent(property) {
  const meta = document.querySelector(`meta[property="${property}"]`);
  return meta ? meta.getAttribute('content') : null;
}

function findPriceInPage() {
  const priceSelectors = [
    '.price',
    '[itemprop="price"]',
    '.product-price',
    '#priceblock_ourprice',
    '.a-price .a-offscreen'
  ];

  for (const selector of priceSelectors) {
    const el = document.querySelector(selector);
    if (el) return el.textContent.trim();
  }
  return null;
}

function findProductImages() {
  const images = [];
  const imageSelectors = [
    'img[itemprop="image"]',
    '.product-image img',
    '#landingImage',
    '.main-image img'
  ];

  for (const selector of imageSelectors) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(img => {
      const src = img.getAttribute('src') || img.getAttribute('data-src');
      if (src && !src.includes('placeholder')) {
        images.push(src);
      }
    });
    if (images.length > 0) break;
  }

  return images;
}
```

---

#### 5.3.6 Modal UI (content/modal.html)

**HTML Structure:**
```html
<div id="product-scraper-modal-backdrop">
  <div id="product-scraper-modal">
    <!-- Header -->
    <div class="modal-header">
      <h2>Add to Babylist</h2>
      <button class="close-btn" aria-label="Close">&times;</button>
    </div>

    <!-- Body -->
    <div class="modal-body">
      <!-- Left: Image Section -->
      <div class="image-section">
        <div class="image-gallery">
          <button class="nav-btn prev-btn" aria-label="Previous image">&lt;</button>
          <img id="current-image" src="" alt="Product image">
          <button class="nav-btn next-btn" aria-label="Next image">&gt;</button>
        </div>
        <div class="image-pagination">
          <!-- Dots will be generated dynamically -->
        </div>
        <p class="image-label">Selected Image</p>
      </div>

      <!-- Right: Form Section -->
      <div class="form-section">
        <!-- Title -->
        <div class="form-group">
          <label for="product-title">Title</label>
          <input type="text" id="product-title" maxlength="200" required>
        </div>

        <!-- Price & Quantity -->
        <div class="form-row">
          <div class="form-group">
            <label for="product-price">Price</label>
            <input type="text" id="product-price" placeholder="$0.00" required>
          </div>
          <div class="form-group">
            <label for="product-quantity">Quantity</label>
            <input type="number" id="product-quantity" value="1" min="1" max="99">
          </div>
        </div>

        <!-- Category -->
        <div class="form-group">
          <label for="product-category">Category</label>
          <select id="product-category">
            <option value="General">General</option>
            <option value="Nursery">Nursery</option>
            <option value="Feeding">Feeding</option>
            <option value="Clothing">Clothing</option>
            <option value="Toys">Toys</option>
            <option value="Gear & Furniture">Gear & Furniture</option>
            <option value="Bath & Potty">Bath & Potty</option>
            <option value="Health & Safety">Health & Safety</option>
            <option value="Books">Books</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <!-- Notes -->
        <div class="form-group">
          <label for="product-notes">Note for friends and family</label>
          <textarea
            id="product-notes"
            placeholder="Add an optional note here to help your gift-givers. For example, what size or color would you like?"
            maxlength="500"
            rows="4"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="modal-footer">
      <button class="btn btn-secondary cancel-btn">Cancel</button>
      <button class="btn btn-primary export-btn">Export JSON</button>
    </div>

    <!-- Error Banner (hidden by default) -->
    <div class="error-banner" style="display: none;">
      <span class="error-message"></span>
    </div>
  </div>
</div>
```

---

#### 5.3.7 JSON Exporter (exporter/jsonExporter.js)

**Export Function:**
```javascript
// jsonExporter.js

export function exportProductAsJSON(formData, scrapingMetadata) {
  const jsonData = {
    metadata: {
      exported_at: new Date().toISOString(),
      extension_version: "1.0.0",
      source_url: formData.url,
      domain: formData.domain
    },
    product: {
      title: formData.title,
      price: formData.price,
      price_numeric: parsePriceToNumber(formData.price),
      currency: detectCurrency(formData.price),
      quantity: parseInt(formData.quantity) || 1,
      category: formData.category || "General",
      brand: formData.brand || "",
      description: formData.description || "",
      notes: formData.notes || ""
    },
    images: formData.images.map((url, index) => ({
      url: url,
      is_primary: index === 0,
      index: index
    })),
    scraping_metadata: scrapingMetadata
  };

  // Create blob and open in new tab
  const json = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Send message to background script to open new tab
  chrome.runtime.sendMessage({
    type: 'EXPORT_JSON',
    data: jsonData
  });

  // Alternative: Use data URI (works without background script)
  // window.open('data:application/json;charset=utf-8,' + encodeURIComponent(json), '_blank');
}

function parsePriceToNumber(priceString) {
  // Remove currency symbols and convert to number
  const cleaned = priceString.replace(/[^0-9.,]/g, '');
  return parseFloat(cleaned.replace(',', '.')) || 0;
}

function detectCurrency(priceString) {
  if (priceString.includes('$')) return 'USD';
  if (priceString.includes('€')) return 'EUR';
  if (priceString.includes('£')) return 'GBP';
  if (priceString.includes('₪')) return 'ILS';
  return 'USD'; // Default
}
```

---

### 5.4 Data Flow Diagram

```
User Clicks Extension Icon
         ↓
Service Worker Activates
         ↓
Inject contentScript.js + modal.css
         ↓
Get Current Page URL
         ↓
Call Babylist API
  GET /api/v3/scraper_directives?url={url}
         ↓
    ┌─────────┴─────────┐
    │                   │
Directives         No Directives
Available          (Use Fallback)
    │                   │
    └─────────┬─────────┘
              ↓
Execute Scraping (Directive Engine or Fallback)
         ↓
Extract Product Data
  - Title
  - Price
  - Images
  - Brand (optional)
  - Description (optional)
         ↓
Render Modal with Pre-filled Data
         ↓
User Reviews/Edits Fields
         ↓
User Clicks "Export JSON"
         ↓
Validate Form Data
    ↓          ↓
  Valid     Invalid
    ↓          ↓
Export     Show Errors
    ↓
Create JSON Object
         ↓
Open New Tab with JSON
         ↓
Done!
```

---

## 6. USER EXPERIENCE FLOW

### 6.1 Happy Path

1. **User navigates to product page** (e.g., Amazon, Target, Shilav)
2. **User clicks extension icon** in browser toolbar
3. **Extension scrapes page**
   - Calls Babylist API for directives
   - Executes scraping
   - Shows loading spinner in modal (1-2 seconds)
4. **Modal appears** with pre-filled data
   - Product title populated
   - Price populated and formatted
   - Image gallery loaded
   - Category set to "General"
5. **User reviews data**
   - Edits title if needed
   - Adjusts price format
   - Changes quantity (default 1)
   - Selects appropriate category
   - Adds optional notes
   - Navigates through product images
6. **User clicks "Export JSON"**
7. **New tab opens** with formatted JSON
8. **User can:**
   - Copy JSON to clipboard
   - Save as .json file
   - Use in other applications

### 6.2 Error Path

1. **Scraping fails** (API down, no directives, network error)
2. **Modal shows warning** at top: "Could not auto-detect all fields. Please review and fill in manually."
3. **Some fields empty** or marked "[Not detected]"
4. **User manually enters** missing data
5. **User clicks "Export JSON"**
6. **Validation runs:**
   - If title/price missing → Show error
   - If valid → Export JSON
7. **Continue to export**

---

## 7. VALIDATION RULES

### 7.1 Required Fields

| Field | Validation | Error Message |
|-------|-----------|---------------|
| Title | Not empty, max 200 chars | "Please enter a product title" |
| Price | Valid number or currency format | "Please enter a valid price (e.g., 99.99 or $99.99)" |
| Images | At least 1 image URL | "At least one product image is required" |
| Quantity | Integer, 1-99 | "Quantity must be between 1 and 99" |

### 7.2 Optional Fields

| Field | Validation | Default |
|-------|-----------|---------|
| Category | One of predefined options | "General" |
| Notes | Max 500 characters | "" (empty) |
| Brand | Any string | "" (empty) |
| Description | Any string | "" (empty) |

---

## 8. STYLING GUIDE

### 8.1 Color Palette

```css
/* Primary Colors */
--primary-purple: #7B3987;
--primary-purple-hover: #662F71;
--primary-purple-light: #9E4FA8;

/* Neutral Colors */
--white: #FFFFFF;
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-700: #374151;
--gray-900: #111827;

/* Semantic Colors */
--error-red: #DC2626;
--warning-yellow: #F59E0B;
--success-green: #10B981;

/* Backdrop */
--backdrop: rgba(0, 0, 0, 0.6);
```

### 8.2 Typography

```css
/* Font Family */
--font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

/* Font Sizes */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 8.3 Spacing

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
```

---

## 9. IMPLEMENTATION ROADMAP

### Phase 1: MVP Core (Week 1)
- [ ] Set up Chrome extension project structure
- [ ] Implement manifest.json with required permissions
- [ ] Create service worker with icon click handler
- [ ] Build basic content script injection
- [ ] Integrate Babylist API client
- [ ] Implement simple directive executor (GetText, GetAttribute)
- [ ] Create basic modal HTML structure

### Phase 2: Scraping Engine (Week 2)
- [ ] Complete directive execution engine (all types)
- [ ] Implement fallback scraping (JSON-LD, OpenGraph)
- [ ] Add error handling for API failures
- [ ] Test on 10 major e-commerce sites
- [ ] Cache directives to reduce API calls

### Phase 3: UI Development (Week 3)
- [ ] Build complete modal UI matching screenshot
- [ ] Implement image gallery with navigation
- [ ] Add form validation
- [ ] Style all components
- [ ] Make responsive (desktop, tablet, mobile)
- [ ] Add animations and transitions

### Phase 4: JSON Export (Week 4)
- [ ] Implement JSON formatter
- [ ] Create export functionality
- [ ] Open JSON in new tab
- [ ] Add download as file option (bonus)
- [ ] Test JSON schema validation

### Phase 5: Polish & Testing (Week 5-6)
- [ ] Cross-browser testing
- [ ] Error handling improvements
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] User testing with 5+ sites
- [ ] Documentation (README, code comments)

---

## 10. TESTING PLAN

### 10.1 Test Sites

**Tier 1 (Must Work):**
- Amazon.com
- Target.com
- Walmart.com
- Shilav.co.il (from screenshot)
- BuyBuyBaby.com

**Tier 2 (Should Work):**
- Etsy.com
- eBay.com
- BestBuy.com
- HomeDepot.com
- Wayfair.com

**Tier 3 (Fallback):**
- Generic Shopify stores
- WooCommerce sites
- Small independent retailers

### 10.2 Test Cases

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Happy path scraping | 1. Visit Amazon product<br>2. Click extension<br>3. Review data<br>4. Export JSON | All fields populated correctly, JSON opens in new tab |
| Fallback scraping | 1. Visit site without directives<br>2. Click extension | Fields populated via JSON-LD/OpenGraph, warning shown |
| Manual entry | 1. Visit non-product page<br>2. Click extension<br>3. Enter data manually<br>4. Export | Modal shows empty fields, allows manual input, exports correctly |
| Validation error | 1. Scrape product<br>2. Delete title<br>3. Click export | Error shown, export disabled until fixed |
| Image navigation | 1. Scrape multi-image product<br>2. Click arrows<br>3. Select different image | Images change, pagination updates |
| Cancel flow | 1. Open modal<br>2. Click cancel or X | Modal closes, no export |

---

## 11. SUCCESS METRICS

### 11.1 Technical Metrics
- **Scraping Success Rate:** >90% on Tier 1 sites
- **Fallback Usage:** <20% of scraping attempts
- **Modal Load Time:** <2 seconds average
- **JSON Export Time:** <500ms
- **Extension Crashes:** 0 per 1000 uses

### 11.2 User Experience Metrics
- **Time to Export:** <30 seconds from icon click to JSON output
- **Manual Edits Required:** <30% of fields need editing
- **Validation Errors:** <10% of export attempts

---

## 12. FUTURE ENHANCEMENTS (Post-MVP)

### Phase 2 Features
1. **Download JSON as File**
   - Add "Download" button next to export
   - Filename: `product-{timestamp}.json`

2. **Copy to Clipboard**
   - One-click copy formatted JSON
   - Toast notification: "Copied to clipboard!"

3. **History/Saved Products**
   - Store last 10 scraped products in local storage
   - Quick access to previous scrapes

4. **Custom Export Formats**
   - CSV export option
   - XML export option
   - Copy as formatted table

5. **Batch Scraping**
   - Scrape multiple products from listing page
   - Export all as JSON array

6. **Build Your Own Directives**
   - Visual directive builder
   - Store custom directives for unsupported sites
   - Share directives with community

---

## 13. LEGAL & ETHICAL CONSIDERATIONS

### 13.1 Babylist API Usage
- **Personal/Educational Use Only**
- Do NOT publish to Chrome Web Store using their API
- Do NOT use for commercial competing service
- Implement rate limiting and caching (respect their servers)
- Add attribution in code comments

### 13.2 Web Scraping Best Practices
- Only scrape on explicit user action (icon click)
- Respect robots.txt (general principle)
- No automated/background scraping
- User-initiated only
- Data for personal use

### 13.3 Attribution Example
```javascript
/**
 * This extension uses Babylist's scraper directives API
 * for educational and personal use purposes.
 *
 * API: https://www.babylist.com/api/v3/scraper_directives
 *
 * This is a learning project and not affiliated with Babylist.
 */
```

---

## 14. DOCUMENTATION REQUIREMENTS

### 14.1 README.md
Include:
- Project description
- Installation instructions
- Usage guide
- Supported sites
- Technical architecture
- Development setup
- Testing instructions
- Attribution to Babylist

### 14.2 Code Comments
- Document all major functions
- Explain directive execution logic
- Comment fallback strategies
- Note any tricky DOM manipulations

### 14.3 User Guide
- How to use extension
- Troubleshooting common issues
- Understanding JSON output
- Manual data entry tips

---

## 15. APPENDIX

### 15.1 Example JSON Output

```json
{
  "metadata": {
    "exported_at": "2024-12-10T17:03:52.000Z",
    "extension_version": "1.0.0",
    "source_url": "https://www.shilav.co.il/product/hoodie-grey-long",
    "domain": "shilav.co.il"
  },
  "product": {
    "title": "חולצה אפורה ארוכה עם הדפס - Shilav",
    "price": "$159.90",
    "price_numeric": 159.90,
    "currency": "USD",
    "quantity": 1,
    "category": "Clothing",
    "brand": "Shilav",
    "description": "Long gray hoodie with print",
    "notes": "Size: M, Color: Gray"
  },
  "images": [
    {
      "url": "https://www.shilav.co.il/wp-content/uploads/2024/01/hoodie-1.jpg",
      "is_primary": true,
      "index": 0
    },
    {
      "url": "https://www.shilav.co.il/wp-content/uploads/2024/01/hoodie-2.jpg",
      "is_primary": false,
      "index": 1
    }
  ],
  "scraping_metadata": {
    "method": "babylist_api",
    "directives_available": true,
    "fallback_used": false,
    "api_response_time_ms": 342,
    "scraping_duration_ms": 128,
    "fields_scraped": {
      "title": true,
      "price": true,
      "images": true,
      "brand": true,
      "description": false
    },
    "directive_source": "babylist",
    "errors": []
  }
}
```

---

## 16. GLOSSARY

- **Directive:** JSON instruction that tells the scraper how to extract data from a page
- **Babylist API:** Third-party API providing scraping directives for e-commerce sites
- **Content Script:** JavaScript injected into web pages by extension
- **Service Worker:** Background script in Manifest V3 extensions
- **JSON-LD:** Structured data format embedded in HTML
- **OpenGraph:** Meta tag protocol for social sharing (also contains product data)
- **Fallback Scraping:** Generic scraping when site-specific directives unavailable

---

## CONCLUSION

This PRD outlines a focused, educational Chrome extension that:

✅ Leverages Babylist's powerful scraping API (learning opportunity)
✅ Provides intuitive UI for data review and editing
✅ Exports clean JSON for any downstream use
✅ Serves as practical learning project for Chrome extension development
✅ Requires no backend infrastructure
✅ Can be completed in 4-6 weeks

**Key Differentiator:** This is a **data extraction and export tool**, not a registry service. It uses Babylist's scraping intelligence but outputs to JSON instead of saving to their platform.

**Next Steps:**
1. Review and approve this PRD
2. Set up development environment
3. Start with Phase 1 (MVP Core)
4. Test on 5-10 sites
5. Iterate and improve

---

**Document Version:** 1.0.0
**Last Updated:** December 10, 2024
**Status:** Ready for Development

**END OF DOCUMENT**
