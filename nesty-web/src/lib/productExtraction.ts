/**
 * Product Extraction Utility
 *
 * Extracts product data from e-commerce URLs using multiple extraction methods:
 * - AliExpress: Platform-specific DOM extraction with priority-based price selection
 * - Amazon: Platform-specific DOM extraction with USD to ILS currency conversion
 * - All other sites: JSON-LD structured data extraction
 *
 * Originally ported from the Chrome extension's content.js
 * AliExpress support synced with extension (priority-based selection for bundle deals)
 * Amazon support synced with extension (USD to ILS conversion at rate 3.19)
 */

// TypeScript Interfaces
export interface ExtractedProductData {
  /** Display price — already converted to ILS when source was a known foreign currency. */
  name: string
  price: string
  /** Currency of the `price` field. 'ILS' after conversion; the original is preserved in sourceCurrency. */
  priceCurrency: string
  brand: string
  category: string
  imageUrls: string[]
  /** Original price from the source page, before any currency conversion. NULL if no conversion happened. */
  sourcePrice?: string
  /** Original currency code from the source page (e.g. 'EUR', 'USD'). NULL if no conversion happened. */
  sourceCurrency?: string
}

// FX rates to ILS — used when a foreign-currency product page is extracted.
// Keep these in sync with the extension's content.js conversion logic.
// Updated periodically; small drift is acceptable since the user can edit
// the price before saving.
const FX_TO_ILS: Record<string, number> = {
  USD: 3.19,
  EUR: 3.43,
  GBP: 4.05,
}

/**
 * Convert a non-ILS price to ILS using the FX_TO_ILS table.
 * Returns a normalised ExtractedProductData with price in ILS and the
 * original price/currency preserved in sourcePrice / sourceCurrency.
 *
 * If currency is already ILS, blank, or unknown, the data is returned
 * as-is (no source fields set).
 */
function convertPriceToILS(data: ExtractedProductData): ExtractedProductData {
  const rawCurrency = (data.priceCurrency || '').toUpperCase().trim()
  // Strip thousands separators — parseFloat("1,299") would return 1
  const rawPrice = parseFloat((data.price || '').replace(/,/g, ''))

  // Pass through when there's nothing to convert
  if (!rawCurrency || rawCurrency === 'ILS' || rawCurrency === 'NIS' || !rawPrice) {
    return data
  }

  const rate = FX_TO_ILS[rawCurrency]
  if (!rate) {
    console.warn(`   ⚠️ No FX rate for ${rawCurrency}, leaving price as-is`)
    return data
  }

  const ilsPrice = (rawPrice * rate).toFixed(2)
  console.log(`   💱 Converted ${rawPrice} ${rawCurrency} → ₪${ilsPrice} ILS (rate: ${rate})`)
  return {
    ...data,
    price: ilsPrice,
    priceCurrency: 'ILS',
    sourcePrice: String(rawPrice),
    sourceCurrency: rawCurrency,
  }
}

/**
 * Category auto-suggestion from the product name. Ordered by priority —
 * the FIRST category with a keyword hit wins (e.g. "עגלת תאומים" must land
 * on strollers, not siblings). Returns '' when nothing is recognized so the
 * form keeps showing "בחרו קטגוריה".
 * Keep in sync with CATEGORY_KEYWORDS in extension/current-build/content.js.
 */
const CATEGORY_KEYWORDS: { id: string; words: string[] }[] = [
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
  { id: 'siblings', words: ['תאומים', 'twins'] },
]

export function guessCategoryFromName(name: string): string {
  if (!name) return ''
  const n = name.toLowerCase()
  for (const cat of CATEGORY_KEYWORDS) {
    if (cat.words.some(w => n.includes(w))) return cat.id
  }
  return ''
}

interface PriceSpecificationSchema {
  price?: string | number
  priceCurrency?: string
  priceType?: string
}

interface OfferSchema {
  price?: string | number
  priceCurrency?: string
  priceSpecification?: PriceSpecificationSchema | PriceSpecificationSchema[]
}

/**
 * Read the price out of an Offer. Some platforms (WooCommerce SEO plugins,
 * e.g. segalbaby.co.il) omit offer.price and nest it in priceSpecification[]
 * instead — where the current sale price is the spec WITHOUT
 * priceType=ListPrice (ListPrice is the crossed-out original).
 */
function priceFromOffer(offer: OfferSchema | undefined): { price: string; currency: string } {
  if (!offer) return { price: '', currency: '' }
  if (offer.price != null && offer.price !== '') {
    return { price: String(offer.price), currency: offer.priceCurrency || '' }
  }
  const specData = offer.priceSpecification
  const specs = Array.isArray(specData) ? specData : specData ? [specData] : []
  const withPrice = specs.filter(s => s && s.price != null && s.price !== '')
  const sale = withPrice.find(s => !String(s.priceType || '').includes('ListPrice')) || withPrice[0]
  if (sale) {
    return { price: String(sale.price), currency: sale.priceCurrency || offer.priceCurrency || '' }
  }
  return { price: '', currency: offer.priceCurrency || '' }
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
 * Resolve a potentially relative URL to an absolute URL
 */
function resolveUrl(src: string, baseUrl?: string): string {
  if (!src) return ''
  // Already absolute
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src
  }
  // Protocol-relative
  if (src.startsWith('//')) {
    return 'https:' + src
  }
  // Relative — resolve against base URL
  if (baseUrl) {
    try {
      return new URL(src, baseUrl).href
    } catch {
      return src
    }
  }
  return src
}

