/**
 * Content Script - Runs on the product page and tests the Babylist API
 *
 * This script:
 * 1. Gets the current page URL
 * 2. Calls Babylist's scraper directives API
 * 3. Displays the results in the browser console and as an alert
 */

(async function() {
  console.log('🚀 Babylist API Tester - Starting...');

  try {
    // STEP 1: Get the current page URL
    const currentPageUrl = window.location.href;
    console.log('📍 Current Page URL:', currentPageUrl);

    // STEP 2: Call the Babylist API to get scraping directives
    console.log('📡 Calling Babylist API...');
    const directives = await fetchBabylistDirectives(currentPageUrl);

    // STEP 3: Display results
    console.log('✅ SUCCESS! Directives received from Babylist API');
    console.log('📦 Full Response:', directives);

    // Log directives in a more readable format
    console.log('📋 DIRECTIVES BREAKDOWN:');
    console.log('========================');
    directives.directives.forEach((directive, index) => {
      console.log(`\nDirective ${index + 1}:`, directive);
    });
    console.log('========================\n');

    // Also log as pretty JSON string
    console.log('📄 Full Response as JSON:');
    console.log(JSON.stringify(directives, null, 2));

    // Analyze what the directives will extract
    const analysis = analyzeDirectives(directives);
    console.log('📊 Directive Analysis:', analysis);

    // EXTRACT ACTUAL PRODUCT DATA from the page
    const productData = extractJsonLdData();

    if (productData) {
      // Extract all data with proper fallbacks
      const name = productData.name || 'N/A';
      const price = productData.offers?.price || productData.offers?.lowPrice || 'N/A';
      const currency = productData.offers?.priceCurrency || '';
      const availability = productData.offers?.availability || 'N/A';
      const brand = productData.brand?.name || productData.brand || 'N/A';
      const sku = productData.sku || 'N/A';
      const category = productData.category || 'N/A';

      // Handle image - could be string or array
      let image = 'N/A';
      if (Array.isArray(productData.image)) {
        image = productData.image[0];
      } else if (typeof productData.image === 'string') {
        image = productData.image;
      }

      console.log('🎁 ACTUAL PRODUCT DATA EXTRACTED FROM PAGE:');
      console.log('==========================================');
      console.log('Product Name:', name);
      console.log('Price:', price, currency);
      console.log('Availability:', availability);
      console.log('Brand:', brand);
      console.log('SKU:', sku);
      console.log('Category:', category);
      console.log('Image URL:', image);
      console.log('Full product data:', productData);
      console.log('==========================================\n');

      // Show a user-friendly alert with ACTUAL DATA
      alert(
        '✅ Product Data Extracted!\n\n' +
        `Product: ${name}\n` +
        `Price: ${currency} ${price}\n` +
        `Brand: ${brand}\n` +
        `SKU: ${sku}\n` +
        `Category: ${category}\n` +
        `Availability: ${availability}\n` +
        `Image: ${image}\n\n` +
        '--- Babylist API Info ---\n' +
        `Platform: ${analysis.platform}\n` +
        `Fields API can extract: ${analysis.fields.join(', ')}\n\n` +
        'Check console (F12) for full details!'
      );
    } else {
      // Show directive info if no product data found
      alert(
        '✅ Babylist API Test Successful!\n\n' +
        `Platform: ${analysis.platform}\n` +
        `Fields to extract: ${analysis.fields.join(', ')}\n` +
        `Directive chains: ${analysis.chainCount}\n\n` +
        `Has JSON-LD: ${analysis.hasJsonLd}\n` +
        `Has Shopify: ${analysis.hasShopify}\n` +
        `Has Fallback: ${analysis.hasFallback}\n\n` +
        'Check the browser console (F12) for full directive details!'
      );
    }

  } catch (error) {
    // If something goes wrong, log the error
    console.error('❌ Error testing Babylist API:', error);
    alert(`❌ Error: ${error.message}\n\nCheck console (F12) for details.`);
  }
})();

/**
 * Fetch scraping directives from Babylist API via background script
 *
 * @param {string} productUrl - The URL of the product page
 * @returns {Promise<Object>} - The API response containing directives
 */
async function fetchBabylistDirectives(productUrl) {
  console.log('🔗 Requesting API fetch from background script');

  // Send a message to the background script to make the API call
  // This bypasses CORS restrictions since background scripts have host_permissions
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: 'fetchBabylistAPI', url: productUrl },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      }
    );
  });
}

