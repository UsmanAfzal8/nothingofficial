import { createClient } from '@supabase/supabase-js'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SITE_URL = 'https://www.nothingshop.pk'
const REPORT_DIR = resolve(process.cwd(), 'seo-output')
const REPORT_FILE = resolve(REPORT_DIR, 'supabase-seo-update-report.json')

function loadEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8')

    for (const line of content.split(/\r?\n/)) {
      const trimmedLine = line.trim()
      if (!trimmedLine || trimmedLine.startsWith('#') || !trimmedLine.includes('=')) continue
      const [key, ...valueParts] = trimmedLine.split('=')
      const value = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '')
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  } catch {
    // Local env files are optional in CI; shell env vars can provide credentials.
  }
}

loadEnvFile(resolve(process.cwd(), '.env.local'))
loadEnvFile(resolve(process.cwd(), 'env'))

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const RESEARCH_SOURCES = [
  'Google Ads Keyword Planner intent framework',
  'Pakistan SERP review for Nothing and CMF phone price queries',
  'Nothing Pakistan product catalog',
  'Nothing official support/product specs',
  'Price comparison snippets for Pakistan purchase intent',
]

const PAKISTAN_CITY_KEYWORDS = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
]

const MARKET_KEYWORDS = [
  'price in Pakistan',
  'buy online Pakistan',
  'PTA approved Pakistan',
  'official warranty Pakistan',
  'original Pakistan',
  'COD delivery Pakistan',
  'Nothing Pakistan',
  'Nothing official store Pakistan',
]

