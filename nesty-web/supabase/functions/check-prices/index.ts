import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts'

// ─── Configuration ───────────────────────────────────────────────
const BATCH_SIZE = 10
const BATCH_DELAY_MS = 2000
const FETCH_TIMEOUT_MS = 10000
const MAX_ITEMS_PER_RUN = 50
const MAX_ALERTS_PER_EMAIL = 5
const COOLDOWN_DAYS = 7
const MAX_CONSECUTIVE_FAILURES = 3

// Thresholds for items WITH known source currency
const THRESHOLD_PERCENT = 5
const THRESHOLD_ILS_AMOUNT = 10

// Wider thresholds for legacy items (ILS comparison only)
const LEGACY_THRESHOLD_PERCENT = 10
const LEGACY_THRESHOLD_ILS_AMOUNT = 15

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Interfaces ──────────────────────────────────────────────────

interface ExtractedPrice {
  price: number
  currency: string
}

interface PriceDrop {
  item_id: string
  registry_id: string
  item_name: string
  image_url: string | null
  original_url: string
  store_name: string
  original_price_ils: number
  found_price_ils: number
  source_price_old: number | null
  source_price_new: number
  source_currency: string
  drop_percent: number
  savings_ils: number
}

interface ExchangeRates {
  [currency: string]: number
}

// ─── Exchange Rate Fetching ──────────────────────────────────────

async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/ILS')
    if (!response.ok) throw new Error(`Exchange rate API returned ${response.status}`)
    const data = await response.json()
    if (data.result !== 'success') throw new Error('Exchange rate API error')

    // The API returns rates relative to ILS (1 ILS = X foreign)
    // We need the inverse: 1 foreign = X ILS
    const rates: ExchangeRates = { ILS: 1 }
    for (const [currency, rate] of Object.entries(data.rates)) {
      if (typeof rate === 'number' && rate > 0) {
        rates[currency] = 1 / rate // Invert: 1 USD = X ILS
      }
    }
    console.log(`💱 Fetched exchange rates. USD=${rates['USD']?.toFixed(2)}, EUR=${rates['EUR']?.toFixed(2)}, GBP=${rates['GBP']?.toFixed(2)}`)
    return rates
  } catch (error) {
    console.error('❌ Failed to fetch exchange rates:', error)
    // Fallback rates (approximate)
    return {
      ILS: 1,
      USD: 3.65,
      EUR: 4.00,
      GBP: 4.60,
      AUD: 2.40,
      CAD: 2.70,
    }
  }
}

// ─── HTML Fetching ───────────────────────────────────────────────

async function fetchHtml(url: string): Promise<{ html: string; status: number } | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,he;q=0.8',
      },
      redirect: 'follow',
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return { html: '', status: response.status }
    }

    const html = await response.text()
    return { html, status: response.status }
  } catch (error) {
    clearTimeout(timeoutId)
    console.error(`Fetch error for ${url}:`, error instanceof Error ? error.message : error)
    return null
  }
}

// ─── Price Extraction (ported from productExtraction.ts) ─────────

function detectPlatform(url: string): string | null {
  try {
    const hostname = new URL(url).hostname
    if (hostname.includes('aliexpress.com')) return 'aliexpress'
    if (hostname.includes('amazon.com') || hostname.includes('amazon.co.uk') ||
        hostname.includes('amazon.de') || hostname.includes('amazon.fr') ||
        hostname.includes('amazon.it') || hostname.includes('amazon.es') ||
        hostname.includes('amazon.ca')) return 'amazon'
    return null
  } catch {
    return null
  }
}

