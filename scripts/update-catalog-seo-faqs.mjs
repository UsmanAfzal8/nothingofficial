import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const SITE_URL = 'https://www.nothingpakistan.pk'
const BRAND = 'Nothing Pakistan'
const STORE_LABEL = 'Nothing Official Store Pakistan'
const LEGAL_NAME = 'NOTHING PAKISTAN (SMC-PRIVATE) LIMITED'
const CUIN = 'CUIN 0337422'
const PAGE_SIZE = 1000

function loadEnv() {
  for (const envFile of ['.env.local', 'env']) {
    const fullPath = path.join(process.cwd(), envFile)
    if (!existsSync(fullPath)) continue

    for (const line of readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue

      const separatorIndex = trimmed.indexOf('=')
      const key = trimmed.slice(0, separatorIndex).trim()
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '')
      process.env[key] ||= value
    }
  }
}

function normalizeText(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function compact(value, maxLength = 158) {
  const normalized = normalizeText(value)
  if (normalized.length <= maxLength) return normalized

  const clipped = normalized.slice(0, maxLength - 1)
  const lastSpace = clipped.lastIndexOf(' ')

  return `${clipped.slice(0, lastSpace > 80 ? lastSpace : clipped.length).trim()}.`
}

function formatPrice(value) {
  const price = Number(value)
  if (!Number.isFinite(price)) return null

  return `Rs ${price.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
}

function stripNothingPrefix(name) {
  return normalizeText(name).replace(/^nothing\s+pakistan\s+/i, '').trim()
}

function ensureBrandName(name, fallbackBrand = 'Nothing') {
  const cleaned = stripNothingPrefix(name)

  if (/^(nothing|cmf)\b/i.test(cleaned)) return cleaned
  if (/^phone\b/i.test(cleaned)) return `Nothing ${cleaned}`
  if (/^(ear|headphone)\b/i.test(cleaned)) return `Nothing ${cleaned}`

  return `${fallbackBrand} ${cleaned}`
}

function sourceText(row) {
  return `${row.name || ''} ${row.slug || ''} ${row.product_type || ''}`.toLowerCase()
}

function classifyProduct(row) {
  const source = sourceText(row)

  if (row.product_type === 'charger' || /\b(charger|power|gan|adapter)\b/.test(source)) return 'charger'
  if (row.product_type === 'data_cable' || /\b(cable|usb-c|type-c)\b/.test(source)) return 'cable'
  if (row.product_type === 'earbuds' || /\b(ear|buds|neckband)\b/.test(source)) return 'audio'
  if (/\bheadphone\b/.test(source)) return 'headphone'
  if (/\bwatch\b/.test(source)) return 'watch'
  if (row.product_type === 'covers' || /\b(cover|case|polo)\b/.test(source)) return 'cover'
  if (row.product_type === 'protector' || row.product_type === 'screen_protector' || /\b(protector|glass|sheet|privacy|uv|9d)\b/.test(source)) return 'protector'

  return 'accessory'
}

function productTypeLabel(type) {
  return {
    charger: 'charger',
    cable: 'USB-C cable',
    audio: 'wireless audio product',
    headphone: 'headphones',
    watch: 'smartwatch',
    cover: 'phone cover',
    protector: 'screen protector',
    accessory: 'accessory',
  }[type]
}

function inferCompatibleModel(row) {
  const source = `${row.name || ''} ${row.slug || ''}`
  const patterns = [
    ['CMF Phone 2 Pro', /\bcmf[-\s]*phone[-\s]*2[-\s]*pro\b/i],
    ['CMF Phone 1', /\bcmf[-\s]*phone[-\s]*1\b/i],
    ['Phone (4a) Pro', /\b(?:nothing[-\s]*)?(?:phone[-\s]*)?4a[-\s]*pro\b/i],
    ['Phone (4a)', /\b(?:nothing[-\s]*)?(?:phone[-\s]*)?4a(?![-\s]*pro)\b/i],
    ['Phone (3a) Pro', /\b(?:nothing[-\s]*)?(?:phone[-\s]*)?3a[-\s]*pro\b/i],
    ['Phone (3a) Lite', /\b(?:nothing[-\s]*)?(?:phone[-\s]*)?3a[-\s]*lite\b/i],
    ['Phone (3a)', /\b(?:nothing[-\s]*)?(?:phone[-\s]*)?3a(?![-\s]*(pro|lite))\b/i],
    ['Phone (2a) Plus', /\b(?:nothing[-\s]*)?(?:phone[-\s]*)?2a[-\s]*plus\b/i],
    ['Phone (2a)', /\b(?:nothing[-\s]*)?(?:phone[-\s]*)?2a(?![-\s]*plus)\b/i],
    ['Phone (3)', /\b(?:nothing[-\s]*phone|phone)[-\s]*(?:\(?3\)?)(?![-\s]*a)\b/i],
    ['Phone (2)', /\b(?:nothing[-\s]*phone|phone)[-\s]*(?:\(?2\)?)(?![-\s]*a)\b/i],
    ['Phone (1)', /\b(?:nothing[-\s]*phone|phone)[-\s]*(?:\(?1\)?)\b/i],
  ]

  return patterns.find(([, pattern]) => pattern.test(source))?.[0] ?? null
}

function uniqueTags(values) {
  const seen = new Set()
  const output = []

  for (const value of values) {
    const tag = normalizeText(value)
    if (!tag) continue

    const key = tag.toLowerCase()
    if (seen.has(key)) continue

    seen.add(key)
    output.push(tag)
    if (output.length >= 8) break
  }

  return output.join(', ')
}

function splitTags(value) {
  return String(value || '')
    .split(',')
    .map((tag) => normalizeText(tag))
    .filter(Boolean)
}

function buildProductSeo(row) {
  const isCmfProduct = /\bcmf\b/i.test(`${row.name || ''} ${row.slug || ''}`)
  const name = ensureBrandName(row.name, isCmfProduct ? 'CMF' : 'Nothing')
  const shortName = stripNothingPrefix(row.name)
  const price = formatPrice(row.price)
  const type = classifyProduct(row)
  const compatibleModel = inferCompatibleModel(row)
  const typeLabel = productTypeLabel(type)
  const canonicalUrl = `${SITE_URL}/products/${row.slug}`
  const pricePhrase = price ? ` at ${price}` : ''
  const compatibilityPhrase = compatibleModel && ['cover', 'protector'].includes(type) ? ` for ${compatibleModel}` : ''

  const metaTitle = compact(`${name} Price in Pakistan | Official Store`, 68)
  const metaDescription = compact(
    `Buy ${name}${compatibilityPhrase} in Pakistan${pricePhrase} from ${STORE_LABEL}. Check original stock, compatibility, delivery, warranty and WhatsApp orders.`,
    165,
  )
  const seoKeywords = uniqueTags([
    `${name} price in Pakistan`,
    `buy ${name} Pakistan`,
    `${name} original Pakistan`,
    `${name} official store Pakistan`,
    compatibleModel ? `${name} ${compatibleModel}` : null,
    `${typeLabel} Pakistan`,
    `${name} ${BRAND}`,
    STORE_LABEL,
  ])

  return {
    metaTitle,
    metaDescription,
    seoKeywords,
    canonicalUrl,
    imageAltText: compact(`${name}${price ? ` - ${price}` : ''} - ${STORE_LABEL}`, 120),
    seoDescriptionLong: `${metaDescription} ${name} is listed for Pakistan buyers who want a clear product page with PKR pricing, safe order support, and direct store verification through ${LEGAL_NAME}.`,
  }
}

function buildMobileSeo(row) {
  const name = ensureBrandName(row.name)
  const price = formatPrice(row.Price)
  const canonicalUrl = `${SITE_URL}/products/${row.slug}`
  const pricePhrase = price ? ` is ${price}` : ' is available on request'
  const metaTitle = compact(`${name} Price in Pakistan | Official Store`, 68)
  const metaDescription = compact(
    `${name} price in Pakistan${pricePhrase}. Compare PTA status, specs, stock, colours, delivery, warranty and accessories from ${STORE_LABEL}.`,
    165,
  )
  const seoKeywords = uniqueTags([
    `${name} price in Pakistan`,
    `${name} PTA approved Pakistan`,
    `${name} non PTA price Pakistan`,
    `buy ${name} Pakistan`,
    `${name} specs Pakistan`,
    `${name} accessories Pakistan`,
    `${name} official store Pakistan`,
    STORE_LABEL,
  ])

  return {
    metaTitle,
    metaDescription,
    seoKeywords,
    canonicalUrl,
    imageAltText: compact(`${name}${price ? ` - ${price}` : ''} - ${STORE_LABEL}`, 120),
    seoDescriptionLong: `${metaDescription} ${name} is presented for Pakistan buyers with phone-specific buying context, linked accessories, support routes, and company verification through ${LEGAL_NAME}.`,
  }
}

function buildCategorySeo(row, itemCount) {
  const name = stripNothingPrefix(row.name)
  const canonicalUrl = `${SITE_URL}/collections/${row.slug}`
  const countPhrase = itemCount > 0 ? `${itemCount}+ products` : 'current products'
  const metaTitle = compact(`${name} Price in Pakistan | Official Store`, 68)
  const metaDescription = compact(
    `Shop ${name} in Pakistan from ${STORE_LABEL}. Browse ${countPhrase} with PKR prices, original stock, compatibility guidance and WhatsApp ordering.`,
    165,
  )
  const seoKeywords = uniqueTags([
    `${name} price in Pakistan`,
    `buy ${name} Pakistan`,
    `${name} official store Pakistan`,
    `Nothing ${name} Pakistan`,
    `CMF ${name} Pakistan`,
    `${name} original Pakistan`,
    STORE_LABEL,
    BRAND,
  ])

  return {
    metaTitle,
    metaDescription,
    seoKeywords,
    canonicalUrl,
    seoDescriptionLong: `${metaDescription} This collection helps Pakistan shoppers move from comparison to product pages, support routes, company verification, and order confirmation on ${SITE_URL}.`,
  }
}

function updateSchemaDescription(schemaJson, canonicalUrl, description, name, options = {}) {
  if (!schemaJson || typeof schemaJson !== 'object' || Array.isArray(schemaJson)) return schemaJson

  const schema = JSON.parse(JSON.stringify(schemaJson))
  schema.name = name
  schema.url = canonicalUrl
  schema.description = description
  if (options.keywords) schema.keywords = splitTags(options.keywords)

  if (schema.offers && typeof schema.offers === 'object' && !Array.isArray(schema.offers)) {
    schema.offers.url = canonicalUrl
    const price = Number(options.price)
    if (Number.isFinite(price)) schema.offers.price = price
    schema.offers.priceCurrency ||= 'PKR'
    schema.offers.seller ||= {
      '@type': 'Organization',
      name: BRAND,
      legalName: LEGAL_NAME,
      identifier: CUIN,
      url: SITE_URL,
    }
  }

  return schema
}

function productHighlight(row, fallback) {
  const text = normalizeText(row.short_description || row.description || row.meta_description || '')
  return text ? compact(text, 210) : fallback
}

function buildProductFaqs(row) {
  const isCmfProduct = /\bcmf\b/i.test(`${row.name || ''} ${row.slug || ''}`)
  const name = ensureBrandName(row.name, isCmfProduct ? 'CMF' : 'Nothing')
  const price = formatPrice(row.price)
  const type = classifyProduct(row)
  const label = productTypeLabel(type)
  const compatibleModel = inferCompatibleModel(row)
  const compatibilityAnswer = compatibleModel
    ? `${name} is intended for ${compatibleModel}. Confirm your exact model, colour, and variant with ${BRAND} support before ordering.`
    : `${name} compatibility depends on the device and product type. Share your exact phone or device model with ${BRAND} support before ordering.`
  const priceAnswer = price
    ? `${name} price in Pakistan is ${price} on ${BRAND}. The final order total can change if delivery charges, stock changes, or payment terms apply.`
    : `${name} price in Pakistan is shown on the product page when available. Contact ${BRAND} on WhatsApp for the latest price and stock.`
  const highlight = productHighlight(row, `${name} is a ${label} listed for Pakistan buyers who want original Nothing or CMF products with local ordering support.`)

  return [
    [`What is the price of ${name} in Pakistan?`, priceAnswer],
    [`Where can I buy original ${name} in Pakistan?`, `You can buy ${name} from ${STORE_LABEL} through the product page, order form, or WhatsApp support.`],
    [`Is ${name} original?`, `${name} is listed in the ${BRAND} catalog. Confirm current stock, packaging, colour or variant, and order details before payment.`],
    [`What is ${name} used for?`, `${name} is a ${label} for buyers who want compatible Nothing or CMF products with local Pakistan ordering support.`],
    [`Which device is ${name} compatible with?`, compatibilityAnswer],
    [`Does ${name} work with Nothing and CMF devices?`, `${name} may work with supported Nothing or CMF devices depending on the product type. Always confirm your exact model before checkout.`],
    [`What are the key highlights of ${name}?`, highlight],
    [`Is ${name} available for delivery in Pakistan?`, `Yes, ${name} can be delivered to supported Pakistani cities, subject to live stock, courier coverage, and order confirmation.`],
    [`Can I order ${name} in Karachi, Lahore, or Islamabad?`, `${name} can usually be ordered for major cities such as Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, and Peshawar where courier service is available.`],
    [`Does ${name} support cash on delivery?`, `Cash on delivery for ${name} may be available in supported areas. ${BRAND} confirms COD eligibility during order processing.`],
    [`Can I order ${name} on WhatsApp?`, `Yes. Use WhatsApp support to confirm ${name} price, stock, compatibility, delivery city, payment method, and order timing.`],
    [`How do I confirm stock for ${name}?`, `Open the product page or contact WhatsApp support to confirm live stock for ${name} before finalizing the order.`],
    [`Does ${name} come with warranty support?`, `Warranty or replacement support for ${name} depends on the confirmed order terms and product condition. Ask support for current coverage before purchase.`],
    [`Can I return or exchange ${name}?`, `If ${name} arrives damaged, incorrect, or defective, contact support quickly with order details, photos, and packaging proof so the case can be reviewed.`],
    [`Does the ${name} price include delivery?`, `The visible price is the product price. Delivery charges, if any, are confirmed during checkout or WhatsApp order confirmation.`],
    [`What should I check before ordering ${name}?`, `Before ordering ${name}, confirm the latest price, stock, exact compatibility, delivery city, payment method, and return support details.`],
    [`Are images of ${name} shown on the product page?`, `Yes. The ${name} page shows product images when available so buyers can review design, colour, packaging style, or product type before ordering.`],
    [`Is ${name} good value in Pakistan?`, `${name} is useful for shoppers who want a ${label} with visible PKR pricing, original-store context, and direct ordering support in Pakistan.`],
    [`Why should I buy ${name} from ${BRAND}?`, `${BRAND} keeps ${name} on a local product page with updated pricing, company verification, support links, delivery guidance, and WhatsApp help.`],
    [`How often is the ${name} price updated?`, `${name} pricing is managed from the live Supabase catalog, so updates can appear on the website without rebuilding local product files.`],
  ]
}

function buildMobileFaqs(row) {
  const name = ensureBrandName(row.name)
  const price = formatPrice(row.Price)
  const priceAnswer = price
    ? `${name} price in Pakistan is ${price} on ${BRAND}. Confirm current stock, PTA or non-PTA context, colour, and final order total before checkout.`
    : `${name} price in Pakistan is shown on the phone page when available. Contact ${BRAND} on WhatsApp for the latest price and stock.`
  const highlight = productHighlight(row, `${name} is listed for Pakistan buyers who want Nothing or CMF phone information, accessories, ordering support, and delivery guidance.`)

  return [
    [`What is the price of ${name} in Pakistan?`, priceAnswer],
    [`Where can I buy ${name} in Pakistan?`, `You can order ${name} from ${STORE_LABEL} through the phone page, order form, or WhatsApp support, subject to live stock.`],
    [`Is ${name} available on ${BRAND}?`, `${name} is listed on ${BRAND}. Stock, colour, storage variant, and order timing should be confirmed before checkout.`],
    [`Is ${name} PTA approved in Pakistan?`, `PTA approval status for ${name} should be confirmed before purchase because PTA and non-PTA availability can vary by stock batch.`],
    [`What is the non-PTA price of ${name}?`, `Non-PTA pricing for ${name}, if available, should be confirmed with WhatsApp support because phone stock and tax context can change.`],
    [`Does ${name} work with Jazz, Zong, Ufone, and Telenor?`, `${name} is an Android smartphone, but network performance depends on the exact model, variant, supported bands, SIM, and PTA status. Confirm the variant before ordering.`],
    [`Does ${name} support 5G in Pakistan?`, `5G support for ${name} depends on the exact model variant and local network availability. Ask support to confirm the listed variant before purchase.`],
    [`What are the key highlights of ${name}?`, highlight],
    [`Which accessories are available for ${name}?`, `Compatible accessories for ${name} can include chargers, cables, protectors, covers, earbuds, or other linked products when available in the catalog.`],
    [`Does ${name} include a charger in the box?`, `Box contents can vary by stock and region. Confirm whether ${name} includes a charger or whether you should add a compatible Nothing or CMF charger before ordering.`],
    [`Can I buy a cover or protector for ${name}?`, `If linked accessories are available, the ${name} page can show compatible covers, protectors, chargers, and earbuds. Confirm exact model fit before ordering.`],
    [`Can I buy ${name} on cash on delivery?`, `Cash on delivery for ${name} may be available in supported areas. ${BRAND} confirms COD eligibility during order processing.`],
    [`Does ${BRAND} deliver ${name} across Pakistan?`, `${BRAND} can support delivery for ${name} to many Pakistani cities, subject to courier coverage, stock, address confirmation, and payment terms.`],
    [`How long does delivery take for ${name}?`, `The product page shows an estimated delivery window for ${name}. Actual timing depends on city, confirmation time, courier service, and stock availability.`],
    [`Can I contact WhatsApp for ${name}?`, `Yes. Use WhatsApp support to confirm ${name} price, stock, PTA status, colour, storage, accessories, delivery, and payment details.`],
    [`Does ${name} come with warranty or support?`, `Warranty and after-sales support for ${name} depend on confirmed order terms and stock source. Ask support for current coverage before purchase.`],
    [`Can I return or exchange ${name}?`, `If ${name} arrives damaged, incorrect, or defective, contact support quickly with order information, photos, and packaging proof for review.`],
    [`Are colors or variants available for ${name}?`, `Available colours, RAM, storage, and variants for ${name} depend on current stock. Confirm the exact option before placing an order.`],
    [`Why should I buy ${name} from ${BRAND}?`, `${BRAND} gives ${name} a local product page with PKR pricing, linked accessories, support routes, company verification, and WhatsApp ordering help.`],
    [`How often is the ${name} price updated?`, `${name} pricing is managed from the live Supabase catalog, so updates can appear on the website without rebuilding local product files.`],
  ]
}

async function fetchAllRows(supabase, table, select) {
  const rows = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase.from(table).select(select).order('id', { ascending: true }).range(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(`${table}: ${error.message}`)

    rows.push(...(data || []))
    if ((data || []).length < PAGE_SIZE) break
  }

  return rows
}

async function replaceFaqs(supabase, relatedType, relatedId, faqs, apply) {
  if (!apply) return

  const { error: deleteError } = await supabase.from('faqs').delete().eq('related_type', relatedType).eq('related_id', relatedId)
  if (deleteError) throw new Error(`delete faqs ${relatedType}:${relatedId}: ${deleteError.message}`)

  const rows = faqs.map(([question, answer]) => ({
    related_type: relatedType,
    related_id: relatedId,
    question,
    answer,
    updated_at: new Date().toISOString(),
  }))
  const { error: insertError } = await supabase.from('faqs').insert(rows)
  if (insertError) throw new Error(`insert faqs ${relatedType}:${relatedId}: ${insertError.message}`)
}

async function updateRow(supabase, table, id, updates, apply) {
  if (!apply) return

  const { error } = await supabase.from(table).update(updates).eq('id', id)
  if (error) throw new Error(`${table} id=${id}: ${error.message}`)
}

async function categorySeoColumnsAvailable(supabase) {
  const { error } = await supabase
    .from('categories')
    .select('id, seo_keywords, canonical_url, schema_json, seo_description_long')
    .limit(1)

  return !error
}

async function main() {
  loadEnv()

  const apply = process.argv.includes('--apply')
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const categorySeoSupported = await categorySeoColumnsAvailable(supabase)
  const categorySelect = categorySeoSupported
    ? 'id,name,slug,meta_title,meta_description,parent_id,seo_keywords,canonical_url,schema_json,seo_description_long'
    : 'id,name,slug,meta_title,meta_description,parent_id'

  const [products, mobiles, categories, categoryRelations] = await Promise.all([
    fetchAllRows(supabase, 'products', 'id,name,slug,product_type,price,description,short_description,meta_title,meta_description,seo_keywords,canonical_url,schema_json,seo_description_long,image_alt_text'),
    fetchAllRows(supabase, 'mobiles', 'id,name,slug,Price,description,meta_title,meta_description,seo_keywords,canonical_url,schema_json,seo_description_long,image_alt_text'),
    fetchAllRows(supabase, 'categories', categorySelect),
    fetchAllRows(supabase, 'category_relations', 'id,category_id,related_type,related_id'),
  ])

  const categoryCounts = new Map()
  for (const relation of categoryRelations) {
    categoryCounts.set(relation.category_id, (categoryCounts.get(relation.category_id) || 0) + 1)
  }

  const report = {
    mode: apply ? 'apply' : 'dry-run',
    productsUpdated: 0,
    mobilesUpdated: 0,
    categoriesUpdated: 0,
    productFaqSetsReplaced: 0,
    mobileFaqSetsReplaced: 0,
    faqRowsWritten: 0,
    categoryTagsUpdated: 0,
    categoryTagsSkippedMissingColumns: categorySeoSupported ? 0 : categories.length,
    totalProducts: products.length,
    totalMobiles: mobiles.length,
    totalCategories: categories.length,
  }

  for (const product of products) {
    const seo = buildProductSeo(product)
    const updates = {
      meta_title: seo.metaTitle,
      meta_description: seo.metaDescription,
      seo_keywords: seo.seoKeywords,
      canonical_url: seo.canonicalUrl,
      seo_description_long: seo.seoDescriptionLong,
      image_alt_text: seo.imageAltText,
      schema_json: updateSchemaDescription(product.schema_json, seo.canonicalUrl, seo.metaDescription, ensureBrandName(product.name), {
        keywords: seo.seoKeywords,
        price: product.price,
      }),
      updated_at: new Date().toISOString(),
    }

    await updateRow(supabase, 'products', product.id, updates, apply)
    await replaceFaqs(supabase, 'product', product.id, buildProductFaqs(product), apply)

    report.productsUpdated += 1
    report.productFaqSetsReplaced += 1
    report.faqRowsWritten += 20
  }

  for (const mobile of mobiles) {
    const seo = buildMobileSeo(mobile)
    const updates = {
      meta_title: seo.metaTitle,
      meta_description: seo.metaDescription,
      seo_keywords: seo.seoKeywords,
      canonical_url: seo.canonicalUrl,
      seo_description_long: seo.seoDescriptionLong,
      image_alt_text: seo.imageAltText,
      schema_json: updateSchemaDescription(mobile.schema_json, seo.canonicalUrl, seo.metaDescription, ensureBrandName(mobile.name), {
        keywords: seo.seoKeywords,
        price: mobile.Price,
      }),
      updated_at: new Date().toISOString(),
    }

    await updateRow(supabase, 'mobiles', mobile.id, updates, apply)
    await replaceFaqs(supabase, 'mobile', mobile.id, buildMobileFaqs(mobile), apply)

    report.mobilesUpdated += 1
    report.mobileFaqSetsReplaced += 1
    report.faqRowsWritten += 20
  }

  for (const category of categories) {
    const seo = buildCategorySeo(category, categoryCounts.get(category.id) || 0)
    const updates = {
      meta_title: seo.metaTitle,
      meta_description: seo.metaDescription,
      updated_at: new Date().toISOString(),
    }

    if (categorySeoSupported) {
      updates.seo_keywords = seo.seoKeywords
      updates.canonical_url = seo.canonicalUrl
      updates.seo_description_long = seo.seoDescriptionLong
      updates.schema_json = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: seo.metaTitle,
        description: seo.metaDescription,
        url: seo.canonicalUrl,
        publisher: {
          '@type': 'Organization',
          name: BRAND,
          legalName: LEGAL_NAME,
          identifier: CUIN,
          url: SITE_URL,
        },
      }
      report.categoryTagsUpdated += 1
    }

    await updateRow(supabase, 'categories', category.id, updates, apply)
    report.categoriesUpdated += 1
  }

  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
