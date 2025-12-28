/**
 * Product Extraction Utility
 *
 * Extracts product data from e-commerce URLs using multiple extraction methods:
 * - AliExpress: Platform-specific DOM extraction with priority-based price selection
 * - All other sites: JSON-LD structured data extraction
 *
 * Originally ported from the Chrome extension's content.js
 * AliExpress support synced with extension (priority-based selection for bundle deals)
 */

// TypeScript Interfaces
export interface ExtractedProductData {
  name: string
  price: string
  priceCurrency: string
  brand: string
  category: string
  imageUrls: string[]
}

interface OfferSchema {
  price?: string
  priceCurrency?: string
}

interface ProductSchema {
  '@type': 'Product'
  name?: string
  offers?: OfferSchema | OfferSchema[]
  image?: string | string[]
  brand?: string | { name: string }
  category?: string
}

interface ProductGroupSchema {
  '@type': 'ProductGroup'
  name?: string
  hasVariant?: ProductSchema[]
  brand?: string | { name: string }
  category?: string
}

interface GraphSchema {
  '@graph'?: (ProductSchema | ProductGroupSchema)[]
}

/**
 * Normalize image data to string URLs
 * JSON-LD images can be: string, {url: string}, or arrays of either
 */
function normalizeImageUrls(imageData: string | string[] | any | any[] | undefined): string[] {
  if (!imageData) return []

  const urls: string[] = []
  const dataArray = Array.isArray(imageData) ? imageData : [imageData]

  dataArray.forEach(item => {
    if (typeof item === 'string') {
      // Direct URL string
      urls.push(item)
    } else if (typeof item === 'object' && item !== null) {
      // Image object with url property
      if (item.url && typeof item.url === 'string') {
        urls.push(item.url)
      } else if (item['@id'] && typeof item['@id'] === 'string') {
        // Sometimes uses @id instead of url
        urls.push(item['@id'])
      }
    }
  })

  return urls
}

/**
 * Extract product data from a Product schema (standard e-commerce product)
 */
function extractFromProduct(data: ProductSchema): ExtractedProductData {
  const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers

  // Normalize image URLs (handles both strings and objects)
  const imageUrls = normalizeImageUrls(data.image)

  return {
    name: data.name || '',
    price: offer?.price || '',
    priceCurrency: offer?.priceCurrency || '',
    brand: typeof data.brand === 'object' ? data.brand?.name || '' : data.brand || '',
    category: data.category || '',
    imageUrls: [...new Set(imageUrls)] // Remove duplicates
  }
}

/**
 * Extract product data from a ProductGroup schema (Shopify-style with variants)
 */
function extractFromProductGroup(data: ProductGroupSchema): ExtractedProductData {
  const variants = data.hasVariant || []
  const firstVariant = Array.isArray(variants) ? variants[0] : variants
  const offer = firstVariant?.offers as OfferSchema | undefined

  // Extract and normalize images from all variants
  const imageUrls: string[] = []
  if (Array.isArray(variants)) {
    variants.forEach(variant => {
      if (variant.image) {
        imageUrls.push(...normalizeImageUrls(variant.image))
      }
    })
  }

  return {
    name: data.name || '',
    price: offer?.price || '',
    priceCurrency: offer?.priceCurrency || '',
    brand: typeof data.brand === 'object' ? data.brand?.name || '' : data.brand || '',
    category: data.category || '',
    imageUrls: [...new Set(imageUrls)] // Remove duplicates
  }
}

/**
 * Detect platform from hostname
 * @param url - The product URL (optional, falls back to doc.URL)
 * @param doc - The document (used as fallback if url not provided)
 */
function detectPlatform(url?: string, doc?: Document): string | null {
  let hostname = ''

  if (url) {
    try {
      hostname = new URL(url).hostname
    } catch {
      // Invalid URL, try doc
    }
  }

  if (!hostname && doc) {
    try {
      hostname = new URL(doc.URL || 'about:blank').hostname
    } catch {
      // Fall through
    }
  }

  if (hostname.includes('aliexpress.com')) {
    return 'aliexpress'
  }

  // Can add more platform detection here in the future
  return null
}

