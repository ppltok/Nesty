import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts'
import productsData from './products.json' with { type: 'json' }

// ─── Config ──────────────────────────────────────────────────────
// Sized so one invocation finishes inside Supabase's Edge Function
// wall-time limit. Worst case: 3 batches × ~8s fetch + 2 × 1s delay ≈ 26s.
// Scheduled daily, so 30 × 7 = 210 checks/week covers ~190 products with
// the 6-day cooldown.
const BATCH_SIZE = 10
const BATCH_DELAY_MS = 1000
const FETCH_TIMEOUT_MS = 8000
const MAX_PER_RUN = 30
const COOLDOWN_DAYS = 6
const MAX_CONSECUTIVE_FAILURES = 3

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProductEntry {
  url: string
  item_key: string
  fallback_price: number
}

interface ExtractedPrice {
  price: number
  currency: string
}

interface ExchangeRates {
  [currency: string]: number
}

// ─── Exchange rates ─────────────────────────────────────────────
async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/ILS')
    if (!r.ok) throw new Error(`status ${r.status}`)
    const data = await r.json()
    if (data.result !== 'success') throw new Error('rates api error')
    const rates: ExchangeRates = { ILS: 1 }
    for (const [currency, rate] of Object.entries(data.rates as Record<string, number>)) {
      if (typeof rate === 'number' && rate > 0) rates[currency] = 1 / rate
    }
    return rates
  } catch (e) {
    console.warn('⚠️ exchange-rate fetch failed, using fallback:', e)
    return { ILS: 1, USD: 3.65, EUR: 4.0, GBP: 4.6 }
  }
}

// ─── HTML fetch ─────────────────────────────────────────────────
async function fetchHtml(url: string): Promise<string | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'he-IL,he;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    })
    if (!r.ok) return null
    return await r.text()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

// ─── Extractors (mirror check-prices) ────────────────────────────
function extractFromProduct(data: any): ExtractedPrice | null {
  const offersData = data.offers || data.Offers
  const offer = Array.isArray(offersData) ? offersData[0] : offersData
  const price = parseFloat(offer?.price)
  const currency = offer?.priceCurrency || 'ILS'
  if (isNaN(price) || price <= 0) return null
  return { price, currency }
}

function extractFromProductGroup(data: any): ExtractedPrice | null {
  const variants = data.hasVariant || []
  const v = Array.isArray(variants) ? variants[0] : variants
  const offer = v?.offers || v?.Offers
  const o = Array.isArray(offer) ? offer[0] : offer
  const price = parseFloat(o?.price)
  const currency = o?.priceCurrency || 'ILS'
  if (isNaN(price) || price <= 0) return null
  return { price, currency }
}

function extractFromJsonLd(doc: any): ExtractedPrice | null {
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]')
  for (const s of scripts) {
    try {
      const data = JSON.parse(s.textContent || '')
      if (data['@type'] === 'Product') {
        const r = extractFromProduct(data)
        if (r) return r
      }
      if (data['@type'] === 'ProductGroup') {
        const r = extractFromProductGroup(data)
        if (r) return r
      }
      if (data['@graph']) {
        const p = data['@graph'].find(
          (x: any) => x['@type'] === 'Product' || x['@type'] === 'ProductGroup',
        )
        if (p) {
          const r =
            p['@type'] === 'Product' ? extractFromProduct(p) : extractFromProductGroup(p)
          if (r) return r
        }
      }
    } catch {
      // invalid JSON-LD; keep going
    }
  }
  return null
}

function extractFromMeta(doc: any): ExtractedPrice | null {
  const priceEl =
    doc.querySelector('meta[property="product:price:amount"]') ||
    doc.querySelector('meta[property="og:price:amount"]')
  const currencyEl =
    doc.querySelector('meta[property="product:price:currency"]') ||
    doc.querySelector('meta[property="og:price:currency"]')
  if (priceEl) {
    const price = parseFloat(priceEl.getAttribute('content') || '')
    const currency = currencyEl?.getAttribute('content') || 'ILS'
    if (!isNaN(price) && price > 0) return { price, currency }
  }
  return null
}