const MOBILE_RESEARCH = {
  'nothing-4a-pro': {
    aliases: ['Nothing 4a Pro', 'Nothing Phone 4a Pro', 'Phone (4a) Pro'],
    features: ['PTA approved', '12GB 256GB', 'AMOLED display', 'Nothing OS', 'transparent design', 'pink silver black'],
    intent: ['nothing 4a pro price in pakistan', 'nothing phone 4a pro price pakistan', 'nothing 4a pro pta approved', 'nothing 4a pro buy online'],
    focus: 'premium Nothing phone buyers comparing PTA-approved stock, colors, storage, and official local support.',
  },
  'phone-4a': {
    aliases: ['Phone (4a)', 'Nothing Phone 4a', 'Nothing 4a'],
    features: ['8GB 128GB', '3 camera system', '70x ultra zoom', 'Nothing OS', 'blue black pink', 'PTA approved'],
    intent: ['nothing phone 4a price in pakistan', 'phone 4a price pakistan', 'nothing 4a price in pakistan', 'nothing phone 4a buy online'],
    focus: 'balanced Nothing smartphone shoppers looking for price, camera, colors, and PTA guidance.',
  },
  'phone-3': {
    aliases: ['Phone (3)', 'Nothing Phone 3', 'Nothing 3'],
    features: ['Snapdragon 8s Gen 4', 'Glyph Matrix', '50MP cameras', '5G', '512GB', 'PTA approved'],
    intent: ['nothing phone 3 price in pakistan', 'phone 3 price pakistan', 'nothing phone 3 pta approved', 'nothing phone 3 specs pakistan'],
    focus: 'flagship Nothing buyers comparing performance, camera setup, Glyph Matrix, PTA cost, and local availability.',
  },
  'phone-3a-lite': {
    aliases: ['Phone (3a) Lite', 'Nothing Phone 3a Lite', 'Nothing 3a Lite'],
    features: ['budget Nothing phone', 'Nothing OS', 'AMOLED display', 'good battery', 'PTA approved', '128GB'],
    intent: ['nothing phone 3a lite price in pakistan', 'phone 3a lite price pakistan', 'nothing 3a lite buy online', 'nothing phone 3a lite pta approved'],
    focus: 'budget-focused Nothing buyers looking for a lower-price phone with reliable local buying support.',
  },
  'phone-3a-pro': {
    aliases: ['Phone (3a) Pro', 'Nothing Phone 3a Pro', 'Nothing 3a Pro'],
    features: ['Snapdragon 7s Gen 3', 'periscope camera', '50MP camera', 'AMOLED display', 'Nothing OS', 'PTA approved'],
    intent: ['nothing phone 3a pro price in pakistan', 'phone 3a pro price pakistan', 'nothing 3a pro pta approved', 'nothing phone 3a pro specs'],
    focus: 'mid-premium Nothing buyers comparing camera zoom, specs, PTA details, and Pakistan pricing.',
  },
  'phone-3a': {
    aliases: ['Phone (3a)', 'Nothing Phone 3a', 'Nothing 3a'],
    features: ['Snapdragon 7s Gen 3', '50MP camera', 'AMOLED 120Hz', 'Nothing OS', 'PTA approved', '256GB'],
    intent: ['nothing phone 3a price in pakistan', 'phone 3a price pakistan', 'nothing phone 3a buy online', 'nothing phone 3a specs pakistan'],
    focus: 'mainstream Nothing buyers comparing price, specs, camera, PTA status, and delivery in Pakistan.',
  },
  'phone-3a-community-edition': {
    aliases: ['Phone (3a) Community Edition', 'Nothing Phone 3a Community Edition', 'Nothing 3a Community Edition'],
    features: ['limited edition', 'community edition', 'Nothing OS', 'AMOLED display', 'PTA approved', 'collector model'],
    intent: ['nothing phone 3a community edition price pakistan', 'phone 3a community edition pakistan', 'nothing community edition buy online', 'nothing phone 3a community edition pta'],
    focus: 'limited-edition Nothing buyers looking for authenticity, availability, and local support.',
  },
  'cmf-phone-2-pro': {
    aliases: ['CMF Phone 2 Pro', 'Nothing CMF Phone 2 Pro', 'CMF 2 Pro'],
    features: ['Dimensity 7300 Pro', '8GB 128GB', '120Hz AMOLED', '50MP camera', '5000mAh battery', 'PTA approved'],
    intent: ['cmf phone 2 pro price in pakistan', 'nothing cmf phone 2 pro price pakistan', 'cmf 2 pro pta approved', 'cmf phone 2 pro buy online pakistan'],
    focus: 'value-focused CMF buyers comparing Pakistan price, battery, camera, storage, and official local stock.',
  },
  'phone-2a': {
    aliases: ['Phone (2a)', 'Nothing Phone 2a', 'Nothing 2a'],
    features: ['Dimensity 7200 Pro', 'AMOLED 120Hz', '50MP dual camera', 'Nothing OS', '5000mAh battery', 'PTA approved'],
    intent: ['nothing phone 2a price in pakistan', 'phone 2a price pakistan', 'nothing phone 2a buy online', 'nothing phone 2a pta approved'],
    focus: 'Nothing Phone 2a shoppers comparing price, camera, battery, PTA status, and accessories.',
  },
  'cmf-phone-1': {
    aliases: ['CMF Phone 1', 'Nothing CMF Phone 1', 'CMF Phone One'],
    features: ['Dimensity 7300', 'AMOLED display', '5000mAh battery', 'replaceable back cover', 'budget phone', 'PTA approved'],
    intent: ['cmf phone 1 price in pakistan', 'nothing cmf phone 1 price pakistan', 'cmf phone 1 buy online pakistan', 'cmf phone 1 pta approved'],
    focus: 'budget CMF buyers comparing price, design, battery, PTA approval, and Pakistan delivery.',
  },
  'phone-2a-plus': {
    aliases: ['Phone (2a) Plus', 'Nothing Phone 2a Plus', 'Nothing 2a Plus'],
    features: ['Dimensity 7350 Pro', '50MP front camera', 'AMOLED 120Hz', 'fast charging', 'Nothing OS', 'PTA approved'],
    intent: ['nothing phone 2a plus price in pakistan', 'phone 2a plus price pakistan', 'nothing phone 2a plus buy online', 'nothing 2a plus pta approved'],
    focus: 'buyers comparing Phone 2a Plus performance, selfie camera, charging, and local Pakistan pricing.',
  },
  'phone-2': {
    aliases: ['Phone (2)', 'Nothing Phone 2', 'Nothing 2'],
    features: ['Snapdragon 8 Plus Gen 1', 'Glyph Interface', 'LTPO OLED', 'wireless charging', '50MP camera', 'PTA approved'],
    intent: ['nothing phone 2 price in pakistan', 'phone 2 price pakistan', 'nothing phone 2 buy online pakistan', 'nothing phone 2 pta approved'],
    focus: 'Nothing Phone 2 buyers comparing flagship design, Glyph lights, wireless charging, and Pakistan resale value.',
  },
  'phone-1': {
    aliases: ['Phone (1)', 'Nothing Phone 1', 'Nothing 1'],
    features: ['Glyph Interface', 'OLED display', '50MP dual camera', 'wireless charging', 'transparent design', 'PTA approved'],
    intent: ['nothing phone 1 price in pakistan', 'phone 1 price pakistan', 'nothing phone 1 buy online pakistan', 'nothing phone 1 pta approved'],
    focus: 'Nothing Phone 1 buyers checking original stock, price, accessories, and PTA-ready buying options.',
  },
}

