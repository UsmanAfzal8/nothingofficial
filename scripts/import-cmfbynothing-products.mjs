import { createClient } from '@supabase/supabase-js'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { extname, join, resolve } from 'node:path'

const ROOT = process.cwd()
const SITE_URL = 'https://www.nothingpakistan.pk'
const ENV_FILES = ['.env.local', 'env']
const MISSING_JSON_PATH = resolve(ROOT, 'database', 'cmfbynothing-missing-products.json')
const DOWNLOADED_IMAGES_DIR = resolve(ROOT, 'output image', 'cmfbynothing-missing-products')
const LOCAL_PRODUCTS_PATH = resolve(ROOT, 'database', 'prodcuts.json')
const REPORT_DIR = resolve(ROOT, 'seo-output')
const REPORT_PATH = resolve(REPORT_DIR, 'cmfbynothing-import-report.json')

function loadEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8')
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
      const [key, ...valueParts] = trimmed.split('=')
      const value = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '')
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  } catch {
    // Optional local env file.
  }
}

for (const envFile of ENV_FILES) {
  loadEnvFile(resolve(ROOT, envFile))
}

const targetSupabaseUrl = process.env.NOTHING_SUPABASE_URL
const targetSupabaseKey =
  process.env.NOTHING_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NOTHING_SUPABASE_ANON_KEY
const bunnyZone = process.env.BUNNY_STORAGE_ZONE_NAME
const bunnyAccessKey = process.env.BUNNY_ACCESS_KEY
const bunnyCdnHostname = process.env.BUNNY_CDN_HOSTNAME
const bunnyRegion = process.env.BUNNY_STORAGE_REGION || 'de'

if (!targetSupabaseUrl || !targetSupabaseKey) {
  console.error('Missing NOTHING_SUPABASE_URL or NOTHING_SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

if (!bunnyZone || !bunnyAccessKey || !bunnyCdnHostname) {
  console.error('Missing Bunny CDN credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(targetSupabaseUrl, targetSupabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const CATEGORY_SLUGS = {
  accessories: 'accessories',
  audio: 'audio',
  watches: 'watches',
  cmf: 'cmf',
  chargers: 'chargers',
  cables: 'cables',
  phoneCases: 'phone-cases',
  phoneProtectors: 'phone-protectors',
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function trimText(value, maxLength) {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  const clipped = normalized.slice(0, maxLength - 1)
  const lastSpace = clipped.lastIndexOf(' ')
  const base = lastSpace > 80 ? clipped.slice(0, lastSpace) : clipped
  return `${base.trim()}.`
}

function formatPrice(price) {
  if (typeof price !== 'number' || Number.isNaN(price)) return null
  return `Rs ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(price)}`
}

function uniqueStrings(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))]
}

function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase()
  if (ext === '.webp') return 'image/webp'
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.gif') return 'image/gif'
  return 'application/octet-stream'
}