/**
 * Extract product data from AliExpress pages
 * Uses DOM extraction with priority-based price selection
 */
function extractFromAliExpress(doc: Document): ExtractedProductData | null {
  console.log('🛍️ Attempting AliExpress extraction...')

  const productData: ExtractedProductData = {
    name: '',
    price: '',
    priceCurrency: 'USD',
    brand: 'AliExpress',
    category: '',
    imageUrls: []
  }

  // Extract title
  const titleSelectors = [
    '.product-title-text',
    '[data-pl="product-title"]',
    'h1[class*="title"]',
    'h1[class*="Product"]',
    '.pdp-product-title',
    'meta[property="og:title"]'
  ]

  for (const selector of titleSelectors) {
    const element = doc.querySelector(selector)
    if (element) {
      const title = selector.includes('meta')
        ? element.getAttribute('content') || ''
        : element.textContent?.trim() || ''

      if (title && title.length > 3) {
        productData.name = title
        console.log(`   ✓ Found title: ${title.substring(0, 50)}...`)
        break
      }
    }
  }

  // Extract price with priority-based selection
  interface PriceCandidate {
    price: string
    currency: string
    priority: number
    selector: string
    source: string
  }

  const foundPrices: PriceCandidate[] = []
  const priceSelectors = [
    '.product-price-value',
    '[data-pl="product-price"]',
    '[class*="price-current"]',
    '[class*="price-sale"]',
    '[class*="Price"]',
    'span[class*="price"]',
    'div[class*="price"]'
  ]

  for (const selector of priceSelectors) {
    const elements = doc.querySelectorAll(selector)
    elements.forEach(element => {
      const priceText = element.textContent?.trim() || ''
      if (!priceText) return

      // Check for USD price (highest priority)
      const usdMatch = priceText.match(/\$\s*([\d,]+\.?\d*)/)
      if (usdMatch && usdMatch[1]) {
        foundPrices.push({
          price: usdMatch[1].replace(',', ''),
          currency: 'USD',
          priority: 10,
          selector: selector,
          source: priceText
        })
        console.log(`   $ Found USD price: $${usdMatch[1]}`)
        return
      }

      // Check for ILS/shekel price
      const ilsMatch = priceText.match(/₪\s*([\d,]+\.?\d*)/)
      if (ilsMatch && ilsMatch[1]) {
        // Check if this price has a discount indicator nearby (higher priority)
        const hasDiscount = priceText.includes('%') ||
                           priceText.includes('off') ||
                           priceText.includes('הנחה')
        const priority = hasDiscount ? 8 : 5 // Prioritize prices with discounts

        foundPrices.push({
          price: ilsMatch[1].replace(',', ''),
          currency: 'ILS',
          priority: priority,
          selector: selector,
          source: priceText
        })
        console.log(`   ₪ Found ILS price: ₪${ilsMatch[1]} ${hasDiscount ? '(with discount indicator)' : ''}`)
        return
      }

      // Check for numeric price without symbol
      const numericMatch = priceText.match(/^[\d,]+\.?\d*$/)
      if (numericMatch) {
        foundPrices.push({
          price: priceText.replace(',', ''),
          currency: 'USD',
          priority: 3,
          selector: selector,
          source: priceText
        })
        console.log(`   # Found numeric price: ${priceText}`)
      }
    })
  }

  // Sort by priority (highest first), then by price (highest first)
  if (foundPrices.length > 0) {
    foundPrices.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority
      }
      return parseFloat(b.price) - parseFloat(a.price)
    })

    const bestPrice = foundPrices[0]
    productData.price = bestPrice.price
    productData.priceCurrency = bestPrice.currency
    console.log(`   ✅ Selected best price: ${bestPrice.price} ${bestPrice.currency} (priority ${bestPrice.priority})`)
  }

  // Extract images
  const imageSelectors = [
    '.images-view-item img',
    '[class*="magnifier"] img',
    'img[src*="alicdn.com"]',
    '.product-image img',
    'meta[property="og:image"]'
  ]

  for (const selector of imageSelectors) {
    const elements = doc.querySelectorAll(selector)
    elements.forEach(element => {
      let imageUrl = ''

      if (selector.includes('meta')) {
        imageUrl = element.getAttribute('content') || ''
      } else {
        const img = element as HTMLImageElement
        imageUrl = img.src || img.getAttribute('data-src') || img.srcset?.split(',')[0]?.trim().split(' ')[0] || ''
      }

      if (imageUrl && imageUrl.startsWith('http') && !productData.imageUrls.includes(imageUrl)) {
        productData.imageUrls.push(imageUrl)
      }
    })
  }

  console.log(`   📊 Found ${foundPrices.length} price candidates`)
  console.log(`   🖼️ Found ${productData.imageUrls.length} images`)

  // Validate that we have minimum required data
  if (productData.name && (productData.price || productData.imageUrls.length > 0)) {
    console.log('✅ AliExpress extraction successful')
    return productData
  }

  console.log('❌ AliExpress extraction failed - insufficient data')
  return null
}