function extractPriceFromJsonLd(doc: any): ExtractedPrice | null {
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]')

  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent || '')

      // Direct Product type
      if (data['@type'] === 'Product') {
        return extractPriceFromProductSchema(data)
      }

      // ProductGroup type (Shopify variants)
      if (data['@type'] === 'ProductGroup') {
        return extractPriceFromProductGroupSchema(data)
      }

      // @graph structure
      if (data['@graph']) {
        const product = data['@graph'].find((item: any) =>
          item['@type'] === 'Product' || item['@type'] === 'ProductGroup'
        )
        if (product) {
          return product['@type'] === 'Product'
            ? extractPriceFromProductSchema(product)
            : extractPriceFromProductGroupSchema(product)
        }
      }
    } catch {
      // Skip invalid JSON-LD
    }
  }

  return null
}

function extractPriceFromProductSchema(data: any): ExtractedPrice | null {
  const offersData = data.offers || data.Offers
  const offer = Array.isArray(offersData) ? offersData[0] : offersData

  const price = parseFloat(offer?.price)
  const currency = offer?.priceCurrency || 'ILS'

  if (isNaN(price) || price <= 0) return null
  return { price, currency }
}

function extractPriceFromProductGroupSchema(data: any): ExtractedPrice | null {
  const variants = data.hasVariant || []
  const firstVariant = Array.isArray(variants) ? variants[0] : variants
  const offer = firstVariant?.offers || firstVariant?.Offers
  const offerObj = Array.isArray(offer) ? offer[0] : offer

  const price = parseFloat(offerObj?.price)
  const currency = offerObj?.priceCurrency || 'ILS'

  if (isNaN(price) || price <= 0) return null
  return { price, currency }
}

function extractPriceFromMetaTags(doc: any): ExtractedPrice | null {
  // Open Graph price tags
  const priceEl = doc.querySelector('meta[property="product:price:amount"]') ||
                  doc.querySelector('meta[property="og:price:amount"]')
  const currencyEl = doc.querySelector('meta[property="product:price:currency"]') ||
                     doc.querySelector('meta[property="og:price:currency"]')

  if (priceEl) {
    const price = parseFloat(priceEl.getAttribute('content') || '')
    const currency = currencyEl?.getAttribute('content') || 'ILS'
    if (!isNaN(price) && price > 0) return { price, currency }
  }

  // Microdata
  const microdataPrice = doc.querySelector('[itemprop="price"]')
  if (microdataPrice) {
    const priceVal = parseFloat(
      microdataPrice.getAttribute('content') || microdataPrice.textContent?.trim() || ''
    )
    const microdataCurrency = doc.querySelector('[itemprop="priceCurrency"]')
    const currency = microdataCurrency?.getAttribute('content') || 'ILS'
    if (!isNaN(priceVal) && priceVal > 0) return { price: priceVal, currency }
  }

  return null
}

function extractPriceFromAliExpress(doc: any): ExtractedPrice | null {
  const priceSelectors = [
    '.product-price-value',
    '[data-pl="product-price"]',
    '[class*="price-current"]',
    '[class*="price-sale"]',
    '[class*="Price"]',
    'span[class*="price"]',
    'div[class*="price"]',
  ]

  interface PriceCandidate {
    price: number
    currency: string
    priority: number
  }

  const found: PriceCandidate[] = []

  for (const selector of priceSelectors) {
    const elements = doc.querySelectorAll(selector)
    for (const element of elements) {
      const text = element.textContent?.trim() || ''
      if (!text) continue

      const usdMatch = text.match(/\$\s*([\d,]+\.?\d*)/)
      if (usdMatch?.[1]) {
        const price = parseFloat(usdMatch[1].replace(',', ''))
        if (price > 0) {
          const hasDiscount = text.includes('%') || text.includes('off')
          found.push({ price, currency: 'USD', priority: hasDiscount ? 12 : 10 })
        }
        continue
      }

      const ilsMatch = text.match(/₪\s*([\d,]+\.?\d*)/)
      if (ilsMatch?.[1]) {
        const price = parseFloat(ilsMatch[1].replace(',', ''))
        if (price > 0) {
          const hasDiscount = text.includes('%') || text.includes('off') || text.includes('הנחה')
          found.push({ price, currency: 'ILS', priority: hasDiscount ? 8 : 5 })
        }
        continue
      }
    }
  }

  if (found.length === 0) return null

  found.sort((a, b) => b.priority - a.priority || b.price - a.price)
  return { price: found[0].price, currency: found[0].currency }
}