function extractFromGenericDom(doc: any): ExtractedPrice | null {
  const selectors = [
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
  for (const sel of selectors) {
    const el = doc.querySelector(sel)
    if (!el) continue
    const text = el.textContent?.trim() || ''
    const matchers: [RegExp, string][] = [
      [/\$\s*([\d,]+\.?\d*)/, 'USD'],
      [/€\s*([\d,]+\.?\d*)/, 'EUR'],
      [/£\s*([\d,]+\.?\d*)/, 'GBP'],
      [/₪\s*([\d,]+\.?\d*)/, 'ILS'],
      [/([\d,]+\.?\d*)/, 'ILS'],
    ]
    for (const [re, currency] of matchers) {
      const m = text.match(re)
      if (m?.[1]) {
        const price = parseFloat(m[1].replace(/,/g, ''))
        if (price > 0) return { price, currency }
      }
    }
  }
  return null
}

function extractPrice(html: string): ExtractedPrice | null {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  if (!doc) return null
  return extractFromJsonLd(doc) || extractFromMeta(doc) || extractFromGenericDom(doc)
}

function toIls(p: ExtractedPrice, rates: ExchangeRates): number {
  if (p.currency === 'ILS') return p.price
  const rate = rates[p.currency]
  if (!rate) return p.price // unknown currency, store as-is
  return p.price * rate
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ─── Main ────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const start = Date.now()

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const allProducts = (productsData as { products: ProductEntry[] }).products

    // Get current cache rows so we can apply cooldown + failure caps
    const { data: cacheRows, error: cacheErr } = await supabase
      .from('recommended_price_cache')
      .select('url, last_checked, failures')
    if (cacheErr) throw new Error(`cache read: ${cacheErr.message}`)

    const cacheByUrl = new Map<string, { last_checked: string; failures: number }>(
      (cacheRows || []).map((r: any) => [r.url, r]),
    )

    const cooldownMs = COOLDOWN_DAYS * 86_400_000
    const now = Date.now()

    const eligible = allProducts
      .filter((p) => {
        const cached = cacheByUrl.get(p.url)
        if (!cached) return true // never checked
        if ((cached.failures || 0) >= MAX_CONSECUTIVE_FAILURES) return false
        return now - new Date(cached.last_checked).getTime() >= cooldownMs
      })
      .slice(0, MAX_PER_RUN)

    if (eligible.length === 0) {
      return new Response(
        JSON.stringify({ checked: 0, message: 'nothing eligible' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const rates = await fetchExchangeRates()

    let updated = 0
    let failed = 0

    for (let i = 0; i < eligible.length; i += BATCH_SIZE) {
      const batch = eligible.slice(i, i + BATCH_SIZE)
      await Promise.all(
        batch.map(async (p) => {
          const cached = cacheByUrl.get(p.url)
          const failures = cached?.failures || 0
          const html = await fetchHtml(p.url)
          if (!html) {
            failed++
            await supabase
              .from('recommended_price_cache')
              .upsert(
                {
                  url: p.url,
                  price: cached ? undefined : p.fallback_price,
                  failures: failures + 1,
                  last_checked: new Date().toISOString(),
                },
                { onConflict: 'url' },
              )
            return
          }
          const extracted = extractPrice(html)
          if (!extracted || extracted.price <= 0) {
            failed++
            await supabase
              .from('recommended_price_cache')
              .upsert(
                {
                  url: p.url,
                  price: cached ? undefined : p.fallback_price,
                  failures: failures + 1,
                  last_checked: new Date().toISOString(),
                },
                { onConflict: 'url' },
              )
            return
          }
          const ils = Math.round(toIls(extracted, rates) * 100) / 100
          await supabase.from('recommended_price_cache').upsert(
            {
              url: p.url,
              price: ils,
              currency: 'ILS',
              source_price: extracted.price,
              source_currency: extracted.currency,
              failures: 0,
              last_checked: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'url' },
          )
          updated++
        }),
      )
      if (i + BATCH_SIZE < eligible.length) await sleep(BATCH_DELAY_MS)
    }

    return new Response(
      JSON.stringify({
        checked: eligible.length,
        updated,
        failed,
        total_products: allProducts.length,
        duration_ms: Date.now() - start,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    console.error('refresh-recommended-prices failed:', e)
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
