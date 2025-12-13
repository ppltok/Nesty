# Product Requirements Document (PRD)
## Babylist Chrome Extension - "Add to Babylist Button"

**Version:** 3.1.11
**Document Date:** December 10, 2024
**Author:** Reverse Engineered from Production Extension

---

## 1. EXECUTIVE SUMMARY

### 1.1 Product Overview
A Chrome browser extension that enables users to add products from any e-commerce website to their Babylist baby registry. The extension acts as a universal "Add to Registry" button that works across the entire web.

### 1.2 Core Value Proposition
- **For Users:** Shop anywhere on the web and add items to your Babylist registry without visiting the Babylist website
- **For Babylist:** Increases registry item additions, reduces friction, and captures products from non-partner retailers
- **Competitive Advantage:** Works on ANY e-commerce site (not limited to partner stores)

### 1.3 Key Metrics
- Number of items added via extension
- User activation rate (installs → active users)
- Scraping success rate across different e-commerce sites
- User authentication/conversion rate

---

## 2. PRODUCT GOALS & SUCCESS CRITERIA

### 2.1 Primary Goals
1. Enable seamless product addition from any e-commerce website
2. Maintain high scraping accuracy (>95% success rate on major retailers)
3. Provide excellent UX with <2 second modal load time
4. Drive user engagement and registry growth

### 2.2 Success Metrics
- **Adoption:** 100,000+ active users
- **Engagement:** Average 5+ items added per user per month
- **Technical:** <3% error rate on product scraping
- **Performance:** Modal render time <1.5 seconds
- **Retention:** 60%+ monthly active user retention

---

## 3. USER PERSONAS

### 3.1 Primary Persona: Expectant Parent
- **Age:** 25-35
- **Tech Savvy:** Medium to High
- **Behavior:** Researches products extensively across multiple sites (Amazon, Target, specialty baby stores, independent retailers)
- **Pain Point:** Switching between shopping sites and Babylist is tedious
- **Goal:** Quick, one-click addition of products while browsing

### 3.2 Secondary Persona: Gift Giver
- **Age:** 30-60
- **Relationship:** Friend/Family of expectant parent
- **Behavior:** Shops on specific retailers, may suggest items to registry owner
- **Goal:** Easy way to share product recommendations

---

## 4. FUNCTIONAL REQUIREMENTS

### 4.1 Core Features

#### 4.1.1 Extension Activation
**Requirement:** Extension activates when user clicks the browser toolbar icon

**Behavior:**
- Icon visible on all web pages (except excluded domains)
- Single click triggers extension
- No automatic activation (respects user privacy)
- Visual feedback on click (icon state change)

**Technical Implementation:**
- Chrome Extension Manifest V3
- `chrome.action.onClicked` event listener
- Service worker maintains background state

---

#### 4.1.2 Product Scraping Engine

**Requirement:** Automatically detect and extract product information from current web page

**Data Fields to Extract:**
| Field | Priority | Fallback Behavior |
|-------|----------|-------------------|
| Product Title | Critical | Use page title if not found |
| Price | Critical | Mark as "Price not found" |
| Product Image(s) | Critical | Use og:image or first large image |
| Product URL | Critical | Always available (window.location.href) |
| Brand | High | Extract from meta tags or leave empty |
| Description | Medium | Use meta description or leave empty |
| Product ID/SKU | Low | Leave empty if not found |

**Scraping Strategy:**
- **Server-Driven Directives:** Fetch site-specific scraping instructions from Babylist API
- **Dynamic Configuration:** No hardcoded selectors in extension code
- **Directive Types:**
  - DOM Query Selectors (querySelector, querySelectorAll)
  - Attribute extraction (data attributes, meta tags, JSON-LD)
  - Text content extraction
  - URL parsing and manipulation
  - Conditional logic (if/else based on page structure)
  - Array operations (map, find, filter)

**API Endpoint:**
```
GET /api/v3/scraper_directives?url={current_page_url}

Response:
{
  "directives": {
    "title": { "type": "GetText", "selector": "h1.product-title" },
    "price": { "type": "GetText", "selector": ".price-value" },
    "image_urls": { "type": "GetAttributeList", "selector": "img.product-image", "attribute": "src" },
    ...
  }
}
```

**Scraper Execution:**
1. Load babylistScraper.js into page context
2. Execute directives against DOM
3. Return structured product data
4. Handle errors gracefully (missing fields, selector failures)

---

#### 4.1.3 User Interface Modal

**Requirement:** Display an overlay modal with scraped product information and registry controls

**Modal Components:**

**A. Product Preview Card**
- Product image (primary image, full-width)
- Product title (truncated if >100 characters)
- Current price (formatted with currency symbol)
- Sale badge (if applicable)
- Store name/domain

**B. Registry Selection**
- Dropdown showing all user registries
- Display: "Registry Name (Owner Name)"
- Pre-select most recently used registry
- Create new registry option (link to Babylist)

**C. Quantity Picker**
- Default quantity: 1
- Increment/decrement buttons (+ / -)
- Range: 1-99
- Keyboard input allowed

