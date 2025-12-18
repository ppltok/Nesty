/**
 * Content Script for Nesty Local Dev Extension
 * Extracts product data and displays it in a modal
 */

(async function() {
  console.log('🚀 Nesty Local Dev - Starting...');

  try {
    // STEP 1: Extract product data from the page
    const currentPageUrl = window.location.href;
    console.log('📍 Current Page URL:', currentPageUrl);

    // STEP 2: Extract product data directly from the page
    console.log('🔍 Extracting product data from page...');
    const productData = extractProductData();

    if (productData) {
      console.log('✅ Product data extracted successfully!');
      console.log('📦 Product Data:', productData);

      // Display the product data in a modal
      displayProductModal(productData);
    } else {
      console.log('❌ No product data found on this page');
      alert('❌ No product data found on this page.\n\nMake sure you\'re on a product page with JSON-LD or Shopify data.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    alert(`❌ Error: ${error.message}\n\nCheck console (F12) for details.`);
  }
})();

/**
 * Extract product data from the page using multiple methods
 */
function extractProductData() {
  console.log('🔍 Searching for product data on page...');

  // METHOD 1: Look for all JSON-LD script tags
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
  console.log(`Found ${jsonLdScripts.length} JSON-LD script(s)`);

  for (let i = 0; i < jsonLdScripts.length; i++) {
    try {
      const data = JSON.parse(jsonLdScripts[i].textContent);
      console.log(`JSON-LD ${i + 1}:`, data);

      let productData = null;
      const nonProductTypes = ['WebSite', 'Organization', 'BreadcrumbList', 'WebPage', 'SearchAction'];
      const isProductLike = data.name && data.offers && !nonProductTypes.includes(data['@type']);

      if (data['@type'] === 'Product' || (isProductLike && data['@type'] !== 'ProductGroup')) {
        console.log('Found Product, extracting data...');
        productData = extractFromProduct(data);
      } else if (data['@type'] === 'ProductGroup') {
        console.log('Found ProductGroup, extracting data...');
        productData = extractFromProductGroup(data);
      } else if (data['@graph']) {
        const foundProduct = data['@graph'].find(item =>
          item['@type'] === 'Product' || item['@type'] === 'ProductGroup'
        );
        if (foundProduct) {
          console.log('Found Product in @graph, extracting data...');
          productData = foundProduct['@type'] === 'ProductGroup'
            ? extractFromProductGroup(foundProduct)
            : extractFromProduct(foundProduct);
        }
      }

      if (productData) {
        console.log('✅ Found Product data in JSON-LD:', productData);
        return productData;
      }
    } catch (error) {
      console.warn(`⚠️ Failed to parse JSON-LD ${i + 1}:`, error);
    }
  }

  // METHOD 2: Try Shopify's meta tags
  console.log('🔍 Trying Shopify meta tags...');
  const productMeta = {
    name: document.querySelector('meta[property="og:title"]')?.content,
    price: document.querySelector('meta[property="product:price:amount"]')?.content,
    priceCurrency: document.querySelector('meta[property="product:price:currency"]')?.content,
    image: document.querySelector('meta[property="og:image"]')?.content,
    availability: document.querySelector('meta[property="product:availability"]')?.content
  };

  if (productMeta.name) {
    console.log('✅ Found product data in meta tags!');
    return {
      name: productMeta.name,
      category: 'N/A',
      price: productMeta.price || 'N/A',
      priceCurrency: productMeta.priceCurrency || 'N/A',
      brand: 'N/A',
      imageUrls: productMeta.image ? [productMeta.image] : []
    };
  }

  // METHOD 3: Try ShopifyAnalytics
  console.log('🔍 Trying ShopifyAnalytics...');
  if (window.ShopifyAnalytics?.meta?.product) {
    const shopifyProduct = window.ShopifyAnalytics.meta.product;
    console.log('✅ Found ShopifyAnalytics data!');
    return {
      name: shopifyProduct.name || 'N/A',
      category: 'N/A',
      price: shopifyProduct.price || 'N/A',
      priceCurrency: window.ShopifyAnalytics.meta.currency || 'N/A',
      brand: shopifyProduct.vendor || 'N/A',
      imageUrls: []
    };
  }

  console.log('❌ No product data found on page');
  return null;
}

/**
 * Extract simplified product data from Product type
 */
function extractFromProduct(data) {
  const imageUrls = [];
  if (data.image) {
    if (Array.isArray(data.image)) {
      imageUrls.push(...data.image);
    } else {
      imageUrls.push(data.image);
    }
  }

  const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
  const price = offer?.price || offer?.lowPrice || 'N/A';
  const priceCurrency = offer?.priceCurrency || 'N/A';

  return {
    name: data.name || 'N/A',
    category: data.category || 'N/A',
    price: price,
    priceCurrency: priceCurrency,
    brand: data.brand?.name || data.brand || 'N/A',
    imageUrls: [...new Set(imageUrls)]
  };
}

/**
 * Extract simplified product data from ProductGroup type
 */
function extractFromProductGroup(data) {
  const offers = data.hasVariant || data.offers;
  let firstOffer;
  if (Array.isArray(offers)) {
    const inStockOffer = offers.find(offer =>
      offer?.offers?.availability?.includes('InStock')
    );
    firstOffer = inStockOffer || offers[0];
  } else {
    firstOffer = offers;
  }

  const imageUrls = [];
  if (Array.isArray(data.hasVariant)) {
    data.hasVariant.forEach(variant => {
      if (variant.image) {
        if (Array.isArray(variant.image)) {
          imageUrls.push(...variant.image);
        } else {
          imageUrls.push(variant.image);
        }
      }
    });
  }

  const variantOffers = firstOffer?.offers;

  return {
    name: data.name || 'N/A',
    category: data.category || 'N/A',
    price: variantOffers?.price || 'N/A',
    priceCurrency: variantOffers?.priceCurrency || 'N/A',
    brand: data.brand?.name || data.brand || 'N/A',
    imageUrls: [...new Set(imageUrls)]
  };
}

/**
 * Display product data and open Nesty app
 */
function displayProductModal(productData) {
  // Store product data in localStorage for the Nesty app to pick up
  const extensionData = {
    productData: productData,
    sourceUrl: window.location.href,
    timestamp: new Date().toISOString()
  };

  try {
    localStorage.setItem('nesty_extension_product', JSON.stringify(extensionData));
    console.log('✅ Product data stored in localStorage');
  } catch (error) {
    console.error('❌ Failed to store in localStorage:', error);
  }

  // Show confirmation modal
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border: 3px solid #4CAF50;
    border-radius: 8px;
    z-index: 999999;
    max-width: 500px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    font-family: system-ui, -apple-system, sans-serif;
  `;

  modal.innerHTML = `
    <h2 style="margin-top: 0; color: #4CAF50;">
      🎁 Product Data Extracted!
    </h2>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
      <p style="margin: 5px 0;"><strong>Name:</strong> ${productData.name}</p>
      <p style="margin: 5px 0;"><strong>Price:</strong> ${productData.priceCurrency} ${productData.price}</p>
      <p style="margin: 5px 0;"><strong>Brand:</strong> ${productData.brand}</p>
      <p style="margin: 5px 0;"><strong>Category:</strong> ${productData.category}</p>
    </div>
    <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
      Click "Open Nesty App" to add this product to your registry and edit the details.
    </p>
    <div style="display: flex; gap: 10px;">
      <button id="nesty-open-app-btn" style="flex: 1; padding: 12px 20px; background: #6750a4; color: white; border: none; cursor: pointer; font-size: 16px; border-radius: 8px; font-weight: 500;">
        🚀 Open Nesty App
      </button>
      <button id="nesty-close-btn" style="padding: 12px 20px; background: #e0e0e0; color: #333; border: none; cursor: pointer; font-size: 16px; border-radius: 8px; font-weight: 500;">
        Close
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  // Open Nesty app button
  document.getElementById('nesty-open-app-btn').addEventListener('click', () => {
    // Open Nesty dashboard in a new tab with the product data parameter
    window.open('http://localhost:5173/dashboard?addProduct=true', '_blank');
    modal.remove();
  });

  // Close button
  document.getElementById('nesty-close-btn').addEventListener('click', () => {
    modal.remove();
  });
}