/**
 * Analyze the directives to understand what will be scraped
 *
 * @param {Object} response - The API response
 * @returns {Object} - Analysis summary
 */
function analyzeDirectives(response) {
  // Convert directives to string for searching
  const jsonString = JSON.stringify(response.directives || {});

  // Detect platform
  let platform = 'Generic';
  if (jsonString.includes('ShopifyAnalytics')) {
    platform = 'Shopify';
  } else if (jsonString.includes('JsonLdProduct')) {
    platform = 'JSON-LD Compatible';
  }

  // Detect which fields will be extracted
  const fields = [];
  if (jsonString.includes('"title"')) fields.push('title');
  if (jsonString.includes('"price"')) fields.push('price');
  if (jsonString.includes('image_urls')) fields.push('images');
  if (jsonString.includes('"brand"')) fields.push('brand');
  if (jsonString.includes('"sku"')) fields.push('sku');
  if (jsonString.includes('"category"')) fields.push('category');
  if (jsonString.includes('"availability"')) fields.push('availability');

  // Count directive chains
  const chainCount = Array.isArray(response.directives) ? response.directives.length : 0;

  return {
    platform,
    fields,
    chainCount,
    hasJsonLd: jsonString.includes('JsonLdProduct'),
    hasShopify: jsonString.includes('ShopifyAnalytics'),
    hasFallback: jsonString.includes('fallback')
  };
}

/**
 * Extract product data from the page using multiple methods
 */