**D. Category Suggestion (Optional)**
- Auto-suggest product category based on title/description
- Display as pill/badge
- User can ignore or accept

**E. Action Buttons**
- **Primary:** "Add to Babylist" (full-width, prominent)
- **Secondary:** "Cancel" or "X" close button
- **States:**
  - Default: "Add to Babylist"
  - Loading: "Adding..." (with spinner)
  - Success: "Added!" (brief confirmation)
  - Error: "Try Again" (with error message)

**F. Authentication States**
- **Logged In:** Show full interface
- **Not Logged In:**
  - Show product preview
  - Display: "Sign up to add items to your registry"
  - Buttons: "Log In" | "Sign Up"
  - Links open Babylist login in new tab with ?popup=true parameter

**Modal Design Specifications:**
- **Position:** Center of viewport, fixed
- **Z-Index:** 2147483647 (maximum, ensures visibility)
- **Backdrop:** Semi-transparent dark overlay (rgba(0,0,0,0.5))
- **Width:** 400px (desktop), 90vw (mobile)
- **Animation:** Fade in + scale from 0.95 to 1.0 (200ms ease-out)
- **Typography:** Custom "Maax" font family
- **Close:** ESC key, backdrop click, or X button

---

#### 4.1.4 Registry Management

**Requirement:** Allow users to add, update, and manage registry items

**Add Item Flow:**
1. User reviews product details in modal
2. Selects target registry (if multiple)
3. Sets quantity
4. Clicks "Add to Babylist"
5. POST request to Babylist API
6. Success confirmation shown
7. Item appears in registry (verify via API)

**API Endpoint:**
```
POST /api/v3/registries/{registry_id}/reg_items

Request Body:
{
  "reg_item": {
    "product_id": null,  // null for external products
    "quantity": 1,
    "price": "29.99",
    "title": "Baby Monitor with Camera",
    "image_urls": ["https://example.com/image.jpg"],
    "brand": "Infant Optics",
    "description": "...",
    "url": "https://example.com/product",
    "scraped_data": {
      // Raw scraped data for debugging
    }
  }
}

Response:
{
  "reg_item": {
    "id": "abc123",
    "registry_id": "xyz789",
    "created_at": "2024-12-10T12:00:00Z",
    ...
  }
}
```

**Update Item (if already exists):**
```
PUT /api/v3/registries/{registry_id}/reg_items/{item_id}

Body: { "quantity": 2 }
```

**Delete Item:**
```
DELETE /api/v3/registries/{registry_id}/reg_items/{item_id}
```

---

#### 4.1.5 Authentication & Session Management

**Requirement:** Maintain user authentication across extension sessions

**Authentication Flow:**
1. Extension checks for babylist.com cookies
2. If cookies exist, validate with API call:
   ```
   GET /api/v3/user/authenticated_user

   Response:
   {
     "user": {
       "id": "user_123",
       "email": "user@example.com",
       "first_name": "Jane",
       "registries": [...]
     }
   }
   ```
3. If valid, load user registries
4. If invalid/missing, show login prompt

**Cookie Management:**
- Read cookies via `chrome.cookies.getAll({ domain: "babylist.com" })`
- Write cookies via `chrome.cookies.set()`
- Scopes: .babylist.com (all subdomains)
- Session persistence across browser restarts

**Login/Signup Flow:**
1. User clicks "Log In" or "Sign Up" in modal
2. Open new tab: `https://www.babylist.com/login?popup=true`
3. User completes authentication on Babylist website
4. Extension detects new cookies
5. Refresh user state
6. Close login tab (or user closes manually)

---

#### 4.1.6 Analytics & Tracking

**Requirement:** Track user interactions for product insights and optimization

**Events to Track:**

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `AddProductViewed` | Modal opened | `landingPage`, `productPrice`, `title_scraped`, `price_scraped`, `images_scraped` |
| `productClicked` | User clicks product in modal | `productIds`, `eventCta` |
| `AddModalClosed` | User closes modal | `method` (backdrop, X, ESC) |
| `productAdded` | Item added to registry | `regItemIds`, `regItemPrice`, `isFirstRegItem` |
| `signUpIntentShown` | Login prompt displayed | `landingPage` |
| `loginClicked` | User clicks login button | `eventCta` |
| `scrapingError` | Scraping fails | `url`, `errorType`, `directives` |

**Analytics Provider:**
- **Avo Inspector** for event schema validation
- Events sent via Babylist API or third-party analytics (Segment, etc.)
- **Anonymous ID:** Generated on first install, persisted
- **System Properties:** Browser version, OS, extension version, environment (production/staging)

**Privacy Considerations:**
- No PII sent without user consent
- Product URLs may contain sensitive info (handle carefully)
- Scraping only occurs on user action (not automatic)

---

### 4.2 Site Compatibility

#### 4.2.1 Supported Sites
**Goal:** Work on 95%+ of e-commerce websites

**Tier 1 Support (Critical - Must work perfectly):**
- Amazon.com
- Target.com
- BuyBuyBaby.com
- Pottery Barn Kids
- Crate & Kids
- West Elm
- Etsy.com

**Tier 2 Support (High Priority):**
- BabyGap.com
- Carter's
- Nordstrom
- REI
- Specialized baby brands