function extractPriceFromAmazon(doc: any): ExtractedPrice | null {
  const priceSelectors = [
    '.a-price .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '#corePrice_feature_div .a-price .a-offscreen',
    '[data-a-color="price"] .a-offscreen',
    '.priceToPay .a-offscreen',
    '#corePriceDisplay_desktop_feature_div .a-price .a-offscreen',
  ]

  for (const selector of priceSelectors) {
    const elements = doc.querySelectorAll(selector)
    for (const element of elements) {
      const text = element.textContent?.trim() || ''
      const match = text.match(/\$\s*([\d,]+\.?\d*)/)
      if (match?.[1]) {
        const price = parseFloat(match[1].replace(',', ''))
        if (price > 0) return { price, currency: 'USD' }
      }
    }
  }

  return null
}

function extractPriceFromGenericDOM(doc: any): ExtractedPrice | null {
  const priceSelectors = [
    '#tovel_initial_price',
    '.price--highlight .price-item--regular',
    '.price-item--regular',
    '[data-product-price]',
    '.product-price',
    '.price',
    '[itemprop="price"]',
    '.money',
    '.product__price',
    '.product-single__price',
    '[data-hook="formatted-primary-price"]',
  ]

  for (const selector of priceSelectors) {
    const element = doc.querySelector(selector)
    if (!element) continue

    const text = element.textContent?.trim() || ''

    // Try to extract price with currency detection
    const usdMatch = text.match(/\$\s*([\d,]+\.?\d*)/)
    if (usdMatch?.[1]) {
      const price = parseFloat(usdMatch[1].replace(',', ''))
      if (price > 0) return { price, currency: 'USD' }
    }

    const eurMatch = text.match(/€\s*([\d,]+\.?\d*)/)
    if (eurMatch?.[1]) {
      const price = parseFloat(eurMatch[1].replace(',', ''))
      if (price > 0) return { price, currency: 'EUR' }
    }

    const gbpMatch = text.match(/£\s*([\d,]+\.?\d*)/)
    if (gbpMatch?.[1]) {
      const price = parseFloat(gbpMatch[1].replace(',', ''))
      if (price > 0) return { price, currency: 'GBP' }
    }

    const ilsMatch = text.match(/₪\s*([\d,]+\.?\d*)/)
    if (ilsMatch?.[1]) {
      const price = parseFloat(ilsMatch[1].replace(',', ''))
      if (price > 0) return { price, currency: 'ILS' }
    }

    // Numeric only (assume ILS for Israeli sites)
    const numMatch = text.match(/([\d,]+\.?\d*)/)
    if (numMatch?.[1]) {
      const price = parseFloat(numMatch[1].replace(',', ''))
      if (price > 0) return { price, currency: 'ILS' }
    }
  }

  return null
}

/**
 * Extract price + currency from an HTML string.
 * Priority: JSON-LD → Meta tags → Platform-specific DOM → Generic DOM
 */
function extractPriceFromHtml(html: string, url: string): ExtractedPrice | null {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  if (!doc) return null

  // 1. JSON-LD (most reliable, ~95% of e-commerce sites)
  const jsonLdResult = extractPriceFromJsonLd(doc)
  if (jsonLdResult) return jsonLdResult

  // 2. Meta tags (Open Graph, Microdata)
  const metaResult = extractPriceFromMetaTags(doc)
  if (metaResult) return metaResult

  // 3. Platform-specific DOM extraction
  const platform = detectPlatform(url)

  if (platform === 'aliexpress') {
    const aliResult = extractPriceFromAliExpress(doc)
    if (aliResult) return aliResult
  }

  if (platform === 'amazon') {
    const amazonResult = extractPriceFromAmazon(doc)
    if (amazonResult) return amazonResult
  }

  // 4. Generic DOM fallback
  return extractPriceFromGenericDOM(doc)
}

