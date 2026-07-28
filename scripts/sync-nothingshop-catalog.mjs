import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ROOT = process.cwd()
const SOURCE_ORIGIN = 'https://www.nothingshop.pk'
const SOURCE_COLLECTIONS = ['shop-all', 'phones', 'chargers', 'offers', 'audio', 'watches', 'accessories', 'cmf']
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nothingpakistan.pk'

function loadEnv() {
  for (const fileName of ['.env.local', 'env']) {
    const filePath = path.join(ROOT, fileName)
    if (!fs.existsSync(filePath)) continue

    for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
      const separator = trimmed.indexOf('=')
      const key = trimmed.slice(0, separator).trim()
      const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')
      process.env[key] ||= value
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment value: ${name}`)
  return value
}

function decodeHtml(value) {
  return String(value)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
}

function stripHtml(value) {
  return decodeHtml(String(value).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
}

function parseCards(html, sourceCollection) {
  const cards = []

  for (const match of html.matchAll(/<a[^>]+href="(\/products\/[^"?]+)(?:\?[^" ]*)?"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const [, route, cardHtml] = match
    const nameMatch = cardHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)
    const priceMatch = cardHtml.match(/<p[^>]*>Rs(?:\s|&nbsp;| )*([0-9][0-9,]*)<\/p>/i)
    if (!nameMatch || !priceMatch) continue

    const imageMatch = cardHtml.match(/<img[^>]+src="([^"]+)"/i)
    const slug = route.replace(/^\/products\//, '')
    const imageUrl = imageMatch?.[1] ? new URL(imageMatch[1], SOURCE_ORIGIN).toString() : null

    cards.push({
      sourceCollection,
      sourceSlug: slug,
      name: stripHtml(nameMatch[1]),
      price: Number(priceMatch[1].replace(/,/g, '')),
      imageUrl,
    })
  }

  return cards
}

function isMobileName(name) {
  return /^(?:CMF )?Phone \(/i.test(name) || /^CMF Phone \d/i.test(name)
}

function isAccessoryName(name) {
  return /\b(?:cover|protector|jelly sheet|uv protector)\b/i.test(name)
}

function entityType(name) {
  return isMobileName(name) && !isAccessoryName(name) ? 'mobile' : 'product'
}

function canonicalSlug(name, sourceSlug, existingByName) {
  const existing = existingByName.get(normalize(name))
  if (existing) return existing.slug

  if (normalize(name) === normalize('Phone (4a) Pro')) {
    return 'nothing-pakistan-phone-4a-pro'
  }

  return `nothing-pakistan-${slugify(sourceSlug)}`
}

function productType(name) {
  const value = normalize(name)
  if (/cover/.test(value)) return 'covers'
  if (/protector|jelly sheet|uv protector/.test(value)) return 'protector'
  if (/cable/.test(value)) return 'data_cable'
  if (/charger|power/.test(value)) return 'charger'
  if (/buds|earbuds|ear \(|^ear$/.test(value)) return 'earbuds'
  return null
}

function categoryKey(name, type) {
  const value = normalize(name)
  if (type === 'mobile') return 'phones'
  if (/cover|protector|jelly sheet|uv protector/.test(value)) return 'cases'
  if (/watch/.test(value)) return 'watches'
  if (/headphone|neckband|buds|ear \(|^ear$|earbuds/.test(value)) return 'audio'
  if (/charger|power|cable/.test(value)) return 'power'
  return null
}

function buildDescription(name, price) {
  return `${name} is listed for Pakistan buyers through the NothingShop.pk product catalogue. Confirm current stock, variant, delivery, warranty, and final order terms before purchase.`
}

function buildMetaDescription(name, price) {
  return `Buy ${name} in Pakistan. Current listing price: Rs ${price.toLocaleString('en-PK')}. Check stock, delivery, warranty, and ordering terms before purchase.`.slice(0, 160)
}

function buildSeoLong(name, price) {
  return `${name} is listed in the NothingShop.pk Pakistan catalogue at the current observed price of Rs ${price.toLocaleString('en-PK')}. Prices and availability can change, so customers should confirm the exact model, colour, storage, delivery, warranty, and final order total before payment. Nothing Pakistan provides the product page as a local buying reference and keeps support and order confirmation separate from a general catalogue price.`
}

function buildSchema({ name, slug, price, imageUrl, type }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    brand: { '@type': 'Brand', name: /^CMF/i.test(name) ? 'CMF by Nothing' : 'Nothing' },
    sku: slug,
    category: type === 'mobile' ? 'Mobile Phone' : 'Consumer Electronics',
    image: imageUrl ? [imageUrl] : [],
    url: `${SITE_URL}/products/${slug}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: `${SITE_URL}/products/${slug}`,
    },
  }
}