**Tier 3 Support (Best Effort):**
- Independent/small retailers
- International sites
- Generic e-commerce platforms (Shopify, WooCommerce, BigCommerce)

**Excluded Sites:**
- walmart.com (currently excluded, may have partnership conflict)
- babylist.com itself (native functionality)
- Non-retail sites (blogs, news, social media)

---

#### 4.2.2 Fallback Scraping Strategy

**If site-specific directives fail:**
1. **Schema.org / JSON-LD:** Parse structured data
   ```json
   {
     "@type": "Product",
     "name": "...",
     "offers": { "price": "..." },
     "image": "..."
   }
   ```

2. **OpenGraph Meta Tags:**
   ```html
   <meta property="og:title" content="..." />
   <meta property="og:image" content="..." />
   <meta property="product:price:amount" content="..." />
   ```

3. **Common CSS Patterns:**
   - Price: `.price`, `[itemprop="price"]`, `#priceblock_ourprice`
   - Title: `h1`, `.product-title`, `[itemprop="name"]`
   - Image: `img[data-zoom]`, `.product-image`, `img[itemprop="image"]`

4. **User Manual Entry:**
   - If all fails, pre-fill with URL and page title
   - Allow user to manually edit fields
   - Show warning: "We couldn't detect all product details"

---

### 4.3 Performance Requirements

| Metric | Target | Maximum |
|--------|--------|---------|
| Modal render time | <1 second | 2 seconds |
| API response time (directives) | <300ms | 1 second |
| Product scraping execution | <500ms | 2 seconds |
| Add to registry API call | <500ms | 3 seconds |
| Extension bundle size | <1MB | 2MB |
| Memory footprint | <50MB | 100MB |

**Optimization Strategies:**
- Lazy load React components
- Cache scraper directives (15 min TTL)
- Minify/bundle JavaScript (webpack/rollup)
- Compress images and fonts
- Use service worker for background tasks

---

### 4.4 Error Handling

#### 4.4.1 Scraping Errors

**Error Types:**
1. **No directives available** → Use fallback scraping
2. **Selector not found** → Try alternate selectors, mark field as unavailable
3. **Invalid data format** → Sanitize and retry, or prompt user
4. **Timeout** → Retry once, then show error

**User-Facing Messages:**
- "We couldn't detect the price. Please add it manually."
- "This product may not be fully supported. Please review details."
- "Unable to load product information. Try again?"

#### 4.4.2 Network Errors

**Scenarios:**
- API down → Show cached data if available, or error message
- No internet → "Please check your connection and try again"
- Rate limiting → Exponential backoff, then inform user

#### 4.4.3 Authentication Errors

**Scenarios:**
- Expired session → Prompt re-login
- Deleted registry → Refresh registry list
- Account suspended → Contact support message

---

## 5. TECHNICAL ARCHITECTURE

### 5.1 Technology Stack

**Chrome Extension:**
- **Manifest Version:** 3
- **Language:** JavaScript (ES6+), TypeScript (optional)
- **UI Framework:** React 18+
- **State Management:** React Context or Redux
- **Styling:** CSS-in-JS (styled-components or emotion)
- **Build Tool:** Webpack or Vite
- **Package Manager:** npm or yarn

**Backend API:**
- **Base URL:** `https://www.babylist.com/api/v3/`
- **Authentication:** Cookie-based sessions
- **Format:** JSON (REST API)
- **CORS:** Must support cross-origin requests from extension

---

### 5.2 File Structure

```
babylist-chrome-extension/
├── manifest.json              # Extension configuration
├── package.json               # Dependencies
├── webpack.config.js          # Build configuration
├── src/
│   ├── background/
│   │   └── serviceWorker.js   # Background service worker
│   ├── content/
│   │   ├── contentScript.js   # Main content script (React app)
│   │   ├── clientSide.js      # Event dispatcher
│   │   └── components/        # React components
│   │       ├── Modal.jsx
│   │       ├── ProductCard.jsx
│   │       ├── RegistrySelector.jsx
│   │       ├── QuantityPicker.jsx
│   │       └── ActionButtons.jsx
│   ├── scraper/
│   │   ├── babylistScraper.js # Scraping engine
│   │   ├── directives.js      # Directive execution logic
│   │   └── fallback.js        # Fallback scraping strategies
│   ├── api/
│   │   ├── client.js          # API client wrapper
│   │   ├── auth.js            # Authentication helpers
│   │   └── endpoints.js       # API endpoint definitions
│   ├── analytics/
│   │   └── tracker.js         # Analytics event tracking
│   └── utils/
│       ├── cookies.js         # Cookie management
│       ├── dom.js             # DOM helpers
│       └── formatters.js      # Price/text formatting
├── assets/
│   ├── icons/                 # Extension icons (16, 48, 128px)
│   └── fonts/                 # Maax font family
└── dist/                      # Build output (generated)
```

---

### 5.3 Component Breakdown

#### 5.3.1 Service Worker (serviceWorker.js)

**Responsibilities:**
- Listen for extension icon clicks
- Inject content scripts into active tab
- Manage cookie operations
- Handle message passing between components
- Initialize analytics on install

