#!/usr/bin/env node
// Extract product URLs + fallback prices from src/data/categories.ts into a
// JSON file the refresh-recommended-prices edge function can consume.
//
// Output: supabase/functions/refresh-recommended-prices/products.json
//
// Usage: node scripts/extract-product-urls.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(resolve(__dirname, '../src/data/categories.ts'), 'utf-8')

const STR = "((?:[^'\\\\]|\\\\.)*)"
const keyRe = new RegExp(`'${STR}':\\s*\\{[^]*?type:\\s*'[^']+',[^]*?products:\\s*\\[([\\s\\S]*?)\\]`, 'g')
const prodRe = new RegExp(
  `\\{\\s*name:\\s*'${STR}',\\s*store:\\s*'${STR}',\\s*url:\\s*'${STR}',\\s*image:\\s*'${STR}',\\s*price:\\s*(\\d+(?:\\.\\d+)?)\\s*,?\\s*\\}`,
  'g',
)

const products = []
let m
while ((m = keyRe.exec(src))) {
  const itemKey = m[1].replace(/\\'/g, "'")
  const block = m[2]
  let p
  while ((p = prodRe.exec(block))) {
    products.push({
      url: p[3].replace(/\\'/g, "'"),
      item_key: itemKey,
      fallback_price: Number(p[5]),
    })
  }
}

const outDir = resolve(__dirname, '../supabase/functions/refresh-recommended-prices')
mkdirSync(outDir, { recursive: true })
const outPath = resolve(outDir, 'products.json')
writeFileSync(outPath, JSON.stringify({ generated_at: new Date().toISOString(), products }, null, 2))
console.error(`Wrote ${products.length} products to ${outPath}`)