async function fetchCatalog() {
  const entries = new Map()

  for (const collection of SOURCE_COLLECTIONS) {
    const response = await fetch(`${SOURCE_ORIGIN}/collections/${collection}`, { signal: AbortSignal.timeout(30000) })
    if (!response.ok) throw new Error(`NothingShop collection ${collection} returned HTTP ${response.status}`)
    const html = await response.text()

    for (const card of parseCards(html, collection)) {
      const current = entries.get(card.sourceSlug)
      if (!current || current.sourceCollection === 'shop-all') entries.set(card.sourceSlug, card)
    }
  }

  return [...entries.values()]
}

async function fetchAll(client, table, columns) {
  const { data, error } = await client.from(table).select(columns).order('id')
  if (error) throw error
  return data || []
}

async function ensureImage({ supabase, entityTypeValue, entityId, entry, name }) {
  if (!entry.imageUrl) return 'no-source-image'

  const imageSlug = 'nothingshop-primary'
  const { data: existing, error: lookupError } = await supabase
    .from('images')
    .select('id')
    .eq('related_type', entityTypeValue)
    .eq('related_id', entityId)
    .eq('slug', imageSlug)
    .maybeSingle()
  if (lookupError) throw lookupError

  const row = {
    related_type: entityTypeValue,
    related_id: entityId,
    color_id: null,
    url: entry.imageUrl,
    alt_text: `${name} product image for Pakistan shoppers`,
    title: name.slice(0, 160),
    caption: `${name} image sourced from the live NothingShop.pk catalogue.`,
    file_name: `${entry.sourceSlug}-nothingshop-primary`,
    slug: imageSlug,
    sort_order: 0,
    updated_at: new Date().toISOString(),
  }

  if (existing?.id) {
    const { error } = await supabase.from('images').update(row).eq('id', existing.id)
    if (error) throw error
    return 'updated'
  }

  const { error } = await supabase.from('images').insert(row)
  if (error) throw error
  return 'inserted'
}

async function ensureCategoryRelation({ supabase, categoryIds, categoryKeyValue, entityTypeValue, entityId }) {
  const categoryId = categoryIds.get(categoryKeyValue)
  if (!categoryId) return false

  const { data: existing, error: lookupError } = await supabase
    .from('category_relations')
    .select('id')
    .eq('category_id', categoryId)
    .eq('related_type', entityTypeValue)
    .eq('related_id', entityId)
    .maybeSingle()
  if (lookupError) throw lookupError
  if (existing) return false

  const { error } = await supabase.from('category_relations').insert({
    category_id: categoryId,
    related_type: entityTypeValue,
    related_id: entityId,
  })
  if (error) throw error
  return true
}

