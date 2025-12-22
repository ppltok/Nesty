/**
 * Product Extraction Utility
 *
 * Extracts product data from e-commerce URLs using JSON-LD structured data.
 * Ported from the Chrome extension's content.js (lines 266-406)
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
 * Extract product data from a Product schema (standard e-commerce product)
 */
function extractFromProduct(data: ProductSchema): ExtractedProductData {
  const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers
  const imageUrls: string[] = []

  if (data.image) {
    if (Array.isArray(data.image)) {
      imageUrls.push(...data.image)
    } else {
      imageUrls.push(data.image)
    }
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
 * Extract product data from a ProductGroup schema (Shopify-style with variants)
 */
function extractFromProductGroup(data: ProductGroupSchema): ExtractedProductData {
  const variants = data.hasVariant || []
  const firstVariant = Array.isArray(variants) ? variants[0] : variants
  const offer = firstVariant?.offers as OfferSchema | undefined

  const imageUrls: string[] = []
  if (Array.isArray(variants)) {
    variants.forEach(variant => {
      if (variant.image) {
        if (Array.isArray(variant.image)) {
          imageUrls.push(...variant.image)
        } else {
          imageUrls.push(variant.image)
        }
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
 * Extract product data from a DOM document by finding JSON-LD structured data
 */
function extractProductDataFromDocument(doc: Document): ExtractedProductData | null {
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
    const productData = extractProductDataFromDocument(doc)

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
