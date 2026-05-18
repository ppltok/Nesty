import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface CacheRow {
  url: string
  price: number
  last_checked: string
}

// Cache the result in module scope so multiple consumers share one fetch.
let cachedPromise: Promise<Map<string, CacheRow>> | null = null

function loadCache(): Promise<Map<string, CacheRow>> {
  if (cachedPromise) return cachedPromise
  cachedPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from('recommended_price_cache')
        .select('url, price, last_checked')
      if (error || !data) return new Map<string, CacheRow>()
      return new Map<string, CacheRow>(data.map((r) => [r.url, r as CacheRow]))
    } catch {
      return new Map<string, CacheRow>()
    }
  })()
  return cachedPromise
}

export interface RecommendedPriceLookup {
  getCurrentPrice: (url: string, fallback: number) => number
  getLastChecked: (url: string) => string | null
  isReady: boolean
}

export function useRecommendedPriceCache(): RecommendedPriceLookup {
  const [cache, setCache] = useState<Map<string, CacheRow> | null>(null)

  useEffect(() => {
    let cancelled = false
    loadCache().then((c) => {
      if (!cancelled) setCache(c)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const getCurrentPrice = useCallback(
    (url: string, fallback: number) => {
      if (!cache) return fallback
      const row = cache.get(url)
      return row?.price ?? fallback
    },
    [cache],
  )

  const getLastChecked = useCallback(
    (url: string) => {
      if (!cache) return null
      return cache.get(url)?.last_checked ?? null
    },
    [cache],
  )

  return { getCurrentPrice, getLastChecked, isReady: cache !== null }
}