async function main() {
  loadEnv()
  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const [catalog, products, mobiles, categories] = await Promise.all([
    fetchCatalog(),
    fetchAll(supabase, 'products', 'id,name,slug,price'),
    fetchAll(supabase, 'mobiles', 'id,name,slug,Price'),
    fetchAll(supabase, 'categories', 'id,name,slug'),
  ])

  if (catalog.length === 0) throw new Error('NothingShop catalogue returned no priced product cards')

  const existingByName = new Map([...products, ...mobiles].map((row) => [normalize(row.name), row]))
  const existingProductBySlug = new Map(products.map((row) => [row.slug, row]))
  const existingMobileBySlug = new Map(mobiles.map((row) => [row.slug, row]))
  const categoryIds = new Map()
  for (const category of categories) {
    const key = normalize(category.slug).replace(/^nothing pakistan /, '')
    if (['audio', 'cases', 'power', 'watches', 'phones'].includes(key)) categoryIds.set(key, category.id)
  }

  const summary = {
    liveEntries: catalog.length,
    insertedProducts: 0,
    insertedMobiles: 0,
    updatedPrices: 0,
    imagesInserted: 0,
    imagesUpdated: 0,
    categoryRelationsAdded: 0,
    missingSourceImages: [],
    processed: [],
  }

  for (const entry of catalog) {
    const type = entityType(entry.name)
    const slug = canonicalSlug(entry.name, entry.sourceSlug, existingByName)
    const existing = existingByName.get(normalize(entry.name)) || (type === 'mobile' ? existingMobileBySlug.get(slug) : existingProductBySlug.get(slug))
    const now = new Date().toISOString()
    let id
    let action

    if (type === 'mobile') {
      const payload = {
        name: entry.name,
        slug,
        Price: entry.price,
        updated_at: now,
      }

      if (existing?.id) {
        const { error } = await supabase.from('mobiles').update(payload).eq('id', existing.id)
        if (error) throw error
        id = existing.id
        action = existing.Price === entry.price ? 'unchanged' : 'updated-mobile'
        if (action === 'updated-mobile') summary.updatedPrices += 1
      } else {
        const { data, error } = await supabase.from('mobiles').insert({
          ...payload,
          description: buildDescription(entry.name, entry.price),
          meta_title: `${entry.name} Price in Pakistan | Nothing Pakistan`.slice(0, 255),
          meta_description: buildMetaDescription(entry.name, entry.price),
          seo_keywords: `${entry.name}, ${entry.name} price in Pakistan, Nothing Pakistan, buy ${entry.name} online`,
          canonical_url: `${SITE_URL}/products/${slug}`,
          schema_json: buildSchema({ name: entry.name, slug, price: entry.price, imageUrl: entry.imageUrl, type }),
          seo_description_long: buildSeoLong(entry.name, entry.price),
          image_alt_text: `${entry.name} product image in Pakistan`,
          piority: 2000 + summary.insertedMobiles,
        }).select('id').single()
        if (error) throw error
        id = data.id
        action = 'inserted-mobile'
        summary.insertedMobiles += 1
      }
    } else {
      const typeValue = productType(entry.name)
      const payload = {
        name: entry.name,
        slug,
        price: entry.price,
        updated_at: now,
      }

      if (existing?.id) {
        const { error } = await supabase.from('products').update({ ...payload, product_type: existing.product_type || typeValue }).eq('id', existing.id)
        if (error) throw error
        id = existing.id
        action = existing.price === entry.price ? 'unchanged' : 'updated-product'
        if (action === 'updated-product') summary.updatedPrices += 1
      } else {
        const { data, error } = await supabase.from('products').insert({
          ...payload,
          description: buildDescription(entry.name, entry.price),
          short_description: `${entry.name} available for Pakistan buyers with live price and order confirmation support.`,
          meta_title: `${entry.name} Price in Pakistan | Nothing Pakistan`.slice(0, 255),
          meta_description: buildMetaDescription(entry.name, entry.price),
          seo_keywords: `${entry.name}, ${entry.name} price in Pakistan, Nothing Pakistan, buy ${entry.name} online`,
          canonical_url: `${SITE_URL}/products/${slug}`,
          schema_json: buildSchema({ name: entry.name, slug, price: entry.price, imageUrl: entry.imageUrl, type }),
          seo_description_long: buildSeoLong(entry.name, entry.price),
          image_alt_text: `${entry.name} product image in Pakistan`,
          stock_quantity: null,
          product_type: typeValue,
        }).select('id').single()
        if (error) throw error
        id = data.id
        action = 'inserted-product'
        summary.insertedProducts += 1
      }
    }

    const imageAction = await ensureImage({ supabase, entityTypeValue: type, entityId: id, entry, name: entry.name })
    if (imageAction === 'inserted') summary.imagesInserted += 1
    if (imageAction === 'updated') summary.imagesUpdated += 1
    if (imageAction === 'no-source-image') summary.missingSourceImages.push(entry.sourceSlug)

    if (await ensureCategoryRelation({
      supabase,
      categoryIds,
      categoryKeyValue: categoryKey(entry.name, type),
      entityTypeValue: type,
      entityId: id,
    })) summary.categoryRelationsAdded += 1

    summary.processed.push({ name: entry.name, slug, type, price: entry.price, action, imageAction })
  }

  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error(error?.stack || error?.message || error)
  process.exitCode = 1
})