const CATEGORY_KEYWORDS = {
  earbuds: [
    'Nothing earbuds price in Pakistan',
    'CMF earbuds price in Pakistan',
    'Nothing buds Pakistan',
    'wireless earbuds Pakistan',
    'ANC earbuds Pakistan',
    'original earbuds Pakistan',
    'buy Nothing earbuds online',
    'earbuds with COD Pakistan',
  ],
  charger: [
    'Nothing charger price in Pakistan',
    'CMF charger price in Pakistan',
    'GaN charger Pakistan',
    'USB C fast charger Pakistan',
    'PD charger Pakistan',
    'original Nothing charger Pakistan',
    'buy fast charger online Pakistan',
  ],
  protector: [
    'Nothing screen protector price in Pakistan',
    'Nothing phone tempered glass Pakistan',
    'Nothing privacy sheet Pakistan',
    '9D protector Pakistan',
    'mobile screen protector Pakistan',
    'original phone protector Pakistan',
    'buy screen protector online Pakistan',
  ],
  phone: [
    'Nothing Phone price in Pakistan',
    'Nothing mobile price in Pakistan',
    'CMF Phone price in Pakistan',
    'Nothing Phone PTA approved',
    'Nothing Phone official warranty Pakistan',
    'Nothing Phone specs Pakistan',
    'buy Nothing Phone online Pakistan',
    'Nothing phones with COD Pakistan',
  ],
  default: [
    'Nothing Pakistan',
    'Nothing accessories Pakistan',
    'CMF Pakistan',
    'Nothing products Pakistan',
    'Nothing online store Pakistan',
    'original Nothing products Pakistan',
    'buy Nothing products online',
  ],
}