/**
 * Normalize image data to string URLs
 * JSON-LD images can be: string, {url: string}, or arrays of either
 * Resolves relative URLs when baseUrl is provided
 */
function normalizeImageUrls(imageData: string | string[] | any | any[] | undefined, baseUrl?: string): string[] {
  if (!imageData) return []

  const urls: string[] = []
  const dataArray = Array.isArray(imageData) ? imageData : [imageData]

  dataArray.forEach(item => {
    if (typeof item === 'string') {
      urls.push(resolveUrl(item, baseUrl))
    } else if (typeof item === 'object' && item !== null) {
      if (item.url && typeof item.url === 'string') {
        urls.push(resolveUrl(item.url, baseUrl))
      } else if (item['@id'] && typeof item['@id'] === 'string') {
        urls.push(resolveUrl(item['@id'], baseUrl))
      }
    }
  })

  return urls
}

/**
 * Extract product data from a Product schema (standard e-commerce product)
 */
function extractFromProduct(data: ProductSchema, baseUrl?: string): ExtractedProductData {
  // Handle case-insensitive property access (Wix uses "Offers" instead of "offers")
  const offersData = (data as any).offers || (data as any).Offers
  const offer = Array.isArray(offersData) ? offersData[0] : offersData

  // Normalize image URLs (handles both strings and objects, resolves relative URLs)
  const imageUrls = normalizeImageUrls(data.image, baseUrl)

  const { price, currency } = priceFromOffer(offer)

  return convertPriceToILS({
    name: data.name || '',
    price,
    priceCurrency: currency,
    brand: typeof data.brand === 'object' ? data.brand?.name || '' : data.brand || '',
    category: data.category || '',
    imageUrls: [...new Set(imageUrls)] // Remove duplicates
  })
}

/**
 * Extract product data from a ProductGroup schema (Shopify-style with variants)
 */