function getBunnyStorageBaseUrl() {
  return bunnyRegion.toLowerCase() === 'de'
    ? 'https://storage.bunnycdn.com'
    : `https://${bunnyRegion}.storage.bunnycdn.com`
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function listDownloadedFiles(sourceSlug) {
  const sourceDir = join(DOWNLOADED_IMAGES_DIR, sourceSlug)
  if (!existsSync(sourceDir)) return []

  return readdirSync(sourceDir)
    .map((name) => join(sourceDir, name))
    .filter((filePath) => statSync(filePath).isFile())
    .sort((left, right) => left.localeCompare(right))
}

function buildMobileAliases(mobile) {
  const aliases = new Set()
  const add = (value) => {
    const normalized = normalizeText(value)
    if (normalized) aliases.add(normalized)
  }

  add(mobile.name)
  add(mobile.slug)
  add(mobile.slug.replace(/-/g, ' '))

  if (/^phone\s*\(/i.test(mobile.name)) {
    add(`Nothing ${mobile.name}`)
  }

  if (/^nothing\s+/i.test(mobile.name)) {
    add(mobile.name.replace(/^nothing\s+/i, ''))
  }

  return [...aliases].sort((left, right) => right.length - left.length)
}

function detectVariant(item) {
  const haystack = `${item.name} ${item.slug}`.toLowerCase()

  if (/\bcase\b|\bcover\b/.test(haystack)) return 'cover'
  if (/\bjelly\s+sheet\b/.test(haystack)) return 'jelly'
  if (/\buv\b/.test(haystack)) return 'uv'
  if (/\b9d\b|\bglass\b|\bprotector\b/.test(haystack)) return 'protector'

  return null
}

function isPrivacySheetItem(item) {
  return /\bprivacy\b|\bprivacy\s+sheet\b/.test(`${item.name} ${item.slug}`.toLowerCase())
}

function determineProductKind(item, variant) {
  const haystack = `${item.name} ${item.slug} ${item.category || ''}`.toLowerCase()

  if (variant === 'cover') return 'cover'
  if (variant === 'jelly' || variant === 'uv' || variant === 'protector') return 'protector'
  if (item.category === 'earbuds') return 'earbuds'
  if (item.category === 'data_cable' || /\bcable\b/.test(haystack)) return 'data_cable'
  if (item.category === 'charger' || /\bcharger\b|\bpower\b|\bgan\b/.test(haystack)) return 'charger'
  if (/\bwatch\b/.test(haystack)) return 'watch'
  if (/\bheadphone\b|\bear\b/.test(haystack)) return 'audio'
  return 'default'
}

function buildAccessoryFromMobile(item, mobile, variant) {
  const baseName = mobile.name

  if (variant === 'cover') {
    return {
      name: `${baseName} Cover`,
      slug: `${mobile.slug}-cover`,
      legacySlugs: [`${mobile.slug}-case`],
      productType: null,
      collections: [CATEGORY_SLUGS.accessories, CATEGORY_SLUGS.phoneCases],
    }
  }

  if (variant === 'jelly') {
    return {
      name: `${baseName} Jelly Sheet`,
      slug: `${mobile.slug}-jelly-sheet`,
      legacySlugs: [],
      productType: 'protector',
      collections: [CATEGORY_SLUGS.accessories, CATEGORY_SLUGS.phoneProtectors],
    }
  }

  if (variant === 'uv') {
    return {
      name: `${baseName} UV Protector`,
      slug: `${mobile.slug}-uv-protector`,
      legacySlugs: [],
      productType: 'protector',
      collections: [CATEGORY_SLUGS.accessories, CATEGORY_SLUGS.phoneProtectors],
    }
  }

  return {
    name: `${baseName} Protector`,
    slug: `${mobile.slug}-protector`,
    legacySlugs: [`${mobile.slug}-9d-protector`],
    productType: 'protector',
    collections: [CATEGORY_SLUGS.accessories, CATEGORY_SLUGS.phoneProtectors],
  }
}

function transformStandaloneItem(item) {
  const normalized = normalizeText(item.name)

  if (normalized === 'nothing ear') {
    return {
      name: 'Ear',
      slug: 'ear',
      legacySlugs: [],
      productType: 'earbuds',
      collections: [CATEGORY_SLUGS.accessories, CATEGORY_SLUGS.audio],
    }
  }

  if (normalized.includes('nothing ear 3')) {
    return {
      name: 'Ear (3)',
      slug: 'ear-3',
      legacySlugs: [],
      productType: 'earbuds',
      collections: [CATEGORY_SLUGS.accessories, CATEGORY_SLUGS.audio],
    }
  }

  if (normalized.includes('nothing ear open')) {
    return {
      name: 'Ear (open)',
      slug: 'ear-open',
      legacySlugs: [],
      productType: 'earbuds',
      collections: [CATEGORY_SLUGS.accessories, CATEGORY_SLUGS.audio],
    }
  }

  if (normalized.includes('nothing ear a')) {
    return {
      name: 'Ear (a)',
      slug: 'ear-a',
      legacySlugs: [],
      productType: 'earbuds',
      collections: [CATEGORY_SLUGS.accessories, CATEGORY_SLUGS.audio],
    }
  }

  if (normalized.includes('nothing headphone 1')) {
    return {
      name: 'Headphone (1)',
      slug: 'headphone-1',
      legacySlugs: [],
      productType: null,
      collections: [CATEGORY_SLUGS.accessories, CATEGORY_SLUGS.audio],
    }
  }

  if (normalized.includes('nothing headphone a')) {
    return {
      name: 'Headphone (a)',
      slug: 'headphone-a',
      legacySlugs: [],
      productType: null,
      collections: [CATEGORY_SLUGS.accessories, CATEGORY_SLUGS.audio],
    }
  }

  if (normalized.includes('nothing cable c c')) {
    return {
      name: 'Nothing USB-C to USB-C Cable',
      slug: 'nothing-usb-c-to-usb-c-cable',
      legacySlugs: [],
      productType: 'data_cable',
      collections: [CATEGORY_SLUGS.accessories, CATEGORY_SLUGS.chargers, CATEGORY_SLUGS.cables],
    }
  }

  if (normalized.includes('nothing power 45w')) {
    return {
      name: 'Nothing Power 45W',
      slug: 'nothing-power-45w',
      legacySlugs: [],
      productType: 'charger',
      collections: [CATEGORY_SLUGS.accessories, CATEGORY_SLUGS.chargers],
    }
  }

  if (normalized.includes('cmf watch 3 pro')) {
    return {
      name: 'CMF Watch 3 Pro',
      slug: 'cmf-watch-3-pro',
      legacySlugs: [],
      productType: null,
      collections: [CATEGORY_SLUGS.accessories, CATEGORY_SLUGS.watches, CATEGORY_SLUGS.cmf],
    }
  }

  if (normalized.includes('cmf watch pro')) {
    return {
      name: 'CMF Watch Pro',
      slug: 'cmf-watch-pro',
      legacySlugs: [],
      productType: null,
      collections: [CATEGORY_SLUGS.accessories, CATEGORY_SLUGS.watches, CATEGORY_SLUGS.cmf],
    }
  }

  if (normalized.includes('cmf headphone pro')) {
    return {
      name: 'CMF Headphone Pro',
      slug: 'cmf-headphone-pro',
      legacySlugs: [],
      productType: null,
      collections: [CATEGORY_SLUGS.accessories, CATEGORY_SLUGS.audio, CATEGORY_SLUGS.cmf],
    }
  }

  const inferredCollections = [CATEGORY_SLUGS.accessories]
  const inferredSlug = slugify(item.name)
  const kind = determineProductKind(item, detectVariant(item))

  if (kind === 'watch') inferredCollections.push(CATEGORY_SLUGS.watches)
  if (kind === 'audio' || kind === 'earbuds') inferredCollections.push(CATEGORY_SLUGS.audio)
  if (kind === 'charger' || kind === 'data_cable') inferredCollections.push(CATEGORY_SLUGS.chargers)
  if (kind === 'data_cable') inferredCollections.push(CATEGORY_SLUGS.cables)
  if (/^cmf\b/i.test(item.name)) inferredCollections.push(CATEGORY_SLUGS.cmf)

  return {
    name: item.name,
    slug: inferredSlug,
    legacySlugs: [item.slug],
    productType: kind === 'earbuds' ? 'earbuds' : kind === 'charger' ? 'charger' : kind === 'data_cable' ? 'data_cable' : null,
    collections: inferredCollections,
  }
}

function buildTargetRecord(item, mobilesWithAliases) {
  const searchText = normalizeText(`${item.name} ${item.slug}`)
  let linkedMobileEntry = null
  let matchedAliasLength = 0

  for (const mobileEntry of mobilesWithAliases) {
    for (const alias of mobileEntry.aliases) {
      if (!searchText.includes(alias)) continue
      if (alias.length <= matchedAliasLength) continue
      linkedMobileEntry = mobileEntry
      matchedAliasLength = alias.length
    }
  }

  const variant = detectVariant(item)
  const kind = determineProductKind(item, variant)
  const useLinkedMobile = variant === 'cover' || kind === 'protector'

  const transformed = linkedMobileEntry && useLinkedMobile
    ? buildAccessoryFromMobile(item, linkedMobileEntry.mobile, variant)
    : transformStandaloneItem(item)

  const collections = uniqueStrings([
    ...transformed.collections,
    /^cmf\b/i.test(transformed.name) ? CATEGORY_SLUGS.cmf : null,
  ])

  return {
    source: item,
    linkedMobile: useLinkedMobile ? linkedMobileEntry?.mobile ?? null : null,
    kind,
    name: transformed.name,
    slug: transformed.slug,
    legacySlugs: uniqueStrings([item.slug, ...transformed.legacySlugs]),
    productType: transformed.productType,
    collections,
    price: typeof item.price === 'number' ? item.price : Number(item.price) || null,
  }
}

function buildShortDescription(record, priceLabel) {
  const priceText = priceLabel ? ` Price: ${priceLabel}.` : ''

  if (record.kind === 'cover') {
    return trimText(
      `${record.name} is a clean everyday phone cover for buyers in Pakistan who want fit, grip, and practical device protection.${priceText}`,
      180,
    )
  }

  if (record.kind === 'protector') {
    return trimText(
      `${record.name} is built for clean screen coverage, daily scratch protection, and reliable fit for the right phone model.${priceText}`,
      180,
    )
  }

  if (record.kind === 'charger' || record.kind === 'data_cable') {
    return trimText(
      `${record.name} is listed on Nothing Pakistan for buyers who want a clean charging setup, simple ordering, and local support.${priceText}`,
      180,
    )
  }

  return trimText(
    `${record.name} is part of the Nothing Pakistan catalog for shoppers who want original products, updated pricing, and WhatsApp support before ordering.${priceText}`,
    180,
  )
}

function buildMetaTitle(record) {
  return trimText(`${record.name} Price in Pakistan | Nothing Pakistan`, 68)
}

function buildMetaDescription(record, priceLabel) {
  const priceText = priceLabel ? ` Price: ${priceLabel}.` : ''

  if (record.kind === 'cover') {
    return trimText(
      `Buy ${record.name} in Pakistan with clean fit, everyday protection, quick delivery, and WhatsApp support.${priceText}`,
      158,
    )
  }

  if (record.kind === 'protector') {
    return trimText(
      `Buy ${record.name} in Pakistan for clean screen protection, model-specific fit, fast delivery, and WhatsApp support.${priceText}`,
      158,
    )
  }

  if (record.kind === 'charger' || record.kind === 'data_cable') {
    return trimText(
      `Buy ${record.name} in Pakistan with original charging support, updated price, fast delivery, and WhatsApp help.${priceText}`,
      158,
    )
  }

  return trimText(
    `Shop ${record.name} in Pakistan with original products, updated pricing, fast delivery, and WhatsApp support.${priceText}`,
    158,
  )
}

function buildKeywords(record) {
  const name = record.name
  const base = [
    name,
    `${name} price in Pakistan`,
    `buy ${name} in Pakistan`,
    `${name} Pakistan`,
    `${name} Nothing Pakistan`,
    `${name} original Pakistan`,
    `${name} online Pakistan`,
  ]

  if (record.linkedMobile) {
    base.push(`${record.linkedMobile.name} accessories Pakistan`)
    base.push(`${record.linkedMobile.name} protector Pakistan`)
    base.push(`${record.linkedMobile.name} cover Pakistan`)
  }

  if (record.kind === 'cover') {
    base.push('Nothing phone cover Pakistan', 'transparent phone cover Pakistan', 'Nothing case Pakistan')
  }

  if (record.kind === 'protector') {
    base.push('Nothing screen protector Pakistan', 'UV protector Pakistan', 'jelly sheet Pakistan')
  }

  if (record.kind === 'charger' || record.kind === 'data_cable') {
    base.push('Nothing charger Pakistan', 'Nothing cable Pakistan', 'USB-C cable Pakistan')
  }

  if (record.kind === 'audio' || record.kind === 'earbuds') {
    base.push('Nothing audio Pakistan', 'CMF audio Pakistan', 'original earbuds Pakistan')
  }

  if (record.kind === 'watch') {
    base.push('CMF watch Pakistan', 'smart watch Pakistan', 'Nothing watch Pakistan')
  }

  return uniqueStrings(base).slice(0, 36).join(', ')
}

function buildLongDescription(record, priceLabel) {
  const priceSentence = priceLabel
    ? `${record.name} is currently listed at ${priceLabel} on Nothing Pakistan, while live stock confirmation can still be checked on WhatsApp before ordering.`
    : `${record.name} availability and final order confirmation can be checked on WhatsApp before purchase.`

  const linkedSentence = record.linkedMobile
    ? `${record.name} is prepared for buyers who specifically want an accessory matched to ${record.linkedMobile.name} without guesswork around fit and compatibility.`
    : `${record.name} is positioned for buyers who want a clean product page, direct pricing context, and a simple local order route in Pakistan.`

  const categorySentence =
    record.kind === 'cover'
      ? 'This cover category works best when the fit is exact, the grip feels practical, and the profile stays clean for everyday carry.'
      : record.kind === 'protector'
        ? 'This protector category is built around model-specific fit, easy daily use, and screen protection that feels practical instead of overdesigned.'
        : record.kind === 'charger' || record.kind === 'data_cable'
          ? 'This charging category is for buyers who want dependable power accessories, simple compatibility, and original product presentation.'
          : 'This product is presented for Pakistan search intent around price, originality, delivery, and easy support before ordering.'

  return [
    `${record.name} is part of the Nothing Pakistan catalog for shoppers who want original Nothing and CMF products with clear product naming, clean presentation, and straightforward local ordering. ${linkedSentence} ${categorySentence} ${priceSentence}`,
    `This page is optimized for Pakistan buying intent, which usually means customers want the current price, fit or compatibility guidance, real product images, and an easy support route before they place an order. The page structure, FAQs, and product schema are designed to answer those questions directly without making the content feel stuffed or repetitive.`,
    `Search intent around ${record.name} commonly includes price in Pakistan, original product availability, online ordering, and support through WhatsApp. For linked phone accessories, the page should also support searches around the exact phone model, clean fit, and related accessories that match the same device.`,
    `Overall, ${record.name} should feel like a practical and trustworthy listing for Nothing Pakistan visitors. The content stays minimal, product-led, and useful for customers who want a cleaner buying decision instead of a noisy marketing page.`,
  ].join('\n\n')
}

function buildDescription(record, priceLabel) {
  return [
    buildShortDescription(record, priceLabel),
    record.linkedMobile
      ? `${record.name} is linked with ${record.linkedMobile.name} so buyers can move from the phone page to the right accessory without extra searching.`
      : `This listing is structured for Nothing Pakistan shoppers who want current pricing, real product images, and support before ordering.`,
  ].join('\n\n')
}

function buildSchema(record, finalSlug, firstImageUrl, price, metaDescription, seoKeywords) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: record.name,
    brand: {
      '@type': 'Brand',
      name: /^cmf\b/i.test(record.name) ? 'CMF by Nothing' : 'Nothing',
    },
    sku: finalSlug,
    description: metaDescription,
    category:
      record.kind === 'cover'
        ? 'Phone Cover'
        : record.kind === 'protector'
          ? 'Screen Protector'
          : record.kind === 'charger'
            ? 'Charger'
            : record.kind === 'data_cable'
              ? 'Cable'
              : 'Accessory',
    url: `${SITE_URL}/products/${finalSlug}`,
    keywords: seoKeywords.split(',').map((keyword) => keyword.trim()).filter(Boolean),
  }

  if (firstImageUrl) {
    schema.image = [firstImageUrl]
  }

  if (typeof price === 'number' && Number.isFinite(price)) {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price,
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/products/${finalSlug}`,
    }
  }

  if (record.linkedMobile) {
    schema.isRelatedTo = {
      '@type': 'Product',
      name: record.linkedMobile.name,
      url: `${SITE_URL}/products/${record.linkedMobile.slug}`,
    }
  }

  return schema
}

function buildFaqs(record, priceLabel) {
  const priceLine = priceLabel
    ? `${record.name} is currently listed at ${priceLabel} on Nothing Pakistan, while live stock can still be confirmed on WhatsApp before ordering.`
    : `You can confirm the latest price for ${record.name} on WhatsApp before placing the order.`

  if (record.kind === 'cover') {
    return [
      [`What is the price of ${record.name} in Pakistan?`, priceLine],
      [`Which phone is ${record.name} made for?`, `${record.name} is prepared for ${record.linkedMobile?.name || 'the matching Nothing phone model'} so buyers can choose a cover with the right fit.`],
      [`Is ${record.name} a cover or a screen protector?`, `${record.name} is a phone cover, made for back and side protection rather than screen coverage.`],
      [`Does ${record.name} keep the phone easy to carry every day?`, `${record.name} is listed as an everyday-use cover option for buyers who want a cleaner carry and practical device protection.`],
      [`Can I use buttons, ports, and camera areas easily with ${record.name}?`, `This product is presented as a model-specific cover, so buyers can order with the expectation of proper access around the matching phone layout.`],
      [`Can I use a screen protector with ${record.name}?`, `In most cases, buyers use a separate protector with a cover. If you want a cleaner combined setup, you can confirm the matching protector on WhatsApp before ordering.`],
      [`Is ${record.name} available with delivery in Pakistan?`, `Yes, the listing is prepared for Pakistan orders with delivery support and WhatsApp confirmation before checkout.`],
      [`How do I confirm stock for ${record.name}?`, `The fastest way is to message Nothing Pakistan on WhatsApp and confirm live stock, color, and delivery details before placing the order.`],
      [`Can I order ${record.name} online from Nothing Pakistan?`, `Yes, you can use the product page and WhatsApp support route to place or confirm your order.`],
      [`Why should I choose ${record.name} from Nothing Pakistan?`, `${record.name} is listed with clean naming, local price context, real product images, and direct support for buyers in Pakistan.`],
    ]
  }

  if (record.kind === 'protector') {
    return [
      [`What is the price of ${record.name} in Pakistan?`, priceLine],
      [`Which phone model is ${record.name} for?`, `${record.name} is linked to ${record.linkedMobile?.name || 'the matching Nothing phone model'} so buyers can choose the correct screen accessory for their device.`],
      [`Does ${record.name} use the word Protector instead of 9D Glass?`, `Yes. On Nothing Pakistan, this listing is kept clean and professional with Protector-focused naming instead of using 9D Glass wording.`],
      [`What kind of protection does ${record.name} offer?`, `${record.name} is positioned for day-to-day screen protection, cleaner fit, and model-matched coverage for the right phone.`],
      [`Is ${record.name} easy to pair with a cover?`, `Buyers usually combine a protector with a matching phone cover. You can confirm the related cover or other accessories on WhatsApp before ordering.`],
      [`Will ${record.name} affect daily touch use?`, `${record.name} is listed as a practical screen accessory, and buyers can confirm the right variant for daily use on WhatsApp before purchase.`],
      [`Can I choose between Jelly Sheet, UV Protector, and Protector versions?`, `Yes. Nothing Pakistan separates these variants clearly so buyers can choose the protection style that matches their preference.`],
      [`How do I know ${record.name} fits my phone correctly?`, `${record.name} is mapped to the related phone model in the catalog, which helps buyers avoid guesswork around compatibility.`],
      [`Is ${record.name} available for delivery in Pakistan?`, `Yes, this listing is intended for Pakistan delivery with local ordering support and WhatsApp confirmation.`],
      [`How can I place an order for ${record.name}?`, `You can order through the product page or message Nothing Pakistan on WhatsApp to confirm stock, price, and delivery details first.`],
    ]
  }

  if (record.kind === 'charger' || record.kind === 'data_cable') {
    return [
      [`What is the price of ${record.name} in Pakistan?`, priceLine],
      [`Is ${record.name} available on Nothing Pakistan?`, `Yes, ${record.name} is part of the Nothing Pakistan catalog for buyers who want local pricing and WhatsApp support before ordering.`],
      [`Is ${record.name} an original product?`, `The listing is positioned around original Nothing and CMF product sourcing with direct support through Nothing Pakistan.`],
      [`Who should buy ${record.name}?`, `${record.name} is suitable for buyers who want a cleaner charging setup, simple product guidance, and a reliable local order route in Pakistan.`],
      [`Can I confirm compatibility for ${record.name} before ordering?`, `Yes, you can message Nothing Pakistan on WhatsApp and confirm compatibility with your phone or accessory before checkout.`],
      [`Does ${record.name} have live images on the product page?`, `Yes, the page uses real product images so buyers can review the product before ordering.`],
      [`How do I confirm stock for ${record.name}?`, `Use the WhatsApp support route to confirm live stock and final availability before placing the order.`],
      [`Can I order ${record.name} online in Pakistan?`, `Yes, Nothing Pakistan supports online ordering with local delivery guidance and direct product support.`],
      [`Does Nothing Pakistan deliver ${record.name} across Pakistan?`, `Yes, the listing is structured for Pakistan-wide ordering and delivery support.`],
      [`Why buy ${record.name} from Nothing Pakistan?`, `${record.name} is shown with updated pricing, clear naming, direct support, and a cleaner buying path for Pakistan customers.`],
    ]
  }

  return [
    [`What is the price of ${record.name} in Pakistan?`, priceLine],
    [`Is ${record.name} available on Nothing Pakistan?`, `Yes, ${record.name} is part of the Nothing Pakistan catalog for buyers who want local pricing and support before ordering.`],
    [`Is ${record.name} an original product?`, `The product page is positioned for original Nothing and CMF product sourcing with local support routes.`],
    [`Who should consider buying ${record.name}?`, `${record.name} is aimed at buyers in Pakistan who want a cleaner product page, updated price context, and direct WhatsApp help before purchase.`],
    [`Can I confirm stock for ${record.name} before ordering?`, `Yes, Nothing Pakistan supports WhatsApp confirmation for live stock and final order details.`],
    [`Does ${record.name} have real product images on the page?`, `Yes, the listing uses product images so buyers can review the item before ordering.`],
    [`How do I place an order for ${record.name}?`, `You can use the product page or contact Nothing Pakistan on WhatsApp to confirm the latest ordering details.`],
    [`Does Nothing Pakistan deliver ${record.name} across Pakistan?`, `Yes, the listing is structured for Pakistan orders with delivery support and local assistance.`],
    [`Can I ask for the latest price of ${record.name} on WhatsApp?`, `Yes, WhatsApp is the fastest route for live stock, latest price confirmation, and order help.`],
    [`Why is ${record.name} listed on Nothing Pakistan?`, `${record.name} is included for buyers who want a minimal, product-first shopping experience with local support and clean catalog structure.`],
  ]
}

async function fetchAllRows(table, selectColumns) {
  const rows = []
  const pageSize = 1000

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase.from(table).select(selectColumns).range(offset, offset + pageSize - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < pageSize) break
  }

  return rows
}

async function uploadFileToBunny(localPath, remotePath) {
  const uploadUrl = `${getBunnyStorageBaseUrl()}/${bunnyZone}/${remotePath}`
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      AccessKey: bunnyAccessKey,
      'Content-Type': getMimeType(localPath),
    },
    body: readFileSync(localPath),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Bunny upload failed for ${remotePath}: ${response.status} ${body}`)
  }

  return `https://${bunnyCdnHostname}/${remotePath}`
}