/**
 * Extract product data from a DOM document by finding JSON-LD structured data
 * or using platform-specific extraction methods
 * @param doc - The parsed HTML document
 * @param url - Optional original URL (needed for platform detection when doc.URL is 'about:blank')
 */
function extractProductDataFromDocument(doc: Document, url?: string): ExtractedProductData | null {
  // Check for platform-specific extraction first
  const platform = detectPlatform(url, doc)

  if (platform === 'aliexpress') {
    console.log('🏪 Detected platform: aliexpress')
    const aliexpressResult = extractFromAliExpress(doc)
    if (aliexpressResult) {
      return aliexpressResult
    }
    console.log('⚠️ AliExpress extraction failed, falling back to JSON-LD')
  }

  // Fall back to JSON-LD extraction for all other sites
  const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]')
  console.log(`Found ${jsonLdScripts.length} JSON-LD scripts`)

  for (const script of jsonLdScripts) {
    try {
      const data = JSON.parse(script.textContent || '')

      // Check for Product type
      if (data['@type'] === 'Product') {
        console.log('✅ Found Product type')
        return extractFromProduct(data as ProductSchema)
      }

      // Check for ProductGroup type
      if (data['@type'] === 'ProductGroup') {
        console.log('✅ Found ProductGroup type')
        return extractFromProductGroup(data as ProductGroupSchema)
      }

      // Check for @graph structure
      if (data['@graph']) {
        const graphData = data as GraphSchema
        const product = graphData['@graph']?.find(item =>
          item['@type'] === 'Product' || item['@type'] === 'ProductGroup'
        )
        if (product) {
          console.log('✅ Found product in @graph')
          return product['@type'] === 'Product'
            ? extractFromProduct(product as ProductSchema)
            : extractFromProductGroup(product as ProductGroupSchema)
        }
      }
    } catch (error) {
      console.warn('Failed to parse JSON-LD:', error)
    }
  }

  return null
}

/**
 * Extract product data from an external URL via Supabase Edge Function
 *
 * @param url - Product URL to extract from
 * @param accessToken - Supabase session access token for authentication
 * @returns Extracted product data
 * @throws Error with Hebrew message if extraction fails
 */
export async function extractProductFromUrl(
  url: string,
  accessToken: string
): Promise<ExtractedProductData> {
  console.log('🌐 Extracting product from URL:', url)

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

  if (!supabaseUrl) {
    throw new Error('Missing Supabase URL configuration')
  }

  try {
    // Call Supabase Edge Function to fetch HTML (bypasses CORS)
    const response = await fetch(
      `${supabaseUrl}/functions/v1/extract-product`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch URL')
    }

    const data = await response.json()

    if (!data.success || !data.html) {
      throw new Error('No HTML returned from server')
    }

    console.log('✅ Received HTML, parsing...')

    // Parse HTML string into Document using DOMParser
    const parser = new DOMParser()
    const doc = parser.parseFromString(data.html, 'text/html')

    // Extract product data using same logic as current page
    // Pass the original URL for platform detection (parsed doc has URL='about:blank')
    const productData = extractProductDataFromDocument(doc, url)

    if (!productData) {
      throw new Error('לא נמצא מידע על מוצר בדף זה')
    }

    console.log('✅ Product extracted:', productData)
    return productData

  } catch (error) {
    console.error('❌ Extract from URL failed:', error)
    throw error
  }
}
