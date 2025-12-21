/**
 * Nesty Extension - Simplified Content Script
 * Just show popup with product data - no authentication for now
 */

console.log('🚀 Nesty Extension - Starting...');

// Prevent double execution
if (window.nestyExtensionLoaded) {
  console.log('⚠️ Extension already loaded, exiting');
} else {
  window.nestyExtensionLoaded = true;

  console.log('✅ First load, continuing...');

  // Inject CSS
  console.log('💅 Injecting styles...');
  const link = document.createElement('link');
  link.id = 'nesty-styles';
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('popup-styles.css');
  document.head.appendChild(link);

  console.log('🔍 Extracting product data...');

  // Extract product data
  const productData = extractProductData();

  console.log('📦 Product data:', productData);

  if (productData) {
    console.log('✅ Showing popup...');
    showSimplePopup(productData);
  } else {
    console.log('❌ No product data found');
    showErrorPopup('No product data found on this page');
  }
}

/**
 * Extract product data from JSON-LD
 */
function extractProductData() {
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
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
 * Show simple popup with product data
 */
function showSimplePopup(product) {
  console.log('🎨 Creating popup...');

  const overlay = document.createElement('div');
  overlay.className = 'nesty-overlay';

  const modal = document.createElement('div');
  modal.className = 'nesty-modal';
  modal.style.maxWidth = '800px';
  modal.style.maxHeight = '90vh';
  modal.style.display = 'flex';
  modal.style.flexDirection = 'column';

  const imageUrl = product.imageUrls[0] || '';

  // Form state
  let quantity = 1;
  let isMostWanted = false;
  let isPrivate = false;
  let isSecondhand = false;

  modal.innerHTML = `
    <div class="nesty-modal-header" style="border-bottom: 1px solid #e5e7eb; padding: 16px 20px; flex-shrink: 0; display: flex; justify-content: space-between; align-items: center;">
      <h2 class="nesty-modal-title" style="font-size: 18px; font-weight: 600; margin: 0;">Add to Babylist</h2>
      <button class="nesty-close-btn" id="nesty-close" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; padding: 0;">×</button>
    </div>

    <div class="nesty-modal-body" style="padding: 20px; display: grid; grid-template-columns: 160px 1fr; gap: 20px; flex: 1; overflow-y: auto;">
      <!-- Left side - Image -->
      <div style="text-align: center;">
        <img src="${imageUrl}" alt="${product.name}"
             style="width: 160px; height: 160px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 8px;"
             onerror="this.style.background='#f3f4f6'; this.alt='No Image'">
        <div style="font-size: 11px; color: #6b7280;">Selected image</div>
      </div>

      <!-- Right side - Form -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <!-- Title -->
        <div>
          <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px;">Title</label>
          <input type="text" id="nesty-title" value="${product.name}"
                 style="width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        </div>

        <!-- Price and Quantity -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px;">Price</label>
            <input type="text" id="nesty-price" value="${product.price}"
                   style="width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px;">
          </div>
          <div>
            <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px;">Quantity</label>
            <div style="display: flex; align-items: center; border: 1px solid #d1d5db; border-radius: 6px; overflow: hidden; background: white;">
              <button id="qty-minus" style="padding: 8px 14px; background: #f9fafb; border: none; border-right: 1px solid #d1d5db; cursor: pointer; font-size: 16px; color: #374151;">−</button>
              <div id="qty-display" style="flex: 1; text-align: center; font-weight: 600; font-size: 14px;">1</div>
              <button id="qty-plus" style="padding: 8px 14px; background: #f9fafb; border: none; border-left: 1px solid #d1d5db; cursor: pointer; font-size: 16px; color: #374151;">+</button>
            </div>
          </div>
        </div>

        <!-- Registry -->
        <div>
          <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px;">Registry</label>
          <select id="nesty-registry"
                  style="width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; background: white;">
            <option>Michael's Baby Registry</option>
          </select>
        </div>

        <!-- Category -->
        <div>
          <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px;">Category</label>
          <select id="nesty-category"
                  style="width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; background: white;">
            <option value="">General</option>
            <option value="strollers">Strollers</option>
            <option value="car_safety">Car Safety</option>
            <option value="furniture">Furniture</option>
            <option value="feeding">Feeding</option>
            <option value="clothing">Clothing</option>
            <option value="toys">Toys</option>
          </select>
        </div>

        <!-- Toggles -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          <div id="toggle-wanted" style="padding: 8px; border: 2px solid #e5e7eb; border-radius: 6px; text-align: center; cursor: pointer; transition: all 0.2s;">
            <div style="font-size: 11px; font-weight: 500; color: #374151;">Most wanted</div>
            <div style="margin-top: 6px;">
              <div style="width: 40px; height: 20px; background: #e5e7eb; border-radius: 10px; margin: 0 auto; position: relative;">
                <div id="toggle-wanted-switch" style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.1);"></div>
              </div>
            </div>
          </div>

          <div id="toggle-private" style="padding: 8px; border: 2px solid #e5e7eb; border-radius: 6px; text-align: center; cursor: pointer; transition: all 0.2s;">
            <div style="font-size: 11px; font-weight: 500; color: #374151;">Private</div>
            <div style="margin-top: 6px;">
              <div style="width: 40px; height: 20px; background: #e5e7eb; border-radius: 10px; margin: 0 auto; position: relative;">
                <div id="toggle-private-switch" style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.1);"></div>
              </div>
            </div>
          </div>

          <div id="toggle-secondhand" style="padding: 8px; border: 2px solid #e5e7eb; border-radius: 6px; text-align: center; cursor: pointer; transition: all 0.2s;">
            <div style="font-size: 11px; font-weight: 500; color: #374151;">Open to<br>secondhand</div>
            <div style="margin-top: 6px;">
              <div style="width: 40px; height: 20px; background: #e5e7eb; border-radius: 10px; margin: 0 auto; position: relative;">
                <div id="toggle-secondhand-switch" style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.1);"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px;">Note for friends and family</label>
          <textarea id="nesty-notes" rows="2" placeholder="Add an optional note here to help your gift-givers. For example, what size or color would you like?"
                    style="width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; resize: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"></textarea>
        </div>
      </div>
    </div>

    <div class="nesty-modal-footer" style="padding: 14px 20px; border-top: 1px solid #e5e7eb; background: #f9fafb; display: flex; justify-content: flex-end; flex-shrink: 0;">
      <button id="nesty-submit" style="padding: 10px 28px; background: #6d28d9; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap;">
        Add to Babylist
      </button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  console.log('✅ Popup added to DOM');

  // Event listeners
  document.getElementById('nesty-close').addEventListener('click', () => {
    console.log('Close clicked');
    overlay.remove();
  });

  // Quantity controls
  document.getElementById('qty-minus').addEventListener('click', () => {
    if (quantity > 1) {
      quantity--;
      document.getElementById('qty-display').textContent = quantity;
    }
  });

  document.getElementById('qty-plus').addEventListener('click', () => {
    quantity++;
    document.getElementById('qty-display').textContent = quantity;
  });

  // Toggle switches
  const toggleWanted = document.getElementById('toggle-wanted');
  const togglePrivate = document.getElementById('toggle-private');
  const toggleSecondhand = document.getElementById('toggle-secondhand');

  toggleWanted.addEventListener('click', () => {
    isMostWanted = !isMostWanted;
    const bg = toggleWanted.querySelector('div > div');
    const sw = document.getElementById('toggle-wanted-switch');
    if (isMostWanted) {
      bg.style.background = '#dc2626';
      sw.style.left = '22px';
      toggleWanted.style.borderColor = '#dc2626';
      toggleWanted.style.background = '#fee';
    } else {
      bg.style.background = '#e5e7eb';
      sw.style.left = '2px';
      toggleWanted.style.borderColor = '#e5e7eb';
      toggleWanted.style.background = 'white';
    }
  });

  togglePrivate.addEventListener('click', () => {
    isPrivate = !isPrivate;
    const bg = togglePrivate.querySelector('div > div');
    const sw = document.getElementById('toggle-private-switch');
    if (isPrivate) {
      bg.style.background = '#6d28d9';
      sw.style.left = '20px';
      togglePrivate.style.borderColor = '#6d28d9';
      togglePrivate.style.background = '#f3e8ff';
    } else {
      bg.style.background = '#e5e7eb';
      sw.style.left = '2px';
      togglePrivate.style.borderColor = '#e5e7eb';
      togglePrivate.style.background = 'white';
    }
  });

  toggleSecondhand.addEventListener('click', () => {
    isSecondhand = !isSecondhand;
    const bg = toggleSecondhand.querySelector('div > div');
    const sw = document.getElementById('toggle-secondhand-switch');
    if (isSecondhand) {
      bg.style.background = '#10b981';
      sw.style.left = '20px';
      toggleSecondhand.style.borderColor = '#10b981';
      toggleSecondhand.style.background = '#d1fae5';
    } else {
      bg.style.background = '#e5e7eb';
      sw.style.left = '2px';
      toggleSecondhand.style.borderColor = '#e5e7eb';
      toggleSecondhand.style.background = 'white';
    }
  });

  // Submit button
  document.getElementById('nesty-submit').addEventListener('click', () => {
    console.log('Submit clicked');
    const formData = {
      title: document.getElementById('nesty-title').value,
      price: document.getElementById('nesty-price').value,
      quantity: quantity,
      registry: document.getElementById('nesty-registry').value,
      category: document.getElementById('nesty-category').value,
      notes: document.getElementById('nesty-notes').value,
      isMostWanted: isMostWanted,
      isPrivate: isPrivate,
      isSecondhand: isSecondhand,
      imageUrl: imageUrl,
      originalUrl: window.location.href
    };
    console.log('Form data:', formData);
    alert('Form submitted! Check console for data.');
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      console.log('Overlay clicked');
      overlay.remove();
    }
  });

  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      console.log('Escape pressed');
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  });
}

/**
 * Show error popup
 */
function showErrorPopup(message) {
  console.log('❌ Showing error:', message);

  const overlay = document.createElement('div');
  overlay.className = 'nesty-overlay';

  const modal = document.createElement('div');
  modal.className = 'nesty-modal';
  modal.style.maxWidth = '400px';

  modal.innerHTML = `
    <div class="nesty-modal-header">
      <h2 class="nesty-modal-title" style="color: #dc2626;">Error</h2>
      <button class="nesty-close-btn" id="nesty-close">×</button>
    </div>

    <div class="nesty-modal-body">
      <p style="color: #374151; font-size: 14px;">${message}</p>
    </div>

    <div class="nesty-modal-footer">
      <button class="nesty-btn nesty-btn-primary" id="nesty-ok">OK</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  document.getElementById('nesty-close').addEventListener('click', () => overlay.remove());
  document.getElementById('nesty-ok').addEventListener('click', () => overlay.remove());

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

console.log('✅ Content script loaded successfully');