async function replaceImages(productId, productName, finalSlug, localFiles) {
  const { error: deleteError } = await supabase
    .from('images')
    .delete()
    .eq('related_type', 'product')
    .eq('related_id', productId)

  if (deleteError) throw deleteError

  const uploadedUrls = []
  const imageRows = []

  for (let index = 0; index < localFiles.length; index += 1) {
    const localPath = localFiles[index]
    const fileName = `${finalSlug}-${String(index + 1).padStart(2, '0')}${extname(localPath).toLowerCase()}`
    const remotePath = `products/${finalSlug}/${fileName}`
    const publicUrl = await uploadFileToBunny(localPath, remotePath)
    uploadedUrls.push(publicUrl)
    imageRows.push({
      related_type: 'product',
      related_id: productId,
      url: publicUrl,
      alt_text: `${productName} in Pakistan from Nothing Pakistan`,
      title: productName,
      caption: `${productName} product image ${index + 1}`,
      file_name: fileName,
      slug: `${finalSlug}-image-${index + 1}`,
      sort_order: index,
      updated_at: new Date().toISOString(),
    })
  }

  if (imageRows.length > 0) {
    const { error: insertError } = await supabase.from('images').insert(imageRows)
    if (insertError) throw insertError
  }

  return uploadedUrls
}

