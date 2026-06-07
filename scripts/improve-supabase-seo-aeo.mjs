import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const projectRoot = process.cwd()
const siteUrl = 'https://www.cmfbynothing.pk'

function loadEnv() {
  for (const envFile of ['.env.local', 'env']) {
    const fullPath = path.join(projectRoot, envFile)
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

function formatPrice(value) {
  const price = Number(value)
  if (!Number.isFinite(price)) return null
  return `PKR ${price.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
}

function isProtector(row) {
  return /(protector|privacy|sheet|glass)/i.test(`${row.name} ${row.slug} ${row.product_type ?? ''}`)
}

function isCover(row) {
  return /\bcover\b/i.test(`${row.name} ${row.slug} ${row.product_type ?? ''}`)
}

function isChargingProduct(row) {
  return /(charger|power|gan|cable)/i.test(`${row.name} ${row.slug} ${row.product_type ?? ''}`)
}

function finalizeDescription(value) {
  if (value.length >= 120) return value
  return `${value.replace(/[.!?]+$/, '')} Shop with Nothing Pakistan.`
}

function buildProductDescription(row) {
  const price = formatPrice(row.price)
  const priceSentence = price ? `Price: ${price}.` : 'Check the current price.'

  if (isProtector(row)) {
    return finalizeDescription(`Buy ${row.name} in Pakistan. ${priceSentence} Check compatibility, protection details, delivery, and WhatsApp ordering support.`)
  }

  if (isCover(row)) {
    return finalizeDescription(`Buy ${row.name} in Pakistan. ${priceSentence} Check device fit, stock, delivery, and WhatsApp ordering support.`)
  }

  if (isChargingProduct(row)) {
    return finalizeDescription(`Buy ${row.name} in Pakistan. ${priceSentence} Check compatibility, product details, stock, delivery, and ordering support.`)
  }

  return finalizeDescription(`Buy ${row.name} in Pakistan. ${priceSentence} Check product details, stock, delivery, and WhatsApp ordering support.`)
}

function buildMobileDescription(row) {
  const price = formatPrice(row.Price)
  const pricePhrase = price ? `Price: ${price}.` : 'Check the current price.'
  return `Check ${row.name} price in Pakistan. ${pricePhrase} Review PTA status, specifications, stock, delivery, and ordering support.`
}

function buildCategoryDescription(row) {
  return `Shop ${row.name} in Pakistan with current prices, product details, compatibility guidance, delivery options, and ordering support from Nothing Pakistan.`
}

function buildShortTitle(row) {
  if (row.meta_title.length <= 60) return row.meta_title

  const candidate = `${row.name} Price in Pakistan | Nothing`
  if (candidate.length <= 60) return candidate

  return `${row.name} Pakistan | Nothing`.slice(0, 60).trim()
}

function updateSchemaDescription(schemaJson, canonicalUrl, description) {
  if (!schemaJson || typeof schemaJson !== 'object' || Array.isArray(schemaJson)) {
    return schemaJson
  }

  const schema = structuredClone(schemaJson)
  schema.url = canonicalUrl
  schema.description = description

  if (schema.offers && typeof schema.offers === 'object' && !Array.isArray(schema.offers)) {
    schema.offers.url = canonicalUrl
  }

  return schema
}

function faqRowsForProduct(product) {
  const price = formatPrice(product.price)
  const priceAnswer = price
    ? `${product.name} is currently listed at ${price}. Confirm the latest stock and final order total before checkout.`
    : `Check the ${product.name} product page or WhatsApp support for the current listed price and stock.`

  const typeAnswer = product.slug.includes('jelly-sheet')
    ? `${product.name} is a model-specific protective sheet for Phone (4a) Pro. Confirm the fit and installation method before ordering.`
    : product.slug.includes('uv-protector')
      ? `${product.name} is a UV-style screen protector made for Phone (4a) Pro. Confirm installation requirements before ordering.`
      : `${product.name} is a model-specific screen protector made for Phone (4a) Pro. Confirm the exact protector type before ordering.`

  return [
    {
      question: `What is the price of ${product.name} in Pakistan?`,
      answer: priceAnswer,
    },
    {
      question: `Which phone is ${product.name} compatible with?`,
      answer: `${product.name} is made for Phone (4a) Pro. Confirm your exact phone model before placing an order.`,
    },
    {
      question: `What type of protection does ${product.name} provide?`,
      answer: typeAnswer,
    },
    {
      question: `Does ${product.name} require professional installation?`,
      answer: `Installation requirements depend on the protector type. Ask support for current installation guidance before applying ${product.name}.`,
    },
    {
      question: `Is ${product.name} available for delivery in Pakistan?`,
      answer: `Yes, ${product.name} can be ordered for delivery in supported Pakistani cities, subject to current stock and courier coverage.`,
    },
    {
      question: `How can I confirm stock for ${product.name}?`,
      answer: `Use the product page or WhatsApp support to confirm live stock, current price, compatibility, and delivery details before ordering.`,
    },
  ]
}

async function run() {
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

  const [
    { data: products, error: productsError },
    { data: mobiles, error: mobilesError },
    { data: categories, error: categoriesError },
    { data: faqs, error: faqsError },
  ] = await Promise.all([
    supabase.from('products').select('*').order('id'),
    supabase.from('mobiles').select('*').order('id'),
    supabase.from('categories').select('*').order('id'),
    supabase.from('faqs').select('id,related_type,related_id,question').order('id'),
  ])

  if (productsError) throw productsError
  if (mobilesError) throw mobilesError
  if (categoriesError) throw categoriesError
  if (faqsError) throw faqsError

  const report = {
    mode: apply ? 'apply' : 'dry-run',
    productsUpdated: 0,
    mobilesUpdated: 0,
    categoriesUpdated: 0,
    titlesShortened: 0,
    schemaDescriptionsUpdated: 0,
    faqsInserted: 0,
  }

  for (const product of products ?? []) {
    const canonicalUrl = `${siteUrl}/products/${product.slug}`
    const metaDescription = buildProductDescription(product)
    const metaTitle = buildShortTitle(product)
    const schemaJson = updateSchemaDescription(product.schema_json, canonicalUrl, metaDescription)
    const updates = {
      meta_description: metaDescription,
      canonical_url: canonicalUrl,
      schema_json: schemaJson,
      updated_at: new Date().toISOString(),
    }

    if (metaTitle !== product.meta_title) {
      updates.meta_title = metaTitle
      report.titlesShortened += 1
    }

    if (apply) {
      const { error } = await supabase.from('products').update(updates).eq('id', product.id)
      if (error) throw new Error(`products id=${product.id}: ${error.message}`)
    }

    report.productsUpdated += 1
    report.schemaDescriptionsUpdated += 1
  }

  for (const mobile of mobiles ?? []) {
    const canonicalUrl = `${siteUrl}/products/${mobile.slug}`
    const metaDescription = buildMobileDescription(mobile)
    const metaTitle = buildShortTitle(mobile)
    const schemaJson = updateSchemaDescription(mobile.schema_json, canonicalUrl, metaDescription)
    const updates = {
      meta_description: metaDescription,
      canonical_url: canonicalUrl,
      schema_json: schemaJson,
      updated_at: new Date().toISOString(),
    }

    if (metaTitle !== mobile.meta_title) {
      updates.meta_title = metaTitle
      report.titlesShortened += 1
    }

    if (apply) {
      const { error } = await supabase.from('mobiles').update(updates).eq('id', mobile.id)
      if (error) throw new Error(`mobiles id=${mobile.id}: ${error.message}`)
    }

    report.mobilesUpdated += 1
    report.schemaDescriptionsUpdated += 1
  }

  for (const category of categories ?? []) {
    const updates = {
      meta_description: buildCategoryDescription(category),
      updated_at: new Date().toISOString(),
    }

    if (apply) {
      const { error } = await supabase.from('categories').update(updates).eq('id', category.id)
      if (error) throw new Error(`categories id=${category.id}: ${error.message}`)
    }

    report.categoriesUpdated += 1
  }

  const faqProductSlugs = new Set([
    'nothing-pakistan-phone-4a-pro-9d-protector',
    'nothing-pakistan-phone-4a-pro-jelly-sheet',
    'nothing-pakistan-phone-4a-pro-uv-protector',
  ])
  const existingFaqKeys = new Set(
    (faqs ?? []).map((faq) => `${faq.related_type}:${faq.related_id}:${faq.question.trim().toLowerCase()}`),
  )

  for (const product of (products ?? []).filter((row) => faqProductSlugs.has(row.slug))) {
    for (const faq of faqRowsForProduct(product)) {
      const key = `product:${product.id}:${faq.question.trim().toLowerCase()}`
      if (existingFaqKeys.has(key)) continue

      if (apply) {
        const { error } = await supabase.from('faqs').insert({
          related_type: 'product',
          related_id: product.id,
          question: faq.question,
          answer: faq.answer,
          updated_at: new Date().toISOString(),
        })
        if (error) throw new Error(`faqs product id=${product.id}: ${error.message}`)
      }

      existingFaqKeys.add(key)
      report.faqsInserted += 1
    }
  }

  console.log(JSON.stringify(report, null, 2))
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
