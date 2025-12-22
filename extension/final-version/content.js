/**
 * Nesty Extension - Content Script with Authentication
 * Checks user authentication, fetches registry, and shows product form
 */

// Wrap everything in IIFE to avoid variable conflicts on re-injection
(function() {
  console.log('🚀 Nesty Extension - Starting...');

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

  // Categories (Hebrew)
  const CATEGORIES = [
    { id: 'strollers', name: 'עגלות וטיולים' },
    { id: 'car_safety', name: 'בטיחות ברכב' },
    { id: 'furniture', name: 'ריהוט' },
    { id: 'safety', name: 'מוצרי בטיחות' },
    { id: 'feeding', name: 'האכלה' },
    { id: 'nursing', name: 'הנקה' },
    { id: 'bath', name: 'אמבט וטיפול בתינוק' },
    { id: 'clothing', name: 'ביגוד ראשוני' },
    { id: 'bedding', name: 'מצעים ואקססוריז' },
    { id: 'toys', name: 'צעצועים' }
  ];

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
      const productData = extractProductData();

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
        `${NESTY_CONFIG.SUPABASE_URL}/rest/v1/registries?owner_id=eq.${userId}&select=*`,
        {
          headers: {
            'apikey': NESTY_CONFIG.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${supabaseSession.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch registry');
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
        <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0;">נדרשת התחברות</h2>
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px 0;">
          כדי להוסיף מוצרים לרשימה שלך, עליך להתחבר ל-Nesty
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="nesty-login-btn" style="padding: 12px 24px; background: #6d28d9; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            התחבר ל-Nesty
          </button>
          <button id="nesty-close-login" style="padding: 12px 24px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
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
        <h2 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0;">שגיאה</h2>
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px 0; white-space: pre-wrap;">
          ${message}
        </p>
        <button id="nesty-close-error" style="padding: 12px 24px; background: #6d28d9; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">
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
   * Extract product data from current page (wrapper for backward compatibility)
   */
  function extractProductData() {
    return extractProductDataFromDocument(document);
  }

  /**
   * Extract product data from a Document object (current page OR parsed HTML)
   * @param {Document} doc - Document object to extract from
   * @returns {Object|null} - Product data or null if not found
   */
  function extractProductDataFromDocument(doc = document) {
    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    console.log(`Found ${jsonLdScripts.length} JSON-LD scripts`);

    for (let script of jsonLdScripts) {
      try {
        const data = JSON.parse(script.textContent);

        if (data['@type'] === 'Product') {
          console.log('✅ Found Product type');
          return extractFromProduct(data);
        }

        if (data['@type'] === 'ProductGroup') {
          console.log('✅ Found ProductGroup type');
          return extractFromProductGroup(data);
        }

        if (data['@graph']) {
          const product = data['@graph'].find(item =>
            item['@type'] === 'Product' || item['@type'] === 'ProductGroup'
          );
          if (product) {
            console.log('✅ Found product in @graph');
            return product['@type'] === 'Product'
              ? extractFromProduct(product)
              : extractFromProductGroup(product);
          }
        }
      } catch (error) {
        console.warn('Failed to parse JSON-LD:', error);
      }
    }

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
      const productData = extractProductDataFromDocument(doc);

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

  function extractFromProduct(data) {
    const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
    const imageUrls = [];

    if (data.image) {
      if (Array.isArray(data.image)) {
        imageUrls.push(...data.image);
      } else {
        imageUrls.push(data.image);
      }
    }

    return {
      name: data.name || '',
      price: offer?.price || '',
      priceCurrency: offer?.priceCurrency || '',
      brand: data.brand?.name || data.brand || '',
      category: data.category || '',
      imageUrls: [...new Set(imageUrls)]
    };
  }

  function extractFromProductGroup(data) {
    const variants = data.hasVariant || [];
    const firstVariant = Array.isArray(variants) ? variants[0] : variants;
    const offer = firstVariant?.offers;

    const imageUrls = [];
    if (Array.isArray(variants)) {
      variants.forEach(variant => {
        if (variant.image) {
          if (Array.isArray(variant.image)) {
            imageUrls.push(...variant.image);
          } else {
            imageUrls.push(variant.image);
          }
        }
      });
    }

    return {
      name: data.name || '',
      price: offer?.price || '',
      priceCurrency: offer?.priceCurrency || '',
      brand: data.brand?.name || data.brand || '',
      category: data.category || '',
      imageUrls: [...new Set(imageUrls)]
    };
  }

  /**
   * Show product form with full UI
   * @param {Object|null} product - Product data (null for paste mode)
   * @param {string} mode - Initial mode: 'current' or 'paste'
   */
  function showProductForm(product = null, mode = 'current') {
    console.log('🎨 Creating product form...');

    const overlay = document.createElement('div');
    overlay.className = 'nesty-overlay';

    const modal = document.createElement('div');
    modal.className = 'nesty-modal';
    modal.style.maxWidth = '800px';
    modal.style.maxHeight = '90vh';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';

    let imageUrl = product ? (product.imageUrls[0] || '') : '';

    // Form state
    let currentMode = mode; // 'current' or 'paste'
    let extractedUrl = null; // Store URL from paste mode
    let quantity = 1;
    let isMostWanted = false;
    let isPrivate = false;
    let isSecondhand = false;

    modal.innerHTML = `
      <div class="nesty-modal-header" style="border-bottom: 1px solid #e5e7eb; padding: 16px 20px; flex-shrink: 0; display: flex; justify-content: space-between; align-items: center;">
        <!-- Tab interface -->
        <div style="display: flex; gap: 8px; align-items: center;">
          <button id="nesty-mode-current" class="nesty-mode-tab"
                  style="padding: 8px 16px; background: ${currentMode === 'current' ? '#6d28d9' : '#f3f4f6'}; color: ${currentMode === 'current' ? 'white' : '#374151'}; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s;">
            עמוד נוכחי
          </button>
          <button id="nesty-mode-paste" class="nesty-mode-tab"
                  style="padding: 8px 16px; background: ${currentMode === 'paste' ? '#6d28d9' : '#f3f4f6'}; color: ${currentMode === 'paste' ? 'white' : '#374151'}; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s;">
            הדבק קישור
          </button>
        </div>

        <button class="nesty-close-btn" id="nesty-close" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; padding: 0;">×</button>
      </div>

      <div class="nesty-modal-body" style="padding: 20px; flex: 1; overflow-y: auto;">
        <!-- Current Page Mode Content -->
        <div id="nesty-current-mode-content" style="display: ${currentMode === 'current' ? 'grid' : 'none'}; grid-template-columns: 160px 1fr; gap: 20px;">
          <!-- Left side - Image -->
          <div style="text-align: center;">
            <img src="${imageUrl}" alt="${product ? product.name : ''}"
                 style="width: 160px; height: 160px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 8px;"
                 onerror="this.style.background='#f3f4f6'; this.alt='No Image'">
            <div style="font-size: 11px; color: #6b7280;">תמונה שנבחרה</div>
          </div>

          <!-- Right side - Form -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Title -->
            <div>
              <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px;">שם המוצר</label>
              <input type="text" id="nesty-title" value="${product ? product.name : ''}"
                     style="width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            </div>

            <!-- Price and Quantity -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px;">מחיר</label>
                <input type="text" id="nesty-price" value="${product ? product.price : ''}"
                       style="width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px;">
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px;">כמות</label>
                <div style="display: flex; align-items: center; border: 1px solid #d1d5db; border-radius: 6px; overflow: hidden; background: white;">
                  <button id="qty-minus" style="padding: 8px 14px; background: #f9fafb; border: none; border-right: 1px solid #d1d5db; cursor: pointer; font-size: 16px; color: #374151;">−</button>
                  <div id="qty-display" style="flex: 1; text-align: center; font-weight: 600; font-size: 14px;">1</div>
                  <button id="qty-plus" style="padding: 8px 14px; background: #f9fafb; border: none; border-left: 1px solid #d1d5db; cursor: pointer; font-size: 16px; color: #374151;">+</button>
                </div>
              </div>
            </div>

            <!-- Category -->
            <div>
              <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px;">קטגוריה</label>
              <select id="nesty-category"
                      style="width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; background: white;">
                <option value="">כללי</option>
                ${CATEGORIES.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
              </select>
            </div>

            <!-- Toggles -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
              <div id="toggle-wanted" style="padding: 8px; border: 2px solid #e5e7eb; border-radius: 6px; text-align: center; cursor: pointer; transition: all 0.2s;">
                <div style="font-size: 11px; font-weight: 500; color: #374151;">הכי רציתי</div>
                <div style="margin-top: 6px;">
                  <div style="width: 40px; height: 20px; background: #e5e7eb; border-radius: 10px; margin: 0 auto; position: relative;">
                    <div id="toggle-wanted-switch" style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.1);"></div>
                  </div>
                </div>
              </div>

              <div id="toggle-private" style="padding: 8px; border: 2px solid #e5e7eb; border-radius: 6px; text-align: center; cursor: pointer; transition: all 0.2s;">
                <div style="font-size: 11px; font-weight: 500; color: #374151;">פרטי</div>
                <div style="margin-top: 6px;">
                  <div style="width: 40px; height: 20px; background: #e5e7eb; border-radius: 10px; margin: 0 auto; position: relative;">
                    <div id="toggle-private-switch" style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.1);"></div>
                  </div>
                </div>
              </div>

              <div id="toggle-secondhand" style="padding: 8px; border: 2px solid #e5e7eb; border-radius: 6px; text-align: center; cursor: pointer; transition: all 0.2s;">
                <div style="font-size: 11px; font-weight: 500; color: #374151;">פתוח למשומש</div>
                <div style="margin-top: 6px;">
                  <div style="width: 40px; height: 20px; background: #e5e7eb; border-radius: 10px; margin: 0 auto; position: relative;">
                    <div id="toggle-secondhand-switch" style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.1);"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px;">הערות</label>
              <textarea id="nesty-notes" rows="2" placeholder="הערות למשפחה וחברים..."
                        style="width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; resize: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"></textarea>
            </div>
          </div>
        </div>

        <!-- Paste URL Mode Content (NEW) -->
        <div id="nesty-paste-mode-content" style="display: ${currentMode === 'paste' ? 'flex' : 'none'}; flex-direction: column; align-items: center; padding: 40px 20px;">
          <div style="width: 100%; max-width: 500px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 48px; margin-bottom: 12px;">🔗</div>
              <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">הדבק קישור למוצר</h3>
              <p style="font-size: 13px; color: #6b7280; margin: 0;">הדבק כתובת URL של מוצר מכל אתר מסחר אלקטרוני</p>
            </div>

            <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 8px;">
              כתובת URL
            </label>
            <input type="url" id="nesty-url-input" placeholder="https://example.com/product"
                   style="width: 100%; padding: 12px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 14px; margin-bottom: 16px; direction: ltr; text-align: left;">

            <button id="nesty-extract-btn"
                    style="width: 100%; padding: 12px 32px; background: #6d28d9; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
              חלץ מוצר
            </button>

            <div id="nesty-extraction-status" style="margin-top: 16px; text-align: center; color: #6b7280; font-size: 13px; min-height: 20px;"></div>
          </div>
        </div>
      </div>

      <div class="nesty-modal-footer" style="padding: 14px 20px; border-top: 1px solid #e5e7eb; background: #f9fafb; display: flex; justify-content: flex-end; flex-shrink: 0;">
        <button id="nesty-submit" style="padding: 10px 28px; background: #6d28d9; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap;">
          הוסף לרשימה
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

    // Toggle controls
    document.getElementById('toggle-wanted').addEventListener('click', () => {
      isMostWanted = !isMostWanted;
      const toggle = document.getElementById('toggle-wanted');
      const toggleSwitch = document.getElementById('toggle-wanted-switch');
      if (isMostWanted) {
        toggle.style.borderColor = '#ef4444';
        toggle.style.background = '#fef2f2';
        toggleSwitch.style.left = '22px';
        toggleSwitch.style.background = '#ef4444';
      } else {
        toggle.style.borderColor = '#e5e7eb';
        toggle.style.background = 'white';
        toggleSwitch.style.left = '2px';
        toggleSwitch.style.background = 'white';
      }
    });

    document.getElementById('toggle-private').addEventListener('click', () => {
      isPrivate = !isPrivate;
      const toggle = document.getElementById('toggle-private');
      const toggleSwitch = document.getElementById('toggle-private-switch');
      if (isPrivate) {
        toggle.style.borderColor = '#8b5cf6';
        toggle.style.background = '#f5f3ff';
        toggleSwitch.style.left = '22px';
        toggleSwitch.style.background = '#8b5cf6';
      } else {
        toggle.style.borderColor = '#e5e7eb';
        toggle.style.background = 'white';
        toggleSwitch.style.left = '2px';
        toggleSwitch.style.background = 'white';
      }
    });

    document.getElementById('toggle-secondhand').addEventListener('click', () => {
      isSecondhand = !isSecondhand;
      const toggle = document.getElementById('toggle-secondhand');
      const toggleSwitch = document.getElementById('toggle-secondhand-switch');
      if (isSecondhand) {
        toggle.style.borderColor = '#10b981';
        toggle.style.background = '#f0fdf4';
        toggleSwitch.style.left = '22px';
        toggleSwitch.style.background = '#10b981';
      } else {
        toggle.style.borderColor = '#e5e7eb';
        toggle.style.background = 'white';
        toggleSwitch.style.left = '2px';
        toggleSwitch.style.background = 'white';
      }
    });

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

      if (mode === 'current') {
        currentTab.style.background = '#6d28d9';
        currentTab.style.color = 'white';
        pasteTab.style.background = '#f3f4f6';
        pasteTab.style.color = '#374151';
        document.getElementById('nesty-current-mode-content').style.display = 'grid';
        document.getElementById('nesty-paste-mode-content').style.display = 'none';
      } else {
        pasteTab.style.background = '#6d28d9';
        pasteTab.style.color = 'white';
        currentTab.style.background = '#f3f4f6';
        currentTab.style.color = '#374151';
        document.getElementById('nesty-current-mode-content').style.display = 'none';
        document.getElementById('nesty-paste-mode-content').style.display = 'flex';
      }
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
      statusDiv.style.color = '#6b7280';

      try {
        const productData = await extractProductFromUrl(url);

        statusDiv.textContent = '✅ מוצר חולץ בהצלחה!';
        statusDiv.style.color = '#10b981';

        document.getElementById('nesty-title').value = productData.name || '';
        document.getElementById('nesty-price').value = productData.price || '';

        const img = document.querySelector('#nesty-current-mode-content img');
        if (img && productData.imageUrls?.[0]) {
          img.src = productData.imageUrls[0];
          imageUrl = productData.imageUrls[0];
        }

        extractedUrl = url;

        setTimeout(() => switchMode('current'), 1000);
      } catch (error) {
        statusDiv.textContent = `❌ ${error.message}`;
        statusDiv.style.color = '#ef4444';
      } finally {
        extractBtn.disabled = false;
        extractBtn.textContent = 'חלץ מוצר';
      }
    });

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
      submitBtn.disabled = true;
      submitBtn.textContent = 'מוסיף...';
      submitBtn.style.opacity = '0.7';

      const formData = {
        registry_id: userRegistry.id,
        name: document.getElementById('nesty-title').value,
        price: parseFloat(document.getElementById('nesty-price').value) || 0,
        image_url: imageUrl || null,
        original_url: extractedUrl || window.location.href,
        store_name: extractedUrl ? new URL(extractedUrl).hostname : window.location.hostname,
        category: document.getElementById('nesty-category').value || 'strollers',
        quantity: quantity,
        quantity_received: 0,
        is_most_wanted: isMostWanted,
        is_private: isPrivate,
        notes: document.getElementById('nesty-notes').value || null,
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
          throw new Error('Failed to add item to registry');
        }

        const result = await response.json();
        console.log('✅ Item added successfully:', result);

        submitBtn.textContent = 'נוסף! ✓';
        submitBtn.style.background = '#10b981';

        setTimeout(() => {
          overlay.remove();
        }, 1500);

      } catch (error) {
        console.error('❌ Error adding item:', error);
        submitBtn.textContent = 'שגיאה - נסה שוב';
        submitBtn.style.background = '#ef4444';
        submitBtn.disabled = false;

        setTimeout(() => {
          submitBtn.textContent = 'הוסף לרשימה';
          submitBtn.style.background = '#6d28d9';
          submitBtn.style.opacity = '1';
        }, 2000);
      }
    });
  }
})(); // End of IIFE - allows re-injection without variable conflicts