async function replaceFaqs(productId, faqs) {
  const { error: deleteError } = await supabase
    .from('faqs')
    .delete()
    .eq('related_type', 'product')
    .eq('related_id', productId)

  if (deleteError) throw deleteError

  const faqRows = faqs.map(([question, answer]) => ({
    related_type: 'product',
    related_id: productId,
    question,
    answer,
    updated_at: new Date().toISOString(),
  }))

  const { error: insertError } = await supabase.from('faqs').insert(faqRows)
  if (insertError) throw insertError
}

async function replaceCategoryRelations(productId, categoryIds) {
  const { error: deleteError } = await supabase
    .from('category_relations')
    .delete()
    .eq('related_type', 'product')
    .eq('related_id', productId)

  if (deleteError) throw deleteError

  if (categoryIds.length === 0) return

  const rows = categoryIds.map((categoryId) => ({
    category_id: categoryId,
    related_type: 'product',
    related_id: productId,
    updated_at: new Date().toISOString(),
  }))

  const { error: insertError } = await supabase.from('category_relations').insert(rows)
  if (insertError) throw insertError
}

async function replaceMobileLinks(productId, mobileId) {
  const { error: deleteError } = await supabase
    .from('product_mobiles')
    .delete()
    .eq('product_id', productId)

  if (deleteError) throw deleteError

  if (!mobileId) return

  const { error: insertError } = await supabase.from('product_mobiles').insert({
    product_id: productId,
    mobile_id: mobileId,
  })

  if (insertError) throw insertError
}