function extractFromProductGroup(data: ProductGroupSchema, baseUrl?: string): ExtractedProductData {
  const variants = data.hasVariant || []
  const firstVariant = Array.isArray(variants) ? variants[0] : variants
  // Handle case-insensitive property access (Wix uses "Offers" instead of "offers")
  // offers can itself be an array — normalize like extractFromProduct does
  const offersData = (firstVariant as any)?.offers || (firstVariant as any)?.Offers
  const offer = (Array.isArray(offersData) ? offersData[0] : offersData) as OfferSchema | undefined

  // Extract and normalize images from all variants
  const imageUrls: string[] = []
  if (Array.isArray(variants)) {
    variants.forEach(variant => {
      if (variant.image) {
        imageUrls.push(...normalizeImageUrls(variant.image, baseUrl))
      }
    })
  }

  const { price, currency } = priceFromOffer(offer)

  return convertPriceToILS({
    name: data.name || '',
    price,
    priceCurrency: currency,
    brand: typeof data.brand === 'object' ? data.brand?.name || '' : data.brand || '',
    category: data.category || '',
    imageUrls: [...new Set(imageUrls)] // Remove duplicates
  })
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

  if (hostname.includes('ksp.co.il')) {
    return 'ksp'
  }

  if (hostname.includes('hm.com')) {
    return 'hm'
  }

  if (hostname.includes('next.co.il')) {
    return 'next'
  }

  // Check for Amazon (all major domains)
  if (hostname.includes('amazon.com') ||
      hostname.includes('amazon.co.uk') ||
      hostname.includes('amazon.de') ||
      hostname.includes('amazon.fr') ||
      hostname.includes('amazon.it') ||
      hostname.includes('amazon.es') ||
      hostname.includes('amazon.ca')) {
    return 'amazon'
  }

  // Check for Wix (has wix-specific meta tags or scripts)
  if (doc) {
    if (doc.querySelector('meta[name="generator"][content*="Wix"]') ||
        doc.querySelector('script[src*="static.wixstatic.com"]') ||
        doc.querySelector('meta[http-equiv="X-Wix-Meta-Site-Id"]')) {
      return 'wix'
    }
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
 * Extract product data from H&M product pages.
 * H&M exposes stable data-testid hooks for the title and main price.
 */
function extractFromHm(doc: Document, baseUrl?: string): ExtractedProductData | null {
  console.log('🛍️ Attempting H&M extraction...')

  const productData: ExtractedProductData = {
    name: '',
    price: '',
    priceCurrency: 'ILS',
    brand: 'H&M',
    category: '',
    imageUrls: []
  }

  const titleElement = doc.querySelector('[data-testid="product-name"], h1[data-testid="product-name"], h1')
  if (titleElement) {
    const title = titleElement.textContent?.trim() || ''
    if (title.length > 2) {
      productData.name = title
    }
  }

  const priceSelectors = [
    '[data-testid="white-price"]',
    '[data-testid="red-price"]',
    '[data-testid*="price"]'
  ]

  for (const selector of priceSelectors) {
    const element = doc.querySelector(selector)
    if (!element) continue

    const priceText = element.textContent?.trim() || ''
    const priceMatch = priceText.match(/([\d,]+(?:\.\d+)?)\s*₪|₪\s*([\d,]+(?:\.\d+)?)/)
    const rawPrice = priceMatch?.[1] || priceMatch?.[2] || ''
    if (rawPrice) {
      productData.price = rawPrice.replace(/,/g, '')
      console.log(`   💰 Found H&M price in ${selector}: ${productData.price}`)
      break
    }
  }

  if (!productData.price && titleElement) {
    const detailsContainer = titleElement.closest('section, article, main, div')
    const candidateElements = Array.from((detailsContainer || doc).querySelectorAll('*'))

    for (const element of candidateElements) {
      const text = element.textContent?.trim() || ''
      if (!text || text.length > 40) continue

      const priceMatch = text.match(/([\d,]+(?:\.\d+)?)\s*₪|₪\s*([\d,]+(?:\.\d+)?)/)
      const rawPrice = priceMatch?.[1] || priceMatch?.[2] || ''
      if (rawPrice) {
        productData.price = rawPrice.replace(/,/g, '')
        console.log(`   💰 Found H&M nearby price: ${productData.price}`)
        break
      }
    }
  }

  const imageElement = doc.querySelector('meta[property="og:image"], meta[name="og:image"]')
  const imageUrl = imageElement?.getAttribute('content') || ''
  if (imageUrl) {
    productData.imageUrls = [resolveUrl(imageUrl, baseUrl)]
  }

  console.log(`   📊 H&M extraction: name=${!!productData.name} price=${productData.price || '✗'} images=${productData.imageUrls.length}`)

  if (productData.name && productData.price) {
    return productData
  }

  return null
}

/**
 * Extract product data from Next Israel product pages.
 * Uses stable data-testid hooks for the title and current price.
 */
function extractFromNext(doc: Document, baseUrl?: string): ExtractedProductData | null {
  console.log('🛍️ Attempting Next extraction...')

  const productData: ExtractedProductData = {
    name: '',
    price: '',
    priceCurrency: 'ILS',
    brand: 'Next',
    category: '',
    imageUrls: []
  }

  const titleElement = doc.querySelector('[data-testid="product-title"], h1[data-testid="product-title"], h1')
  if (titleElement) {
    const title = titleElement.textContent?.trim() || ''
    if (title.length > 2) {
      productData.name = title
    }
  }

  const priceSelectors = [
    '[data-testid="product-now-price"]',
    '[data-testid="price"]',
    '[data-testid*="price"]'
  ]

  for (const selector of priceSelectors) {
    const element = doc.querySelector(selector)
    if (!element) continue

    const priceText = element.textContent?.trim() || ''
    const rangeMatch = priceText.match(/₪\s*([\d,]+(?:\.\d+)?)\s*-\s*₪\s*([\d,]+(?:\.\d+)?)/)
    if (rangeMatch) {
      productData.price = rangeMatch[1].replace(/,/g, '')
      console.log(`   💰 Found Next price range in ${selector}: ${priceText} -> using ${productData.price}`)
      break
    }

    const priceMatch = priceText.match(/([\d,]+(?:\.\d+)?)\s*₪|₪\s*([\d,]+(?:\.\d+)?)/)
    const rawPrice = priceMatch?.[1] || priceMatch?.[2] || ''
    if (rawPrice) {
      productData.price = rawPrice.replace(/,/g, '')
      console.log(`   💰 Found Next price in ${selector}: ${productData.price}`)
      break
    }
  }

  const imageMeta = doc.querySelector('meta[property="og:image"], meta[name="og:image"]')
  const imageUrl = imageMeta?.getAttribute('content') || ''
  if (imageUrl) {
    productData.imageUrls = [resolveUrl(imageUrl, baseUrl)]
  }

  console.log(`   📊 Next extraction: name=${!!productData.name} price=${productData.price || '✗'} images=${productData.imageUrls.length}`)

  if (productData.name && productData.price) {
    return productData
  }

  return null
}

/**
 * Extract product data from Amazon pages
 * Uses DOM extraction with USD to ILS currency conversion
 */
function extractFromAmazon(doc: Document): ExtractedProductData | null {
  console.log('🛍️ Attempting Amazon extraction...')

  // Exchange rate: 1 USD = 3.19 ILS (December 2025)
  const USD_TO_ILS = 3.19

  const productData: ExtractedProductData = {
    name: '',
    price: '',
    priceCurrency: 'ILS', // Always convert to ILS
    brand: 'Amazon',
    category: '',
    imageUrls: []
  }

  // Extract title from multiple selectors
  const titleSelectors = [
    '#productTitle',
    '#title',
    'h1.product-title',
    'span#productTitle',
    '[data-feature-name="title"] h1'
  ]

  for (const selector of titleSelectors) {
    const element = doc.querySelector(selector)
    if (element) {
      const title = element.textContent?.trim() || ''
      if (title && title.length > 3) {
        productData.name = title
        console.log(`   ✓ Found title: ${title.substring(0, 50)}...`)
        break
      }
    }
  }

  // Extract USD price from multiple selectors
  const priceSelectors = [
    '.a-price .a-offscreen',           // Main price (hidden but accurate)
    '#priceblock_ourprice',            // Our price
    '#priceblock_dealprice',           // Deal price
    '.a-price-whole',                  // Whole number part
    '#corePrice_feature_div .a-price .a-offscreen', // Core price feature
    '[data-a-color="price"] .a-offscreen',
    '.priceToPay .a-offscreen',        // Price to pay
    '#corePriceDisplay_desktop_feature_div .a-price .a-offscreen'
  ]

  let foundUsdPrice: number | null = null

  for (const selector of priceSelectors) {
    const elements = doc.querySelectorAll(selector)
    for (const element of elements) {
      const priceText = element.textContent?.trim() || ''

      // Extract USD price
      const usdMatch = priceText.match(/\$\s*([\d,]+\.?\d*)/)
      if (usdMatch && usdMatch[1]) {
        const usdPrice = parseFloat(usdMatch[1].replace(',', ''))
        if (usdPrice > 0) {
          foundUsdPrice = usdPrice
          console.log(`   $ Found USD price: $${usdPrice}`)
          break
        }
      }
    }
    if (foundUsdPrice) break
  }

  // Convert USD to ILS
  if (foundUsdPrice) {
    const ilsPrice = (foundUsdPrice * USD_TO_ILS).toFixed(2)
    productData.price = ilsPrice
    productData.priceCurrency = 'ILS'
    console.log(`   💱 Converted $${foundUsdPrice} USD → ₪${ilsPrice} ILS (rate: ${USD_TO_ILS})`)
  }

  // Extract brand
  const brandSelectors = [
    '#bylineInfo',
    '.a-size-base.po-brand',
    '[data-feature-name="bylineInfo"]',
    '#brand'
  ]

  for (const selector of brandSelectors) {
    const element = doc.querySelector(selector)
    if (element) {
      const brandText = element.textContent?.trim() || ''
      const brandMatch = brandText.match(/(?:Brand:|Visit the|by)\s*(.+?)(?:\s+Store)?$/i)
      if (brandMatch && brandMatch[1]) {
        productData.brand = brandMatch[1].trim()
        console.log(`   🏷️ Found brand: ${productData.brand}`)
        break
      } else if (brandText && !brandText.includes('http')) {
        productData.brand = brandText.replace(/^Visit the\s+/i, '').replace(/\s+Store$/i, '').trim()
        console.log(`   🏷️ Found brand: ${productData.brand}`)
        break
      }
    }
  }

  // Extract high-resolution images
  const imageSelectors = [
    '#landingImage',                    // Main product image
    '#imgTagWrapperId img',             // Image wrapper
    '#imageBlock img[data-old-hires]',  // High-res image
    '#altImages img',                   // Alternative images
    '.imgTagWrapper img',               // Wrapper images
    '[data-a-dynamic-image] img'        // Dynamic images
  ]

  for (const selector of imageSelectors) {
    const elements = doc.querySelectorAll(selector)
    elements.forEach(element => {
      const img = element as HTMLImageElement
      const imageUrl = img.getAttribute('data-old-hires') ||
                      img.getAttribute('data-a-hires') ||
                      img.src ||
                      ''

      if (imageUrl && imageUrl.startsWith('http') &&
          !imageUrl.includes('data:image') &&
          !imageUrl.includes('spinner') &&
          !imageUrl.includes('loading') &&
          !productData.imageUrls.includes(imageUrl)) {
        productData.imageUrls.push(imageUrl)
      }
    })
  }

  console.log(`   📊 Amazon extraction summary:`)
  console.log(`      Title: ${productData.name ? '✓' : '✗'}`)
  console.log(`      Price: ${productData.price ? `₪${productData.price} ILS` : '✗'}`)
  console.log(`      Images: ${productData.imageUrls.length}`)

  // Validate that we have minimum required data
  if (productData.name && (productData.price || productData.imageUrls.length > 0)) {
    console.log('✅ Amazon extraction successful')
    return productData
  }

  console.log('❌ Amazon extraction failed - insufficient data')
  return null
}

/**
 * Extract product data from Wix sites
 * Uses Wix-specific DOM selectors and meta tags
 */
function extractFromWix(doc: Document): ExtractedProductData | null {
  console.log('🎨 Attempting Wix extraction...')

  const productData: ExtractedProductData = {
    name: '',
    price: '',
    priceCurrency: 'ILS',
    brand: '',
    category: '',
    imageUrls: []
  }

  // Priority 1: Extract from Wix-specific DOM element (most reliable)
  const priceElement = doc.querySelector('[data-hook="formatted-primary-price"]')
  let price = ''
  let currency = 'ILS'

  if (priceElement) {
    // Try data-wix-price attribute first
    const wixPrice = priceElement.getAttribute('data-wix-price')
    if (wixPrice) {
      console.log(`   💰 Found price in data-wix-price: ${wixPrice}`)
      // Parse "159.00 ₪" format
      const priceMatch = wixPrice.match(/([0-9.,]+)/)
      if (priceMatch) {
        price = priceMatch[1]
      }
    } else {
      // Fall back to text content
      const priceText = priceElement.textContent?.trim() || ''
      console.log(`   💰 Found price in element text: ${priceText}`)
      const priceMatch = priceText.match(/([0-9.,]+)/)
      if (priceMatch) {
        price = priceMatch[1]
      }
    }
  }

  // Priority 2: Fall back to meta tags if DOM extraction failed
  if (!price) {
    console.log('   ⚠️ DOM price not found, trying meta tags...')
    const priceMetaElement = doc.querySelector('meta[property="product:price:amount"]')
    price = priceMetaElement?.getAttribute('content') || ''
  }

  // Extract currency from meta tag
  const currencyMetaElement = doc.querySelector('meta[property="product:price:currency"]')
  if (currencyMetaElement) {
    currency = currencyMetaElement.getAttribute('content') || 'ILS'
  }

  productData.price = price
  productData.priceCurrency = currency

  // Extract name from meta tags
  const titleElement = doc.querySelector('meta[property="og:title"]') || doc.querySelector('title')
  let name = ''
  if (titleElement) {
    if (titleElement.tagName === 'META') {
      name = titleElement.getAttribute('content') || ''
    } else {
      name = titleElement.textContent || ''
    }
  }

  // Clean product name (remove site name)
  if (name.includes('|')) {
    name = name.split('|')[0].trim()
  }

  productData.name = name

  // Extract image from meta tags
  const imageElement = doc.querySelector('meta[property="og:image"]')
  const image = imageElement?.getAttribute('content') || ''
  if (image) {
    productData.imageUrls.push(image)
  }

  console.log(`   📊 Wix extraction summary:`)
  console.log(`      Title: ${productData.name ? '✓' : '✗'}`)
  console.log(`      Price: ${productData.price ? `${productData.price} ${productData.priceCurrency}` : '✗'}`)
  console.log(`      Images: ${productData.imageUrls.length}`)
  console.log(`      Method: ${priceElement ? 'DOM (data-hook)' : 'meta tags'}`)

  // Validate that we have minimum required data
  if (productData.name && productData.price) {
    console.log('✅ Wix extraction successful')
    return productData
  }

  console.log('❌ Wix extraction failed - insufficient data')
  return null
}

/**
 * Extract product data from KSP (ksp.co.il) pages.
 * KSP is a React/Material-UI SPA with no JSON-LD and no product:price meta tags.
 * Price is rendered as `<span>₪</span>` + text node in a div with a class like
 * `current-dN-...` (JSS-hashed). Title is in <h1>. Image is in og:image or
 * img tags with src containing img.ksp.co.il/item/<id>/.
 */
function extractFromKsp(doc: Document, url?: string): ExtractedProductData | null {
  console.log('🛍️ Attempting KSP extraction...')

  const productData: ExtractedProductData = {
    name: '',
    price: '',
    priceCurrency: 'ILS',
    brand: '',
    category: '',
    imageUrls: []
  }

  // Title: H1 or og:title
  const h1 = doc.querySelector('h1')
  productData.name = h1?.textContent?.trim() ||
                     doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || ''

  // Price: find a div whose class contains "current-d" (display price) with ₪.
  // Falls back to scanning any node with ₪NNN text pattern.
  const priceRegex = /₪\s*([\d,]+(?:\.\d+)?)/
  let priceText = ''

  const currentEls = doc.querySelectorAll('[class*="current-d"]')
  for (const el of Array.from(currentEls)) {
    const t = (el.textContent || '').trim()
    const m = t.match(priceRegex)
    if (m) { priceText = m[1]; break }
  }

  if (!priceText) {
    // Fallback: any element whose text is exactly ₪NNN (e.g. discounted main price)
    const all = doc.querySelectorAll('div, span')
    for (const el of Array.from(all)) {
      const t = (el.textContent || '').trim()
      if (t.length < 30 && priceRegex.test(t)) {
        const m = t.match(priceRegex)
        if (m) { priceText = m[1]; break }
      }
    }
  }

  productData.price = priceText.replace(/,/g, '')

  // Image: og:image, or the first large product image
  const ogImg = doc.querySelector('meta[property="og:image"]')?.getAttribute('content')
  if (ogImg) {
    productData.imageUrls.push(resolveUrl(ogImg, url))
  }

  const productImgs = doc.querySelectorAll('img[src*="img.ksp.co.il/item/"], img[src*="ksp.co.il/shop/items/"]')
  for (const img of Array.from(productImgs) as HTMLImageElement[]) {
    if (img.src && !productData.imageUrls.includes(img.src)) {
      productData.imageUrls.push(img.src)
      if (productData.imageUrls.length >= 5) break
    }
  }

  console.log(`   📊 KSP extraction: name=${!!productData.name} price=${productData.price || '✗'} images=${productData.imageUrls.length}`)

  if (productData.name && productData.price) {
    return productData
  }
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

  if (platform === 'amazon') {
    console.log('🏪 Detected platform: amazon')
    const amazonResult = extractFromAmazon(doc)
    if (amazonResult) {
      return amazonResult
    }
    console.log('⚠️ Amazon extraction failed, falling back to JSON-LD')
  }

  if (platform === 'wix') {
    console.log('🏪 Detected platform: wix')
    const wixResult = extractFromWix(doc)
    if (wixResult) {
      return wixResult
    }
    console.log('⚠️ Wix extraction failed, falling back to JSON-LD')
  }

  if (platform === 'ksp') {
    console.log('🏪 Detected platform: ksp')
    const kspResult = extractFromKsp(doc, url)
    if (kspResult) {
      return kspResult
    }
    console.log('⚠️ KSP extraction failed, falling back to JSON-LD')
  }

  if (platform === 'hm') {
    console.log('🏪 Detected platform: hm')
    const hmResult = extractFromHm(doc, url)
    if (hmResult) {
      return hmResult
    }
    console.log('⚠️ H&M extraction failed, falling back to JSON-LD')
  }

  if (platform === 'next') {
    console.log('🏪 Detected platform: next')
    const nextResult = extractFromNext(doc, url)
    if (nextResult) {
      return nextResult
    }
    console.log('⚠️ Next extraction failed, falling back to JSON-LD')
  }

  // Fall back to JSON-LD extraction for all other sites
  const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]')
  console.log(`Found ${jsonLdScripts.length} JSON-LD scripts`)

  // @type can be a string or an array (e.g. ["Product", "Thing"])
  const isType = (d: any, t: string): boolean =>
    !!d && (d['@type'] === t || (Array.isArray(d['@type']) && d['@type'].includes(t)))

  for (const script of jsonLdScripts) {
    try {
      const parsed = JSON.parse(script.textContent || '')
      // Top-level JSON-LD can be a single object or an array of objects
      const candidates = Array.isArray(parsed) ? parsed : [parsed]

      for (const data of candidates) {
        // Check for Product type
        if (isType(data, 'Product')) {
          console.log('✅ Found Product type')
          return extractFromProduct(data as ProductSchema, url)
        }

        // Check for ProductGroup type
        if (isType(data, 'ProductGroup')) {
          console.log('✅ Found ProductGroup type')
          return extractFromProductGroup(data as ProductGroupSchema, url)
        }

        // Check for @graph structure
        if (data && data['@graph']) {
          const graphData = data as GraphSchema
          const product = graphData['@graph']?.find(item =>
            isType(item, 'Product') || isType(item, 'ProductGroup')
          )
          if (product) {
            console.log('✅ Found product in @graph')
            return isType(product, 'Product')
              ? extractFromProduct(product as ProductSchema, url)
              : extractFromProductGroup(product as ProductGroupSchema, url)
          }
        }
      }
    } catch (error) {
      console.warn('Failed to parse JSON-LD:', error)
    }
  }

  // Check for non-product page types (Article, BlogPost, etc.)
  const nonProductTypes = ['Article', 'BlogPosting', 'NewsArticle', 'WebPage',
    'AboutPage', 'ContactPage', 'FAQPage', 'CollectionPage']

  for (const script of jsonLdScripts) {
    try {
      const data = JSON.parse(script.textContent || '')
      const pageType = data['@type']
      if (nonProductTypes.includes(pageType)) {
        throw new Error('הדף הזה נראה כמו כתבה ולא כמו דף מוצר. נסה להדביק קישור ישיר לדף המוצר.')
      }
      if (data['@graph']) {
        const hasNonProduct = data['@graph'].some((item: any) =>
          nonProductTypes.includes(item['@type'])
        )
        const hasProduct = data['@graph'].some((item: any) =>
          item['@type'] === 'Product' || item['@type'] === 'ProductGroup'
        )
        if (hasNonProduct && !hasProduct) {
          throw new Error('הדף הזה נראה כמו כתבה ולא כמו דף מוצר. נסה להדביק קישור ישיר לדף המוצר.')
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('כתבה')) {
        throw error
      }
    }
  }

  // Final fallback: Try generic DOM extraction
  console.log('⚠️ JSON-LD extraction failed, trying generic DOM extraction...')
  const genericResult = extractFromGenericDOM(doc, url)
  if (genericResult) {
    return genericResult
  }

  return null
}

/**
 * Generic DOM extraction fallback for sites without JSON-LD
 * Tries common price and product selectors
 */
function extractFromGenericDOM(doc: Document, baseUrl?: string): ExtractedProductData | null {
  console.log('🔍 Attempting generic DOM extraction...')

  const productData: ExtractedProductData = {
    name: '',
    price: '',
    priceCurrency: 'ILS',
    brand: '',
    category: '',
    imageUrls: []
  }

  // Try to extract price from common selectors
  const priceSelectors = [
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
  ]

  let price = ''
  let priceCurrency = ''

  // Priority 1: Open Graph / product meta tags. Shopify (and most platforms)
  // render these server-side even when the JSON-LD app fails to inject its
  // schema — this rescues pages whose structured data is intermittently missing.
  const ogPriceMeta = doc.querySelector(
    'meta[property="og:price:amount"], meta[property="product:price:amount"]'
  )
  const ogPriceRaw = ogPriceMeta?.getAttribute('content') || ''
  const ogPriceMatch = ogPriceRaw.match(/[\d.,]+/)
  if (ogPriceMatch) {
    // Strip thousands separators — og:price:amount can be "7,040.00"
    price = ogPriceMatch[0].replace(/,/g, '')
    priceCurrency = doc.querySelector(
      'meta[property="og:price:currency"], meta[property="product:price:currency"]'
    )?.getAttribute('content') || ''
    console.log(`   💰 Found price in og/product meta: ${price} ${priceCurrency}`)
  }

  for (const selector of priceSelectors) {
    if (price) break
    const element = doc.querySelector(selector)
    if (element) {
      const priceText = element.textContent?.trim() || ''
      let priceMatch = priceText.match(/[\d,]+\.?\d*/)

      // If regex doesn't match (possible encoding issue), try manual extraction
      if (!priceMatch) {
        // Filter for ASCII digits and common separators
        const numericChars = Array.from(priceText)
          .filter(ch => {
            const code = ch.charCodeAt(0)
            return (code >= 48 && code <= 57) || ch === ',' || ch === '.'  // 0-9, comma, dot
          })
          .join('')
        priceMatch = numericChars ? [numericChars] : null
      }

      if (priceMatch) {
        price = priceMatch[0].replace(',', '')
        console.log(`   💰 Found price in ${selector}: ${price}`)
        break
      }
    }
  }

  // Try to extract name from common selectors
  const nameSelectors = [
    'h1',
    '[itemprop="name"]',
    '.product-name',
    '.product-title',
    '.product__title',
    'meta[property="og:title"]'
  ]

  let name = ''
  for (const selector of nameSelectors) {
    const element = doc.querySelector(selector)
    if (element) {
      if (element.tagName === 'META') {
        name = element.getAttribute('content') || ''
      } else {
        name = element.textContent?.trim() || ''
      }
      if (name && name.length > 3) {
        console.log(`   📝 Found name in ${selector}: ${name.substring(0, 50)}...`)
        break
      }
    }
  }

  // Try to extract image from common selectors
  const imageSelectors = [
    'img[itemprop="image"]',
    '.product-image img',
    '.product__image img',
    'meta[property="og:image"]'
  ]

  for (const selector of imageSelectors) {
    const element = doc.querySelector(selector)
    if (element) {
      let imageSrc = ''
      if (element.tagName === 'META') {
        imageSrc = element.getAttribute('content') || ''
      } else {
        imageSrc = element.getAttribute('src') || ''
      }
      if (imageSrc) {
        productData.imageUrls.push(resolveUrl(imageSrc, baseUrl))
        console.log(`   🖼️ Found image: ${imageSrc.substring(0, 50)}...`)
        break
      }
    }
  }

  productData.name = name
  productData.price = price
  productData.priceCurrency = priceCurrency || 'ILS'

  console.log(`   📊 Generic DOM extraction summary:`)
  console.log(`      Title: ${name ? '✓' : '✗'}`)
  console.log(`      Price: ${price ? `₪${price} ILS` : '✗'}`)
  console.log(`      Images: ${productData.imageUrls.length}`)

  // Require both name and price for successful extraction
  if (productData.name && productData.price) {
    console.log('✅ Generic DOM extraction successful')
    return convertPriceToILS(productData)
  }

  console.log('❌ Generic DOM extraction failed - insufficient data')
  return null
}

/**
 * Diagnostics captured when extraction fails — attached to the thrown Error
 * (as `error.diagnostics`) so AddItemModal can persist them to
 * extraction_reports and failures become debuggable after the fact.
 */
export interface ExtractionDiagnostics {
  html_length: number
  page_title: string | null
  ldjson_types: string[]
  shopify_js_tried: boolean
}

export type ExtractionError = Error & { diagnostics?: ExtractionDiagnostics }

/**
 * Fetch a URL's raw body through the extract-product Edge Function
 * (bypasses CORS; the function returns the body in the `html` field
 * regardless of content type).
 */
async function fetchViaEdge(
  url: string,
  accessToken: string
): Promise<{ html: string; finalUrl: string }> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

  if (!supabaseUrl) {
    throw new Error('Missing Supabase URL configuration')
  }

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

  return { html: data.html, finalUrl: data.finalUrl || url }
}

/**
 * Last-resort fallback for Shopify stores whose JSON-LD is missing or broken
 * (it's usually injected by a third-party SEO app that intermittently fails —
 * see baby-star.co.il). Shopify always serves /products/<handle>.js with the
 * full product JSON: title, price (in minor units, e.g. agorot), images.
 *
 * Returns null when the URL/page isn't Shopify-shaped or the fetch/parse fails.
 */
async function tryShopifyProductJs(
  pageUrl: string,
  pageHtml: string,
  accessToken: string
): Promise<ExtractedProductData | null> {
  try {
    const parsedUrl = new URL(pageUrl)
    const handleMatch = parsedUrl.pathname.match(/\/products\/([^/]+?)(?:\.js(?:on)?)?\/?$/)
    if (!handleMatch) return null

    const looksLikeShopify =
      pageHtml.includes('cdn.shopify.com') || pageHtml.includes('Shopify.theme')
    if (!looksLikeShopify) return null

    const jsUrl = `${parsedUrl.origin}/products/${handleMatch[1]}.js`
    console.log('🛟 Trying Shopify product JSON fallback:', jsUrl)

    const { html: body } = await fetchViaEdge(jsUrl, accessToken)
    const product = JSON.parse(body)
    if (!product || typeof product.title !== 'string' || !product.title) return null

    // Shopify's .js endpoint returns prices in minor units (agorot/cents)
    const price = typeof product.price === 'number' && product.price > 0
      ? (product.price / 100).toFixed(2)
      : ''

    // The endpoint has no currency field — read the store currency from the
    // page HTML (Shopify.currency = {"active":"ILS",...} or og:price:currency)
    const currencyMatch =
      pageHtml.match(/Shopify\.currency\s*=\s*\{"active":"([A-Z]{3})"/) ||
      pageHtml.match(/(?:og|product):price:currency"\s+content="([A-Z]{3})"/)
    const currency = currencyMatch?.[1] || 'ILS'

    const images: string[] = Array.isArray(product.images)
      ? product.images.filter((i: unknown) => typeof i === 'string')
      : []

    const result = convertPriceToILS({
      name: product.title,
      price,
      priceCurrency: currency,
      brand: typeof product.vendor === 'string' ? product.vendor : '',
      category: '',
      imageUrls: images.map((i: string) => resolveUrl(i, pageUrl))
    })

    console.log('✅ Shopify product JSON fallback succeeded')
    return result
  } catch (error) {
    console.warn('   ⚠️ Shopify product JSON fallback failed:', error)
    return null
  }
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

  try {
    // Call Supabase Edge Function to fetch HTML (bypasses CORS)
    const data = await fetchViaEdge(url, accessToken)

    console.log('✅ Received HTML, parsing...')

    // Parse HTML string into Document using DOMParser
    const parser = new DOMParser()
    const doc = parser.parseFromString(data.html, 'text/html')

    // Extract product data using same logic as current page
    // Use finalUrl (after redirects) for accurate base URL resolution
    const baseUrl = data.finalUrl || url

    let productData: ExtractedProductData | null = null
    let extractionError: ExtractionError | null = null
    try {
      productData = extractProductDataFromDocument(doc, baseUrl)
    } catch (err) {
      // e.g. the "looks like an article" error — still worth trying the
      // Shopify fallback, since 'FAQPage'-only JSON-LD triggers it on real
      // product pages whose Product block is missing
      extractionError = err as ExtractionError
    }

    let shopifyJsTried = false
    if (!productData) {
      shopifyJsTried = true
      productData = await tryShopifyProductJs(baseUrl, data.html, accessToken)
    }

    if (!productData) {
      const error: ExtractionError =
        extractionError ?? new Error('לא נמצא מידע על מוצר בדף זה')
      error.diagnostics = {
        html_length: data.html.length,
        page_title: doc.querySelector('title')?.textContent?.trim().slice(0, 150) || null,
        ldjson_types: Array.from(
          doc.querySelectorAll('script[type="application/ld+json"]')
        ).map((script) => {
          try {
            const parsed = JSON.parse(script.textContent || '')
            const items = Array.isArray(parsed)
              ? parsed
              : parsed?.['@graph'] && Array.isArray(parsed['@graph'])
                ? parsed['@graph']
                : [parsed]
            return items
              .map((item: unknown) =>
                String((item as Record<string, unknown> | null)?.['@type'] ?? '?'))
              .join(',')
          } catch {
            return 'parse_error'
          }
        }),
        shopify_js_tried: shopifyJsTried,
      }
      throw error
    }

    console.log('✅ Product extracted:', productData)
    return productData

  } catch (error) {
    console.error('❌ Extract from URL failed:', error)
    throw error
  }
}