function extractJsonLdData() {
  console.log('🔍 Searching for product data on page...');

  // METHOD 1: Look for all JSON-LD script tags
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');

  console.log(`Found ${jsonLdScripts.length} JSON-LD script(s)`);

  for (let i = 0; i < jsonLdScripts.length; i++) {
    try {
      const data = JSON.parse(jsonLdScripts[i].textContent);
      console.log(`JSON-LD ${i + 1}:`, data);

      // Check if it's a Product or ProductGroup
      let productData = null;

      // List of non-product types to skip
      const nonProductTypes = ['WebSite', 'Organization', 'BreadcrumbList', 'WebPage', 'SearchAction'];

      // Check if it's a product-like object (has name and offers, and isn't a known non-product type)
      const isProductLike = data.name && data.offers && !nonProductTypes.includes(data['@type']);

      if (data['@type'] === 'Product' || (isProductLike && data['@type'] !== 'ProductGroup')) {
        console.log('Found Product, extracting data...');

        // Extract image URLs (handle both string and array)
        const imageUrls = [];
        if (data.image) {
          if (Array.isArray(data.image)) {
            imageUrls.push(...data.image);
          } else {
            imageUrls.push(data.image);
          }
        }
        const uniqueImageUrls = [...new Set(imageUrls)];

        // Extract price with multiple fallbacks
        let price = 'N/A';
        let priceCurrency = 'N/A';

        if (data.offers) {
          // Handle array of offers
          const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
          price = offer?.price || offer?.lowPrice || offer?.highPrice || 'N/A';
          priceCurrency = offer?.priceCurrency || 'N/A';
        }

        // Create simplified product data
        const simplifiedProduct = {
          name: data.name || 'N/A',
          category: data.category || 'N/A',
          price: price,
          priceCurrency: priceCurrency,
          brand: data.brand?.name || data.brand || 'N/A',
          imageUrls: uniqueImageUrls
        };

        console.log('========== SIMPLIFIED PRODUCT DATA ==========');
        console.log(JSON.stringify(simplifiedProduct, null, 2));
        console.log('========== END SIMPLIFIED DATA ==========\n');

        // Create modal with simplified data
        const modal = document.createElement('div');
        modal.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border: 3px solid #333;
          z-index: 999999;
          max-width: 80%;
          max-height: 80%;
          overflow: auto;
          box-shadow: 0 0 20px rgba(0,0,0,0.5);
        `;

        modal.innerHTML = `
          <h3 style="margin-top: 0;">Product Data (Simplified)</h3>
          <p>Select all the text below and copy it (Ctrl+A, Ctrl+C):</p>
          <textarea readonly style="width: 100%; height: 400px; font-family: monospace; font-size: 12px; padding: 10px; border: 1px solid #ccc;">
${JSON.stringify(simplifiedProduct, null, 2)}
          </textarea>
          <div style="margin-top: 10px;">
            <button id="babylist-copy-btn" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer; font-size: 16px; margin-right: 10px;">
              Copy to Clipboard
            </button>
            <button id="babylist-close-btn" style="padding: 10px 20px; background: #f44336; color: white; border: none; cursor: pointer; font-size: 16px;">
              Close
            </button>
          </div>
        `;

        document.body.appendChild(modal);

        // Add copy button functionality
        document.getElementById('babylist-copy-btn').addEventListener('click', () => {
          const textarea = modal.querySelector('textarea');
          textarea.select();
          document.execCommand('copy');
          alert('JSON data copied to clipboard!');
        });

        // Add close button functionality
        document.getElementById('babylist-close-btn').addEventListener('click', () => {
          modal.remove();
        });

        productData = data;
      } else if (data['@type'] === 'ProductGroup') {
        // ProductGroup contains product variants
        console.log('Found ProductGroup, extracting data...');

        // Get the first variant offer or default offer
        const offers = data.hasVariant || data.offers;

        // Prefer in-stock variants over out-of-stock ones
        let firstOffer;
        if (Array.isArray(offers)) {
          // Find first in-stock variant
          const inStockOffer = offers.find(offer =>
            offer?.offers?.availability?.includes('InStock')
          );
          // Use in-stock if available, otherwise use first variant
          firstOffer = inStockOffer || offers[0];
        } else {
          firstOffer = offers;
        }

        // Collect all unique image URLs from all variants
        const imageUrls = [];
        if (Array.isArray(data.hasVariant)) {
          data.hasVariant.forEach(variant => {
            if (variant.image) {
              // Handle both string and array images
              if (Array.isArray(variant.image)) {
                imageUrls.push(...variant.image);
              } else {
                imageUrls.push(variant.image);
              }
            }
          });
        }
        // Remove duplicates
        const uniqueImageUrls = [...new Set(imageUrls)];

        // Extract offers data from first variant for price
        const variantOffers = firstOffer?.offers;

        // Create simplified product data with only requested fields
        const simplifiedProduct = {
          name: data.name || 'N/A',
          category: data.category || 'N/A',
          price: variantOffers?.price || 'N/A',
          priceCurrency: variantOffers?.priceCurrency || 'N/A',
          brand: data.brand?.name || data.brand || 'N/A',
          imageUrls: uniqueImageUrls
        };

        console.log('========== SIMPLIFIED PRODUCT DATA ==========');
        console.log(JSON.stringify(simplifiedProduct, null, 2));
        console.log('========== END SIMPLIFIED DATA ==========\n');

        // Create debug data object (keep for reference)
        const debugData = {
          fullProductGroup: data,
          offers: offers,
          firstOffer: firstOffer
        };

        // Create a modal with the JSON data
        const modal = document.createElement('div');
        modal.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border: 3px solid #333;
          z-index: 999999;
          max-width: 80%;
          max-height: 80%;
          overflow: auto;
          box-shadow: 0 0 20px rgba(0,0,0,0.5);
        `;

        modal.innerHTML = `
          <h3 style="margin-top: 0;">Product Data (Simplified)</h3>
          <p>Select all the text below and copy it (Ctrl+A, Ctrl+C):</p>
          <textarea readonly style="width: 100%; height: 400px; font-family: monospace; font-size: 12px; padding: 10px; border: 1px solid #ccc;">
${JSON.stringify(simplifiedProduct, null, 2)}
          </textarea>
          <div style="margin-top: 10px;">
            <button id="babylist-copy-btn" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer; font-size: 16px; margin-right: 10px;">
              Copy to Clipboard
            </button>
            <button id="babylist-close-btn" style="padding: 10px 20px; background: #f44336; color: white; border: none; cursor: pointer; font-size: 16px;">
              Close
            </button>
          </div>
        `;

        document.body.appendChild(modal);

        // Add copy button functionality
        document.getElementById('babylist-copy-btn').addEventListener('click', () => {
          const textarea = modal.querySelector('textarea');
          textarea.select();
          document.execCommand('copy');
          alert('JSON data copied to clipboard!');
        });

        // Add close button functionality
        document.getElementById('babylist-close-btn').addEventListener('click', () => {
          modal.remove();
        });

        // Extract image from first variant
        let image = firstOffer?.image || data.image;
        if (Array.isArray(image)) {
          image = image[0];
        }

        productData = {
          '@type': 'Product',
          name: data.name,
          brand: data.brand,
          category: data.category,
          description: data.description,
          image: image,
          sku: firstOffer?.sku,
          url: data.url,
          productGroupID: data.productGroupID,
          offers: {
            price: variantOffers?.price,
            priceCurrency: variantOffers?.priceCurrency,
            availability: variantOffers?.availability,
            url: variantOffers?.url
          },
          // Include all variants for reference
          variants: data.hasVariant
        };

        console.log('========== EXTRACTED PRODUCT DATA ==========');
        console.log(JSON.stringify(productData, null, 2));
        console.log('========== END EXTRACTED DATA ==========\n');
      } else if (data['@graph']) {
        // Check if product is in @graph array
        const foundProduct = data['@graph'].find(item =>
          item['@type'] === 'Product' || item['@type'] === 'ProductGroup'
        );

        if (foundProduct) {
          console.log('Found Product in @graph, extracting data...');

          // Extract image URLs (handle both string and array)
          const imageUrls = [];
          if (foundProduct.image) {
            if (Array.isArray(foundProduct.image)) {
              imageUrls.push(...foundProduct.image);
            } else {
              imageUrls.push(foundProduct.image);
            }
          }
          const uniqueImageUrls = [...new Set(imageUrls)];

          // Handle both Product and ProductGroup in @graph
          let price = 'N/A';
          let priceCurrency = 'N/A';

          if (foundProduct['@type'] === 'ProductGroup') {
            const offers = foundProduct.hasVariant || foundProduct.offers;
            const firstOffer = Array.isArray(offers) ? offers[0] : offers;
            price = firstOffer?.offers?.price || firstOffer?.price || 'N/A';
            priceCurrency = firstOffer?.offers?.priceCurrency || firstOffer?.priceCurrency || 'N/A';
          } else {
            price = foundProduct.offers?.price || 'N/A';
            priceCurrency = foundProduct.offers?.priceCurrency || 'N/A';
          }

          // Create simplified product data
          const simplifiedProduct = {
            name: foundProduct.name || 'N/A',
            category: foundProduct.category || 'N/A',
            price: price,
            priceCurrency: priceCurrency,
            brand: foundProduct.brand?.name || foundProduct.brand || 'N/A',
            imageUrls: uniqueImageUrls
          };

          console.log('========== SIMPLIFIED PRODUCT DATA (@graph) ==========');
          console.log(JSON.stringify(simplifiedProduct, null, 2));
          console.log('========== END SIMPLIFIED DATA ==========\n');

          // Create modal with simplified data
          const modal = document.createElement('div');
          modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border: 3px solid #333;
            z-index: 999999;
            max-width: 80%;
            max-height: 80%;
            overflow: auto;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
          `;

          modal.innerHTML = `
            <h3 style="margin-top: 0;">Product Data (Simplified)</h3>
            <p>Select all the text below and copy it (Ctrl+A, Ctrl+C):</p>
            <textarea readonly style="width: 100%; height: 400px; font-family: monospace; font-size: 12px; padding: 10px; border: 1px solid #ccc;">
${JSON.stringify(simplifiedProduct, null, 2)}
            </textarea>
            <div style="margin-top: 10px;">
              <button id="babylist-copy-btn" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer; font-size: 16px; margin-right: 10px;">
                Copy to Clipboard
              </button>
              <button id="babylist-close-btn" style="padding: 10px 20px; background: #f44336; color: white; border: none; cursor: pointer; font-size: 16px;">
                Close
              </button>
            </div>
          `;

          document.body.appendChild(modal);

          // Add copy button functionality
          document.getElementById('babylist-copy-btn').addEventListener('click', () => {
            const textarea = modal.querySelector('textarea');
            textarea.select();
            document.execCommand('copy');
            alert('JSON data copied to clipboard!');
          });

          // Add close button functionality
          document.getElementById('babylist-close-btn').addEventListener('click', () => {
            modal.remove();
          });

          // Set productData for return
          productData = foundProduct;
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
      '@type': 'Product',
      name: productMeta.name,
      offers: {
        price: productMeta.price,
        priceCurrency: productMeta.priceCurrency,
        availability: productMeta.availability
      },
      image: productMeta.image
    };
  }

  // METHOD 3: Try ShopifyAnalytics (if available)
  console.log('🔍 Trying ShopifyAnalytics...');
  if (window.ShopifyAnalytics?.meta?.product) {
    const shopifyProduct = window.ShopifyAnalytics.meta.product;
    console.log('✅ Found ShopifyAnalytics data!');
    return {
      '@type': 'Product',
      name: shopifyProduct.name,
      offers: {
        price: shopifyProduct.price,
        priceCurrency: window.ShopifyAnalytics.meta.currency
      },
      sku: shopifyProduct.sku,
      brand: { name: shopifyProduct.vendor }
    };
  }

  console.log('❌ No product data found on page');
  return null;
}