function buildExistingProductLookup(products) {
  const bySlug = new Map()
  const byName = new Map()

  for (const product of products) {
    bySlug.set(product.slug, product)
    byName.set(normalizeText(product.name), product)
  }

  return { bySlug, byName }
}

function resolveExistingProduct(record, lookup) {
  for (const slug of [record.slug, ...record.legacySlugs]) {
    if (lookup.bySlug.has(slug)) {
      return lookup.bySlug.get(slug)
    }
  }

  const nameMatch = lookup.byName.get(normalizeText(record.name))
  if (nameMatch) return nameMatch

  return null
}

function updateLocalProductsJson(records) {
  const current = existsSync(LOCAL_PRODUCTS_PATH) ? readJson(LOCAL_PRODUCTS_PATH) : []
  const bySlug = new Map(current.map((item) => [item.slug, item]))

  for (const record of records) {
    bySlug.set(record.slug, {
      name: record.name,
      slug: record.slug,
    })
  }

  const output = [...bySlug.values()].sort((left, right) => left.name.localeCompare(right.name))
  writeFileSync(LOCAL_PRODUCTS_PATH, `${JSON.stringify(output, null, 2)}\n`)
}

async function main() {
  const input = readJson(MISSING_JSON_PATH)
  const sourceItems = input.missingItems || []

  const [existingProducts, categories, mobiles] = await Promise.all([
    fetchAllRows('products', 'id,name,slug,product_type,price'),
    fetchAllRows('categories', 'id,name,slug'),
    fetchAllRows('mobiles', 'id,name,slug'),
  ])

  const categoryIdBySlug = new Map(categories.map((category) => [category.slug, category.id]))
  const mobilesWithAliases = mobiles
    .map((mobile) => ({
      mobile,
      aliases: buildMobileAliases(mobile),
    }))
    .sort((left, right) => right.aliases[0].length - left.aliases[0].length)

  const existingLookup = buildExistingProductLookup(existingProducts)
  const reportRows = []
  const touchedProducts = []

  for (const sourceItem of sourceItems) {
    if (isPrivacySheetItem(sourceItem)) {
      reportRows.push({
        sourceName: sourceItem.name,
        sourceSlug: sourceItem.slug,
        action: 'skipped',
        productId: null,
        name: sourceItem.name,
        slug: sourceItem.slug,
        kind: 'privacy',
        linkedMobile: null,
        collections: [],
        imageCount: 0,
        faqCount: 0,
        price: typeof sourceItem.price === 'number' ? sourceItem.price : Number(sourceItem.price) || null,
      })
      console.log(`Skipped privacy sheet: ${sourceItem.name} (${sourceItem.slug})`)
      continue
    }

    const record = buildTargetRecord(sourceItem, mobilesWithAliases)
    const existingProduct = resolveExistingProduct(record, existingLookup)
    const finalSlug = existingProduct?.slug || record.slug
    const priceLabel = formatPrice(record.price)
    const metaTitle = buildMetaTitle(record)
    const metaDescription = buildMetaDescription(record, priceLabel)
    const seoKeywords = buildKeywords(record)
    const canonicalUrl = `${SITE_URL}/products/${finalSlug}`
    const localFiles = listDownloadedFiles(sourceItem.slug)

    if (localFiles.length === 0) {
      throw new Error(`No downloaded images found for source item: ${sourceItem.slug}`)
    }

    const basePayload = {
      name: record.name,
      slug: finalSlug,
      description: buildDescription(record, priceLabel),
      short_description: buildShortDescription(record, priceLabel),
      meta_title: metaTitle,
      meta_description: metaDescription,
      seo_keywords: seoKeywords,
      canonical_url: canonicalUrl,
      seo_description_long: buildLongDescription(record, priceLabel),
      image_alt_text: `${record.name} in Pakistan from Nothing Pakistan`,
      price: record.price,
      product_type: record.productType,
      updated_at: new Date().toISOString(),
    }

    let productId = existingProduct?.id || null

    if (existingProduct) {
      const { error } = await supabase.from('products').update(basePayload).eq('id', existingProduct.id)
      if (error) throw error
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert(basePayload)
        .select('id,slug')
        .single()
      if (error) throw error
      productId = data.id
    }

    if (!productId) {
      throw new Error(`Could not resolve product id for ${record.name}`)
    }

    const uploadedUrls = await replaceImages(productId, record.name, finalSlug, localFiles)
    const schemaJson = buildSchema(record, finalSlug, uploadedUrls[0] || null, record.price, metaDescription, seoKeywords)
    const { error: schemaError } = await supabase
      .from('products')
      .update({ schema_json: schemaJson, updated_at: new Date().toISOString() })
      .eq('id', productId)
    if (schemaError) throw schemaError

    const faqs = buildFaqs(record, priceLabel)
    await replaceFaqs(productId, faqs)

    const categoryIds = uniqueStrings(record.collections)
      .map((slug) => categoryIdBySlug.get(slug))
      .filter((value) => typeof value === 'number')
    await replaceCategoryRelations(productId, categoryIds)
    await replaceMobileLinks(productId, record.linkedMobile?.id || null)

    const refreshedProduct = {
      id: productId,
      name: record.name,
      slug: finalSlug,
    }
    existingLookup.bySlug.set(finalSlug, refreshedProduct)
    existingLookup.byName.set(normalizeText(record.name), refreshedProduct)
    touchedProducts.push({ name: record.name, slug: finalSlug })

    reportRows.push({
      sourceName: sourceItem.name,
      sourceSlug: sourceItem.slug,
      action: existingProduct ? 'updated' : 'inserted',
      productId,
      name: record.name,
      slug: finalSlug,
      kind: record.kind,
      linkedMobile: record.linkedMobile?.name || null,
      collections: record.collections,
      imageCount: uploadedUrls.length,
      faqCount: faqs.length,
      price: record.price,
    })

    console.log(`${existingProduct ? 'Updated' : 'Inserted'}: ${record.name} (${finalSlug})`)
  }

  updateLocalProductsJson(touchedProducts)
  mkdirSync(REPORT_DIR, { recursive: true })
  writeFileSync(
    REPORT_PATH,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalSourceItems: sourceItems.length,
        inserted: reportRows.filter((row) => row.action === 'inserted').length,
        updated: reportRows.filter((row) => row.action === 'updated').length,
        rows: reportRows,
      },
      null,
      2,
    )}\n`,
  )

  console.log(
    JSON.stringify(
      {
        reportPath: REPORT_PATH.replace(`${ROOT}/`, ''),
        inserted: reportRows.filter((row) => row.action === 'inserted').length,
        updated: reportRows.filter((row) => row.action === 'updated').length,
        total: reportRows.length,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error?.stack || error?.message || error)
  process.exit(1)
})
