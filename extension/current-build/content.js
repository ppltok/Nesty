/**
 * Nesty Extension - Content Script with Authentication
 * Checks user authentication, fetches registry, and shows product form
 */

// Wrap everything in IIFE to avoid variable conflicts on re-injection
(function() {
  console.log('🚀 Nesty Extension - Starting...');

  // Signal to website that extension is installed
  document.documentElement.setAttribute('data-nesty-extension-installed', 'true');
  document.documentElement.setAttribute('data-nesty-extension-version', '1.5.5');
  console.log('✅ Extension detection markers set');

  // Remove any existing Nesty UI elements (modals, overlays, styles)
  const existingOverlays = document.querySelectorAll('.nesty-overlay');
  existingOverlays.forEach(overlay => overlay.remove());

  const existingStyles = document.querySelector('#nesty-styles');
  if (existingStyles) {
    existingStyles.remove();
  }

  console.log('✅ Cleaned up existing elements, starting fresh...');

  // Load configuration dynamically from config.js
  let NESTY_CONFIG = null;

  // Categories (Hebrew) — keep in sync with nesty-web/src/data/categories.ts
  const CATEGORIES = [
    { id: 'general', name: 'כללי' },
    { id: 'strollers', name: 'עגלות וטיולים' },
    { id: 'car_safety', name: 'בטיחות ברכב' },
    { id: 'furniture', name: 'ריהוט' },
    { id: 'safety', name: 'מוצרי בטיחות' },
    { id: 'feeding', name: 'האכלה' },
    { id: 'nursing', name: 'הנקה' },
    { id: 'bath', name: 'אמבט וטיפול בתינוק' },
    { id: 'clothing', name: 'ביגוד ראשוני' },
    { id: 'bedding', name: 'מצעים ואקססוריז' },
    { id: 'toys', name: 'צעצועים' },
    { id: 'birth_prep', name: 'הכנה ללידה ולאמא' },
    { id: 'siblings', name: 'תוספות לאחים / תאומים' }
  ];

  // Category auto-suggestion from the product name. Ordered by priority —
  // the FIRST category with a keyword hit wins (e.g. "עגלת תאומים" must land
  // on strollers, not siblings). Returns '' when nothing is recognized so the
  // form keeps showing "בחרו קטגוריה".
  const CATEGORY_KEYWORDS = [
    { id: 'strollers', words: ['עגלת', 'עגלה', 'טיולון', 'מנשא', 'stroller', 'buggy', 'pushchair', 'carrier'] },
    { id: 'car_safety', words: ['סלקל', 'סל קל', 'סל-קל', 'כיסא בטיחות', 'כסא בטיחות', 'מושב בטיחות', 'בוסטר', 'איזופיקס', 'isofix', 'car seat', 'booster'] },
    { id: 'nursing', words: ['הנקה', 'משאבת חלב', 'שאיבת חלב', 'מחמצץ', 'breast pump', 'nursing'] },
    { id: 'feeding', words: ['בקבוק', 'מוצץ', 'כיסא אוכל', 'כסא אוכל', 'האכלה', 'סטריליזטור', 'מחמם בקבוקים', 'סינר', 'תמ"ל', 'bottle', 'pacifier', 'high chair', 'sterilizer'] },
    { id: 'bath', words: ['אמבט', 'חיתול', 'מד חום', 'מדחום', 'משטח החתלה', 'שמפו', 'מגבת', 'קרם החתלה', 'bath', 'diaper', 'towel'] },
    { id: 'furniture', words: ['מיטת', 'מיטה', 'עריסה', 'עריסת', 'שידה', 'שידת', 'קומודה', 'לול', 'נדנדה', 'טרמפולינה', 'crib', 'bassinet', 'dresser', 'bouncer'] },
    { id: 'safety', words: ['מוניטור', 'אינטרקום', 'משגוחה', 'שער בטיחות', 'מגן שקעים', 'monitor', 'baby gate'] },
    { id: 'bedding', words: ['מצעים', 'סדין', 'שמיכה', 'שמיכת', 'כרית', 'מובייל', 'מגן ראש', 'שק שינה', 'sheet', 'blanket', 'swaddle', 'sleeping bag'] },
    { id: 'clothing', words: ['בגד', 'בגדי', 'אוברול', 'בודי', 'גרביים', 'כובע', "פיג'מה", 'onesie', 'bodysuit', 'romper'] },
    { id: 'toys', words: ['צעצוע', 'משחק', 'נשכן', 'רעשן', 'בובה', 'קוביות', "ג'ימבורי", 'ספר רך', 'toy', 'rattle', 'teether', 'playmat', 'play mat', 'gym'] },
    { id: 'birth_prep', words: ['תיק לידה', 'לאחר לידה', 'ליולדת', 'יולדת', 'פדים', 'postpartum'] },
    { id: 'siblings', words: ['תאומים', 'twins'] }
  ];

  function guessCategory(name) {
    if (!name) return '';
    const n = name.toLowerCase();
    for (const cat of CATEGORY_KEYWORDS) {
      if (cat.words.some(w => n.includes(w))) return cat.id;
    }
    return '';
  }

  // Global state
  let supabaseSession = null;
  let userRegistry = null;

  // Main execution
  (async function() {
    // Load configuration first
    try {
      const configUrl = chrome.runtime.getURL('config.js');
      const { config } = await import(configUrl);
      NESTY_CONFIG = {
        WEB_URL: config.WEB_URL,
        SUPABASE_URL: config.SUPABASE_URL,
        SUPABASE_ANON_KEY: config.SUPABASE_ANON_KEY
      };
      console.log('✅ Config loaded:', NESTY_CONFIG.WEB_URL);
    } catch (error) {
      console.error('❌ Failed to load config, using defaults:', error);
      // Fallback to hardcoded values if config fails to load
      NESTY_CONFIG = {
        WEB_URL: 'http://localhost:5173',
        SUPABASE_URL: 'https://wopsrjfdaovlyibivijl.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcHNyamZkYW92bHlpYml2aWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MTgxMjMsImV4cCI6MjA4MTE5NDEyM30.x4yVBmmbKyGKylOepJwOHessCfIjVxzRvSNbyJ4VyJw'
      };
    }

    console.log('📍 Current URL:', window.location.href);

    // Inject CSS
    console.log('💅 Injecting styles...');
    const link = document.createElement('link');
    link.id = 'nesty-styles';
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('popup-styles.css');
    document.head.appendChild(link);

    // Get Supabase session
    console.log('🔑 Getting Supabase session...');
    supabaseSession = await getSupabaseSession();
    console.log('📦 Session data:', supabaseSession ? '✅ Found' : '❌ Not found');

    if (!supabaseSession) {
      console.log('❌ User not authenticated');
      showLoginPrompt();
      return;
    }

    console.log('✅ User authenticated:', supabaseSession.user?.email);

    // Fetch user's registry
    try {
      console.log('📥 Fetching user registry...');
      userRegistry = await fetchUserRegistry(supabaseSession.user.id);

      if (!userRegistry) {
        showErrorModal('לא נמצאה רשימה. אנא צור רשימה תחילה ב-Nesty.');
        return;
      }

      console.log('✅ Registry found:', userRegistry.title);

      // Extract product data
      console.log('🔍 Extracting product data...');
      const productData = await extractProductData();

      if (productData) {
        console.log('✅ Product extracted, showing form in current page mode');
        showProductForm(productData, 'current');
      } else {
        console.log('⚠️ No product on current page, showing paste URL mode');
        showProductForm(null, 'paste');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      showErrorModal('אירעה שגיאה: ' + error.message);
    }
  })();

  /**
   * Get Supabase session by requesting it from the background script
   */
  async function getSupabaseSession() {
    console.log('🔍 Requesting session from background script...');

    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_SESSION' });

      if (response && response.session) {
        console.log('✅ Got session from background script');
        return response.session;
      } else {
        console.log('❌ No session returned from background script');
        return null;
      }
    } catch (error) {
      console.error('❌ Error requesting session:', error);
      return null;
    }
  }

  /**
   * Fetch user's registry from Supabase
   */
  async function fetchUserRegistry(userId) {
    try {
      const response = await fetch(
        `${NESTY_CONFIG.SUPABASE_URL}/rest/v1/registries?or=(owner_id.eq.${userId},partner_id.eq.${userId})&select=*&limit=1`,
        {
          headers: {
            'apikey': NESTY_CONFIG.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${supabaseSession.access_token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        console.error('Registry fetch failed:', response.status, body);
        throw new Error(`שגיאת שרת ${response.status} בטעינת הרשימה`);
      }

      const data = await response.json();
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching registry:', error);
      throw error;
    }
  }

  /**
   * Show login prompt for unauthenticated users
   */
  function showLoginPrompt() {
    const overlay = document.createElement('div');
    overlay.className = 'nesty-overlay';

    const modal = document.createElement('div');
    modal.className = 'nesty-modal';
    modal.style.maxWidth = '400px';
    modal.style.textAlign = 'center';

    modal.innerHTML = `
      <div style="padding: 32px;">
        <div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
        <h2 style="font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 12px 0;">נדרשת התחברות</h2>
        <p style="font-size: 14px; color: #6b6b6b; margin: 0 0 24px 0;">
          כדי להוסיף מוצרים לרשימה שלך, עליך להתחבר ל-Nesty
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="nesty-login-btn" style="padding: 12px 24px; background: #86608e; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            התחבר ל-Nesty
          </button>
          <button id="nesty-close-login" style="padding: 12px 24px; background: #e8e4e9; color: #1a1a1a; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            סגור
          </button>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Event listeners
    document.getElementById('nesty-login-btn').addEventListener('click', () => {
      window.open(NESTY_CONFIG.WEB_URL, '_blank');
    });

    document.getElementById('nesty-close-login').addEventListener('click', () => {
      overlay.remove();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }

  /**
   * Show error modal
   */
  function showErrorModal(message) {
    const overlay = document.createElement('div');
    overlay.className = 'nesty-overlay';

    const modal = document.createElement('div');
    modal.className = 'nesty-modal';
    modal.style.maxWidth = '400px';
    modal.style.textAlign = 'center';

    modal.innerHTML = `
      <div style="padding: 32px;">
        <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
        <h2 style="font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 0 0 12px 0;">שגיאה</h2>
        <p style="font-size: 14px; color: #6b6b6b; margin: 0 0 24px 0; white-space: pre-wrap;">
          ${message}
        </p>
        <button id="nesty-close-error" style="padding: 12px 24px; background: #86608e; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">
          סגור
        </button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById('nesty-close-error').addEventListener('click', () => {
      overlay.remove();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }

  /**
   * Normalize image data to string URLs
   * JSON-LD images can be: string, {url: string}, or arrays of either
   * @param {*} imageData - Image data from JSON-LD
   * @returns {Array} - Array of image URL strings
   */
  function decodeHtmlEntities(str) {
    if (!str || !str.includes('&')) return str;
    const el = document.createElement('textarea');
    el.innerHTML = str;
    return el.value;
  }

  /**
   * Resolve a potentially relative URL to an absolute URL
   * (mirrors productExtraction.ts — needed for paste-URL mode where the
   * parsed document's relative paths must resolve against the pasted URL)
   */
  function resolveUrl(src, baseUrl) {
    if (!src) return '';
    // Already absolute
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      return src;
    }
    // Protocol-relative
    if (src.startsWith('//')) {
      return 'https:' + src;
    }
    // Relative — resolve against base URL
    if (baseUrl) {
      try {
        return new URL(src, baseUrl).href;
      } catch {
        return src;
      }
    }
    return src;
  }

  function normalizeImageUrls(imageData, baseUrl) {
    if (!imageData) return [];

    const urls = [];
    const dataArray = Array.isArray(imageData) ? imageData : [imageData];

    dataArray.forEach(item => {
      if (typeof item === 'string') {
        // Direct URL string
        urls.push(resolveUrl(item, baseUrl));
      } else if (typeof item === 'object' && item !== null) {
        // Image object with url property (Wix uses contentUrl per schema.org ImageObject)
        if (item.url) {
          urls.push(resolveUrl(item.url, baseUrl));
        } else if (item.contentUrl) {
          urls.push(resolveUrl(item.contentUrl, baseUrl));
        } else if (item['@id']) {
          // Sometimes uses @id instead of url
          urls.push(resolveUrl(item['@id'], baseUrl));
        }
      }
    });

    return urls;
  }

  /**
   * Filter and prioritize images (skip small thumbnails, prioritize high-res)
   * @param {Array} imageUrls - Array of image URLs (strings)
   * @returns {Array} - Filtered and sorted image URLs
   */
  function filterAndPrioritizeImages(imageUrls) {
    if (!imageUrls || imageUrls.length === 0) return [];

    return imageUrls
      .filter(url => {
        if (!url || typeof url !== 'string') return false;
        // Skip very small images (likely thumbnails/icons)
        const hasSmallIndicator = url.match(/_(thumb|small|icon|avatar|mini|tiny|50x|100x)/i);
        return !hasSmallIndicator;
      })
      .sort((a, b) => {
        // Prioritize images with "large", "master", "original" in URL
        const aScore = (a.match(/_(large|master|original|1200x|2000x)/i) ? 10 : 0);
        const bScore = (b.match(/_(large|master|original|1200x|2000x)/i) ? 10 : 0);
        return bScore - aScore;
      })
      .slice(0, 5); // Limit to 5 images max
  }

  /**
   * Extract product data from current page (wrapper for backward compatibility)
   */
  async function extractProductData() {
    return await extractProductDataFromDocument(document);
  }

  /**
   * Try to parse JSON with error recovery
   * @param {string} jsonString - JSON string to parse
   * @returns {Object|null} - Parsed object or null
   */
  function parseJsonLdSafely(jsonString) {
    // Try normal parsing first
    try {
      return JSON.parse(jsonString);
    } catch (firstError) {
      console.log('⚠️ Standard JSON parse failed, attempting recovery...');

      try {
        // Aggressive fixes for malformed JSON
        let fixed = jsonString
          // Remove BOM if present
          .replace(/^\uFEFF/, '')
          // Fix control characters
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
          // Remove trailing commas before } or ]
          .replace(/,(\s*[}\]])/g, '$1')
          // Fix numbers with leading zeros (e.g., 0123 -> 123)
          .replace(/:\s*0+(\d+)/g, ': $1')
          // Fix array items missing commas (risky but worth a try)
          .replace(/"\s*\n\s*"/g, '",\n"')
          // Fix object properties missing commas
          .replace(/}(\s*)"(\w+)":/g, '},\n"$2":')
          // Fix single quotes to double quotes (common error)
          .replace(/'/g, '"')
          // Remove comments (// and /* */)
          .replace(/\/\/.*/g, '')
          .replace(/\/\*[\s\S]*?\*\//g, '');

        return JSON.parse(fixed);
      } catch (secondError) {
        console.log('⚠️ Advanced recovery failed, trying aggressive cleanup...');

        try {
          // Even more aggressive: try to extract just the Product object
          const productMatch = jsonString.match(/"@type"\s*:\s*"Product"[\s\S]*?(?=\n\s*<\/script>|$)/);
          if (productMatch) {
            // Try to balance braces
            let productStr = productMatch[0];
            let braceCount = 0;
            let lastValidIndex = 0;

            for (let i = 0; i < productStr.length; i++) {
              if (productStr[i] === '{') braceCount++;
              if (productStr[i] === '}') braceCount--;
              if (braceCount === 0 && productStr[i] === '}') {
                lastValidIndex = i + 1;
                break;
              }
            }

            if (lastValidIndex > 0) {
              productStr = '{' + productStr.substring(0, lastValidIndex);
              // Apply fixes again
              productStr = productStr
                .replace(/,(\s*[}\]])/g, '$1')
                .replace(/:\s*0+(\d+)/g, ': $1');

              return JSON.parse(productStr);
            }
          }
        } catch (thirdError) {
          console.log('❌ All JSON recovery attempts failed:', thirdError.message);
        }

        return null;
      }
    }
  }

  /**
   * Validate if extracted product data is complete enough to use
   * @param {Object} productData - Extracted product data
   * @returns {boolean} - True if data is usable
   */
  function isValidProductData(productData) {
    if (!productData) return false;

    // Must have at least a name
    if (!productData.name || productData.name.trim() === '') {
      return false;
    }

    // Should have price OR image (at minimum one piece of useful data besides name)
    const hasPrice = productData.price && productData.price !== '';
    const hasImage = productData.imageUrls && productData.imageUrls.length > 0;

    if (!hasPrice && !hasImage) {
      console.log('⚠️ Incomplete extraction - missing both price and image');
      return false;
    }

    return true;
  }

  /**
   * Extract product data from a Document object (current page OR parsed HTML)
   * @param {Document} doc - Document object to extract from
   * @returns {Promise<Object|null>} - Product data or null if not found
   */
  async function extractProductDataFromDocument(doc = document) {
    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    console.log(`🔍 Found ${jsonLdScripts.length} JSON-LD scripts`);

    const currentUrl = doc.URL || window.location.href;
    const currentPath = new URL(currentUrl).pathname;
    console.log(`📍 Current page path: ${currentPath}`);

    // Collect all valid products first
    const allProducts = [];

    for (let i = 0; i < jsonLdScripts.length; i++) {
      const scriptContent = jsonLdScripts[i].textContent.trim();
      console.log(`📄 Parsing JSON-LD script #${i + 1}...`);

      const data = parseJsonLdSafely(scriptContent);

      if (!data) {
        console.warn(`⚠️ Skipping invalid JSON-LD script #${i + 1}`);
        continue;
      }

      console.log(`📊 Parsed data type:`, data['@type']);

      try {

      if (data['@type'] === 'Product') {
        console.log('✅ Found Product type, extracting...');
        const offersData = data.offers || data.Offers;
        const firstOffer = Array.isArray(offersData) ? offersData[0] : offersData;
        const offerUrl = firstOffer?.url || data.url || data['@id'] || '';

        console.log('📦 Product data:', {
          name: data.name,
          offerUrl: offerUrl,
          hasOffers: !!offersData,
          offersIsArray: Array.isArray(offersData),
          offersLength: Array.isArray(offersData) ? offersData.length : 'N/A'
        });

        const result = extractFromProduct(data, currentUrl);
        console.log('✅ Extraction result:', result);

        // Check if this product matches the current URL
        let isMatch = false;
        if (offerUrl) {
          try {
            const offerPath = new URL(offerUrl).pathname;
            // Exact match OR current path starts with offer path (handles slug suffixes like /items/6724131-name)
            isMatch = offerPath === currentPath || currentPath.startsWith(offerPath + '-') || currentPath.startsWith(offerPath + '/');
            console.log(`🔗 URL match check: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'} (offer: ${offerPath})`);
          } catch (e) {
            console.log('⚠️ Could not parse offer URL');
          }
        }

        // Validate result before adding to candidates
        if (isValidProductData(result)) {
          allProducts.push({ result, isMatch, index: i });
          console.log(`✅ Valid product data found (match: ${isMatch})`);
        } else {
          console.log('⚠️ JSON-LD data incomplete, will try next');
        }
      }

      if (data['@type'] === 'ProductGroup') {
        console.log('✅ Found ProductGroup type, extracting...');
        const result = extractFromProductGroup(data, currentUrl);
        console.log('✅ Extraction result:', result);

        if (isValidProductData(result)) {
          allProducts.push({ result, isMatch: false, index: i });
          console.log('✅ Valid ProductGroup data found');
        } else {
          console.log('⚠️ ProductGroup data incomplete, will try next');
        }
      }

      if (data['@graph'] && Array.isArray(data['@graph'])) {
        console.log('📊 Found @graph, searching for product...');
        const product = data['@graph'].find(item =>
          item && (item['@type'] === 'Product' || item['@type'] === 'ProductGroup')
        );
        if (product) {
          console.log(`✅ Found ${product['@type']} in @graph`);
          const result = product['@type'] === 'Product'
            ? extractFromProduct(product, currentUrl)
            : extractFromProductGroup(product, currentUrl);

          if (isValidProductData(result)) {
            allProducts.push({ result, isMatch: false, index: i });
            console.log('✅ Valid product data from @graph');
          }
        }
      }

      } catch (scriptError) {
        // One malformed JSON-LD script must not kill the whole extraction chain
        console.warn(`⚠️ Error processing JSON-LD script #${i + 1}, skipping:`, scriptError);
        continue;
      }
    }

    // After collecting all products, check for URL match
    if (allProducts.length > 0) {
      console.log(`📊 Found ${allProducts.length} valid product(s) in JSON-LD`);

      // Enrich missing price from the DOM. Some sites (e.g. agalease-baby.co.il)
      // emit Product JSON-LD with an empty offers array, leaving price = ''.
      const enrichPriceIfMissing = (result) => {
        if (result && (!result.price || result.price === '')) {
          const domPrice = extractPriceFromDOM(doc);
          if (domPrice) {
            console.log(`💰 Enriched JSON-LD result with DOM price: ${domPrice}`);
            result.price = domPrice;
            if (!result.priceCurrency) result.priceCurrency = 'ILS';
          }
        }
        return result;
      };

      // Only return if we have a URL match
      const matchedProduct = allProducts.find(p => p.isMatch);
      if (matchedProduct) {
        console.log(`✅ Using URL-matched product from script #${matchedProduct.index + 1}`);
        return enrichPriceIfMissing(matchedProduct.result);
      }

      // Single product with no URL match — use it directly (e.g. babyshome slug suffix)
      if (allProducts.length === 1) {
        console.log(`✅ Single product in JSON-LD, using it directly`);
        return enrichPriceIfMissing(allProducts[0].result);
      }

      // No URL match - fall through to platform-specific extraction
      console.log(`⚠️ No URL match found in ${allProducts.length} product(s), trying platform-specific fallback...`);
    } else {
      console.log('⚠️ No valid products found in JSON-LD, trying platform-specific fallback...');
    }

    // Check for non-product page types (Article, BlogPost, etc.) —
    // mirrors productExtraction.ts so pasted article links get a clear error.
    // Paste mode only (doc !== document): live pages keep their DOM fallbacks
    // even when the site emits a stray WebPage/Article JSON-LD block.
    const nonProductTypes = doc === document ? [] : ['Article', 'BlogPosting', 'NewsArticle', 'WebPage',
      'AboutPage', 'ContactPage', 'FAQPage', 'CollectionPage'];

    for (const script of nonProductTypes.length ? jsonLdScripts : []) {
      try {
        const data = JSON.parse(script.textContent || '');
        const pageType = data['@type'];
        if (nonProductTypes.includes(pageType)) {
          throw new Error('הדף הזה נראה כמו כתבה ולא כמו דף מוצר. נסה להדביק קישור ישיר לדף המוצר.');
        }
        if (data['@graph'] && Array.isArray(data['@graph'])) {
          const hasNonProduct = data['@graph'].some(item =>
            item && nonProductTypes.includes(item['@type'])
          );
          const hasProduct = data['@graph'].some(item =>
            item && (item['@type'] === 'Product' || item['@type'] === 'ProductGroup')
          );
          if (hasNonProduct && !hasProduct) {
            throw new Error('הדף הזה נראה כמו כתבה ולא כמו דף מוצר. נסה להדביק קישור ישיר לדף המוצר.');
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('כתבה')) {
          throw error;
        }
      }
    }

    return await extractFromShopifyFallback(doc);
  }

  /**
   * Try to fetch product data from Shopify JSON API
   * @returns {Promise<Object|null>} - Product data or null
   */
  async function tryShopifyJsonApi() {
    try {
      // Shopify product URL: /products/{handle}
      // JSON API: /products/{handle}.json
      const url = window.location.pathname;
      if (!url.includes('/products/')) {
        return null;
      }

      const jsonUrl = url.endsWith('.json') ? url : url + '.json';
      console.log(`🔍 Trying Shopify JSON API: ${jsonUrl}`);

      const response = await fetch(jsonUrl);
      if (!response.ok) {
        console.log('❌ Shopify JSON API returned:', response.status);
        return null;
      }

      const data = await response.json();
      if (!data.product) {
        return null;
      }

      const product = data.product;
      const firstVariant = product.variants?.[0] || {};

      return {
        name: product.title || '',
        price: firstVariant.price || product.price || '',
        priceCurrency: 'ILS',
        brand: product.vendor || '',
        category: product.product_type || '',
        imageUrls: product.images?.map(img => img.src || img) || []
      };

    } catch (error) {
      console.log('❌ Shopify JSON API failed:', error.message);
      return null;
    }
  }

  /**
   * Detect e-commerce platform
   * @param {Document} doc - Document object
   * @returns {string} - Platform name
   */
  function detectPlatform(doc = document) {
    // Check for Wix (has wix-specific meta tags or scripts)
    if (doc.querySelector('meta[name="generator"][content*="Wix"]') ||
        doc.querySelector('script[src*="static.wixstatic.com"]') ||
        doc.querySelector('meta[http-equiv="X-Wix-Meta-Site-Id"]')) {
      return 'wix';
    }

    // Check for Amazon
    if (window.location.hostname.includes('amazon.com') ||
        window.location.hostname.includes('amazon.co.uk') ||
        window.location.hostname.includes('amazon.de') ||
        window.location.hostname.includes('amazon.fr') ||
        window.location.hostname.includes('amazon.it') ||
        window.location.hostname.includes('amazon.es') ||
        window.location.hostname.includes('amazon.ca')) {
      return 'amazon';
    }

    // Check for AliExpress
    if (window.location.hostname.includes('aliexpress.com')) {
      return 'aliexpress';
    }

    // Check for KSP (ksp.co.il) - React/MUI SPA, no JSON-LD
    if (window.location.hostname.includes('ksp.co.il')) {
      return 'ksp';
    }

    // Check for H&M product pages
    if (window.location.hostname.includes('hm.com')) {
      return 'hm';
    }

    // Check for Next Israel product pages
    if (window.location.hostname.includes('next.co.il')) {
      return 'next';
    }

    // Check for Shopify
    if (doc.querySelector('[data-shopify]') ||
        doc.querySelector('script[src*="shopify"]') ||
        window.Shopify ||
        doc.body.innerHTML.includes('Shopify')) {
      return 'shopify';
    }

    // Check for WooCommerce (WordPress)
    if (doc.querySelector('.woocommerce') ||
        doc.querySelector('link[href*="woocommerce"]')) {
      return 'woocommerce';
    }

    // Check for Magento
    if (doc.body.classList.contains('catalog-product-view') ||
        doc.querySelector('script[src*="mage"]')) {
      return 'magento';
    }

    return 'unknown';
  }

  /**
   * Extract product data from Amazon with USD to ILS conversion
   * @param {Document} doc - Document object
   * @returns {Promise<Object|null>} - Product data or null
   */
  async function extractFromAmazon(doc = document) {
    console.log('🛍️ Attempting Amazon extraction...');

    // USD to ILS exchange rate (updated December 2025)
    const USD_TO_ILS = 3.19;

    const productData = {
      name: '',
      price: '',
      priceCurrency: 'ILS', // Always convert to ILS
      brand: 'Amazon',
      category: '',
      imageUrls: []
    };

    // Extract title
    const titleSelectors = [
      '#productTitle',
      '#title',
      'h1.product-title',
      'span#productTitle',
      '[data-feature-name="title"] h1'
    ];

    for (const selector of titleSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const title = element.textContent?.trim() || '';
        if (title && title.length > 3) {
          productData.name = title;
          console.log(`   ✓ Found title: ${title.substring(0, 50)}...`);
          break;
        }
      }
    }

    // Extract price (multiple formats and locations)
    const priceSelectors = [
      '.a-price .a-offscreen',           // Main price (hidden but accurate)
      '#priceblock_ourprice',            // Our price
      '#priceblock_dealprice',           // Deal price
      '.a-price-whole',                  // Whole number part
      '#corePrice_feature_div .a-price .a-offscreen', // Core price feature
      '[data-a-color="price"] .a-offscreen',
      '.priceToPay .a-offscreen',        // Price to pay
      '#corePriceDisplay_desktop_feature_div .a-price .a-offscreen'
    ];

    let foundUsdPrice = null;

    for (const selector of priceSelectors) {
      const elements = doc.querySelectorAll(selector);
      for (const element of elements) {
        const priceText = element.textContent?.trim() || '';

        // Extract USD price
        const usdMatch = priceText.match(/\$\s*([\d,]+\.?\d*)/);
        if (usdMatch && usdMatch[1]) {
          const usdPrice = parseFloat(usdMatch[1].replace(',', ''));
          if (usdPrice > 0) {
            foundUsdPrice = usdPrice;
            console.log(`   $ Found USD price: $${usdPrice}`);
            break;
          }
        }
      }
      if (foundUsdPrice) break;
    }

    // Convert USD to ILS
    if (foundUsdPrice) {
      const ilsPrice = (foundUsdPrice * USD_TO_ILS).toFixed(2);
      productData.price = ilsPrice;
      productData.priceCurrency = 'ILS';
      console.log(`   💱 Converted $${foundUsdPrice} USD → ₪${ilsPrice} ILS (rate: ${USD_TO_ILS})`);
    }

    // Extract images
    const imageSelectors = [
      '#landingImage',                    // Main product image
      '#imgTagWrapperId img',             // Image wrapper
      '#imageBlock img[data-old-hires]',  // High-res image
      '#altImages img',                   // Alternative images
      '.imgTagWrapper img',               // Wrapper images
      '[data-a-dynamic-image] img'        // Dynamic images
    ];

    for (const selector of imageSelectors) {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(element => {
        const img = element;
        const imageUrl = img.getAttribute('data-old-hires') ||
                        img.getAttribute('data-a-hires') ||
                        img.src ||
                        '';

        if (imageUrl && imageUrl.startsWith('http') &&
            !imageUrl.includes('data:image') &&
            !imageUrl.includes('spinner') &&
            !imageUrl.includes('loading') &&
            !productData.imageUrls.includes(imageUrl)) {
          productData.imageUrls.push(imageUrl);
        }
      });
    }

    // Try to extract brand
    const brandSelectors = [
      '#bylineInfo',
      '.a-size-base.po-brand',
      '[data-feature-name="bylineInfo"]',
      '#brand'
    ];

    for (const selector of brandSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const brandText = element.textContent?.trim() || '';
        const brandMatch = brandText.match(/(?:Brand:|Visit the|by)\s*(.+?)(?:\s+Store)?$/i);
        if (brandMatch && brandMatch[1]) {
          productData.brand = brandMatch[1].trim();
          console.log(`   🏷️ Found brand: ${productData.brand}`);
          break;
        } else if (brandText && !brandText.includes('http')) {
          productData.brand = brandText.replace(/^Visit the\s+/i, '').replace(/\s+Store$/i, '').trim();
          console.log(`   🏷️ Found brand: ${productData.brand}`);
          break;
        }
      }
    }

    console.log(`   📊 Amazon extraction summary:`);
    console.log(`      Title: ${productData.name ? '✓' : '✗'}`);
    console.log(`      Price: ${productData.price ? `₪${productData.price} ILS` : '✗'}`);
    console.log(`      Images: ${productData.imageUrls.length}`);

    // Validate minimum required data
    if (productData.name && (productData.price || productData.imageUrls.length > 0)) {
      console.log('✅ Amazon extraction successful');
      return productData;
    }

    console.log('❌ Amazon extraction failed - insufficient data');
    return null;
  }

  /**
   * Extract product data from AliExpress (handles modals, dynamic content, JS variables)
   * @param {Document} doc - Document object
   * @returns {Promise<Object|null>} - Product data or null
   */
  async function extractFromAliExpress(doc = document) {
    console.log('🛍️ Attempting AliExpress extraction...');

    // Wait a bit for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Detect what currency AliExpress is showing the user right now
      const pageDisplaysILS = (doc.body?.innerText?.match(/₪/g) || []).length > 3;
      console.log(`🌍 AliExpress display currency: ${pageDisplaysILS ? 'ILS (₪)' : 'USD ($)'}`);

      let productData = {
        name: '',
        price: '',
        priceCurrency: pageDisplaysILS ? 'ILS' : 'USD',
        brand: 'AliExpress',
        category: '',
        imageUrls: []
      };

      // DEBUG: Show all available window variables
      console.log('🔍 DEBUG: Available AliExpress window variables:');
      if (window.runParams) console.log('  ✓ window.runParams exists');
      if (window._d_c_) console.log('  ✓ window._d_c_ exists');
      if (window.__INITIAL_STATE__) console.log('  ✓ window.__INITIAL_STATE__ exists');
      if (window.pageData) console.log('  ✓ window.pageData exists');

      // Method 1: Try window.runParams (common AliExpress variable)
      if (window.runParams) {
        console.log('📦 Found window.runParams, attempting extraction...');
        console.log('📦 window.runParams structure:', window.runParams);

        try {
          if (window.runParams.data) {
            const data = typeof window.runParams.data === 'string'
              ? JSON.parse(window.runParams.data)
              : window.runParams.data;

            console.log('📦 Parsed data structure:', data);
            console.log('📦 Available modules:', Object.keys(data));

            // Try multiple price paths
            const pricePaths = [
              { path: 'priceModule.minActivityAmount.value', currency: 'priceModule.minActivityAmount.currency' },
              { path: 'priceModule.minAmount.value', currency: 'priceModule.minAmount.currency' },
              { path: 'priceModule.price', currency: 'priceModule.currency' },
              { path: 'price', currency: 'currency' }
            ];

            for (let { path, currency } of pricePaths) {
              const pathParts = path.split('.');
              const currencyParts = currency.split('.');

              let priceValue = data;
              let currencyValue = data;

              // Navigate the object path
              for (let part of pathParts) {
                priceValue = priceValue?.[part];
              }
              for (let part of currencyParts) {
                currencyValue = currencyValue?.[part];
              }

              if (priceValue) {
                productData.price = priceValue.toString();
                productData.priceCurrency = currencyValue || 'USD';
                console.log(`✅ Found price in window.runParams.data.${path}: ${priceValue} ${productData.priceCurrency}`);
                break;
              }
            }

            if (data.titleModule?.subject) {
              productData.name = data.titleModule.subject;
              console.log(`✅ Found title: ${productData.name}`);
            }

            if (data.imageModule?.imagePathList) {
              productData.imageUrls = data.imageModule.imagePathList;
              console.log(`✅ Found ${productData.imageUrls.length} images`);
            }

            if (productData.name && productData.price) {
              console.log('✅ Successfully extracted from window.runParams');
              return productData;
            }
          }
        } catch (e) {
          console.log('⚠️ window.runParams parsing failed:', e.message);
          console.error(e);
        }
      }

      // Method 2: Try window._d_c_ (AliExpress data container)
      if (window._d_c_) {
        console.log('📦 Found window._d_c_');
        try {
          if (window._d_c_.DCData?.imagePathList) {
            productData.imageUrls = window._d_c_.DCData.imagePathList;
            console.log(`✅ Found ${productData.imageUrls.length} images in _d_c_`);
          }
        } catch (e) {
          console.log('⚠️ window._d_c_ parsing failed:', e.message);
        }
      }

      // Method 3: Try window.__INITIAL_STATE__ or window.__APP_STATE__
      const stateVars = ['__INITIAL_STATE__', '__APP_STATE__', 'pageData'];
      for (let varName of stateVars) {
        if (window[varName]) {
          console.log(`📦 Found window.${varName}`);
          try {
            const state = window[varName];
            // Try to find product data in nested structure
            const searchForProduct = (obj, depth = 0) => {
              if (depth > 5) return null;
              if (!obj || typeof obj !== 'object') return null;

              // Look for common product fields
              if (obj.subject || obj.title || obj.productTitle) {
                return obj;
              }

              // Search nested objects
              for (let key in obj) {
                if (key.toLowerCase().includes('product') ||
                    key.toLowerCase().includes('item') ||
                    key.toLowerCase().includes('detail')) {
                  const result = searchForProduct(obj[key], depth + 1);
                  if (result) return result;
                }
              }
              return null;
            };

            const productInfo = searchForProduct(state);
            if (productInfo) {
              if (productInfo.subject || productInfo.title || productInfo.productTitle) {
                productData.name = productInfo.subject || productInfo.title || productInfo.productTitle;
              }
              if (productInfo.price || productInfo.salePrice) {
                productData.price = productInfo.price || productInfo.salePrice;
              }
              if (productData.name) {
                console.log(`✅ Extracted product name from window.${varName}`);
              }
            }
          } catch (e) {
            console.log(`⚠️ window.${varName} parsing failed:`, e.message);
          }
        }
      }

      // Method 4: DOM extraction from modal/page
      console.log('🔍 Trying DOM extraction...');

      // First, try to find the active product modal/container (for bundle deals)
      let productContainer = doc;
      const modalSelectors = [
        '.pdp-mini-wrap',                // AliExpress bundle deals product modal
        '.comet-v2-modal-body',          // AliExpress comet modal body
        '.cosmos-drawer-body',           // AliExpress cosmos drawer
        '[class*="cosmos-drawer-body"]',
        '[class*="modal"][class*="show"]',
        '[class*="modal"][class*="active"]',
        '[class*="modal"][class*="visible"]',
        '[class*="overlay"][class*="show"]',
        '[class*="dialog"][class*="open"]',
        '[data-pl="product-container"]',
        '[class*="product-detail"]',
        '[class*="ProductDetail"]'
      ];

      for (let selector of modalSelectors) {
        const el = doc.querySelector(selector);
        // Only use as container if visible AND contains price/product data (avoids login drawers etc.)
        if (el && el.offsetParent !== null &&
            (el.querySelector('[class*="price"]') || el.querySelector('[itemprop="price"]') ||
             el.querySelector('[class*="Price"]') || el.innerText?.includes('₪') || el.innerText?.includes('$'))) {
          productContainer = el;
          console.log(`✅ Found active product container: ${selector}`);
          break;
        }
      }

      // AliExpress product title selectors (works for modals and regular pages)
      const titleSelectors = [
        '.product-title-text',
        '.product-name',
        '[data-pl="product-title"]',
        'h1[data-pl]',
        '.pdp-product-title',
        'h1.product-title',
        '[class*="productTitle"]',
        '[class*="ProductTitle"]',
        'h1',
      ];

      for (let selector of titleSelectors) {
        const element = productContainer.querySelector(selector);
        if (element && element.textContent.trim()) {
          productData.name = element.textContent.trim();
          console.log(`✅ Found title in ${selector}:`, productData.name);
          break;
        }
      }

      // AliExpress price selectors - comprehensive list
      const priceSelectors = [
        // Common selectors
        '.product-price-value',
        '[data-pl="product-price"]',
        '.pdp-price',
        '[class*="productPrice"]',
        '[class*="ProductPrice"]',
        '.price--current',
        '[itemprop="price"]',
        // New AliExpress-specific selectors
        '[class*="Price--price"]',
        '[class*="HalfPrice--price"]',
        '[class*="uniform-banner-box-price"]',
        '.price-current',
        '.price-sale',
        '[class*="snow-price"]',
        '[data-spm-anchor-id*="price"]',
        'span.price',
        '.product-price',
        // Check data attributes
        '[data-price]',
        '[data-product-price]',
        // Bundle deals modal specific
        '[class*="SnowPrice"]',
        '[class*="price"] span',
        'div[class*="price"] span',
        // Look for any element with price-like class
        '[class*="price-"]',
        '[class*="-price"]',
        // Generic price containers
        '.price span',
        '.price div',
        'span[class*="amount"]'
      ];

      // Collect all found prices with their details
      const foundPrices = [];

      for (let selector of priceSelectors) {
        const elements = productContainer.querySelectorAll(selector);
        elements.forEach(element => {
          // Try data attribute first
          if (element.dataset.price) {
            foundPrices.push({
              price: element.dataset.price,
              currency: 'USD',
              priority: 10,
              selector: selector,
              source: 'data-price'
            });
            return;
          }

          // Extract from text
          const priceText = element.textContent.trim();
          if (!priceText) return;

          console.log(`🔍 Checking price in ${selector}:`, priceText);

          // Check if it's USD
          const usdMatch = priceText.match(/(?:US\s*)?[\$]\s*([\d,]+\.?\d*)/i);
          if (usdMatch && usdMatch[1]) {
            // If page displays ILS, USD prices are low priority (user sees ILS)
            const usdPriority = pageDisplaysILS ? 2 : 10;
            foundPrices.push({
              price: usdMatch[1].replace(',', ''),
              currency: 'USD',
              priority: usdPriority,
              selector: selector,
              source: priceText
            });
            console.log(`   💵 Found USD price: $${usdMatch[1]} (priority: ${usdPriority})`);
            return;
          }

          // Check if it's shekel
          const ilsMatch = priceText.match(/₪\s*([\d,]+\.?\d*)/);
          if (ilsMatch && ilsMatch[1]) {
            // If page displays ILS, ILS prices are highest priority
            const hasDiscount = priceText.includes('%') || priceText.includes('off') || priceText.includes('הנחה');
            const priority = pageDisplaysILS ? (hasDiscount ? 12 : 10) : (hasDiscount ? 8 : 5);
            foundPrices.push({
              price: ilsMatch[1].replace(',', ''),
              currency: 'ILS',
              priority: priority,
              selector: selector,
              source: priceText
            });
            console.log(`   ₪ Found ILS price: ₪${ilsMatch[1]} (priority: ${priority})`);
            return;
          }

          // Generic number — assume page display currency
          const numMatch = priceText.match(/^[\d,]+\.?\d*$/);
          if (numMatch && numMatch[0].length > 0) {
            foundPrices.push({
              price: numMatch[0].replace(',', ''),
              currency: pageDisplaysILS ? 'ILS' : 'USD',
              priority: 3,
              selector: selector,
              source: priceText
            });
            console.log(`   🔢 Found number: ${numMatch[0]} (assumed ${pageDisplaysILS ? 'ILS' : 'USD'})`);
          }
        });
      }

      // Select best price from all candidates
      if (foundPrices.length > 0) {
        console.log(`📊 Found ${foundPrices.length} price candidates total`);

        // Filter for reasonable product prices (not shipping, not bundles)
        const reasonablePrices = foundPrices.filter(p => {
          const price = parseFloat(p.price);
          return price > 0.5 && price < 1000; // Reasonable product price range
        });

        if (reasonablePrices.length > 0) {
          // Sort by priority (USD first), then by LOWEST price (product price usually lowest)
          reasonablePrices.sort((a, b) => {
            if (b.priority !== a.priority) return b.priority - a.priority;
            // Among same priority, pick LOWEST price (product price, not total/shipping)
            return parseFloat(a.price) - parseFloat(b.price);
          });

          const bestPrice = reasonablePrices[0];
          productData.price = bestPrice.price;
          productData.priceCurrency = bestPrice.currency;
          console.log(`✅ Selected best price from ${reasonablePrices.length} candidates:`);
          console.log(`   Price: ${bestPrice.price} ${bestPrice.currency}`);
          console.log(`   Source: ${bestPrice.source}`);
          console.log(`   All candidates:`, reasonablePrices.map(p => `${p.price} ${p.currency} (priority ${p.priority})`));
        }
      }

      // Additional price extraction from page content
      if (!productData.price) {
        console.log('🔍 Trying aggressive price extraction from page content...');
        // Look for price patterns in entire page
        const bodyText = doc.body.innerText;

        // Find ALL prices and choose the highest one (likely the product price)
        const allPrices = [];

        const pricePatterns = pageDisplaysILS ? [
          { pattern: /₪\s*([\d,]+\.?\d*)/g, priority: 10, currency: 'ILS' },
          { pattern: /([\d,]+\.?\d*)\s*₪/g, priority: 9, currency: 'ILS' },
          { pattern: /US\s*\$\s*([\d,]+\.?\d*)/gi, priority: 2, currency: 'USD' },
          { pattern: /USD\s*([\d,]+\.?\d*)/gi, priority: 2, currency: 'USD' },
          { pattern: /\$\s*([\d,]+\.?\d*)/g, priority: 1, currency: 'USD' },
        ] : [
          { pattern: /US\s*\$\s*([\d,]+\.?\d*)/gi, priority: 10, currency: 'USD' },
          { pattern: /USD\s*([\d,]+\.?\d*)/gi, priority: 9, currency: 'USD' },
          { pattern: /\$\s*([\d,]+\.?\d*)/g, priority: 8, currency: 'USD' },
          { pattern: /Price:\s*([\d,]+\.?\d*)/gi, priority: 7, currency: 'USD' },
          { pattern: /₪\s*([\d,]+\.?\d*)/g, priority: 5, currency: 'ILS' },
          { pattern: /([\d,]+\.?\d*)\s*₪/g, priority: 4, currency: 'ILS' }
        ];

        for (let { pattern, priority, currency } of pricePatterns) {
          let match;
          while ((match = pattern.exec(bodyText)) !== null) {
            const price = parseFloat(match[1].replace(',', ''));
            if (price > 0 && price < 10000) { // Reasonable price range
              allPrices.push({ price, priority, currency, text: match[0] });
              console.log(`📊 Found price candidate: ${match[0]} = ${price} (priority: ${priority})`);
            }
          }
        }

        if (allPrices.length > 0) {
          // Sort by priority (highest first), then by price (highest first)
          allPrices.sort((a, b) => {
            if (b.priority !== a.priority) return b.priority - a.priority;
            return b.price - a.price;
          });

          const bestPrice = allPrices[0];
          productData.price = bestPrice.price.toString();
          productData.priceCurrency = bestPrice.currency;
          console.log(`✅ Selected best price: ${bestPrice.text} = ${productData.price} ${productData.priceCurrency}`);
          console.log(`   (Chose from ${allPrices.length} candidates, prioritized USD over other currencies)`);
        }
      }

      // Extract currency from price element or page
      const currencyElement = productContainer.querySelector('[data-currency]') ||
                             productContainer.querySelector('[class*="currency"]');
      if (currencyElement) {
        productData.priceCurrency = currencyElement.dataset.currency ||
                                    currencyElement.textContent.match(/[A-Z]{3}/)?.[0] ||
                                    'USD';
      }

      // AliExpress image selectors (handles modals and carousels)
      const imageSelectors = [
        // Common image selectors
        '.images-view-item img',
        '.magnifier-image',
        '[data-role="thumb"] img',
        '.product-image img',
        '.pdp-gallery img',
        '[class*="productImage"] img',
        '[class*="ProductImage"] img',
        // New AliExpress-specific selectors
        '[class*="ImageView"] img',
        '[class*="magnifier"] img',
        '[class*="gallery"] img',
        '.slider-image img',
        '[class*="slider"] img',
        '[class*="product-img"] img',
        'img[class*="main"]',
        'img[class*="zoom"]',
        // Try all images as fallback
        'img[src*="alicdn.com"]'
      ];

      for (let selector of imageSelectors) {
        console.log(`🔍 Trying image selector: ${selector}`);
        const images = productContainer.querySelectorAll(selector);
        console.log(`   Found ${images.length} images with this selector`);

        if (images.length > 0) {
          images.forEach(img => {
            // Try multiple sources
            let src = img.src || img.dataset.src || img.dataset.original || img.dataset.url;

            // Also check for srcset
            if (!src && img.srcset) {
              const srcsetParts = img.srcset.split(',');
              if (srcsetParts.length > 0) {
                src = srcsetParts[0].trim().split(' ')[0];
              }
            }

            console.log(`   Image src:`, src);

            if (src && !src.includes('placeholder') && !src.includes('loading') && !src.includes('data:image')) {
              // Get full-size image (remove dimension parameters)
              let fullSrc = src;

              // AliExpress specific: remove size parameters
              if (src.includes('alicdn.com')) {
                // Remove _xxxxx.jpg patterns and size parameters
                fullSrc = src.split('_')[0];
                // Ensure it ends with image extension
                if (!fullSrc.match(/\.(jpg|jpeg|png|webp)$/i)) {
                  fullSrc += '.jpg';
                }
              }

              if (!productData.imageUrls.includes(fullSrc)) {
                productData.imageUrls.push(fullSrc);
                console.log(`   ✅ Added image:`, fullSrc);
              }
            }
          });

          if (productData.imageUrls.length > 0) {
            console.log(`✅ Found ${productData.imageUrls.length} total images from ${selector}`);
            break;
          }
        }
      }

      // Clean up and deduplicate images
      productData.imageUrls = [...new Set(productData.imageUrls)].slice(0, 5);

      // Method 5: Fallback to Open Graph meta tags
      if (!productData.name) {
        const ogTitle = doc.querySelector('meta[property="og:title"]')?.content;
        if (ogTitle) {
          productData.name = ogTitle;
          console.log('✅ Found title in og:title');
        }
      }

      if (productData.imageUrls.length === 0) {
        const ogImage = doc.querySelector('meta[property="og:image"]')?.content;
        if (ogImage) {
          productData.imageUrls.push(ogImage);
          console.log('✅ Found image in og:image');
        }
      }

      // If page shows ILS but we ended up with a USD price (e.g. from window.runParams),
      // convert to ILS so Nesty always stores the currency the user sees
      if (productData.price && productData.priceCurrency === 'USD' && pageDisplaysILS) {
        const converted = (parseFloat(productData.price) * FX_TO_ILS.USD).toFixed(2);
        console.log(`💱 Page shows ILS but got USD price — converting $${productData.price} → ₪${converted}`);
        productData.price = converted;
        productData.priceCurrency = 'ILS';
      }

      // Validate extraction
      if (productData.name && (productData.price || productData.imageUrls.length > 0)) {
        console.log('✅ AliExpress extraction successful:', productData);
        return productData;
      }

      console.log('❌ AliExpress extraction failed - insufficient data');
      return null;

    } catch (error) {
      console.error('❌ AliExpress extraction error:', error);
      return null;
    }
  }

  /**
   * Extract product data from KSP (ksp.co.il) pages.
   * KSP is a React/Material-UI SPA with no JSON-LD and no product:price meta tags.
   * Price is rendered as <span>₪</span> + text node inside a div with class
   * containing "current-d" (JSS-hashed). Title is in <h1>.
   * @param {Document} doc - Document object
   * @returns {Object|null} - Product data or null
   */
  function extractFromKsp(doc = document) {
    try {
      console.log('🛍️ Extracting from KSP...');

      const productData = {
        name: '',
        price: '',
        priceCurrency: 'ILS',
        brand: '',
        category: '',
        imageUrls: []
      };

      // Title
      const h1 = doc.querySelector('h1');
      productData.name = (h1?.textContent || '').trim() ||
                         doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';

      // Price: prefer elements with "current-d" class (display price)
      const priceRegex = /₪\s*([\d,]+(?:\.\d+)?)/;
      let priceText = '';
      const currentEls = doc.querySelectorAll('[class*="current-d"]');
      for (const el of currentEls) {
        const m = (el.textContent || '').trim().match(priceRegex);
        if (m) { priceText = m[1]; break; }
      }

      if (!priceText) {
        // Fallback: any small element containing ₪NNN
        const all = doc.querySelectorAll('div, span');
        for (const el of all) {
          const t = (el.textContent || '').trim();
          if (t.length < 30) {
            const m = t.match(priceRegex);
            if (m) { priceText = m[1]; break; }
          }
        }
      }

      productData.price = priceText.replace(/,/g, '');

      // Images: og:image + any img pointing to KSP item/product CDN
      const ogImg = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
      if (ogImg) productData.imageUrls.push(ogImg);

      const productImgs = doc.querySelectorAll('img[src*="img.ksp.co.il/item/"], img[src*="ksp.co.il/shop/items/"]');
      for (const img of productImgs) {
        if (img.src && !productData.imageUrls.includes(img.src)) {
          productData.imageUrls.push(img.src);
          if (productData.imageUrls.length >= 5) break;
        }
      }

      console.log(`   📊 KSP: name=${!!productData.name} price=${productData.price || '✗'} images=${productData.imageUrls.length}`);

      if (productData.name && productData.price) {
        return productData;
      }
      return null;
    } catch (e) {
      console.error('❌ KSP extraction failed:', e);
      return null;
    }
  }

  /**
   * Extract product data from Wix sites using meta tags and DOM
   * @param {Document} doc - Document object
   * @returns {Object|null} - Product data or null
   */
  function extractFromWix(doc = document) {
    try {
      console.log('🎨 Extracting from Wix using DOM selectors and meta tags...');

      // Priority 1: Extract from Wix-specific DOM element (most reliable)
      const priceElement = doc.querySelector('[data-hook="formatted-primary-price"]');
      let price = '';
      let currency = 'ILS';

      if (priceElement) {
        // Try data-wix-price attribute first
        const wixPrice = priceElement.getAttribute('data-wix-price');
        if (wixPrice) {
          console.log('💰 Found price in data-wix-price:', wixPrice);
          // Parse "159.00 ₪" format
          const priceMatch = wixPrice.match(/([0-9.,]+)/);
          if (priceMatch) {
            price = priceMatch[1];
          }
        } else {
          // Fall back to text content
          const priceText = priceElement.textContent?.trim() || '';
          console.log('💰 Found price in element text:', priceText);
          const priceMatch = priceText.match(/([0-9.,]+)/);
          if (priceMatch) {
            price = priceMatch[1];
          }
        }
      }

      // Priority 2: Fall back to meta tags if DOM extraction failed
      if (!price) {
        console.log('⚠️ DOM price not found, trying meta tags...');
        const priceMetaElement = doc.querySelector('meta[property="product:price:amount"]');
        price = priceMetaElement?.getAttribute('content') || '';
      }

      // Extract currency from meta tag
      const currencyMetaElement = doc.querySelector('meta[property="product:price:currency"]');
      if (currencyMetaElement) {
        currency = currencyMetaElement.getAttribute('content') || 'ILS';
      }

      // Extract name and image from meta tags
      const titleElement = doc.querySelector('meta[property="og:title"]') || doc.querySelector('title');
      let name = titleElement?.getAttribute('content') || titleElement?.textContent || '';
      let image = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';

      // Fallback: find wixstatic.com images directly in the DOM
      if (!image) {
        const wixImgSelectors = [
          '[data-hook="main-media-image"] img',
          '[data-hook="product-item-media"] img',
          '[data-hook="media-inner-container"] img',
          '[data-hook="product-page-media"] img',
          'img[src*="wixstatic.com"]',
        ];
        for (const sel of wixImgSelectors) {
          const el = doc.querySelector(sel);
          if (el?.src && el.src.includes('wixstatic.com')) {
            image = el.src;
            console.log('🖼️ Found Wix image via DOM selector:', sel);
            break;
          }
        }
      }

      // Clean product name (remove site name)
      if (name.includes('|')) {
        name = name.split('|')[0].trim();
      }

      console.log('📦 Wix extraction result:', { name, price, currency, image, method: priceElement ? 'DOM' : 'meta' });

      if (!name || !price) {
        console.log('⚠️ Wix extraction incomplete - missing name or price');
        return null;
      }

      return {
        name: name,
        price: price,
        priceCurrency: currency,
        brand: '',
        category: '',
        imageUrls: image ? [image] : []
      };

    } catch (error) {
      console.error('❌ Wix extraction error:', error);
      return null;
    }
  }

  /**
   * Fallback extraction for various platforms when JSON-LD fails
   * @param {Document} doc - Document object
   * @returns {Object|null} - Product data or null
   */
  async function extractFromShopifyFallback(doc = document) {
    try {
      const platform = detectPlatform(doc);
      console.log(`🏪 Detected platform: ${platform}`);

      // For Wix, use meta tag extraction
      if (platform === 'wix') {
        console.log('🎨 Using Wix extractor...');
        const wixResult = extractFromWix(doc);
        if (wixResult) {
          console.log('✅ Extracted from Wix meta tags');
          return wixResult;
        }
      }

      // For Amazon, use specialized extractor with USD→ILS conversion
      if (platform === 'amazon') {
        console.log('🛍️ Using Amazon extractor...');
        const amazonResult = await extractFromAmazon(doc);
        if (amazonResult) {
          console.log('✅ Extracted from Amazon');
          return amazonResult;
        }
      }

      // For AliExpress, use specialized extractor
      if (platform === 'aliexpress') {
        console.log('🛍️ Using AliExpress extractor...');
        const aliexpressResult = await extractFromAliExpress(doc);
        if (aliexpressResult) {
          console.log('✅ Extracted from AliExpress');
          return aliexpressResult;
        }
      }

      // For KSP, use specialized DOM extractor
      if (platform === 'ksp') {
        console.log('🛍️ Using KSP extractor...');
        const kspResult = extractFromKsp(doc);
        if (kspResult) {
          console.log('✅ Extracted from KSP');
          return kspResult;
        }
      }

      // For H&M, use their product-page test ids before JSON-LD fallback
      if (platform === 'hm') {
        console.log('🛍️ Using H&M extractor...');
        const hmResult = extractFromHm(doc);
        if (hmResult) {
          console.log('✅ Extracted from H&M');
          return hmResult;
        }
      }

      if (platform === 'next') {
        console.log('🛍️ Using Next extractor...');
        const nextResult = extractFromNext(doc);
        if (nextResult) {
          console.log('✅ Extracted from Next');
          return nextResult;
        }
      }

      // For Shopify, try the JSON API first (most reliable)
      if (platform === 'shopify' && doc === document) {
        const apiResult = await tryShopifyJsonApi();
        if (apiResult) {
          console.log('✅ Extracted from Shopify JSON API');
          return apiResult;
        }
      }

      // Try to find Shopify product data in scripts
      const scripts = doc.querySelectorAll('script:not([type="application/ld+json"])');

      for (let script of scripts) {
        const content = script.textContent;

        // Pattern 1: ShopifyAnalytics.meta.product
        if (content.includes('ShopifyAnalytics') && content.includes('meta')) {
          try {
            // Execute in a safe context to get the product data
            const analyticsMatch = content.match(/meta:\s*({[\s\S]*?})\s*[,}]/);
            if (analyticsMatch) {
              const metaStr = analyticsMatch[1];
              // Try to extract product from meta
              const productMatch = metaStr.match(/product:\s*({[\s\S]*?})\s*[,}]/);
              if (productMatch) {
                const productData = parseJsonLdSafely(productMatch[1]);
                if (productData) {
                  console.log('✅ Extracted from ShopifyAnalytics.meta.product');
                  return extractFromShopifyProduct(productData);
                }
              }
            }
          } catch (e) {
            console.log('Failed to parse ShopifyAnalytics:', e.message);
          }
        }

        // Pattern 2: var meta = {...}
        const metaMatch = content.match(/var\s+meta\s*=\s*(\{[^}]*product[^}]*\})/);
        if (metaMatch) {
          try {
            const meta = parseJsonLdSafely(metaMatch[1]);
            if (meta?.product) {
              console.log('✅ Found Shopify meta.product data');
              return extractFromShopifyProduct(meta.product);
            }
          } catch (e) {
            console.log('Failed to parse meta pattern');
          }
        }
      }

      // Fallback to meta tags + DOM price extraction
      console.log('🔍 Trying meta tag extraction...');
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.content ||
                      doc.querySelector('h1')?.textContent?.trim() ||
                      (doc.title || '').split(/[|–\-]/)[0].trim() || '';
      let ogImage = doc.querySelector('meta[property="og:image"]')?.content;
      let ogPrice = doc.querySelector('meta[property="product:price:amount"]')?.content;
      const ogCurrency = doc.querySelector('meta[property="product:price:currency"]')?.content;

      // If no price in meta tags, try DOM extraction
      if (!ogPrice) {
        console.log('🔍 Trying DOM price extraction...');
        ogPrice = extractPriceFromDOM(doc);
      }

      // If no image in meta tags, try first meaningful img tag
      if (!ogImage) {
        for (const img of doc.querySelectorAll('main img, .product img, article img, img')) {
          const src = img.src || '';
          if (src && /\.(jpg|jpeg|png|webp)/i.test(src) &&
              !/logo|icon|sprite|flag|avatar|placeholder|banner/i.test(src)) {
            ogImage = src;
            console.log('🖼️ Found image via DOM img scan:', src.substring(0, 80));
            break;
          }
        }
      }

      if (ogTitle && (ogPrice || ogImage)) {
        console.log(`✅ Extracted from meta/DOM fallback ${ogPrice ? 'with price' : 'without price'}`);
        return {
          name: ogTitle,
          price: ogPrice || '',
          priceCurrency: ogCurrency || 'ILS',
          brand: '',
          category: '',
          imageUrls: ogImage ? [ogImage] : []
        };
      }

      console.log('❌ No product data found in fallback methods');
      return null;

    } catch (error) {
      console.error('❌ Shopify fallback extraction failed:', error);
      return null;
    }
  }

  /**
   * Extract price from DOM elements
   * @param {Document} doc - Document object
   * @returns {string|null} - Price or null
   */
  function extractPriceFromDOM(doc = document) {
    // Common Shopify price selectors
    // WooCommerce sale-price selectors come first so we pick the discounted price
    // (e.g. ins .woocommerce-Price-amount = current sale price; .price alone may
    // contain both old and new prices concatenated like "₪249.00₪199.20").
    const priceSelectors = [
      '.summary p.price ins .woocommerce-Price-amount',  // WC sale price (scoped)
      'p.price ins .woocommerce-Price-amount',           // WC sale price
      'ins .woocommerce-Price-amount',                   // WC sale price (loose)
      '.summary p.price .woocommerce-Price-amount',      // WC regular price (scoped)
      'p.price > .woocommerce-Price-amount',             // WC regular (no sale)
      '#tovel_initial_price',  // Elementor-based sites like mommyshop.co.il
      '.price--highlight .price-item--regular',
      '.price-item--regular',
      '.price__regular .price-item--regular',
      '[data-product-price]',
      '.product-price',
      '.price',
      '[itemprop="price"]',
      '.money',
      '.product__price',
      '.product-single__price'
    ];

    for (let selector of priceSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const priceText = element.textContent.trim();
        console.log(`Found price in ${selector}:`, priceText);

        // Extract numeric value from text (handles formats like "₪549.00", "549", "549.00 ILS")
        // Use a pattern that skips currency symbols and extracts the first number sequence
        let priceMatch = priceText.match(/[\d,]+\.?\d*/);

        // If regex doesn't match (possible encoding issue), try manual extraction
        if (!priceMatch) {
          // Filter for ASCII digits and common separators
          const numericChars = Array.from(priceText)
            .filter(ch => {
              const code = ch.charCodeAt(0);
              return (code >= 48 && code <= 57) || ch === ',' || ch === '.';  // 0-9, comma, dot
            })
            .join('');
          priceMatch = numericChars ? [numericChars] : null;
        }

        if (priceMatch) {
          const price = priceMatch[0].replace(',', '');
          console.log(`✅ Extracted price from DOM: ${price}`);
          return price;
        }
      }
    }

    // Try data attributes
    const priceDataElement = doc.querySelector('[data-price], [data-product-price], [data-price-amount]');
    if (priceDataElement) {
      const price = priceDataElement.dataset.price ||
                    priceDataElement.dataset.productPrice ||
                    priceDataElement.dataset.priceAmount;
      if (price) {
        console.log('✅ Extracted price from data attribute:', price);
        // Shopify often stores prices in cents
        return (parseFloat(price) > 1000) ? (parseFloat(price) / 100).toString() : price;
      }
    }

    // Open Graph / product meta tags — rendered server-side even when JSON-LD
    // is missing (kept in sync with extractFromGenericDOM in productExtraction.ts).
    // Placed after the DOM selectors because the live DOM reflects sale prices
    // more reliably than meta tags on some themes.
    const ogPriceMeta = doc.querySelector(
      'meta[property="og:price:amount"], meta[property="product:price:amount"]'
    );
    const ogPriceRaw = ogPriceMeta?.getAttribute('content') || '';
    const ogPriceMatch = ogPriceRaw.match(/[\d.,]+/);
    if (ogPriceMatch) {
      // Strip thousands separators — og:price:amount can be "7,040.00"
      const price = ogPriceMatch[0].replace(/,/g, '');
      console.log('✅ Extracted price from og/product meta:', price);
      return price;
    }

    // Last resort: scan short text elements for any ₪ price pattern
    const ilsPriceRe = /₪\s*([\d,]+(?:\.\d+)?)/;
    const ilsPriceRevRe = /([\d,]+(?:\.\d+)?)\s*₪/;
    for (const el of doc.querySelectorAll('bdi, span, td, p, div')) {
      const t = (el.textContent || '').trim();
      if (t.length > 0 && t.length < 40) {
        const m = t.match(ilsPriceRe) || t.match(ilsPriceRevRe);
        if (m) {
          const price = m[1].replace(/,/g, '');
          console.log('✅ Extracted price via ₪ generic scan:', price);
          return price;
        }
      }
    }

    console.log('❌ Could not find price in DOM');
    return null;
  }

  /**
   * Extract from Shopify product object
   */
  function extractFromShopifyProduct(product) {
    const firstVariant = product.variants?.[0] || product;

    // Collect all possible images — Shopify returns protocol-relative URLs
    // ("//cdn.shopify.com/..."), resolve them so stored image_url is absolute
    const imageUrls = [];
    if (product.featured_image) imageUrls.push(resolveUrl(product.featured_image));
    if (product.images) {
      imageUrls.push(...product.images.filter(i => typeof i === 'string').map(i => resolveUrl(i)));
    }

    return {
      name: product.title || product.name || '',
      price: (firstVariant.price ? firstVariant.price / 100 : '') || product.price || '',
      priceCurrency: 'ILS',
      brand: product.vendor || product.brand || '',
      category: product.type || '',
      imageUrls: filterAndPrioritizeImages(imageUrls)
    };
  }

  /**
   * Extract from H&M product pages.
   * H&M exposes stable data-testid hooks for the title and main price.
   */
  function extractFromHm(doc = document) {
    console.log('🛍️ Attempting H&M extraction...');

    const productData = {
      name: '',
      price: '',
      priceCurrency: 'ILS',
      brand: 'H&M',
      category: '',
      imageUrls: []
    };

    const titleElement = doc.querySelector('[data-testid="product-name"], h1[data-testid="product-name"], h1');
    if (titleElement) {
      const title = titleElement.textContent?.trim() || '';
      if (title.length > 2) {
        productData.name = title;
      }
    }

    const priceSelectors = [
      '[data-testid="white-price"]',
      '[data-testid="red-price"]',
      '[data-testid*="price"]'
    ];

    for (const selector of priceSelectors) {
      const element = doc.querySelector(selector);
      if (!element) continue;

      const priceText = element.textContent?.trim() || '';
      const priceMatch = priceText.match(/([\d,]+(?:\.\d+)?)\s*₪|₪\s*([\d,]+(?:\.\d+)?)/);
      const rawPrice = priceMatch?.[1] || priceMatch?.[2] || '';
      if (rawPrice) {
        productData.price = rawPrice.replace(/,/g, '');
        console.log(`💰 Found H&M price in ${selector}: ${productData.price}`);
        break;
      }
    }

    if (!productData.price && titleElement) {
      const detailsContainer = titleElement.closest('section, article, main, div');
      const candidateElements = Array.from((detailsContainer || doc).querySelectorAll('*'));

      for (const element of candidateElements) {
        const text = element.textContent?.trim() || '';
        if (!text || text.length > 40) continue;

        const priceMatch = text.match(/([\d,]+(?:\.\d+)?)\s*₪|₪\s*([\d,]+(?:\.\d+)?)/);
        const rawPrice = priceMatch?.[1] || priceMatch?.[2] || '';
        if (rawPrice) {
          productData.price = rawPrice.replace(/,/g, '');
          console.log(`💰 Found H&M nearby price: ${productData.price}`);
          break;
        }
      }
    }

    const imageElement = doc.querySelector('meta[property="og:image"], meta[name="og:image"]');
    const imageUrl = imageElement?.getAttribute('content') || '';
    if (imageUrl) {
      productData.imageUrls = [imageUrl];
    }

    console.log('📦 H&M extraction result:', productData);

    if (productData.name && productData.price) {
      return productData;
    }

    console.log('⚠️ H&M extraction incomplete');
    return null;
  }

  /**
   * Extract from Next Israel product pages.
   * Uses stable data-testid hooks for the title and current price.
   */
  function extractFromNext(doc = document) {
    console.log('🛍️ Attempting Next extraction...');

    const productData = {
      name: '',
      price: '',
      priceCurrency: 'ILS',
      brand: 'Next',
      category: '',
      imageUrls: []
    };

    const titleElement = doc.querySelector('[data-testid="product-title"], h1[data-testid="product-title"], h1');
    if (titleElement) {
      const title = titleElement.textContent?.trim() || '';
      if (title.length > 2) {
        productData.name = title;
      }
    }

    const priceSelectors = [
      '[data-testid="product-now-price"]',
      '[data-testid="price"]',
      '[data-testid*="price"]'
    ];

    for (const selector of priceSelectors) {
      const element = doc.querySelector(selector);
      if (!element) continue;

      const priceText = element.textContent?.trim() || '';
      const rangeMatch = priceText.match(/₪\s*([\d,]+(?:\.\d+)?)\s*-\s*₪\s*([\d,]+(?:\.\d+)?)/);
      if (rangeMatch) {
        productData.price = rangeMatch[1].replace(/,/g, '');
        console.log(`💰 Found Next price range in ${selector}: ${priceText} -> using ${productData.price}`);
        break;
      }

      const priceMatch = priceText.match(/([\d,]+(?:\.\d+)?)\s*₪|₪\s*([\d,]+(?:\.\d+)?)/);
      const rawPrice = priceMatch?.[1] || priceMatch?.[2] || '';
      if (rawPrice) {
        productData.price = rawPrice.replace(/,/g, '');
        console.log(`💰 Found Next price in ${selector}: ${productData.price}`);
        break;
      }
    }

    const imageMeta = doc.querySelector('meta[property="og:image"], meta[name="og:image"]');
    const imageUrl = imageMeta?.getAttribute('content') || '';
    if (imageUrl) {
      productData.imageUrls = [imageUrl];
    }

    // Fallback: pull image from Product JSON-LD if no og:image
    if (productData.imageUrls.length === 0) {
      const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
      for (const s of scripts) {
        try {
          const d = JSON.parse(s.textContent);
          if (d && d['@type'] === 'Product' && d.image) {
            productData.imageUrls = normalizeImageUrls(d.image);
            break;
          }
        } catch (e) {}
      }
    }

    console.log('📦 Next extraction result:', productData);

    if (productData.name && productData.price) {
      return productData;
    }

    console.log('⚠️ Next extraction incomplete');
    return null;
  }

  /**
   * Extract product data from external URL via Edge Function
   * @param {string} url - Product URL to extract from
   * @returns {Promise<Object|null>} - Product data or null
   */
  async function extractProductFromUrl(url) {
    console.log('🌐 Extracting product from URL:', url);

    try {
      // Call Supabase Edge Function
      const response = await fetch(
        `${NESTY_CONFIG.SUPABASE_URL}/functions/v1/extract-product`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseSession.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch URL');
      }

      const data = await response.json();

      if (!data.success || !data.html) {
        throw new Error('No HTML returned from server');
      }

      console.log('✅ Received HTML, parsing...');

      // Parse HTML string into Document using DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.html, 'text/html');

      // Extract product data using same logic as current page
      const productData = await extractProductDataFromDocument(doc);

      if (!productData) {
        throw new Error('לא נמצא מידע על מוצר בדף זה');
      }

      console.log('✅ Product extracted:', productData);
      return productData;

    } catch (error) {
      console.error('❌ Extract from URL failed:', error);
      throw error;
    }
  }

  // FX rates to ILS — keep in sync with nesty-web/src/lib/productExtraction.ts
  const FX_TO_ILS = {
    USD: 3.19,
    EUR: 3.43,
    GBP: 4.05,
  };

  /**
   * Convert a non-ILS price to ILS using the FX_TO_ILS table.
   * Preserves the original price/currency in sourcePrice / sourceCurrency.
   * If currency is already ILS, blank, or unknown, the data is returned as-is.
   */
  function convertPriceToILS(data) {
    const rawCurrency = (data.priceCurrency || '').toUpperCase().trim();
    const rawPrice = parseFloat(data.price);

    // Pass through when there's nothing to convert
    if (!rawCurrency || rawCurrency === 'ILS' || rawCurrency === 'NIS' || !rawPrice) {
      return data;
    }

    const rate = FX_TO_ILS[rawCurrency];
    if (!rate) {
      console.warn(`   ⚠️ No FX rate for ${rawCurrency}, leaving price as-is`);
      return data;
    }

    const ilsPrice = (rawPrice * rate).toFixed(2);
    console.log(`   💱 Converted ${rawPrice} ${rawCurrency} → ₪${ilsPrice} ILS (rate: ${rate})`);
    return {
      ...data,
      price: ilsPrice,
      priceCurrency: 'ILS',
      sourcePrice: String(rawPrice),
      sourceCurrency: rawCurrency,
    };
  }

  /**
   * Read the price out of an Offer. Some platforms (WooCommerce SEO plugins,
   * e.g. segalbaby.co.il) omit offer.price and nest it in priceSpecification[]
   * instead — the current sale price is the spec WITHOUT priceType=ListPrice.
   * Kept in sync with priceFromOffer in nesty-web/src/lib/productExtraction.ts.
   */
  function priceFromOffer(offer) {
    if (!offer) return { price: '', currency: '' };
    if (offer.price != null && offer.price !== '') {
      return { price: String(offer.price), currency: offer.priceCurrency || '' };
    }
    const specData = offer.priceSpecification;
    const specs = Array.isArray(specData) ? specData : specData ? [specData] : [];
    const withPrice = specs.filter(s => s && s.price != null && s.price !== '');
    const sale = withPrice.find(s => !String(s.priceType || '').includes('ListPrice')) || withPrice[0];
    if (sale) {
      return { price: String(sale.price), currency: sale.priceCurrency || offer.priceCurrency || '' };
    }
    return { price: '', currency: offer.priceCurrency || '' };
  }

  function extractFromProduct(data, baseUrl) {
    // Handle case-insensitive property access (Wix uses "Offers" instead of "offers")
    const offersData = data.offers || data.Offers;

    console.log('🔄 extractFromProduct called with:', {
      hasName: !!data.name,
      hasOffers: !!offersData,
      offersType: Array.isArray(offersData) ? 'array' : typeof offersData,
      hasImage: !!data.image
    });

    // Handle offers - can be array or single object
    let offer = null;
    if (Array.isArray(offersData)) {
      // If array, try to find in-stock offer first, otherwise take first
      offer = offersData.find(o => o.availability !== 'OutOfStock') || offersData[0];
      console.log(`📦 Using offer from array (${offersData.length} total):`, {
        price: offer?.price,
        availability: offer?.availability
      });
    } else if (offersData) {
      offer = offersData;
      console.log('📦 Using single offer:', { price: offer?.price });
    }

    // Extract images (normalize to string URLs first, resolve relative paths)
    const imageUrls = normalizeImageUrls(data.image, baseUrl);

    const offerPrice = priceFromOffer(offer);

    const result = convertPriceToILS({
      name: decodeHtmlEntities(data.name || ''),
      price: offerPrice.price,
      priceCurrency: offerPrice.currency,
      brand: data.brand?.name || data.brand || '',
      category: data.category || '',
      imageUrls: filterAndPrioritizeImages([...new Set(imageUrls)])
    });

    console.log('✅ extractFromProduct result:', result);
    return result;
  }

  function extractFromProductGroup(data, baseUrl) {
    const variants = data.hasVariant || [];
    const firstVariant = Array.isArray(variants) ? variants[0] : variants;
    // Handle case-insensitive property access (Wix uses "Offers" instead of "offers")
    const offer = firstVariant?.offers || firstVariant?.Offers;

    // Extract and normalize images from all variants
    const imageUrls = [];
    if (Array.isArray(variants)) {
      variants.forEach(variant => {
        if (variant.image) {
          imageUrls.push(...normalizeImageUrls(variant.image, baseUrl));
        }
      });
    }

    const groupOfferPrice = priceFromOffer(offer);

    return convertPriceToILS({
      name: data.name || '',
      price: groupOfferPrice.price,
      priceCurrency: groupOfferPrice.currency,
      brand: data.brand?.name || data.brand || '',
      category: data.category || '',
      imageUrls: filterAndPrioritizeImages([...new Set(imageUrls)])
    });
  }

  /**
   * Show product form with full UI
   * @param {Object|null} product - Product data (null for paste mode)
   * @param {string} mode - Initial mode: 'current' or 'paste'
   */
  /**
   * Launch a subtle confetti burst inside the given container.
   * Picks one of 5 variants at random. Self-cleans after the animation.
   */
  function launchConfetti(container) {
    if (!container) return;
    const variants = [
      // 0 — pastel squares raining from top
      { colors: ['#f9c6d9', '#d8b4e2', '#a7d7f9', '#fce38a', '#b5ead7'], shape: 'square', count: 28, durationMs: [1400, 2200], size: [6, 10], spread: 'top', gravity: true, spin: true },
      // 1 — burst of circles from center
      { colors: ['#86608e', '#c48fb5', '#ffd1dc', '#b28dff'], shape: 'circle', count: 22, durationMs: [900, 1500], size: [5, 9], spread: 'center', gravity: false, spin: false },
      // 2 — golden sparkle stars drifting up
      { colors: ['#ffd700', '#ffe58a', '#fff5b7', '#f7c948'], shape: 'star', count: 18, durationMs: [1600, 2400], size: [8, 14], spread: 'bottom', gravity: false, spin: true },
      // 3 — rainbow streamers (tall rectangles) falling slowly
      { colors: ['#ff6b6b', '#ffa36b', '#ffe66b', '#6bd46b', '#6b9bff', '#b36bff'], shape: 'streamer', count: 20, durationMs: [1800, 2600], size: [4, 6], spread: 'top', gravity: true, spin: true },
      // 4 — soft hearts floating up
      { colors: ['#ff8fa3', '#ffb3c1', '#ffc2d1', '#e2a3bf'], shape: 'heart', count: 14, durationMs: [1600, 2300], size: [12, 18], spread: 'bottom', gravity: false, spin: false }
    ];
    const v = variants[Math.floor(Math.random() * variants.length)];

    // Ensure keyframes exist once per document.
    if (!document.getElementById('nesty-confetti-styles')) {
      const css = document.createElement('style');
      css.id = 'nesty-confetti-styles';
      css.textContent = `
        @keyframes nesty-confetti-fall {
          0%   { transform: translate(0,0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--nx,0px), var(--ny,200px)) rotate(var(--nr,720deg)); opacity: 0; }
        }
        @keyframes nesty-confetti-float {
          0%   { transform: translate(0,0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--nx,0px), var(--ny,-220px)) rotate(var(--nr,0deg)); opacity: 0; }
        }
      `;
      document.head.appendChild(css);
    }

    const host = document.createElement('div');
    host.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:9999;';
    // container is the modal — ensure it's a positioning context
    const prevPos = getComputedStyle(container).position;
    if (prevPos === 'static') container.style.position = 'relative';
    container.appendChild(host);

    const rect = host.getBoundingClientRect();
    const W = rect.width || 400;
    const H = rect.height || 400;

    function makeShape(color, size) {
      const el = document.createElement('div');
      const s = `${size}px`;
      let base = `width:${s};height:${s};background:${color};`;
      if (v.shape === 'circle')   base += 'border-radius:50%;';
      if (v.shape === 'square')   base += 'border-radius:2px;';
      if (v.shape === 'streamer') base = `width:${size}px;height:${size * 3}px;background:${color};border-radius:2px;`;
      if (v.shape === 'star') {
        base = `width:${size}px;height:${size}px;background:${color};clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);`;
      }
      if (v.shape === 'heart') {
        // Emoji-based heart — avoids clip-path sizing quirks.
        el.style.cssText = `position:absolute;font-size:${size + 6}px;line-height:1;color:${color};user-select:none;`;
        el.textContent = '♥';
        return el;
      }
      el.style.cssText = `position:absolute;${base}`;
      return el;
    }

    const rand = (a, b) => a + Math.random() * (b - a);
    for (let i = 0; i < v.count; i++) {
      const color = v.colors[Math.floor(Math.random() * v.colors.length)];
      const size = Math.round(rand(v.size[0], v.size[1]));
      const el = makeShape(color, size);

      let startX, startY, dx, dy;
      if (v.spread === 'top')    { startX = rand(0, W);     startY = rand(-10, 10);    dx = rand(-40, 40);  dy = rand(H * 0.7, H + 40); }
      if (v.spread === 'bottom') { startX = rand(0, W);     startY = rand(H - 10, H);  dx = rand(-60, 60);  dy = -rand(H * 0.7, H + 40); }
      if (v.spread === 'center') { startX = W / 2;          startY = H / 2;            const a = rand(0, Math.PI * 2); const r = rand(W * 0.25, W * 0.45); dx = Math.cos(a) * r; dy = Math.sin(a) * r; }

      el.style.left = `${startX}px`;
      el.style.top = `${startY}px`;
      el.style.setProperty('--nx', `${dx}px`);
      el.style.setProperty('--ny', `${dy}px`);
      el.style.setProperty('--nr', `${v.spin ? rand(-720, 720) : 0}deg`);
      const dur = Math.round(rand(v.durationMs[0], v.durationMs[1]));
      const anim = v.gravity ? 'nesty-confetti-fall' : 'nesty-confetti-float';
      const delay = Math.round(rand(0, 250));
      el.style.animation = `${anim} ${dur}ms cubic-bezier(.2,.6,.3,1) ${delay}ms forwards`;
      host.appendChild(el);
    }

    // Clean up after the longest possible lifetime.
    const cleanupMs = v.durationMs[1] + 400;
    setTimeout(() => { host.remove(); }, cleanupMs);
  }

  // Escape values interpolated into innerHTML — product names from page JSON-LD
  // routinely contain quotes (e.g. sizes like 32") and must not break out of attributes
  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showProductForm(product = null, mode = 'current') {
    console.log('🎨 Creating product form...');

    // Defend against hostile host-site CSS that targets empty <div>s, visibility,
    // or display on generic selectors. Example: motsesim.co.il has
    // `div:empty:not(...) { display: none }` which hides our toggle knobs.
    if (!document.getElementById('nesty-defense-styles')) {
      const defense = document.createElement('style');
      defense.id = 'nesty-defense-styles';
      defense.textContent = `
        .nesty-overlay div:empty:not(#nesty-error-banner):not(#nesty-report-image-status) { display: block !important; }
        #toggle-wanted-switch,
        #toggle-private-switch,
        #toggle-secondhand-switch { display: block !important; }
        @keyframes nesty-cta-pulse {
          0%   { transform: scale(1);    box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50%  { transform: scale(1.04); box-shadow: 0 0 0 8px rgba(34,197,94,0); }
          100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `;
      document.head.appendChild(defense);
    }

    const overlay = document.createElement('div');
    overlay.className = 'nesty-overlay';

    const modal = document.createElement('div');
    modal.className = 'nesty-modal';
    // Match the web app's AddItemModal: max-w-xl + rounded-[28px]
    modal.style.maxWidth = '576px';
    modal.style.maxHeight = '90vh';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.borderRadius = '28px';

    let imageUrl = product?.imageUrls?.[0] || '';

    // Form state
    let currentMode = mode; // 'current' or 'paste'
    let extractedUrl = null; // Store URL from paste mode
    let quantity = 1;
    let isMostWanted = false;
    let isPrivate = false;
    let isSecondhand = false;

    // Shared field styles — mirrors the web app's AddItemModal (manual tab)
    const LBL = `display: block; font-size: 11px; font-weight: 700; color: #49454f; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; font-family: 'Assistant', 'Heebo', sans-serif;`;
    const INP = `width: 100%; padding: 8px 12px; border: 1px solid #e7e0ec; border-radius: 12px; font-size: 14px; background: #ffffff; color: #1d192b; box-sizing: border-box; font-family: 'Assistant', 'Heebo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`;
    const EYE_SVG = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    const EYEOFF_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
    const STAR_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

    modal.innerHTML = `
      <div class="nesty-modal-header" style="border-bottom: 1px solid #e7e0ec; padding: 12px 20px; flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; background: #ffffff; border-radius: 28px 28px 0 0;">
        <!-- Tab interface — styled like the web app's modal tabs -->
        <div id="nesty-mode-tabs" style="display: flex; gap: 8px; align-items: center;">
          <button id="nesty-mode-current" class="nesty-mode-tab"
                  style="padding: 8px 16px; background: ${currentMode === 'current' ? '#6750a4' : '#f3edff'}; color: ${currentMode === 'current' ? '#ffffff' : '#6750a4'}; opacity: ${currentMode === 'current' ? '1' : '0.7'}; border: none; border-radius: 12px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; font-family: 'Assistant', 'Heebo', sans-serif;">
            עמוד נוכחי
          </button>
          <button id="nesty-mode-paste" class="nesty-mode-tab"
                  style="padding: 8px 16px; background: ${currentMode === 'paste' ? '#6750a4' : '#f3edff'}; color: ${currentMode === 'paste' ? '#ffffff' : '#6750a4'}; opacity: ${currentMode === 'paste' ? '1' : '0.7'}; border: none; border-radius: 12px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; font-family: 'Assistant', 'Heebo', sans-serif;">
            הדבק קישור
          </button>
        </div>

        <button class="nesty-close-btn" id="nesty-close" style="background: none; border: none; font-size: 22px; cursor: pointer; color: #49454f; padding: 4px 8px; border-radius: 12px;">×</button>
      </div>

      <div class="nesty-modal-body" style="padding: 16px; flex: 1; overflow-y: auto; background: #ffffff;">
        <!-- Error banner (validation) — same style as the web app -->
        <div id="nesty-error-banner" style="display: none; background: #ffebee; color: #b3261e; padding: 10px 16px; border-radius: 12px; font-size: 13px; font-weight: 500; margin-bottom: 12px; font-family: 'Assistant', 'Heebo', sans-serif;"></div>

        <!-- Current Page Mode Content — same structure as the app's manual tab -->
        <div id="nesty-current-mode-content" style="display: ${currentMode === 'current' ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr; gap: 10px 12px;">

          <!-- Name - full width -->
          <div style="grid-column: 1 / -1;">
            <label style="${LBL}">שם המוצר *</label>
            <input type="text" id="nesty-title" value="${escapeHtml(product ? product.name : '')}" placeholder="למשל: עגלת תינוק" style="${INP}">
          </div>

          <!-- Category -->
          <div>
            <label style="${LBL}">קטגוריה *</label>
            <select id="nesty-category" style="${INP} cursor: pointer; appearance: none;">
              <option value="">בחרו קטגוריה</option>
              ${CATEGORIES.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
            </select>
          </div>

          <!-- Price -->
          <div>
            <label style="${LBL}">מחיר (₪)</label>
            <input type="number" id="nesty-price" value="${escapeHtml(product ? product.price : '')}" placeholder="0" min="0" style="${INP}">
          </div>

          <!-- Quantity -->
          <div>
            <label style="${LBL}">כמות</label>
            <div style="display: flex; align-items: center; border: 1px solid #e7e0ec; border-radius: 12px; background: white; overflow: hidden;">
              <button id="qty-minus" style="padding: 8px 12px; background: none; border: none; cursor: pointer; font-size: 16px; color: #49454f; font-weight: 500;">−</button>
              <div id="qty-display" style="flex: 1; text-align: center; font-weight: 700; font-size: 14px; color: #1d192b;">1</div>
              <button id="qty-plus" style="padding: 8px 12px; background: none; border: none; cursor: pointer; font-size: 16px; color: #49454f; font-weight: 500;">+</button>
            </div>
          </div>

          <!-- Color -->
          <div>
            <label style="${LBL}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg> צבע מועדף</label>
            <input type="text" id="nesty-color" placeholder="אפור, ורוד..." style="${INP}">
          </div>

          <!-- Store -->
          <div>
            <label style="${LBL}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg> חנות</label>
            <input type="text" id="nesty-store" value="${escapeHtml(window.location.hostname.replace(/^www\./, ''))}" placeholder="בייבי סטאר..." style="${INP}">
          </div>

          <!-- Image preview (extension-specific: shows what will be saved) -->
          <div>
            <label style="${LBL}">תמונה שנבחרה</label>
            <div style="display: flex; align-items: flex-start; gap: 10px;">
              <img id="nesty-image-thumb" src="${escapeHtml(imageUrl)}" alt=""
                   style="width: 88px; height: 88px; object-fit: cover; border-radius: 12px; border: 1px solid #e7e0ec; flex-shrink: 0; background: #f3edff;"
                   onerror="this.style.background='#f3edff'; this.alt='';">
              <div style="min-width: 0; display: flex; flex-direction: column; gap: 4px;">
                <div id="nesty-image-meta">
                  <button id="nesty-report-image"
                    style="display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; background: white; border: 1px solid #e7e0ec; border-radius: 9999px; font-size: 10px; font-weight: 600; color: #49454f; cursor: pointer; font-family: 'Assistant', 'Heebo', sans-serif; line-height: 1.4; transition: all 0.15s ease;"
                    onmouseover="this.style.borderColor='#6750a4'; this.style.color='#6750a4'; this.style.background='#f3edff';"
                    onmouseout="this.style.borderColor='#e7e0ec'; this.style.color='#49454f'; this.style.background='white';">
                    🐞 דווח תמונה שגויה/חסרה
                  </button>
                </div>
                <div id="nesty-report-image-status" style="font-size: 11px; color: #9a90a8; min-height: 0; font-family: 'Assistant', 'Heebo', sans-serif;"></div>
              </div>
            </div>
          </div>

          <!-- Product URL - full width -->
          <div style="grid-column: 1 / -1;">
            <label style="${LBL}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> קישור למוצר</label>
            <input type="text" id="nesty-url-field" value="${escapeHtml(window.location.href)}" placeholder="https://..." dir="ltr" style="${INP} text-align: left;">
          </div>

          <!-- Notes - full width -->
          <div style="grid-column: 1 / -1;">
            <label style="${LBL}">הערות</label>
            <input type="text" id="nesty-notes" placeholder="מידה, פרטים נוספים..." style="${INP}">
            <p style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #49454f; margin: 4px 0 0 0; font-family: 'Assistant', 'Heebo', sans-serif;">${EYE_SVG} האורחים יראו הערה זו</p>
          </div>

          <!-- Toggle buttons - side by side, same as the app -->
          <button type="button" id="toggle-wanted" style="display: flex; align-items: center; gap: 8px; padding: 10px; border-radius: 12px; border: 2px solid #e7e0ec; background: white; cursor: pointer; transition: all 0.2s; font-family: 'Assistant', 'Heebo', sans-serif;">
            <span id="toggle-wanted-icon" style="color: #49454f; display: inline-flex;">${STAR_SVG}</span>
            <span style="flex: 1; text-align: right; font-size: 13px; font-weight: 700; color: #1d192b;" id="toggle-wanted-label">הכי רוצה!</span>
            <span style="width: 36px; height: 20px; border-radius: 10px; background: #e7e0ec; position: relative; transition: background 0.2s; display: inline-block; flex-shrink: 0;" id="toggle-wanted-track">
              <span id="toggle-wanted-switch" style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.15); display: block;"></span>
            </span>
          </button>

          <button type="button" id="toggle-private" style="display: flex; align-items: center; gap: 8px; padding: 10px; border-radius: 12px; border: 2px solid #e7e0ec; background: white; cursor: pointer; transition: all 0.2s; font-family: 'Assistant', 'Heebo', sans-serif;">
            <span id="toggle-private-icon" style="color: #49454f; display: inline-flex;">${EYEOFF_SVG}</span>
            <span style="flex: 1; text-align: right; font-size: 13px; font-weight: 700; color: #1d192b;" id="toggle-private-label">פריט פרטי</span>
            <span style="width: 36px; height: 20px; border-radius: 10px; background: #e7e0ec; position: relative; transition: background 0.2s; display: inline-block; flex-shrink: 0;" id="toggle-private-track">
              <span id="toggle-private-switch" style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.15); display: block;"></span>
            </span>
          </button>

          <!-- TEMPORARILY HIDDEN: "Open to secondhand" feature not yet available on site -->
          <div id="toggle-secondhand" style="display: none;">
            <div id="toggle-secondhand-switch" style="display: none;"></div>
          </div>
        </div>

        <!-- Paste URL Mode Content -->
        <div id="nesty-paste-mode-content" style="display: ${currentMode === 'paste' ? 'flex' : 'none'}; flex-direction: column; align-items: center; padding: 32px 16px;">
          <div style="width: 100%; max-width: 420px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="margin-bottom: 10px; color: #6750a4;"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" y1="12" x2="16" y2="12"/></svg></div>
              <h3 style="font-size: 17px; font-weight: 700; color: #1d192b; margin: 0 0 6px 0; font-family: 'Assistant', 'Heebo', sans-serif;">הדבק קישור למוצר</h3>
              <p style="font-size: 13px; color: #49454f; margin: 0; font-family: 'Assistant', 'Heebo', sans-serif;">הדבק כתובת URL של מוצר מכל אתר מסחר אלקטרוני</p>
            </div>

            <input type="url" id="nesty-url-input" placeholder="https://example.com/product" dir="ltr"
                   style="${INP} text-align: left; margin-bottom: 14px; padding: 10px 14px;">

            <button id="nesty-extract-btn"
                    style="width: 100%; padding: 12px 24px; background: #6750a4; color: white; border: none; border-radius: 9999px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(103,80,164,0.25); font-family: 'Assistant', 'Heebo', sans-serif;">
              הוספה מהירה מלינק
            </button>

            <div id="nesty-extraction-status" style="margin-top: 14px; text-align: center; color: #49454f; font-size: 13px; min-height: 20px; font-family: 'Assistant', 'Heebo', sans-serif;"></div>
          </div>
        </div>
      </div>

      <div class="nesty-modal-footer" id="nesty-footer" style="padding: 12px 16px; border-top: 1px solid #e7e0ec; background: #fdfcff; display: flex; align-items: center; gap: 10px; flex-shrink: 0; border-radius: 0 0 28px 28px;">
        <label id="nesty-autoclose-label" style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #49454f; cursor: pointer; user-select: none; white-space: nowrap; font-family: 'Assistant', 'Heebo', sans-serif;">
          <input type="checkbox" id="nesty-autoclose" style="width: 15px; height: 15px; cursor: pointer; accent-color: #6750a4;">
          סגור לאחר הוספה
        </label>
        <button id="nesty-cancel" style="flex: 1; padding: 10px 16px; border-radius: 9999px; border: 1px solid #e7e0ec; background: white; color: #49454f; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'Assistant', 'Heebo', sans-serif;">
          ביטול
        </button>
        <button id="nesty-submit" style="flex: 1.4; padding: 10px 16px; border-radius: 9999px; background: #6750a4; color: white; border: none; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(103,80,164,0.25); white-space: nowrap; font-family: 'Assistant', 'Heebo', sans-serif;">
          + הוסף לרשימה
        </button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Event listeners
    document.getElementById('nesty-close').addEventListener('click', () => {
      overlay.remove();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    // Quantity controls
    document.getElementById('qty-minus').addEventListener('click', () => {
      if (quantity > 1) {
        quantity--;
        document.getElementById('qty-display').textContent = quantity;
      }
    });

    document.getElementById('qty-plus').addEventListener('click', () => {
      if (quantity < 99) {
        quantity++;
        document.getElementById('qty-display').textContent = quantity;
      }
    });

    // Toggle controls — same active colors as the web app's AddItemModal:
    // "הכי רוצה!" red (#b3261e / #ffebee), "פריט פרטי" purple (#6750a4 / #f3edff)
    function styleToggle(prefix, on, color, bg) {
      const toggle = document.getElementById(`toggle-${prefix}`);
      const track = document.getElementById(`toggle-${prefix}-track`);
      const knob = document.getElementById(`toggle-${prefix}-switch`);
      const icon = document.getElementById(`toggle-${prefix}-icon`);
      const label = document.getElementById(`toggle-${prefix}-label`);
      if (!toggle) return;
      toggle.style.borderColor = on ? color : '#e7e0ec';
      toggle.style.background = on ? bg : 'white';
      if (track) track.style.background = on ? color : '#e7e0ec';
      if (knob) knob.style.left = on ? '18px' : '2px';
      if (icon) icon.style.color = on ? color : '#49454f';
      if (label) label.style.color = on ? color : '#1d192b';
    }

    document.getElementById('toggle-wanted').addEventListener('click', () => {
      isMostWanted = !isMostWanted;
      styleToggle('wanted', isMostWanted, '#b3261e', '#ffebee');
    });

    document.getElementById('toggle-private').addEventListener('click', () => {
      isPrivate = !isPrivate;
      styleToggle('private', isPrivate, '#6750a4', '#f3edff');
    });

    const secondhandToggle = document.getElementById('toggle-secondhand');
    if (secondhandToggle) {
      secondhandToggle.addEventListener('click', () => {
        isSecondhand = !isSecondhand;
        styleToggle('secondhand', isSecondhand, '#22c55e', '#f0fdf4');
      });
    }

    // Auto-mark birth-prep items as private, same as the web app
    document.getElementById('nesty-category').addEventListener('change', (e) => {
      if (e.target.value === 'birth_prep' && !isPrivate) {
        isPrivate = true;
        styleToggle('private', true, '#6750a4', '#f3edff');
      }
    });

    // Suggest a category from the extracted product name; when nothing is
    // recognized the select stays on "בחרו קטגוריה"
    if (product?.name) {
      const guessed = guessCategory(product.name);
      if (guessed) {
        const catSelect = document.getElementById('nesty-category');
        catSelect.value = guessed;
        catSelect.dispatchEvent(new Event('change'));
        console.log(`🏷️ Category suggested from name: ${guessed}`);
      }
    }

    // Cancel button — same as the app's ביטול
    document.getElementById('nesty-cancel').addEventListener('click', () => {
      overlay.remove();
    });

    // Report wrong image
    const reportImageBtn = document.getElementById('nesty-report-image');
    if (reportImageBtn) {
      reportImageBtn.addEventListener('click', async () => {
        const statusEl = document.getElementById('nesty-report-image-status');
        const metaEl = document.getElementById('nesty-image-meta');
        reportImageBtn.style.opacity = '0.45';
        reportImageBtn.style.pointerEvents = 'none';
        try {
          await fetch(`${NESTY_CONFIG.SUPABASE_URL}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${NESTY_CONFIG.SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              type: 'contact',
              name: supabaseSession?.user?.email || 'Extension User',
              email: supabaseSession?.user?.email || 'no-reply@nestyil.com',
              subject: 'דיווח על תמונה שגויה',
              message: `תמונה שגויה דווחה מהתוסף:\nמוצר: ${document.getElementById('nesty-title')?.value || ''}\nURL: ${window.location.href}\nתמונה: ${imageUrl}`
            })
          });
          if (metaEl) metaEl.style.display = 'none';
          statusEl.style.color = '#86608e';
          statusEl.textContent = 'תודה על הדיווח';
        } catch {
          statusEl.style.color = '#b55c5c';
          statusEl.textContent = 'שגיאה בשליחה';
          reportImageBtn.style.opacity = '1';
          reportImageBtn.style.pointerEvents = '';
        }
      });
    }

    // Tab switching
    document.getElementById('nesty-mode-current').addEventListener('click', () => {
      switchMode('current');
    });

    document.getElementById('nesty-mode-paste').addEventListener('click', () => {
      switchMode('paste');
    });

    function switchMode(mode) {
      currentMode = mode;
      const currentTab = document.getElementById('nesty-mode-current');
      const pasteTab = document.getElementById('nesty-mode-paste');

      // App tab styling: active bg #6750a4 white, inactive bg #f3edff purple 70%
      const setTab = (tab, active) => {
        tab.style.background = active ? '#6750a4' : '#f3edff';
        tab.style.color = active ? '#ffffff' : '#6750a4';
        tab.style.opacity = active ? '1' : '0.7';
      };

      setTab(currentTab, mode === 'current');
      setTab(pasteTab, mode === 'paste');
      document.getElementById('nesty-current-mode-content').style.display = mode === 'current' ? 'grid' : 'none';
      document.getElementById('nesty-paste-mode-content').style.display = mode === 'paste' ? 'flex' : 'none';
    }

    // URL extraction
    document.getElementById('nesty-extract-btn').addEventListener('click', async () => {
      const url = document.getElementById('nesty-url-input').value.trim();
      const statusDiv = document.getElementById('nesty-extraction-status');
      const extractBtn = document.getElementById('nesty-extract-btn');

      if (!url) {
        statusDiv.textContent = '⚠️ אנא הזן כתובת URL';
        statusDiv.style.color = '#ef4444';
        return;
      }

      try {
        new URL(url);
      } catch {
        statusDiv.textContent = '⚠️ כתובת URL לא תקינה';
        statusDiv.style.color = '#ef4444';
        return;
      }

      extractBtn.disabled = true;
      extractBtn.textContent = 'מחלץ...';
      statusDiv.textContent = '🔄 שולח בקשה...';
      statusDiv.style.color = '#6b6b6b';

      try {
        const productData = await extractProductFromUrl(url);

        statusDiv.textContent = '✅ מוצר חולץ בהצלחה!';
        statusDiv.style.color = '#22c55e';

        document.getElementById('nesty-title').value = productData.name || '';
        document.getElementById('nesty-price').value = productData.price || '';

        const img = document.querySelector('#nesty-current-mode-content img');
        if (img && productData.imageUrls?.[0]) {
          img.src = productData.imageUrls[0];
          imageUrl = productData.imageUrls[0];
        }

        extractedUrl = url;
        // Reflect the pasted product in the URL + store fields
        const urlField = document.getElementById('nesty-url-field');
        if (urlField) urlField.value = url;
        const storeField = document.getElementById('nesty-store');
        if (storeField) storeField.value = new URL(url).hostname.replace(/^www\./, '');

        // Suggest a category for the pasted product too (don't override a user's choice)
        const catSelect = document.getElementById('nesty-category');
        if (catSelect && !catSelect.value) {
          const guessed = guessCategory(productData.name || '');
          if (guessed) {
            catSelect.value = guessed;
            catSelect.dispatchEvent(new Event('change'));
          }
        }

        setTimeout(() => switchMode('current'), 1000);
      } catch (error) {
        statusDiv.textContent = `❌ ${error.message}`;
        statusDiv.style.color = '#ef4444';
      } finally {
        extractBtn.disabled = false;
        extractBtn.textContent = 'הוספה מהירה מלינק';
      }
    });

    // Auto-close toggle: load preference and persist on change
    const autoCloseCheckbox = document.getElementById('nesty-autoclose');
    if (autoCloseCheckbox) {
      try {
        chrome.storage.local.get(['nesty_autoclose'], (res) => {
          autoCloseCheckbox.checked = !!res.nesty_autoclose;
        });
      } catch (e) { /* ignore */ }
      autoCloseCheckbox.addEventListener('change', () => {
        try {
          chrome.storage.local.set({ nesty_autoclose: autoCloseCheckbox.checked });
        } catch (e) { /* ignore */ }
      });
    }

    // Submit handler
    const submitButton = document.getElementById('nesty-submit');
    console.log('🔘 Submit button found:', submitButton ? 'Yes' : 'No');

    if (!submitButton) {
      console.error('❌ Submit button not found!');
      return;
    }

    submitButton.addEventListener('click', async () => {
      console.log('🖱️ Submit button clicked!');

      const submitBtn = document.getElementById('nesty-submit');
      const errorBanner = document.getElementById('nesty-error-banner');

      // Validation — same rules and messages as the web app
      const showError = (msg) => {
        if (errorBanner) {
          errorBanner.textContent = msg;
          errorBanner.style.display = 'block';
          errorBanner.scrollIntoView({ block: 'nearest' });
        }
      };
      if (errorBanner) errorBanner.style.display = 'none';

      const itemName = document.getElementById('nesty-title').value.trim();
      const itemCategory = document.getElementById('nesty-category').value;
      if (!itemName) {
        showError('יש להזין שם מוצר');
        return;
      }
      if (!itemCategory) {
        showError('יש לבחור קטגוריה');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'מוסיף...';
      submitBtn.style.opacity = '0.7';

      // Merge color into notes exactly like the web app ("צבע: X\n<notes>")
      const colorValue = document.getElementById('nesty-color').value.trim();
      const notesValue = document.getElementById('nesty-notes').value.trim();
      let combinedNotes = '';
      if (colorValue) combinedNotes += `צבע: ${colorValue}`;
      if (notesValue) combinedNotes += combinedNotes ? `\n${notesValue}` : notesValue;

      const urlFieldValue = document.getElementById('nesty-url-field').value.trim();
      const storeFieldValue = document.getElementById('nesty-store').value.trim();

      const formData = {
        registry_id: userRegistry.id,
        name: itemName,
        price: parseFloat(document.getElementById('nesty-price').value) || 0,
        image_url: imageUrl || null,
        original_url: urlFieldValue || extractedUrl || window.location.href,
        store_name: storeFieldValue || (extractedUrl ? new URL(extractedUrl).hostname : window.location.hostname),
        category: itemCategory,
        quantity: quantity,
        quantity_received: 0,
        is_most_wanted: isMostWanted,
        is_private: isPrivate,
        notes: combinedNotes || null,
        added_via: 'extension',
        cheaper_alternative_url: null,
        cheaper_alternative_price: null,
        cheaper_alternative_store: null,
        price_alert_sent: false,
        enable_chip_in: false,
        chip_in_goal: null
      };

      console.log('📤 Submitting item:', formData);

      try {
        const response = await fetch(
          `${NESTY_CONFIG.SUPABASE_URL}/rest/v1/items`,
          {
            method: 'POST',
            headers: {
              'apikey': NESTY_CONFIG.SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${supabaseSession.access_token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(formData)
          }
        );

        if (!response.ok) {
          const body = await response.text().catch(() => '');
          console.error('Items POST failed:', response.status, body);
          throw new Error(`שגיאת שרת ${response.status} בהוספת המוצר`);
        }

        const result = await response.json();
        console.log('✅ Item added successfully:', result);

        submitBtn.textContent = 'נוסף!';
        submitBtn.style.background = '#22c55e';

        // Replace the mode tabs in the header with a success banner.
        const tabsContainer = document.getElementById('nesty-mode-tabs');
        if (tabsContainer) {
          tabsContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; color: #22c55e; font-size: 16px; font-weight: 700;">
              <span>נוסף לרשימה</span>
              <span>✓</span>
            </div>
          `;
        }

        // Launch confetti (one of 5 randomly-picked variants).
        launchConfetti(modal);

        const shouldAutoClose = !!(autoCloseCheckbox && autoCloseCheckbox.checked);
        if (shouldAutoClose) {
          setTimeout(() => overlay.remove(), 1500);
        } else {
          // Replace footer with a persistent success state:
          // two buttons — "לרשימה שלי" (open dashboard) and "סגור" (close overlay).
          const footer = document.getElementById('nesty-footer');
          if (footer) {
            const prevChecked = !!(autoCloseCheckbox && autoCloseCheckbox.checked);
            footer.innerHTML = `
              <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #6b6b6b; cursor: pointer; user-select: none;">
                <input type="checkbox" id="nesty-autoclose" style="width: 15px; height: 15px; cursor: pointer; accent-color: #6750a4;" ${prevChecked ? 'checked' : ''}>
                סגור לאחר הוספה
              </label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button id="nesty-success-dashboard" style="padding: 10px 20px; background: #22c55e; color: white; border: none; border-radius: 9999px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; animation: nesty-cta-pulse 1.6s ease-in-out infinite; box-shadow: 0 0 0 0 rgba(34,197,94,0.5); font-family: 'Assistant', 'Heebo', sans-serif;">
                  לרשימה שלי
                </button>
                <button id="nesty-success-close" style="padding: 10px 20px; background: white; border: 1px solid #e7e0ec; color: #49454f; border-radius: 9999px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'Assistant', 'Heebo', sans-serif;">
                  סגור
                </button>
              </div>
            `;
            const newAutoClose = document.getElementById('nesty-autoclose');
            newAutoClose.addEventListener('change', () => {
              try {
                chrome.storage.local.set({ nesty_autoclose: newAutoClose.checked });
              } catch (e) { /* ignore */ }
            });
            document.getElementById('nesty-success-dashboard').addEventListener('click', () => {
              overlay.remove();
              window.location.href = 'https://nestyil.com/dashboard';
            });
            document.getElementById('nesty-success-close').addEventListener('click', () => {
              overlay.remove();
            });
          }
        }

      } catch (error) {
        console.error('❌ Error adding item:', error);
        submitBtn.textContent = 'שגיאה - נסה שוב';
        submitBtn.style.background = '#b3261e';
        submitBtn.disabled = false;

        setTimeout(() => {
          submitBtn.textContent = '+ הוסף לרשימה';
          submitBtn.style.background = '#6750a4';
          submitBtn.style.opacity = '1';
        }, 2000);
      }
    });
  }
})(); // End of IIFE - allows re-injection without variable conflicts