// ─── Helpers ─────────────────────────────────────────────────────

function getStoreNameFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname
    return hostname.replace(/^www\./, '')
  } catch {
    return 'unknown'
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── Main Handler ────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 0. Fetch exchange rates
    const rates = await fetchExchangeRates()

    // 1. Get eligible items
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select(`
        id, name, price, original_url, image_url, registry_id,
        source_currency, source_price, store_name,
        last_price_check, price_check_failures, price_alert_sent,
        quantity, quantity_received
      `)
      .not('original_url', 'is', null)
      .order('last_price_check', { ascending: true, nullsFirst: true })
      .limit(MAX_ITEMS_PER_RUN)

    if (itemsError) throw new Error(`Failed to query items: ${itemsError.message}`)

    // Filter: not fully purchased + not too many consecutive failures
    const eligibleItems = (items || []).filter(item =>
      (item.quantity_received || 0) < (item.quantity || 1) &&
      (item.price_check_failures || 0) < MAX_CONSECUTIVE_FAILURES
    )

    console.log(`📦 Found ${eligibleItems.length} eligible items to check (of ${items?.length || 0} total with URLs)`)

    const priceDrops: PriceDrop[] = []
    const logs: any[] = []
    let checkedCount = 0

    // 2. Process in batches
    for (let i = 0; i < eligibleItems.length; i += BATCH_SIZE) {
      const batch = eligibleItems.slice(i, i + BATCH_SIZE)

      // Check time budget (leave 20s for email sending)
      if (Date.now() - startTime > 120000) {
        console.log('⏰ Time budget exceeded, stopping early')
        break
      }

      const batchPromises = batch.map(async (item) => {
        const logEntry: any = {
          item_id: item.id,
          stored_price: item.price,
          stored_source_price: item.source_price,
        }

        try {
          // Check 7-day cooldown
          const { data: recentAlerts } = await supabase
            .from('price_alerts')
            .select('created_at')
            .eq('item_id', item.id)
            .gte('created_at', new Date(Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString())
            .limit(1)

          if (recentAlerts && recentAlerts.length > 0) {
            logEntry.status = 'cooldown_skip'
            logs.push(logEntry)
            return
          }

          // Fetch HTML
          const result = await fetchHtml(item.original_url)
          if (!result || !result.html) {
            logEntry.status = 'fetch_error'
            logEntry.response_status = result?.status || 0
            logEntry.error_message = result ? `HTTP ${result.status}` : 'Network error or timeout'
            logs.push(logEntry)

            // Increment failure counter
            await supabase.from('items').update({
              price_check_failures: (item.price_check_failures || 0) + 1,
              last_price_check: new Date().toISOString(),
            }).eq('id', item.id)
            return
          }

          logEntry.response_status = result.status

          // Extract price
          const extracted = extractPriceFromHtml(result.html, item.original_url)
          if (!extracted || extracted.price <= 0) {
            logEntry.status = 'parse_error'
            logEntry.error_message = 'No price found in HTML'
            logs.push(logEntry)

            await supabase.from('items').update({
              price_check_failures: (item.price_check_failures || 0) + 1,
              last_price_check: new Date().toISOString(),
            }).eq('id', item.id)
            return
          }

          logEntry.extracted_price = extracted.price
          logEntry.extracted_currency = extracted.currency

          // Convert extracted price to ILS
          const extractedIls = extracted.currency === 'ILS'
            ? extracted.price
            : extracted.price * (rates[extracted.currency] || 1)

          // Determine comparison mode
          let dropPercent = 0
          let ilsSavings = 0
          let isRealDrop = false

          if (item.source_currency && item.source_price && item.source_currency !== 'ILS') {
            // ✅ CURRENCY-AWARE comparison
            if (extracted.currency !== item.source_currency) {
              // Currency mismatch — skip (rare edge case)
              logEntry.status = 'currency_mismatch'
              logEntry.error_message = `Expected ${item.source_currency}, got ${extracted.currency}`
              logs.push(logEntry)

              // Still update last check time + backfill
              await supabase.from('items').update({
                last_price_check: new Date().toISOString(),
                last_checked_price: extractedIls,
                last_checked_source_price: extracted.price,
                price_check_failures: 0,
              }).eq('id', item.id)
              return
            }

            dropPercent = ((item.source_price - extracted.price) / item.source_price) * 100
            ilsSavings = item.price - extractedIls

            isRealDrop = dropPercent >= THRESHOLD_PERCENT && ilsSavings >= THRESHOLD_ILS_AMOUNT
          } else {
            // ⚠️ LEGACY: compare in ILS with wider threshold
            const storedIls = item.price || 0
            dropPercent = storedIls > 0
              ? ((storedIls - extractedIls) / storedIls) * 100
              : 0
            ilsSavings = storedIls - extractedIls

            isRealDrop = dropPercent >= LEGACY_THRESHOLD_PERCENT && ilsSavings >= LEGACY_THRESHOLD_ILS_AMOUNT
          }

          // Update item with latest check data
          const updateData: any = {
            last_price_check: new Date().toISOString(),
            last_checked_price: Math.round(extractedIls * 100) / 100,
            last_checked_source_price: extracted.price,
            price_check_failures: 0, // Reset on success
          }

          // Backfill source currency for legacy items
          if (!item.source_currency || !item.source_price) {
            updateData.source_currency = extracted.currency
            updateData.source_price = extracted.price
          }

          await supabase.from('items').update(updateData).eq('id', item.id)

          if (isRealDrop && dropPercent > 0) {
            logEntry.status = 'price_drop'
            priceDrops.push({
              item_id: item.id,
              registry_id: item.registry_id,
              item_name: item.name,
              image_url: item.image_url,
              original_url: item.original_url,
              store_name: item.store_name || getStoreNameFromUrl(item.original_url),
              original_price_ils: item.price,
              found_price_ils: Math.round(extractedIls * 100) / 100,
              source_price_old: item.source_price,
              source_price_new: extracted.price,
              source_currency: extracted.currency,
              drop_percent: Math.round(dropPercent),
              savings_ils: Math.round(ilsSavings * 100) / 100,
            })
          } else if (dropPercent < 0) {
            logEntry.status = 'price_increase'
          } else {
            logEntry.status = dropPercent > 0 ? 'no_change' : 'no_change' // Below threshold counts as no_change
          }

          logs.push(logEntry)
          checkedCount++

        } catch (error) {
          logEntry.status = 'fetch_error'
          logEntry.error_message = error instanceof Error ? error.message : String(error)
          logs.push(logEntry)
        }
      })

      await Promise.all(batchPromises)

      // Delay between batches (skip for last batch)
      if (i + BATCH_SIZE < eligibleItems.length) {
        await sleep(BATCH_DELAY_MS)
      }
    }

    // 3. Write logs
    if (logs.length > 0) {
      const { error: logError } = await supabase
        .from('price_check_logs')
        .insert(logs)

      if (logError) {
        console.error('Failed to write logs:', logError.message)
      }
    }

    // 4. Process price drops: insert alerts + send emails
    if (priceDrops.length > 0) {
      console.log(`📉 Found ${priceDrops.length} price drop(s)!`)

      // Group drops by registry owner
      const dropsByRegistry = new Map<string, PriceDrop[]>()
      for (const drop of priceDrops) {
        const existing = dropsByRegistry.get(drop.registry_id) || []
        existing.push(drop)
        dropsByRegistry.set(drop.registry_id, existing)
      }

      // For each registry, get owner info and send email
      for (const [registryId, drops] of dropsByRegistry) {
        try {
          // Get registry owner's profile
          const { data: registry } = await supabase
            .from('registries')
            .select('owner_id')
            .eq('id', registryId)
            .single()

          if (!registry) continue

          const { data: profile } = await supabase
            .from('profiles')
            .select('id, email, first_name, marketing_emails, email_price_alerts')
            .eq('id', registry.owner_id)
            .single()

          if (!profile?.email) continue

          // Respect email preferences — both the master and per-category toggle.
          // Added in 20260419_email_preferences.sql; defaults to true so
          // existing users keep receiving price alerts unless they opt out.
          if (profile.marketing_emails === false || profile.email_price_alerts === false) {
            console.log(`[check-prices] skipping ${profile.email} — opted out of price alerts`)
            continue
          }

          // Sort by savings %, take top 5
          const topDrops = drops
            .sort((a, b) => b.drop_percent - a.drop_percent)
            .slice(0, MAX_ALERTS_PER_EMAIL)

          // Insert price_alerts only for the drops that actually go into the
          // email — inserting for all drops would arm the 7-day cooldown for
          // ranked 6+ items that were never emailed.
          const alertInserts = topDrops.map(drop => ({
            item_id: drop.item_id,
            original_price: drop.original_price_ils,
            found_price: drop.found_price_ils,
            found_url: drop.original_url,
            found_store: drop.store_name,
          }))

          const { error: alertError } = await supabase
            .from('price_alerts')
            .insert(alertInserts)

          if (alertError) {
            console.error('Failed to insert price alerts:', alertError.message)
          }

          // Build email data
          const emailDrops = topDrops.map(d => ({
            itemName: d.item_name,
            imageUrl: d.image_url || '',
            originalPrice: d.original_price_ils,
            currentPrice: d.found_price_ils.toFixed(2),
            savingsPercent: d.drop_percent,
            productUrl: d.original_url,
            storeName: d.store_name,
          }))

          // Send via existing send-email function
          const emailResponse = await fetch(
            `${supabaseUrl}/functions/v1/send-email`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'price_drop',
                to: profile.email,
                data: {
                  firstName: profile.first_name || 'את',
                  userId: profile.id,  // used to build signed unsubscribe URL
                  drops: emailDrops,
                },
              }),
            }
          )

          if (emailResponse.ok) {
            console.log(`✉️ Sent price drop email to ${profile.email} (${topDrops.length} items)`)

            // Mark alerts as notified
            const alertItemIds = topDrops.map(d => d.item_id)
            await supabase
              .from('price_alerts')
              .update({ notified_at: new Date().toISOString() })
              .in('item_id', alertItemIds)
              .is('notified_at', null)

            // Update items price_alert_sent flag
            for (const d of topDrops) {
              await supabase
                .from('items')
                .update({ price_alert_sent: true })
                .eq('id', d.item_id)
            }
          } else {
            console.error(`Failed to send email to ${profile.email}:`, await emailResponse.text())
          }
        } catch (emailErr) {
          console.error(`Error sending email for registry ${registryId}:`, emailErr)
        }
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    const summary = {
      success: true,
      items_checked: checkedCount,
      price_drops: priceDrops.length,
      logs_written: logs.length,
      elapsed_seconds: elapsed,
      status_breakdown: {
        success: logs.filter(l => l.status === 'no_change').length,
        price_drop: logs.filter(l => l.status === 'price_drop').length,
        price_increase: logs.filter(l => l.status === 'price_increase').length,
        fetch_error: logs.filter(l => l.status === 'fetch_error').length,
        parse_error: logs.filter(l => l.status === 'parse_error').length,
        cooldown_skip: logs.filter(l => l.status === 'cooldown_skip').length,
        currency_mismatch: logs.filter(l => l.status === 'currency_mismatch').length,
      },
    }

    console.log(`✅ Price check complete: ${JSON.stringify(summary)}`)

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('❌ Price check failed:', message)

    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
