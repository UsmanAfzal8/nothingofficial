import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const LOCAL_PRODUCTS_PATH = path.join(ROOT, 'database', 'prodcuts.json')

function formatRsPrice(price) {
  if (typeof price !== 'number' || !Number.isFinite(price)) return null
  return `Rs ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(price)}`
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function replacePriceText(value, oldPrice, newPrice) {
  if (typeof value !== 'string') {
    return value
  }

  const newFormatted = formatRsPrice(newPrice)
  const oldFormatted = formatRsPrice(oldPrice)

  if (!newFormatted) {
    return value
  }

  let nextValue = value
    .replace(/(Price:\s*)Rs\s*[\d,]+/gi, `$1${newFormatted}`)
    .replace(/(listed at\s*)Rs\s*[\d,]+/gi, `$1${newFormatted}`)
    .replace(/(price of [^.?!]*?\bis\s*)Rs\s*[\d,]+/gi, `$1${newFormatted}`)
    .replace(/(for\s*)Rs\s*[\d,]+/gi, `$1${newFormatted}`)

  if (oldFormatted) {
    nextValue = nextValue.replace(new RegExp(escapeRegExp(oldFormatted), 'g'), newFormatted)
  }

  if (typeof oldPrice === 'number' && Number.isFinite(oldPrice)) {
    nextValue = nextValue.replace(new RegExp(`Rs\\s*${escapeRegExp(String(oldPrice))}\\b`, 'g'), newFormatted)
  }

  return nextValue
}

function syncValue(value, oldPrice, newPrice) {
  if (Array.isArray(value)) {
    return value.map((entry) => syncValue(entry, oldPrice, newPrice))
  }

  if (value && typeof value === 'object') {
    const output = {}
    for (const [key, entry] of Object.entries(value)) {
      if (key === 'price' && typeof entry === 'number') {
        output[key] = newPrice
        continue
      }

      output[key] = syncValue(entry, oldPrice, newPrice)
    }
    return output
  }

  if (typeof value === 'string') {
    return replacePriceText(value, oldPrice, newPrice)
  }

  return value
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or key in environment.')
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const rawLocal = await fs.readFile(LOCAL_PRODUCTS_PATH, 'utf8')
  const localProducts = JSON.parse(rawLocal)

  if (!Array.isArray(localProducts)) {
    throw new Error('database/prodcuts.json does not contain an array.')
  }

  const { data, error } = await supabase.from('products').select('slug, price')

  if (error) {
    throw new Error(`Failed to fetch prices from Supabase: ${error.message}`)
  }

  const livePricesBySlug = new Map(
    (data ?? [])
      .filter((row) => row?.slug && typeof row.price === 'number')
      .map((row) => [row.slug, row.price]),
  )

  let changedCount = 0
  const changedSlugs = []

  const updatedProducts = localProducts.map((product) => {
    if (!product || typeof product !== 'object' || typeof product.slug !== 'string') {
      return product
    }

    const livePrice = livePricesBySlug.get(product.slug)
    const currentPrice = typeof product.price === 'number' ? product.price : null

    if (typeof livePrice !== 'number' || currentPrice === null) {
      return product
    }

    const syncedProduct = syncValue(product, currentPrice, livePrice)

    if (JSON.stringify(syncedProduct) === JSON.stringify(product)) {
      return product
    }

    changedCount += 1
    changedSlugs.push({
      slug: product.slug,
      oldPrice: currentPrice,
      newPrice: livePrice,
    })

    return syncedProduct
  })

  await fs.writeFile(LOCAL_PRODUCTS_PATH, `${JSON.stringify(updatedProducts, null, 2)}\n`, 'utf8')

  console.log(
    JSON.stringify(
      {
        updated: changedCount,
        changes: changedSlugs,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