function normalizeName(name) {
  return name
    .replace(/\b9D\s+(Protector|Glass)\b/gi, 'Protector')
    .replace(/\b9D\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function classifyItem(item, entityType) {
  const haystack = `${item.name} ${item.slug} ${item.product_type || ''}`.toLowerCase()

  if (entityType === 'mobile') return 'phone'
  if (haystack.includes('buds') || haystack.includes('ear')) return 'earbuds'
  if (haystack.includes('charger') || haystack.includes('power') || haystack.includes('gan') || haystack.includes('cable')) return 'charger'
  if (haystack.includes('protector') || haystack.includes('privacy') || haystack.includes('sheet') || haystack.includes('glass')) return 'protector'

  return 'default'
}

function titleCaseWords(value) {
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getMobileResearch(item) {
  return MOBILE_RESEARCH[item.slug] || null
}

function buildMetaTitle(item, name, category, entityType) {
  if (entityType === 'mobile') {
    const research = getMobileResearch(item)
    const primaryAlias = research?.aliases?.[1] || name
    const mobileTitle = `${primaryAlias} Price in Pakistan | PTA Approved`

    return mobileTitle.length <= 70 ? mobileTitle : `${name} Price in Pakistan | Nothing Pakistan`
  }

  const candidates = {
    earbuds: `${name} Price in Pakistan | Nothing Pakistan`,
    charger: `${name} Price in Pakistan | Original Charger`,
    protector: `${name} in Pakistan | Screen Protector`,
    phone: `${name} Price in Pakistan | Nothing Pakistan`,
    default: `${name} in Pakistan | Nothing Pakistan`,
  }

  const fallback = `${name} Pakistan | Nothing`
  const title = candidates[category] || fallback

  return title.length <= 70 ? title : fallback.slice(0, 70)
}

function buildMetaDescription(item, name, category, priceLabel, entityType) {
  const priceText = priceLabel ? ` Price: ${priceLabel}.` : ''
  if (entityType === 'mobile') {
    const research = getMobileResearch(item)
    const featureValue = research?.features?.find((feature) => !/pta/i.test(feature))
    const feature = featureValue ? `, ${featureValue}` : ''
    return trimText(
      `Buy ${name} in Pakistan with updated price, PTA details, specs${feature}, COD delivery, and WhatsApp support.${priceText}`,
      158,
    )
  }

  const descriptions = {
    earbuds: `Buy ${name} in Pakistan with original quality, clear sound, fast delivery, COD, and WhatsApp support.${priceText}`,
    charger: `Buy ${name} in Pakistan with original charging support, fast delivery, COD, and WhatsApp help.${priceText}`,
    protector: `Buy ${name} in Pakistan for clean fit, screen protection, fast delivery, COD, and WhatsApp support.${priceText}`,
    phone: `Explore ${name} price in Pakistan with specs, accessories, delivery, COD, and WhatsApp support.${priceText}`,
    default: `Shop ${name} in Pakistan with original products, updated pricing, fast delivery, COD, and WhatsApp support.${priceText}`,
  }

  let description = descriptions[category]

  if (description.length > 158) {
    description = descriptions[category].replace(priceText, '').trim()
  }

  const boosters = [
    ' Original stock and local support.',
    ' Trusted local support.',
    ' Order online in Pakistan.',
    ' Local support.',
  ]

  for (const booster of boosters) {
    if (description.length >= 140) break
    if (`${description}${booster}`.length <= 158) {
      description = `${description}${booster}`
    }
  }

  if (description.length > 158) {
    return `${description.slice(0, 155).trim()}...`
  }

  return description
}

function trimText(value, maxLength) {
  const normalized = value.replace(/\s+/g, ' ').trim()

  if (normalized.length <= maxLength) return normalized

  const clipped = normalized.slice(0, maxLength - 1)
  const lastSpaceIndex = clipped.lastIndexOf(' ')

  return `${clipped.slice(0, lastSpaceIndex > 80 ? lastSpaceIndex : clipped.length).trim()}.`
}

function buildKeywords(item, name, category, entityType) {
  const baseName = normalizeName(name)
  const normalized = baseName.toLowerCase()
  const categoryKeywords = CATEGORY_KEYWORDS[category] || CATEGORY_KEYWORDS.default
  const mobileResearch = entityType === 'mobile' ? getMobileResearch(item) : null
  const aliases = mobileResearch?.aliases || [baseName]
  const aliasKeywords = aliases.flatMap((alias) => [
    alias,
    `${alias} price in Pakistan`,
    `${alias} PTA approved`,
    `${alias} buy online Pakistan`,
    `${alias} specs Pakistan`,
    `${alias} original Pakistan`,
  ])
  const cityKeywords = PAKISTAN_CITY_KEYWORDS.flatMap((city) => [
    `${baseName} price in ${city}`,
    `buy ${baseName} in ${city}`,
  ])
  const marketKeywords = MARKET_KEYWORDS.map((keyword) => `${baseName} ${keyword}`)

  return [
    ...aliasKeywords,
    ...marketKeywords,
    ...(mobileResearch?.intent || []),
    ...(mobileResearch?.features || []).map((feature) => `${baseName} ${feature}`),
    ...cityKeywords,
    `${normalized} pakistan`,
    `${normalized} pakistan mein`,
    ...categoryKeywords,
  ]
    .filter(Boolean)
    .filter((keyword, index, all) => all.findIndex((item) => item.toLowerCase() === keyword.toLowerCase()) === index)
    .slice(0, entityType === 'mobile' ? 52 : 36)
    .join(', ')
}

function buildLongDescription(item, name, category, priceLabel, entityType) {
  const productName = normalizeName(name)
  const mobileResearch = entityType === 'mobile' ? getMobileResearch(item) : null
  const priceSentence = priceLabel
    ? `${productName} is currently listed at ${priceLabel} on Nothing Pakistan, while final availability can still depend on stock confirmation and order timing.`
    : `${productName} pricing and availability can be confirmed from the live product page or WhatsApp support before ordering.`
  const categoryLead = {
    earbuds:
      'This audio product is built for buyers who want wireless listening, clear calling, modern design, and a reliable daily carry option.',
    charger:
      'This charging product is built for users who need dependable power delivery, USB-C convenience, and safe everyday charging for modern devices.',
    protector:
      'This protection product is made for customers who want a clean screen fit, scratch resistance, and practical protection without making the phone feel bulky.',
    phone:
      'This phone page helps Pakistani buyers understand the model, price context, compatible accessories, protection options, and ordering route from one place.',
    default:
      'This product page is designed for shoppers who want original Nothing and CMF accessories with clear information before they place an order.',
  }[category]
  const researchSentence = mobileResearch
    ? `Keyword research for this model is focused on ${mobileResearch.focus} The most important query clusters are ${mobileResearch.intent.join(', ')}. Supporting modifiers include ${mobileResearch.features.join(', ')}.`
    : `Keyword research for this item is focused on commercial Pakistan queries around price, originality, compatibility, COD, fast delivery, and local support.`

  return [
    `${productName} is part of the Nothing Pakistan catalog for customers who want reliable Nothing and CMF products with local pricing, support, and a simple online order flow. ${categoryLead} ${priceSentence} ${researchSentence}`,
    `When people search for ${productName} in Pakistan, they usually want three things: a trusted seller, clear product information, and confidence that the item will match their device or daily use case. This page is optimized to answer those questions directly. It includes product naming, price context, compatibility signals, delivery expectations, and support routes so the buyer does not need to jump across multiple websites before making a decision.`,
    `For search intent, this product targets phrases such as ${productName} price in Pakistan, buy ${productName} online Pakistan, original ${productName} Pakistan, Nothing accessories Pakistan, and CMF products Pakistan. It also supports regional searches from Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Sialkot, and other cities where buyers commonly look for mobile accessories and Nothing products online.`,
    `The main buying advantage is convenience. Customers can review the product page, compare related products, check the visible price, and use the order or WhatsApp route for confirmation. Nothing Pakistan also highlights helpful trust signals such as cash on delivery, free delivery where applicable, seven day return guidance, product support, and original product sourcing. These details help both shoppers and search engines understand that the page is focused on transactional buying intent, not only product browsing.`,
    `For AEO and voice-search coverage, this page should answer direct questions naturally. Buyers may ask: What is the price of ${productName} in Pakistan? Is ${productName} original? Where can I buy ${productName} online? Does Nothing Pakistan deliver ${productName} to my city? Which accessory is compatible with my Nothing phone? The content, FAQ schema, product schema, and internal links should make those answers easy for Google, AI search systems, and users to understand.`,
    `The product image should use descriptive alt text such as "${productName} original product in Pakistan" so image search and accessibility tools can understand the page. The canonical URL should point to the live product URL on nothingshop.pk to avoid duplicate content. The meta title and description should stay concise, readable, and focused on Pakistan purchase intent.`,
    `Internal linking should connect ${productName} to relevant collections such as Shop All, Audio, Chargers, Protectors, Accessories, CMF, or Phones depending on the product type. Related product cards should also link to complementary accessories, for example chargers with phones, protectors with phone models, and earbuds with audio collections. This structure helps crawl depth, improves topical authority, and gives customers a smoother shopping path.`,
    `Overall, ${productName} should be positioned as a trusted local option for Nothing Pakistan shoppers who care about original products, current pricing, simple checkout, and support before and after purchase. The page should keep the language clear, avoid overstuffed keywords, and use helpful product information to match both commercial and informational search intent.`,
  ].join('\n\n')
}

function buildSchema({ item, name, category, entityType, price, imageUrl, metaDescription, seoKeywords }) {
  const keywordList = seoKeywords.split(',').map((keyword) => keyword.trim()).filter(Boolean)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    brand: {
      '@type': 'Brand',
      name: /^cmf/i.test(name) ? 'CMF by Nothing' : 'Nothing',
    },
    sku: item.slug,
    category: titleCaseWords(category),
    description: metaDescription,
    url: `${SITE_URL}/products/${item.slug}`,
    keywords: keywordList,
  }

  if (imageUrl) {
    schema.image = [imageUrl]
  }

  if (typeof price === 'number' && Number.isFinite(price)) {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price,
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/products/${item.slug}`,
    }
  }

  if (entityType === 'mobile') {
    const mobileResearch = getMobileResearch(item)
    schema.additionalProperty = [
      { '@type': 'PropertyValue', name: 'Product type', value: 'Nothing phone model' },
      { '@type': 'PropertyValue', name: 'Accessory support', value: 'Chargers, protectors, earbuds, and compatible accessories' },
      { '@type': 'PropertyValue', name: 'Pakistan buying intent', value: 'Price, PTA approval, COD delivery, specs, warranty, and availability' },
      ...(mobileResearch?.features || []).slice(0, 5).map((feature) => ({
        '@type': 'PropertyValue',
        name: 'Search feature',
        value: feature,
      })),
    ]
  }

  return schema
}

async function fetchImages(relatedType) {
  const { data, error } = await supabase
    .from('images')
    .select('id, related_type, related_id, url, alt_text')
    .eq('related_type', relatedType)
    .order('sort_order', { ascending: true })

  if (error) throw error

  const byRelatedId = new Map()
  for (const image of data || []) {
    const group = byRelatedId.get(image.related_id) || []
    group.push(image)
    byRelatedId.set(image.related_id, group)
  }

  return byRelatedId
}

function resolvePrice(item, entityType) {
  if (entityType === 'mobile') return typeof item.Price === 'number' ? item.Price : null
  return typeof item.price === 'number' ? item.price : null
}

function formatPrice(price) {
  if (typeof price !== 'number' || !Number.isFinite(price)) return null
  return `Rs ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(price)}`
}

async function updateTable({ table, entityType, imageType, selectColumns }) {
  const { data, error } = await supabase.from(table).select(selectColumns).order('id', { ascending: true })
  if (error) throw error

  const imagesByRelatedId = await fetchImages(imageType)
  const reportRows = []

  for (const item of data || []) {
    const name = normalizeName(item.name)
    const category = classifyItem(item, entityType)
    const price = resolvePrice(item, entityType)
    const priceLabel = formatPrice(price)
    const metaTitle = buildMetaTitle(item, name, category, entityType)
    const metaDescription = buildMetaDescription(item, name, category, priceLabel, entityType)
    const seoKeywords = buildKeywords(item, name, category, entityType)
    const canonicalUrl = `${SITE_URL}/products/${item.slug}`
    const images = imagesByRelatedId.get(item.id) || []
    const imageAltText = `${name} original ${category === 'phone' ? 'phone' : 'product'} in Pakistan from Nothing Pakistan`
    const schemaJson = buildSchema({
      item,
      name,
      category,
      entityType,
      price,
      imageUrl: images[0]?.url || null,
      metaDescription,
      seoKeywords,
    })

    const updatePayload = {
      name,
      meta_title: metaTitle,
      meta_description: metaDescription,
      seo_keywords: seoKeywords,
      canonical_url: canonicalUrl,
      schema_json: schemaJson,
      seo_description_long: buildLongDescription(item, name, category, priceLabel, entityType),
      image_alt_text: imageAltText,
      updated_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabase.from(table).update(updatePayload).eq('id', item.id)
    if (updateError) throw updateError

    for (const image of images) {
      if (image.alt_text === imageAltText) continue
      const { error: imageError } = await supabase
        .from('images')
        .update({ alt_text: imageAltText, updated_at: new Date().toISOString() })
        .eq('id', image.id)
      if (imageError) throw imageError
    }

    reportRows.push({
      table,
      id: item.id,
      slug: item.slug,
      name,
      category,
      meta_title: metaTitle,
      meta_description: metaDescription,
      canonical_url: canonicalUrl,
      price,
      image_alt_text: imageAltText,
      images_updated: images.length,
      keyword_count: seoKeywords.split(',').length,
      keyword_sample: seoKeywords.split(',').slice(0, 8).map((keyword) => keyword.trim()),
    })
  }

  return reportRows
}

async function main() {
  const startedAt = new Date().toISOString()
  console.log('Starting SEO update for products and mobiles...')

  const products = await updateTable({
    table: 'products',
    entityType: 'product',
    imageType: 'product',
    selectColumns: 'id, name, slug, price, product_type',
  })

  const mobiles = await updateTable({
    table: 'mobiles',
    entityType: 'mobile',
    imageType: 'mobile',
    selectColumns: 'id, name, slug, Price',
  })

  const finishedAt = new Date().toISOString()
  const report = {
    started_at: startedAt,
    finished_at: finishedAt,
    site_url: SITE_URL,
    research_sources: RESEARCH_SOURCES,
    updated: {
      products: products.length,
      mobiles: mobiles.length,
      total: products.length + mobiles.length,
    },
    products,
    mobiles,
  }

  mkdirSync(REPORT_DIR, { recursive: true })
  writeFileSync(REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`)

  console.log(JSON.stringify(report.updated, null, 2))
  console.log(`Report written to ${REPORT_FILE}`)
}

main().catch((error) => {
  console.error('SEO update failed:')
  console.error(error.message || error)
  process.exit(1)
})