**Key APIs:**
```javascript
// Icon click handler
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['contentScript.js']
  });
});

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch(message.type) {
    case 'GET_COOKIES':
      chrome.cookies.getAll({ domain: 'babylist.com' }, sendResponse);
      break;
    case 'SET_COOKIE':
      chrome.cookies.set(message.options.body, sendResponse);
      break;
    // ... other message types
  }
  return true; // Async response
});
```

---

#### 5.3.2 Content Script (contentScript.js)

**Responsibilities:**
- Inject React app into page
- Render modal UI
- Coordinate scraping execution
- Communicate with service worker
- Handle user interactions

**Injection Strategy:**
- Create isolated React root in page DOM
- Use Shadow DOM or unique class prefixes to avoid style conflicts
- Inject at highest z-index to ensure visibility

**React Root:**
```javascript
const rootContainer = document.createElement('div');
rootContainer.id = 'babylist-extension-root';
document.body.appendChild(rootContainer);

const root = ReactDOM.createRoot(rootContainer);
root.render(<BabylistModal />);
```

---

#### 5.3.3 Scraper Engine (babylistScraper.js)

**Directive Execution Engine:**

**Directive Format:**
```javascript
{
  "type": "GetText",           // Directive type
  "selector": "h1.title",      // CSS selector
  "attribute": "textContent",  // Optional attribute
  "default": "Untitled",       // Fallback value
  "transform": "trim"          // Optional transformation
}
```

**Supported Directive Types:**
1. **GetText** - Extract text content from element
2. **GetAttribute** - Extract HTML attribute value
3. **GetAttributeList** - Extract attribute from multiple elements (returns array)
4. **GetTitle** - Get document.title
5. **GetCurrentUrl** - Get window.location.href
6. **BuildUrl** - Construct URL with parameters
7. **Chain** - Execute multiple directives in sequence
8. **Map** - Transform array elements
9. **FindInArray** - Search array with conditions
10. **GetObjectProperty** - Access nested object properties
11. **Literal** - Return literal value
12. **Click** - Click element (for revealing hidden content)

**Execution Flow:**
```javascript
class BabylistScraper {
  constructor(directives) {
    this.directives = directives;
  }

  async execute() {
    const results = {};

    for (const [field, directive] of Object.entries(this.directives)) {
      try {
        results[field] = await this.executeDirective(directive);
      } catch (error) {
        console.warn(`Failed to scrape ${field}:`, error);
        results[field] = null;
      }
    }

    return results;
  }

  async executeDirective(directive) {
    switch(directive.type) {
      case 'GetText':
        const element = document.querySelector(directive.selector);
        return element?.textContent.trim() || directive.default;

      case 'GetAttribute':
        const el = document.querySelector(directive.selector);
        return el?.getAttribute(directive.attribute) || directive.default;

      // ... other directive types
    }
  }
}
```

---

#### 5.3.4 API Client (api/client.js)

**Base Configuration:**
```javascript
class BabylistAPIClient {
  constructor() {
    this.baseURL = 'https://www.babylist.com/api/v3';
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.append(key, value)
    );

    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers,
      credentials: 'include' // Include cookies
    });

    return this.handleResponse(response);
  }

  async post(endpoint, body) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.headers,
      credentials: 'include',
      body: JSON.stringify(body)
    });

    return this.handleResponse(response);
  }

  async handleResponse(response) {
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  }
}
```

**API Methods:**
```javascript
// Get scraper directives
async getScraperDirectives(url) {
  return this.get('/scraper_directives', { url });
}

// Get authenticated user
async getAuthenticatedUser() {
  return this.get('/user/authenticated_user');
}

// Get user registries
async getRegistries() {
  return this.get('/registries/');
}

// Add item to registry
async addRegistryItem(registryId, itemData) {
  return this.post(`/registries/${registryId}/reg_items`, {
    reg_item: itemData
  });
}

// Update item quantity
async updateRegistryItem(registryId, itemId, updates) {
  return this.put(`/registries/${registryId}/reg_items/${itemId}`, updates);
}

// Delete item
async deleteRegistryItem(registryId, itemId) {
  return this.delete(`/registries/${registryId}/reg_items/${itemId}`);
}
```

---

### 5.4 Message Passing Architecture

**Communication Flow:**

```
Content Script ←→ Service Worker ←→ Babylist API
       ↓
   DOM Events
       ↓
 Scraper (Page Context)
```

**Message Types:**

1. **Content Script → Service Worker:**
   - `GET_COOKIES` - Retrieve babylist.com cookies
   - `SET_COOKIE` - Store authentication cookie
   - `INITIALIZE_ANALYTICS` - Set up tracking
   - `CHECK_CONNECTION` - Verify extension responsive

2. **Service Worker → Content Script:**
   - Cookie data responses
   - Analytics initialization confirmations

3. **Content Script ↔ Page Context:**
   - `Babylist_ExecuteScraper` - Trigger scraping
   - `Babylist_ExecuteScraper_Return` - Return scraped data

**Custom Event Implementation:**
```javascript
// Content script dispatches event
document.dispatchEvent(new CustomEvent('Babylist_ExecuteScraper', {
  detail: scraperDirectives
}));

// Page context listener (clientSide.js)
document.addEventListener('Babylist_ExecuteScraper', async (event) => {
  const directives = event.detail;
  const scraper = new window.BabylistScraper(directives);
  const results = await scraper.execute();

  document.dispatchEvent(new CustomEvent('Babylist_ExecuteScraper_Return', {
    detail: results
  }));
});

// Content script receives results
document.addEventListener('Babylist_ExecuteScraper_Return', (event) => {
  const scrapedData = event.detail;
  // Update React state with scraped data
});
```

---

### 5.5 State Management

**React Context Structure:**

```javascript
// AppContext.js
const AppContext = createContext();

const initialState = {
  user: null,
  registries: [],
  currentRegistry: null,
  scrapedProduct: null,
  isLoading: false,
  error: null,
  isAuthenticated: false
};

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
```

**Actions:**
```javascript
const actions = {
  SET_USER: 'SET_USER',
  SET_REGISTRIES: 'SET_REGISTRIES',
  SET_SCRAPED_PRODUCT: 'SET_SCRAPED_PRODUCT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_ITEM_SUCCESS: 'ADD_ITEM_SUCCESS',
  RESET_STATE: 'RESET_STATE'
};
```

---

### 5.6 Security Considerations

**Content Security Policy:**
```json
// manifest.json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

**XSS Prevention:**
- Sanitize all scraped data before rendering
- Use React's built-in XSS protection (no dangerouslySetInnerHTML)
- Validate URLs before redirecting

**Data Privacy:**
- Only scrape on explicit user action (icon click)
- No background scraping or tracking
- Clear communication about data sent to Babylist
- Respect Do Not Track headers

**Cookie Security:**
- Only access babylist.com cookies (scoped permissions)
- Use secure, httpOnly cookies when possible
- Validate session tokens on backend

---

## 6. USER EXPERIENCE REQUIREMENTS

### 6.1 Onboarding Flow

**First-Time Install:**
1. Extension installed from Chrome Web Store
2. Welcome modal appears on next page visit (or new tab)
3. Show brief tutorial (3-5 screens):
   - "Click the Babylist button when viewing a product"
   - "Review product details"
   - "Choose your registry and add"
4. Prompt to log in or sign up
5. Test with sample product

**Tutorial Screens:**
- Screen 1: "Shop anywhere, add to Babylist" (hero image)
- Screen 2: "Works on thousands of stores" (store logos)
- Screen 3: "One click to add" (animated demo)
- Screen 4: "Get started" (login/signup buttons)

---

### 6.2 Interaction States

**Modal States:**
1. **Loading** - Spinner while scraping/fetching data
2. **Preview** - Display scraped product
3. **Adding** - Button loading state during API call
4. **Success** - Brief confirmation (checkmark, "Added!")
5. **Error** - Error message with retry option
6. **Not Logged In** - Login/signup prompt

**Visual Feedback:**
- Button hover states (color change, slight scale)
- Disabled states (opacity reduction)
- Loading spinners (animated)
- Success animations (checkmark fade-in)
- Error shake animation

---

### 6.3 Accessibility Requirements

**WCAG 2.1 AA Compliance:**
- Keyboard navigation (Tab, Enter, ESC)
- ARIA labels on all interactive elements
- Focus indicators (visible outline)
- Screen reader support
- Minimum contrast ratio 4.5:1
- Font size at least 14px

**Keyboard Shortcuts:**
- `ESC` - Close modal
- `Enter` - Submit/add to registry
- `Tab` - Navigate between fields
- `Shift+Tab` - Reverse navigation

**Screen Reader Announcements:**
- "Babylist modal opened"
- "Product loaded: [Product Title]"
- "Adding to registry..."
- "Product added successfully"
- "Error: [Error message]"

---

### 6.4 Responsive Design

**Breakpoints:**
- Desktop: 1024px+ (400px modal width)
- Tablet: 768px - 1023px (80vw modal width)
- Mobile: <768px (95vw modal width, stacked layout)

**Mobile Optimizations:**
- Larger touch targets (48px minimum)
- Simplified layout (single column)
- Bottom sheet instead of centered modal (optional)
- Reduced animation complexity

---

## 7. NON-FUNCTIONAL REQUIREMENTS

### 7.1 Performance

**Load Time:**
- Initial script injection: <500ms
- Modal render: <1s
- API calls: <2s (with retry)

**Bundle Size:**
- Total extension size: <2MB
- contentScript.js: <700KB (minified)
- serviceWorker.js: <400KB (minified)
- babylistScraper.js: <150KB (minified)

**Memory Usage:**
- Idle: <20MB
- Active (modal open): <100MB
- No memory leaks on modal close

---

### 7.2 Reliability

**Uptime:**
- Extension available 99.9%+ (no crashes)
- Graceful degradation if API unavailable

**Error Rate:**
- Scraping success rate: >95% on Tier 1 sites
- API call success rate: >99%
- Zero critical bugs in production

**Fallback Strategies:**
- If directives fail → fallback scraping
- If API down → cached data or error message
- If scraping fails → allow manual entry

---

### 7.3 Scalability

**User Load:**
- Support 1M+ concurrent users
- Handle 10,000+ requests/second to API
- CDN for static assets (icons, fonts)

**Data Storage:**
- No local storage of sensitive data
- Cache directives for 15 minutes
- Session storage for temporary state

---

### 7.4 Browser Compatibility

**Minimum Versions:**
- Chrome: 88+ (Manifest V3 support)
- Edge: 88+ (Chromium-based)
- Opera: 74+
- Brave: Latest

**Not Supported:**
- Firefox (different extension API)
- Safari (different extension API)
- Internet Explorer (obsolete)

---

### 7.5 Localization & Internationalization

**Phase 1 (MVP):**
- English only (US)

**Future Phases:**
- Support for multiple currencies (CAD, EUR, GBP)
- Internationalized date/time formats
- RTL layout support (Arabic, Hebrew)
- Translated UI strings (Spanish, French, etc.)

---

## 8. IMPLEMENTATION ROADMAP

### Phase 1: MVP (Weeks 1-4)

**Week 1-2: Core Infrastructure**
- [ ] Set up Chrome Extension Manifest V3 project
- [ ] Implement service worker with icon click handler
- [ ] Create basic content script injection
- [ ] Set up React app structure
- [ ] Implement cookie-based authentication
- [ ] Create API client wrapper

**Week 3: Scraping Engine**
- [ ] Implement babylistScraper.js directive engine
- [ ] Support 10 core directive types
- [ ] Integrate with /api/v3/scraper_directives endpoint
- [ ] Add fallback scraping (JSON-LD, OpenGraph)
- [ ] Test on 10 major retailers

**Week 4: UI & Add Flow**
- [ ] Build modal component with React
- [ ] Implement product card UI
- [ ] Add registry selector dropdown
- [ ] Create quantity picker
- [ ] Wire up "Add to Registry" flow
- [ ] Handle success/error states

---

### Phase 2: Enhancement (Weeks 5-6)

**Week 5: Polish & Features**
- [ ] Add analytics tracking (Avo Inspector)
- [ ] Implement category suggestion
- [ ] Add loading states and animations
- [ ] Improve error messaging
- [ ] Test on 50+ websites

**Week 6: Testing & QA**
- [ ] Cross-browser testing (Chrome, Edge, Brave)
- [ ] Performance optimization (bundle size, load times)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Security review
- [ ] User acceptance testing

---

### Phase 3: Launch (Week 7-8)

**Week 7: Beta Release**
- [ ] Deploy to Chrome Web Store (unlisted)
- [ ] Beta test with 100 users
- [ ] Collect feedback and fix bugs
- [ ] Monitor error rates and performance

**Week 8: Public Launch**
- [ ] Submit final version to Chrome Web Store
- [ ] Create marketing materials (screenshots, description)
- [ ] Launch announcement (blog, email, social)
- [ ] Monitor adoption and engagement metrics

---

### Phase 4: Post-Launch (Ongoing)

**Month 2-3:**
- [ ] Add support for 100+ additional websites
- [ ] Implement user feedback features
- [ ] A/B test UI variations
- [ ] Optimize scraping accuracy

**Month 4-6:**
- [ ] Add Firefox and Safari extensions
- [ ] Implement browser-native sharing API integration
- [ ] Add "Price Drop Alert" feature
- [ ] Multi-registry management improvements

---

## 9. TESTING STRATEGY

### 9.1 Unit Testing

**Framework:** Jest + React Testing Library

**Test Coverage:**
- Scraper directive execution (all types)
- API client methods (mocked responses)
- React component rendering
- State management (reducers, actions)
- Cookie management utilities

**Coverage Target:** 80%+ code coverage

---

### 9.2 Integration Testing

**Scenarios:**
- End-to-end add flow (scrape → display → add → verify)
- Authentication flow (login → fetch user → load registries)
- Error handling (API errors, scraping failures)
- Message passing (content script ↔ service worker)

**Tools:** Playwright or Puppeteer

---

### 9.3 Manual Testing

**Test Matrix:**

| Site | Scraping | Add to Registry | Mobile | Notes |
|------|----------|-----------------|--------|-------|
| Amazon.com | ✓ | ✓ | ✓ | Test variations, sale prices |
| Target.com | ✓ | ✓ | ✓ | Check cart integration |
| Etsy.com | ✓ | ✓ | ✓ | Custom product fields |
| Small Shopify store | ✓ | ✓ | ✓ | Generic fallback scraping |

**Edge Cases:**
- Products without prices (contact for quote)
- Out of stock items
- Products with variants (size, color)
- Pages with anti-bot protection
- Infinite scroll product pages

---

### 9.4 Performance Testing

**Metrics to Monitor:**
- Extension load time on 100 different pages
- Modal render time (P50, P95, P99)
- API response times
- Memory consumption over 30-minute session
- Bundle size after each build

**Tools:** Chrome DevTools Performance tab, Lighthouse

---

### 9.5 Security Testing

**Checks:**
- XSS vulnerability testing (inject malicious scraped data)
- CSRF protection on API endpoints
- Cookie security (httpOnly, secure flags)
- Content Security Policy validation
- Permissions audit (minimal required permissions)

---

## 10. ANALYTICS & METRICS

### 10.1 Key Performance Indicators (KPIs)

**Acquisition:**
- Chrome Web Store installs/week
- Install → activation rate
- Referral sources

**Engagement:**
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Average items added per user per week
- Session length

**Retention:**
- Day 1, Day 7, Day 30 retention rates
- Churn rate
- Returning user rate

**Technical:**
- Scraping success rate (by site)
- API error rate
- Extension crash rate
- Average modal load time

---

### 10.2 Event Tracking

**Critical Events:**
1. `extension_installed` - User installed extension
2. `modal_opened` - Extension icon clicked
3. `product_scraped_success` - Scraping succeeded
4. `product_scraped_fail` - Scraping failed
5. `item_added` - Product added to registry
6. `login_completed` - User authenticated
7. `error_occurred` - Any error happened

**Event Properties:**
- `url` - Current page URL (domain only for privacy)
- `site_name` - Detected e-commerce platform
- `user_id` - Babylist user ID (if authenticated)
- `registry_id` - Target registry ID
- `extension_version` - Current version
- `browser` - Chrome, Edge, etc.
- `timestamp` - Event time (ISO 8601)

---

### 10.3 A/B Testing

**Hypotheses to Test:**
1. **Modal size:** 400px vs 500px width (conversion rate)
2. **CTA button text:** "Add to Babylist" vs "Save to Registry" (click rate)
3. **Image placement:** Top vs left side (engagement)
4. **Quantity picker visibility:** Always visible vs hidden by default (items added)
5. **Category suggestion:** Show vs hide (completion rate)

**Testing Framework:** Google Optimize or custom implementation

---

## 11. SUPPORT & MAINTENANCE

### 11.1 Customer Support

**Support Channels:**
- In-app help link → https://www.babylist.com/help
- Email: support@babylist.com
- Chrome Web Store reviews (monitor and respond)

**Common Issues:**
- "Extension not working on [site]" → Add site to directive queue
- "Product details incorrect" → Improve scraping directives
- "Can't log in" → Cookie troubleshooting
- "Modal won't close" → Browser compatibility issue

---

### 11.2 Error Monitoring

**Tools:**
- Sentry or Rollbar for error tracking
- Custom error reporting to Babylist backend

**Alerts:**
- Error rate spike (>1% of sessions)
- API endpoint down (>5% error rate)
- Scraping failure rate spike on major site

---

### 11.3 Update Strategy

**Auto-Update:**
- Chrome automatically updates extensions
- Push critical fixes within 24 hours
- Feature updates every 2-4 weeks

**Version Naming:**
- Major.Minor.Patch (e.g., 3.1.11)
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

**Release Notes:**
- Publish to Chrome Web Store description
- Show in-app changelog on major updates

---

### 11.4 Deprecation Plan

**Manifest V2 → V3 Migration:**
- Already on V3 (future-proof)
- Monitor Chrome updates for API changes
- Maintain backward compatibility for 6 months after breaking changes

---

## 12. LEGAL & COMPLIANCE

### 12.1 Privacy Policy

**Data Collection Disclosure:**
- "We collect product information from pages you choose to add to your registry"
- "We use cookies to maintain your login session"
- "We track usage analytics to improve the extension"

**User Rights:**
- Right to delete account and data
- Right to export data
- Right to opt out of analytics

**Link:** https://www.babylist.com/privacy

---

### 12.2 Terms of Service

**User Agreement:**
- Users must have Babylist account to use extension
- Users responsible for accuracy of added items
- Babylist not responsible for retailer pricing/availability
- No automated/bot usage allowed

**Link:** https://www.babylist.com/terms

---

### 12.3 Chrome Web Store Compliance

**Requirements:**
- Single purpose: "Add items to Babylist registry"
- Minimal permissions (only what's necessary)
- No obfuscated code in production
- No tracking without disclosure
- Responsive support email

**Store Listing:**
- Accurate description and screenshots
- Privacy policy link
- Support link
- Regular updates (at least quarterly)

---

### 12.4 Scraping Legality

**Considerations:**
- Scraping for personal use (user-initiated) generally legal
- Respect robots.txt (though not binding for browser extensions)
- No circumventing authentication or paywalls
- No excessive automated requests
- Cache and rate-limit API calls

**Risk Mitigation:**
- Only scrape on explicit user action
- Use publicly visible data only
- Respect site terms of service
- Include User-Agent with contact info

---

## 13. COMPETITIVE ANALYSIS

### 13.1 Competing Extensions

**Similar Products:**
1. **Amazon Assistant** - Amazon's official extension
   - Pros: Deep Amazon integration, price tracking
   - Cons: Limited to Amazon ecosystem

2. **Honey** - Price comparison and coupons
   - Pros: Wide site support, price alerts
   - Cons: Not registry-focused

3. **MyRegistry Universal Registry Button**
   - Pros: Multi-registry support
   - Cons: Generic UI, less polished

**Babylist Advantages:**
- Registry-specific features (categories, suggestions)
- Better UI/UX (branded, cohesive)
- Direct integration with Babylist platform
- Baby-focused product curation

---

### 13.2 Differentiation Strategy

**Unique Features:**
1. **Smart category suggestions** (baby-specific)
2. **Price tracking** (alert when price drops)
3. **Gift purchaser view** (see who bought what)
4. **Multi-store price comparison** (future)
5. **Community recommendations** (popular items)

---

## 14. RISKS & MITIGATION

### 14.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Website structure changes break scraping | High | Medium | Server-side directive updates, fallback strategies |
| Chrome API changes | Low | High | Monitor Chrome release notes, early beta testing |
| API downtime | Medium | High | Implement retry logic, cached data, status page |
| Performance degradation | Medium | Medium | Regular performance monitoring, optimization sprints |

---

### 14.2 Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Low user adoption | Medium | High | Marketing campaign, influencer partnerships, incentives |
| Retailer blocking | Low | Medium | Legal review, user-initiated design, rate limiting |
| Negative reviews | Medium | Medium | Proactive support, quick bug fixes, feature requests |
| Competitive pressure | High | Medium | Continuous innovation, user feedback loop |

---

### 14.3 Legal Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| GDPR/CCPA violations | Low | High | Privacy audit, clear consent, data minimization |
| Scraping legal challenge | Low | High | User-initiated only, legal consultation, ToS compliance |
| Copyright infringement | Very Low | Medium | Only scrape publicly visible data, attribute sources |

---

## 15. SUCCESS CRITERIA

### 15.1 Launch Criteria (MVP)

**Must Have:**
- ✅ Works on top 20 baby product retailers
- ✅ <2 second modal load time
- ✅ >90% scraping success rate on Tier 1 sites
- ✅ Zero critical security vulnerabilities
- ✅ WCAG 2.1 AA compliant
- ✅ <1% crash rate

**Nice to Have:**
- Category suggestions
- Price tracking
- Multi-registry support

---

### 15.2 6-Month Goals

**User Metrics:**
- 50,000+ active users
- 500,000+ items added
- 70%+ 30-day retention

**Technical Metrics:**
- 95%+ scraping success rate
- <1 second average modal load
- <0.5% error rate

**Business Metrics:**
- 20%+ increase in registry items added (overall)
- 15%+ increase in new user signups (attributed to extension)
- 4.5+ star rating on Chrome Web Store

---

## 16. APPENDIX

### 16.1 API Endpoints Reference

**Full Endpoint List:**

```
GET  /api/v3/scraper_directives?url={url}
GET  /api/v3/user/authenticated_user
GET  /api/v3/registries/
GET  /api/v3/registries/{id}
POST /api/v3/registries/{id}/reg_items
PUT  /api/v3/registries/{id}/reg_items/{item_id}
DELETE /api/v3/registries/{id}/reg_items/{item_id}
GET  /api/v3/registry_category_suggestion?title={title}
POST /api/v3/analytics/track
```

---

### 16.2 Scraper Directive Examples

**Amazon Product Page:**
```json
{
  "title": {
    "type": "GetText",
    "selector": "#productTitle"
  },
  "price": {
    "type": "Chain",
    "steps": [
      {"type": "GetText", "selector": ".a-price-whole"},
      {"type": "Literal", "value": "$"},
      {"type": "Concat"}
    ]
  },
  "image_urls": {
    "type": "GetAttributeList",
    "selector": "#altImages img",
    "attribute": "src",
    "transform": "removeThumbnail"
  },
  "brand": {
    "type": "GetText",
    "selector": "#bylineInfo"
  }
}
```

**Target Product Page:**
```json
{
  "title": {
    "type": "GetText",
    "selector": "h1[data-test='product-title']"
  },
  "price": {
    "type": "GetText",
    "selector": "div[data-test='product-price']"
  },
  "image_urls": {
    "type": "GetAttributeList",
    "selector": "button[data-test='image-gallery-item'] img",
    "attribute": "src"
  }
}
```

---

### 16.3 Glossary

**Terms:**
- **Content Script:** JavaScript injected into web pages by extension
- **Service Worker:** Background script running in extension context
- **Manifest V3:** Latest Chrome extension format (introduced 2021)
- **Directive:** Server-defined instruction for scraping data
- **Registry Item:** Product added to Babylist registry
- **Babylist:** Baby registry and shopping platform
- **Scraping:** Extracting structured data from web pages
- **JSON-LD:** Structured data format for embedding metadata
- **OpenGraph:** Meta tag protocol for social sharing
- **WCAG:** Web Content Accessibility Guidelines

---

### 16.4 References

**Documentation:**
- Chrome Extension API: https://developer.chrome.com/docs/extensions/
- Manifest V3: https://developer.chrome.com/docs/extensions/mv3/
- React: https://react.dev/
- Babylist API: (Internal documentation)

**Libraries:**
- React 18: UI framework
- Webpack: Module bundler
- Avo Inspector: Analytics schema validation

---

## DOCUMENT REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-10 | Reverse Engineered | Initial PRD based on v3.1.11 analysis |

---

**END OF DOCUMENT**
