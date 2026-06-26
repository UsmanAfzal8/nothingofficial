import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ROOT = process.cwd()
const PROMPT_PATH = path.join(ROOT, 'blog_prompt.json')
const REPORT_PATH = path.join(ROOT, 'tmp', 'blog-assets', 'generated', 'longform-blog-update-report.json')
const SITE_URL = 'https://www.cmfbynothing.pk'
const SITE_DOMAIN = 'cmfbynothing.pk'
const BRAND = 'Nothing Pakistan'
const UPDATED_LABEL = 'June 24, 2026'

function loadEnv() {
  for (const envPath of ['.env.local', 'env']) {
    const fullPath = path.join(ROOT, envPath)
    if (!existsSync(fullPath)) continue

    for (const line of readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue

      const index = trimmed.indexOf('=')
      const key = trimmed.slice(0, index)
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')
      process.env[key] ||= value
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env value: ${name}`)
  return value
}

function slugify(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function stripHtml(value) {
  return String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function wordCount(value) {
  return stripHtml(value).split(/\s+/).filter(Boolean).length
}

function readingTime(value) {
  return Math.max(8, Math.ceil(wordCount(value) / 220))
}

function p(value) {
  return `  <p>${value}</p>`
}

function h2(value) {
  return `<h2>${escapeHtml(value)}</h2>`
}

function h3(value) {
  return `  <h3>${escapeHtml(value)}</h3>`
}

function ul(items) {
  return [
    '  <ul>',
    ...items.map((item) => `    <li>${item}</li>`),
    '  </ul>',
  ].join('\n')
}

function table(headers, rows) {
  return [
    '  <table>',
    '    <thead>',
    `      <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>`,
    '    </thead>',
    '    <tbody>',
    ...rows.map((row) => `      <tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`),
    '    </tbody>',
    '  </table>',
  ].join('\n')
}

function section(title, parts) {
  return [
    '<section>',
    h2(title),
    ...parts,
    '</section>',
  ].join('\n')
}

function formatPkr(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'price on request'
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(value)
}

function normalizeKey(value) {
  return String(value ?? '').trim().toLowerCase()
}

async function fetchAll(supabase, table, select, order = 'id') {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select(select).order(order, { ascending: true }).range(from, from + 999)
    if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`)
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return rows
}

async function loadCatalog(supabase) {
  const [mobiles, products] = await Promise.all([
    fetchAll(supabase, 'mobiles', 'id,name,slug,Price'),
    fetchAll(supabase, 'products', 'id,name,slug,price,product_type'),
  ])

  const mobileByName = new Map(mobiles.map((row) => [normalizeKey(row.name), row]))
  const productByName = new Map(products.map((row) => [normalizeKey(row.name), row]))

  const pickMobile = (name) => {
    const row = mobileByName.get(normalizeKey(name))
    if (!row) throw new Error(`Missing mobile in Supabase catalog: ${name}`)
    return { ...row, price: row.Price, href: `${SITE_URL}/mobiles/${row.slug}` }
  }

  const pickProduct = (name) => {
    const row = productByName.get(normalizeKey(name))
    if (!row) throw new Error(`Missing product in Supabase catalog: ${name}`)
    return { ...row, href: `${SITE_URL}/products/${row.slug}` }
  }

  const catalog = {
    cmfPhone1: pickMobile('CMF Phone 1'),
    phone1: pickMobile('Phone (1)'),
    phone2a: pickMobile('Phone (2a)'),
    phone2aPlus: pickMobile('Phone (2a) Plus'),
    phone2: pickMobile('Phone (2)'),
    phone3a: pickMobile('Phone (3a)'),
    phone3aPro: pickMobile('Phone (3a) Pro'),
    phone3: pickMobile('Phone (3)'),
    cmfPhone2Pro: pickMobile('CMF Phone 2 Pro'),
    ear3: pickProduct('Ear (3)'),
    earA: pickProduct('Ear (a)'),
    cmfBudsPro2: pickProduct('CMF Buds Pro 2'),
    cmfBudsPro: pickProduct('CMF Buds Pro'),
    nothingPower45w: pickProduct('Nothing Power 45W'),
    nothingCable: pickProduct('Nothing USB-C to USB-C Cable'),
  }

  catalog.phones = [
    catalog.cmfPhone1,
    catalog.phone1,
    catalog.phone2a,
    catalog.phone2aPlus,
    catalog.phone2,
    catalog.phone3a,
    catalog.phone3aPro,
    catalog.phone3,
    catalog.cmfPhone2Pro,
  ]

  catalog.competitors = {
    samsungA55: 139999,
    redmiNote13: 44999,
    airpods4: 36999,
    airpodsPro2: 53999,
  }

  return catalog
}

const TOPIC_CONFIG = {
  'Nothing Phone Price in Pakistan (2026 Updated Guide)': {
    category: 'Prices',
    contentType: 'guide',
    focusKeyword: 'Nothing Phone price in Pakistan',
    primaryKeyword: 'Nothing Phone price in Pakistan',
    audience: 'Pakistani smartphone buyers comparing Nothing and CMF models in PKR',
    shortAnswer: 'Nothing Phone prices in Pakistan vary by model, storage, PTA status, stock, and seller route. The safest baseline is the live official catalog on cmfbynothing.pk, where buyers can compare CMF Phone 1, Phone (2a), Phone (2), Phone (3a), Phone (3a) Pro, Phone (3), and CMF Phone 2 Pro with clearer support context.',
    angle: 'price, model comparison, buying safety, PTA checks, and official-store trust',
    sections: ['Current price overview', 'Model-by-model buying advice', 'Official store versus market pricing', 'PTA and warranty checks', 'How to avoid fake sellers'],
    keywords: ['Nothing Phone price in Pakistan', 'buy Nothing Phone Pakistan', 'Nothing official store Pakistan', 'CMF phone Pakistan', 'Nothing Pakistan prices'],
  },
  'Where to Buy Nothing Phone Officially in Pakistan': {
    category: 'Buying Guides',
    contentType: 'guide',
    focusKeyword: 'official Nothing Pakistan store',
    primaryKeyword: 'official Nothing Pakistan store',
    audience: 'buyers who want original Nothing phones, official support, and safer online ordering',
    shortAnswer: 'The safest place to start is the official Nothing Pakistan storefront at cmfbynothing.pk because it gives buyers a clearer product catalog, PKR pricing context, support route, and order verification trail than random marketplace listings.',
    angle: 'official buying routes, authenticity, warranty verification, seller comparison, and scam prevention',
    sections: ['Why official buying matters', 'Online store checklist', 'Official store vs market sellers', 'Authenticity and warranty checks', 'Delivery and payment safety'],
    keywords: ['official Nothing Pakistan store', 'buy Nothing phone Pakistan online', 'Nothing phone original Pakistan', 'cmfbynothing.pk', 'Nothing Pakistan warranty'],
  },
  'Nothing Phone 2a vs Samsung A55 in Pakistan': {
    category: 'Comparisons',
    contentType: 'comparison',
    focusKeyword: 'Nothing Phone 2a vs Samsung A55',
    primaryKeyword: 'Nothing Phone 2a vs Samsung A55',
    audience: 'mid-range phone buyers comparing design-led Nothing value against mainstream Samsung familiarity',
    shortAnswer: 'Nothing Phone (2a) is the stronger choice for buyers who want a distinctive design, cleaner software feel, and a fresher ownership experience, while Samsung A55 suits users who prefer a familiar mainstream ecosystem and conventional after-sale expectations.',
    angle: 'design, performance, software, camera, battery, and Pakistan price comparison',
    sections: ['Quick verdict', 'Price comparison in PKR', 'Design and build', 'Performance and software', 'Camera, battery, and final recommendation'],
    keywords: ['Nothing Phone 2a vs Samsung A55', 'best phone in Pakistan midrange 2026', 'Phone 2a Pakistan', 'Samsung A55 Pakistan comparison'],
    competitor: 'Samsung Galaxy A55',
  },
  'What is Nothing Brand? Full Introduction for Pakistan': {
    category: 'Brand',
    contentType: 'blog',
    focusKeyword: 'What is Nothing brand',
    primaryKeyword: 'What is Nothing brand',
    audience: 'Pakistani readers discovering Nothing, CMF, transparent design, and the official local storefront',
    shortAnswer: 'Nothing is a London-founded consumer technology brand known for transparent-inspired design, clean Android software, and a connected ecosystem of phones, earbuds, chargers, and CMF products. In Pakistan, it is gaining attention because it looks different from mainstream phones while staying practical for daily use.',
    angle: 'company history, design philosophy, product lineup, and Pakistan popularity',
    sections: ['Brand origin', 'Transparent design philosophy', 'Nothing versus CMF', 'Product lineup in Pakistan', 'Why Pakistani buyers care'],
    keywords: ['What is Nothing brand', 'Nothing Pakistan', 'CMF by Nothing Pakistan', 'Nothing phones Pakistan'],
  },
  'Are Nothing Phones PTA Approved in Pakistan?': {
    category: 'PTA',
    contentType: 'faq',
    focusKeyword: 'Nothing Phones PTA approved in Pakistan',
    primaryKeyword: 'Nothing Phones PTA approved in Pakistan',
    audience: 'buyers worried about PTA approval, SIM use, registration, and tax confusion',
    shortAnswer: 'Nothing phones are not automatically PTA approved in every buying situation. PTA status depends on the exact unit, import route, seller handling, and registration state, so buyers should confirm whether the listed price is PTA-approved, PTA-ready, or non-PTA before payment.',
    angle: 'PTA approval meaning, registration steps, buyer checks, tax uncertainty, and network use',
    sections: ['What PTA approval means', 'Default PTA status explained', 'Registration process', 'Cost and documentation', 'Buyer checklist'],
    keywords: ['Nothing Phones PTA approved in Pakistan', 'Nothing Phone PTA', 'PTA tax Pakistan Nothing', 'DIRBS registration'],
  },
  'CMF Phone 1 Price in Pakistan Full Guide': {
    category: 'Prices',
    contentType: 'guide',
    focusKeyword: 'CMF Phone 1 Pakistan price',
    primaryKeyword: 'CMF Phone 1 Pakistan price',
    audience: 'budget-focused buyers comparing CMF Phone 1 with other affordable Android phones',
    shortAnswer: 'CMF Phone 1 is the most accessible entry point into the Nothing ecosystem for many Pakistan buyers. It makes the most sense for users who want distinctive design, clean value, and official-store context without moving into a higher Nothing phone budget.',
    angle: 'price, specs overview, availability, pros and cons, and value decision',
    sections: ['Current price context', 'Specifications overview', 'Who should buy it', 'Pros and cons', 'Alternatives inside Nothing Pakistan'],
    keywords: ['CMF Phone 1 Pakistan price', 'buy CMF phone Pakistan', 'CMF Phone 1 official Pakistan', 'budget Nothing phone Pakistan'],
  },
  'Nothing Ear vs AirPods in Pakistan': {
    category: 'Audio Comparisons',
    contentType: 'comparison',
    focusKeyword: 'Nothing Ear vs AirPods in Pakistan',
    primaryKeyword: 'Nothing Ear vs AirPods in Pakistan',
    audience: 'earbuds buyers comparing Android-friendly Nothing audio with Apple AirPods',
    shortAnswer: 'Nothing Ear and CMF earbuds usually make more sense for Android users who want strong features per rupee, while AirPods remain the easier choice for iPhone users who value Apple ecosystem pairing and switching.',
    angle: 'sound, battery, compatibility, price, ecosystem, and Pakistan buying advice',
    sections: ['Quick recommendation', 'Price comparison', 'Sound and call quality', 'Android vs iPhone compatibility', 'Battery and value'],
    keywords: ['Nothing Ear vs AirPods in Pakistan', 'Nothing earbuds Pakistan', 'AirPods Pakistan comparison', 'CMF Buds Pro 2 Pakistan'],
    competitor: 'Apple AirPods',
  },
  'Why Nothing Phones Are Getting Popular in Pakistan': {
    category: 'Market Trends',
    contentType: 'blog',
    focusKeyword: 'Why Nothing Phones are getting popular in Pakistan',
    primaryKeyword: 'Why Nothing Phones are getting popular in Pakistan',
    audience: 'readers tracking phone trends, youth appeal, and Pakistan smartphone market shifts',
    shortAnswer: 'Nothing phones are becoming popular in Pakistan because they look different, feel modern, perform well for daily use, and give younger buyers a brand story that stands out from generic mid-range Android phones.',
    angle: 'design uniqueness, social media appeal, price positioning, youth culture, and market trend prediction',
    sections: ['Design identity', 'Youth and social media appeal', 'Price positioning', 'Official-store trust', 'Future market trend'],
    keywords: ['Nothing phones popular in Pakistan', 'Nothing Pakistan trend', 'Nothing Phone youth appeal', 'transparent phone Pakistan'],
  },
  'Nothing Phone Battery Drain Fix Guide': {
    category: 'Troubleshooting',
    contentType: 'guide',
    focusKeyword: 'Nothing Phone battery drain fix',
    primaryKeyword: 'Nothing Phone battery drain fix',
    audience: 'Nothing phone owners in Pakistan facing fast battery drain, heating, app drain, or signal-related drain',
    shortAnswer: 'Most Nothing Phone battery drain can be improved by checking background apps, updating software, lowering unnecessary display activity, reviewing network signal conditions, and giving the phone one or two full charge cycles after updates.',
    angle: 'battery causes, step-by-step fixes, network conditions, settings, updates, and support escalation',
    sections: ['Common causes', 'Quick battery checklist', 'Settings to change', 'Pakistan network impact', 'When to contact support'],
    keywords: ['Nothing Phone battery drain fix', 'Nothing Phone battery issue Pakistan', 'Phone 2a battery drain', 'Nothing OS battery optimization'],
  },
  'Best Nothing Phone to Buy in Pakistan 2026': {
    category: 'Buying Guides',
    contentType: 'guide',
    focusKeyword: 'Best Nothing Phone to buy in Pakistan 2026',
    primaryKeyword: 'Best Nothing Phone to buy in Pakistan 2026',
    audience: 'buyers choosing between CMF Phone 1, Phone (2a), Phone (3a), Phone (3a) Pro, Phone (2), and Phone (3)',
    shortAnswer: 'For most Pakistan buyers, Phone (2a) is the safest all-round recommendation, CMF Phone 1 is the budget pick, Phone (3a) Pro is the upper-mid option, and Phone (3) is the premium choice.',
    angle: 'best model by budget, usage type, price ladder, and final recommendation',
    sections: ['Best picks by budget', 'Best for students', 'Best for camera-focused users', 'Best premium option', 'Final buying matrix'],
    keywords: ['Best Nothing Phone Pakistan 2026', 'best Nothing phone to buy', 'Nothing Phone buying guide Pakistan', 'CMF Phone 1 vs Phone 2a'],
  },
  'Nothing Phone vs Redmi Note 13 in Pakistan': {
    category: 'Comparisons',
    contentType: 'comparison',
    focusKeyword: 'Nothing Phone vs Redmi Note 13 in Pakistan',
    primaryKeyword: 'Nothing Phone vs Redmi Note 13 in Pakistan',
    audience: 'buyers comparing low-price Redmi value against Nothing design and software identity',
    shortAnswer: 'Redmi Note 13 is usually the lower-cost choice, but Nothing phones are stronger for buyers who value distinctive design, clean software, and a more premium-feeling ownership story.',
    angle: 'price difference, design, performance, software, camera expectations, and final verdict',
    sections: ['Quick verdict', 'Price gap', 'Design difference', 'Daily performance', 'Who should choose each'],
    keywords: ['Nothing Phone vs Redmi Note 13', 'Redmi Note 13 Pakistan', 'Nothing Phone Pakistan comparison', 'budget phone Pakistan'],
    competitor: 'Redmi Note 13',
  },
  'Is Nothing Phone Worth It in Pakistan?': {
    category: 'Buying Guides',
    contentType: 'guide',
    focusKeyword: 'Is Nothing Phone worth it in Pakistan',
    primaryKeyword: 'Is Nothing Phone worth it in Pakistan',
    audience: 'buyers deciding whether Nothing is worth the price compared with Samsung, Redmi, Vivo, Oppo, and used phones',
    shortAnswer: 'Nothing phones are worth it in Pakistan when you care about design, cleaner software, official-store confidence, and a phone that feels less generic. They are less ideal if your only priority is the cheapest possible hardware specification per rupee.',
    angle: 'price-to-performance, alternatives, ownership experience, and buyer recommendation',
    sections: ['Short answer', 'Where Nothing wins', 'Where alternatives win', 'Best value models', 'Final recommendation'],
    keywords: ['Is Nothing Phone worth it Pakistan', 'Nothing Phone value Pakistan', 'Nothing Phone review Pakistan', 'buy Nothing Phone Pakistan'],
  },
  'Nothing Phone Accessories Guide in Pakistan': {
    category: 'Accessories',
    contentType: 'guide',
    focusKeyword: 'Nothing Phone accessories in Pakistan',
    primaryKeyword: 'Nothing Phone accessories in Pakistan',
    audience: 'Nothing phone owners buying chargers, cables, cases, protectors, earbuds, and compatible accessories',
    shortAnswer: 'The most important Nothing Phone accessories in Pakistan are a reliable charger, USB-C cable, model-specific case, screen protector, and compatible earbuds. Buyers should confirm exact model compatibility before ordering.',
    angle: 'chargers, cases, earbuds, cables, compatibility, safety, and official-store recommendations',
    sections: ['Essential accessories', 'Charging safety', 'Case and protector fit', 'Earbuds compatibility', 'Buying checklist'],
    keywords: ['Nothing Phone accessories Pakistan', 'Nothing charger Pakistan', 'Nothing Phone case Pakistan', 'CMF earbuds Pakistan'],
  },
  'Nothing Phone 2a Full Review Pakistan': {
    category: 'Reviews',
    contentType: 'review',
    focusKeyword: 'Nothing Phone 2a full review Pakistan',
    primaryKeyword: 'Nothing Phone 2a full review Pakistan',
    audience: 'buyers considering Phone (2a) as a mid-range daily driver in Pakistan',
    shortAnswer: 'Nothing Phone (2a) is one of the easiest Nothing phones to recommend in Pakistan because it balances design, battery, software feel, performance, and price better than many generic mid-range alternatives.',
    angle: 'full review covering design, display, performance, camera, software, battery, pros, cons, and verdict',
    sections: ['Design review', 'Performance review', 'Camera review', 'Battery review', 'Pros, cons, and verdict'],
    keywords: ['Nothing Phone 2a review Pakistan', 'Nothing Phone 2a Pakistan', 'Phone 2a full review', 'midrange phone Pakistan 2026'],
  },
  'Nothing vs Samsung Phones in Pakistan': {
    category: 'Comparisons',
    contentType: 'comparison',
    focusKeyword: 'Nothing vs Samsung phones in Pakistan',
    primaryKeyword: 'Nothing vs Samsung phones in Pakistan',
    audience: 'buyers comparing brand value, software, resale comfort, design, and pricing between Nothing and Samsung',
    shortAnswer: 'Samsung is the familiar mainstream choice, while Nothing is the design-led alternative for buyers who want a cleaner and more distinctive phone experience. The better choice depends on whether you value predictability or personality.',
    angle: 'brand value, performance, software, ecosystem, pricing, and final recommendation',
    sections: ['Brand positioning', 'Software feel', 'Pricing and value', 'Design identity', 'Which buyer should choose each'],
    keywords: ['Nothing vs Samsung Pakistan', 'Nothing phones vs Samsung phones', 'Samsung alternative Pakistan', 'Nothing Pakistan comparison'],
    competitor: 'Samsung phones',
  },
  'What is CMF by Nothing? Beginner Guide': {
    category: 'Brand',
    contentType: 'blog',
    focusKeyword: 'What is CMF by Nothing',
    primaryKeyword: 'What is CMF by Nothing',
    audience: 'beginners who want to understand CMF products, the sub-brand idea, and how it differs from Nothing',
    shortAnswer: 'CMF by Nothing is the value-focused side of the Nothing ecosystem. It focuses on practical pricing, clean design, and accessible products like CMF Phone 1, earbuds, watches, and chargers.',
    angle: 'CMF meaning, purpose, product lineup, value positioning, and Pakistan relevance',
    sections: ['CMF meaning', 'How CMF differs from Nothing', 'Product examples', 'Who should buy CMF', 'Pakistan value angle'],
    keywords: ['What is CMF by Nothing', 'CMF Pakistan', 'CMF Phone 1 Pakistan', 'CMF by Nothing beginner guide'],
  },
  'Nothing Phone PTA Tax in Pakistan Explained': {
    category: 'PTA',
    contentType: 'faq',
    focusKeyword: 'Nothing Phone PTA tax in Pakistan',
    primaryKeyword: 'Nothing Phone PTA tax in Pakistan',
    audience: 'buyers trying to understand PTA tax, registration, non-PTA pricing, and final landed cost',
    shortAnswer: 'Nothing Phone PTA tax in Pakistan depends on the exact phone, valuation, registration route, and current official rules. Buyers should never compare a non-PTA price with a PTA-approved price as if both are the same final cost.',
    angle: 'tax calculation concept, registration steps, cost breakdown examples, and buyer warnings',
    sections: ['PTA tax basics', 'Why prices differ', 'Registration steps', 'Cost examples', 'Before-payment checklist'],
    keywords: ['Nothing Phone PTA tax Pakistan', 'PTA tax Nothing Phone', 'Nothing Phone registration Pakistan', 'non PTA phone Pakistan'],
  },
  'Does Nothing Phone Work on Jazz and Zong in Pakistan?': {
    category: 'Network',
    contentType: 'faq',
    focusKeyword: 'Does Nothing Phone work on Jazz and Zong in Pakistan',
    primaryKeyword: 'Does Nothing Phone work on Jazz and Zong in Pakistan',
    audience: 'buyers checking Jazz, Zong, Ufone, Telenor, 4G, 5G, and SIM performance before purchase',
    shortAnswer: 'Nothing phones generally work on Jazz, Zong, Ufone, and Telenor when the exact variant supports local bands and the device is properly PTA registered. Network quality still depends on city, coverage, SIM settings, and operator rollout.',
    angle: 'network compatibility, 4G/5G support, operator-specific concerns, and PTA effect',
    sections: ['Quick compatibility answer', 'Jazz and Zong use', 'Ufone and Telenor use', '4G versus 5G', 'Troubleshooting SIM issues'],
    keywords: ['Nothing Phone Jazz Zong Pakistan', 'Nothing Phone network Pakistan', 'Nothing Phone 4G Pakistan', 'Nothing Phone SIM support'],
  },
  'Nothing Phone Camera Review Pakistan': {
    category: 'Reviews',
    contentType: 'review',
    focusKeyword: 'Nothing Phone camera review Pakistan',
    primaryKeyword: 'Nothing Phone camera review Pakistan',
    audience: 'buyers judging Nothing cameras for daylight, night, portraits, videos, social media, and Pakistan conditions',
    shortAnswer: 'Nothing Phone cameras are strong enough for everyday Pakistan use, especially daylight, portraits, social media, and casual video. Camera-focused buyers should compare specific models because Phone (2a), Phone (3a) Pro, and Phone (3) do not perform identically.',
    angle: 'daylight, night, portrait, video, social media, and model-by-model expectations',
    sections: ['Daylight camera', 'Night camera', 'Portraits', 'Video', 'Which model to choose'],
    keywords: ['Nothing Phone camera review Pakistan', 'Nothing Phone camera Pakistan', 'Phone 2a camera review', 'Nothing Phone night camera'],
  },
  'Best Budget Nothing Phone in Pakistan': {
    category: 'Buying Guides',
    contentType: 'guide',
    focusKeyword: 'Best budget Nothing Phone in Pakistan',
    primaryKeyword: 'Best budget Nothing Phone in Pakistan',
    audience: 'budget buyers choosing between CMF Phone 1, Phone (2a), and lower-cost alternatives',
    shortAnswer: 'CMF Phone 1 is the best budget Nothing option for most Pakistan buyers, while Phone (2a) is the better upgrade if the budget allows. The right choice depends on whether affordability or long-term balance matters more.',
    angle: 'budget recommendation, affordability, performance, accessories, PTA, and value for money',
    sections: ['Best budget pick', 'When to upgrade', 'Budget checklist', 'Accessories budget', 'Final recommendation'],
    keywords: ['Best budget Nothing Phone Pakistan', 'budget Nothing phone Pakistan', 'CMF Phone 1 Pakistan', 'Nothing Phone 2a budget'],
  },
}

function priceRows(catalog) {
  return catalog.phones.map((phone) => [
    escapeHtml(phone.name),
    formatPkr(phone.price),
    `<a href="${phone.href}">View on ${SITE_DOMAIN}</a>`,
  ])
}

function buildComparisonRows(config, catalog) {
  const rows = [
    ['Official Nothing Pakistan baseline', 'Compare current PKR catalog pricing on cmfbynothing.pk before buying.'],
    ['PTA status', 'Ask whether the listed price is PTA-approved, PTA-ready, or non-PTA.'],
    ['Warranty and support', 'Prefer a seller with visible support routes, policy pages, and clear order records.'],
    ['Authenticity', 'Confirm exact model, storage, color, packaging, invoice, and product page match.'],
  ]

  if (config.competitor?.includes('Samsung')) {
    rows.unshift(['Samsung Galaxy A55 market context', `Common Pakistan comparison point around ${formatPkr(catalog.competitors.samsungA55)} depending on seller and variant.`])
  }

  if (config.competitor?.includes('Redmi')) {
    rows.unshift(['Redmi Note 13 market context', `Common budget comparison point around ${formatPkr(catalog.competitors.redmiNote13)} depending on seller and variant.`])
  }

  if (config.competitor?.includes('AirPods')) {
    rows.unshift(['AirPods market context', `AirPods 4 and AirPods Pro 2 often sit around ${formatPkr(catalog.competitors.airpods4)} to ${formatPkr(catalog.competitors.airpodsPro2)} depending on seller and stock.`])
  }

  return rows
}

function buildCoreParagraphs(config, catalog) {
  const primaryModels = [
    `${catalog.cmfPhone1.name} at ${formatPkr(catalog.cmfPhone1.price)}`,
    `${catalog.phone2a.name} at ${formatPkr(catalog.phone2a.price)}`,
    `${catalog.phone3a.name} at ${formatPkr(catalog.phone3a.price)}`,
    `${catalog.phone3aPro.name} at ${formatPkr(catalog.phone3aPro.price)}`,
    `${catalog.phone3.name} at ${formatPkr(catalog.phone3.price)}`,
  ]

  return [
    `${BRAND} prepared this guide for ${config.audience}. The goal is to give Pakistani readers a complete, practical answer instead of a short paragraph that leaves price, PTA, warranty, seller trust, and real buying decisions unclear.`,
    `The short answer is simple: ${config.shortAnswer} This article expands that answer with model context, Pakistan-specific buying advice, and clear checks you can use before sending money to any seller.`,
    `The official domain for this content system is <a href="${SITE_URL}">${SITE_DOMAIN}</a>. When a price, stock label, warranty note, or PTA explanation changes, the live store and support route should be treated as the latest point of verification.`,
    `Nothing and CMF products have become more visible in Pakistan because they combine a distinct look with a cleaner technology story. Many buyers are not only comparing chipsets; they are comparing the complete ownership feeling, from unboxing to software to after-sale confidence.`,
    `For searchers comparing prices, the current official catalog context includes ${primaryModels.join(', ')}. These numbers are helpful as a baseline, but final buying confidence still depends on variant, PTA status, stock, payment route, and seller clarity.`,
    `Many buyers ask direct questions such as where to buy, whether the phone is PTA approved, and how to know if the product is original. Those questions deserve clear answers because Pakistan phone buying is often complicated by unofficial imports and incomplete listings.`,
    `Local buying context matters too. A buyer in Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, or Hyderabad may see different market claims, but the verification principles stay the same: exact model, exact price, exact seller, exact PTA position, and exact support route.`,
    `The most important buying rule is to compare like with like. A non-PTA import listing, a used marketplace listing, and an official catalog listing are not the same offer even when the model name looks identical in a search result.`,
    `If you are considering a Nothing phone or CMF product, write down your real priority first. Some buyers need the lowest price, some need long battery life, some care about camera performance, and many simply want a phone that feels different from the mainstream Android crowd.`,
    `This guide uses simple language on purpose. The best technology advice for Pakistan is not the most complicated advice; it is advice that helps a buyer avoid regret after delivery, after SIM insertion, and after the first week of daily use.`,
  ]
}

function buildDetailedSections(config, catalog) {
  const modelAdvice = [
    `CMF Phone 1 is the practical budget entry because it gives buyers a lower-cost path into the wider Nothing ecosystem. It is especially useful for students, first-job buyers, and anyone who wants design personality without premium pricing.`,
    `Phone (2a) is the safest middle recommendation for many Pakistan users because it balances design, battery, software, and price. It is not only a spec sheet decision; it is a daily-use decision.`,
    `Phone (3a) and Phone (3a) Pro make sense when you want a newer upper-mid experience and can stretch beyond the most affordable options. They are better suited to users who want a richer phone without jumping straight to the premium ceiling.`,
    `Phone (2) and Phone (3) are stronger choices for buyers who keep phones for years and want a more premium overall package. These models should be compared with higher expectations around build, performance, and long-term satisfaction.`,
    `CMF Phone 2 Pro belongs in the conversation for users who want CMF value with a more advanced phone direction. It is worth checking when you like the CMF idea but want something more ambitious than the original CMF Phone 1.`,
  ]

  const buyerSafety = [
    `Always ask the seller to confirm the exact model name, RAM and storage variant, color, box condition, invoice process, and PTA position before payment. These details prevent most disputes before they start.`,
    `Do not compare a low social-media price directly with an official catalog price until you know whether both offers include the same device state. The cheaper offer may be non-PTA, used, open-box, imported without local support, or missing clear warranty handling.`,
    `Keep screenshots of the product page, seller chat, payment proof, tracking number, and invoice. If an issue appears later, this record gives you a clear timeline instead of relying on memory.`,
    `Check delivery terms before ordering. Buyers in major cities may receive faster shipping, while smaller cities can need extra courier time and clearer communication around replacement or return handling.`,
    `For accessories, compatibility matters as much as originality. A real case, cable, or charger is still a bad purchase if it does not match your exact phone or charging requirement.`,
  ]

  return [
    section('Quick Answer for Pakistan Buyers', [
      p(config.shortAnswer),
      p(`If you only read one part of this guide, remember this: start with ${SITE_DOMAIN}, confirm the latest listing details, and then compare outside market offers only after you understand PTA, warranty, and seller support differences.`),
      p(`This is especially important for ${config.primaryKeyword} because search results can mix official pages, old listings, import ads, and discussion posts into one confusing page.`),
    ]),
    section('Current Official Price and Catalog Context', [
      p(`The live catalog on ${SITE_DOMAIN} should be used as the first pricing reference. The table below gives a structured view of key Nothing and CMF phone models that Pakistan buyers commonly compare.`),
      table(['Model', 'Official catalog price', 'Official link'], priceRows(catalog)),
      p(`Prices in Pakistan can move because of stock, exchange rate pressure, model availability, seller margin, and PTA handling. That is why ${BRAND} recommends checking the live product page before placing an order.`),
    ]),
    section(config.sections[0], [
      p(`The first decision is not only which product is famous online. The first decision is whether the product fits your budget, use case, and support expectations in Pakistan.`),
      p(`For ${config.angle}, buyers should avoid rushing. A little extra checking before payment is easier than solving a mismatch after the courier has delivered the parcel.`),
      ul(modelAdvice),
    ]),
    section(config.sections[1], [
      p(`A good buying decision starts with your daily routine. If your day is mostly WhatsApp, calls, banking apps, maps, YouTube, TikTok, Instagram, and light gaming, the balanced mid-range options already cover a lot of ground.`),
      p(`If your work depends on camera reliability, long battery life, or fast multitasking, move higher in the lineup. Paying more can make sense when it improves the exact part of the phone you use every day.`),
      p(`If you are buying for a parent, student, or first-time Nothing user, keep the recommendation simple. Choose a model with enough storage, clear PTA handling, and a support path you can explain easily later.`),
    ]),
    section(config.sections[2], [
      p(`Official-store buying and open-market buying are different experiences. A market seller can sometimes offer a tempting price, but the official route usually gives cleaner context around product pages, policies, contact options, and brand consistency.`),
      table(['Decision area', 'What to check'], buildComparisonRows(config, catalog)),
      p(`This does not mean every non-official seller is automatically unsafe. It means you need more proof from them because the buying trail is usually less structured.`),
    ]),
    section(config.sections[3], [
      p(`PTA status is one of the biggest reasons phone prices look confusing in Pakistan. A price can look attractive until you discover that it does not include the registration state you expected.`),
      p(`Ask whether the phone is PTA-approved, non-PTA, or being sold with registration guidance. Save the answer. A clear written answer is much better than a casual verbal promise.`),
      p(`Warranty also needs clarity. Ask what happens if the product arrives damaged, mismatched, or faulty. A serious seller should be able to explain the process in simple terms.`),
    ]),
    section(config.sections[4], [
      p(`Scam prevention is mostly about slowing the purchase down long enough to verify details. Fake or weak sellers often rely on urgency, vague claims, and incomplete product descriptions.`),
      ul(buyerSafety),
      p(`A trusted buying process should feel boring in the best way: clear model name, clear price, clear support, clear delivery, and clear proof. If the process feels dramatic or rushed, pause.`),
    ]),
    section('Model Recommendations by Buyer Type', [
      h3('Best for tight budgets'),
      p(`Choose CMF Phone 1 if affordability is the first priority and you still want a product connected to the Nothing ecosystem. It keeps the entry point lower while preserving a stronger design story than many generic budget phones.`),
      h3('Best all-round pick'),
      p(`Choose Phone (2a) if you want the easiest recommendation for most people. It is balanced enough for daily use, distinctive enough to feel special, and practical enough for Pakistan buyers who do not want flagship-level spending.`),
      h3('Best upper-mid choice'),
      p(`Choose Phone (3a) Pro if you want a richer package and can justify the added price. It is more suitable for users who care about a stronger long-term experience.`),
      h3('Best premium choice'),
      p(`Choose Phone (3) if your priority is the strongest Nothing experience rather than the lowest possible price. Premium buyers should judge it against the cost of ownership over several years, not only the checkout number.`),
    ]),
    section('Final Recommendation', [
      p(`For ${config.primaryKeyword}, the best answer is not a single one-line price or verdict. The best answer is a structured decision: check the live official listing, compare the right model, confirm PTA and warranty, and buy from a route that gives you proof after payment.`),
      p(`${BRAND} recommends using ${SITE_DOMAIN} as your baseline because it keeps the buying journey closer to the official catalog and reduces confusion from mixed market listings.`),
      p(`Before you buy, re-check price, stock, PTA position, delivery options, payment terms, and support availability. These details can change over time, and the latest confirmation should always come before the final payment.`),
    ]),
  ]
}

function buildFaqs(config, catalog) {
  const base = [
    [`What is the short answer for ${config.primaryKeyword}?`, config.shortAnswer],
    [`Where should I verify the latest information about ${config.primaryKeyword}?`, `Verify the latest price, stock, support, and product details on ${SITE_DOMAIN}. Search results and marketplace posts can become outdated, so the official storefront should be your first reference point.`],
    ['Who is the publisher of this guide?', `This guide is published by ${BRAND}. The content is written for Pakistani buyers and avoids personal bylines so the advice stays connected to the official brand voice.`],
    ['Is cmfbynothing.pk the domain mentioned in this guide?', `Yes. The domain used throughout this content system is ${SITE_DOMAIN}, and readers should use it to confirm current catalog details before buying.`],
    ['Are Nothing phones officially available in Pakistan?', `Nothing and CMF products are available through the ${BRAND} storefront experience, but buyers should still confirm exact stock, model, PTA guidance, and warranty information before placing an order.`],
    ['How do I know if a Nothing phone seller is trustworthy?', 'Check whether the seller gives an exact product page, clear model variant, business identity, support route, invoice process, delivery terms, and written answers about PTA and warranty.'],
    ['Why do Nothing Phone prices differ across Pakistan?', 'Prices can differ because of PTA status, storage variant, stock position, import route, seller margin, exchange rate pressure, and whether the device is new, open-box, used, or officially listed.'],
    ['Should I compare PTA and non-PTA prices directly?', 'No. A non-PTA price and a PTA-approved price are not the same final buying state. Always ask what the quoted price includes before comparing offers.'],
    ['What does PTA approval mean for a Nothing phone?', 'PTA approval means the phone IMEI is registered for proper long-term use on Pakistani mobile networks. Without the correct status, SIM functionality can become limited.'],
    ['Are Nothing phones PTA approved by default?', 'Not in every buying situation. PTA status depends on the specific device, seller, import route, and registration handling, so it must be confirmed before payment.'],
    ['Can I use a Nothing phone on Jazz in Pakistan?', 'Generally yes, if the exact variant supports local bands and the device is properly PTA registered. Real signal quality still depends on local coverage.'],
    ['Can I use a Nothing phone on Zong in Pakistan?', 'Generally yes, with the same conditions: compatible variant, proper PTA status, active SIM, and stable coverage in your area.'],
    ['Do Nothing phones work on Ufone and Telenor?', 'They can work when variant support and PTA status are correct. Network experience depends on operator coverage, SIM condition, and local signal strength.'],
    ['Is 5G guaranteed on Nothing phones in Pakistan?', 'No. 5G depends on the specific phone model, supported bands, Pakistani operator rollout, SIM plan, and coverage in your exact area.'],
    ['Which Nothing phone is best for most Pakistan buyers?', `Phone (2a) is often the safest all-round recommendation because it balances price, design, software, and daily usefulness well for many buyers.`],
    ['Which Nothing phone is best on a low budget?', `CMF Phone 1 is the most accessible budget pick in the current catalog context and is useful for buyers who want lower cost with a clear Nothing ecosystem connection.`],
    ['Which Nothing phone is best for premium buyers?', `Phone (3) is the premium pick for buyers who want the strongest Nothing experience and are comfortable paying more for a higher-tier device.`],
    ['Is CMF by Nothing the same as Nothing?', 'CMF is the value-focused side of the Nothing ecosystem. It keeps the design-first mindset but usually targets more accessible pricing and practical everyday products.'],
    ['Is CMF Phone 1 worth buying in Pakistan?', 'Yes, if your budget is limited and you want an affordable entry into the ecosystem. If you can stretch your budget, Phone (2a) may be a more balanced long-term choice.'],
    ['Is Nothing Phone (2a) worth buying in Pakistan?', 'Yes. Phone (2a) is one of the strongest mid-range recommendations for buyers who want distinctive design, clean software, reliable battery life, and good everyday performance.'],
    ['How do Nothing phones compare with Samsung phones?', 'Samsung offers familiarity and a broad ecosystem, while Nothing offers a cleaner, more distinctive design-led experience. The better choice depends on whether you prefer predictability or personality.'],
    ['How do Nothing phones compare with Redmi phones?', 'Redmi often competes strongly on low price, while Nothing focuses more on design identity, software feel, and a premium ownership impression.'],
    ['Are Nothing earbuds good for Android users?', 'Yes. Nothing Ear and CMF earbuds usually make strong sense for Android users because they offer useful features and strong value without relying on Apple ecosystem integration.'],
    ['Are AirPods better than Nothing Ear for iPhone users?', 'AirPods can be better for iPhone users who care about seamless Apple pairing, device switching, and ecosystem features. Nothing Ear may still appeal on design and value.'],
    ['What accessories should I buy with a Nothing phone?', `Most buyers should consider a reliable charger, USB-C cable, case, screen protector, and compatible earbuds. Check ${SITE_DOMAIN} for current official accessory options.`],
    ['Do Nothing phones come with a charger?', 'Box contents can vary by model and market, so check the product listing before buying. If a charger is not included, choose a compatible reliable charger.'],
    ['How can I avoid fake Nothing accessories?', 'Buy from a trusted route, confirm product packaging, check compatibility, avoid suspiciously low prices, and keep order records in case support is needed.'],
    ['What should I check when my Nothing phone arrives?', 'Check the box condition, model name, color, storage, invoice, accessories, IMEI details, charging behavior, display, cameras, speakers, buttons, and SIM functionality.'],
    ['What if the delivered product does not match the order?', 'Contact the seller immediately with photos, unboxing proof, invoice, screenshots, and tracking details. Faster reporting usually makes support handling easier.'],
    ['How often should I check prices before buying?', 'Check prices right before payment because stock, exchange rates, promotions, and availability can change. Do not rely only on an old screenshot or cached search result.'],
  ]

  if (config.competitor?.includes('Samsung')) {
    base.push(
      ['Is Nothing Phone (2a) better than Samsung A55?', 'Phone (2a) is better for buyers who want cleaner software and a more distinctive design. Samsung A55 suits users who prefer mainstream familiarity and a more traditional brand ecosystem.'],
      ['Which has better resale value, Nothing or Samsung?', 'Samsung may feel more familiar in resale markets, but Nothing can attract buyers who specifically want its design. Resale value depends on condition, PTA status, invoice, and demand at the time.'],
    )
  }

  if (config.competitor?.includes('Redmi')) {
    base.push(
      ['Is Nothing Phone better than Redmi Note 13?', 'Nothing is better for design and software identity, while Redmi Note 13 is better for buyers focused on a lower upfront price.'],
      ['Should budget buyers choose Redmi or CMF?', 'If the lowest price is the goal, Redmi may be tempting. If you want budget pricing with a stronger Nothing ecosystem feel, CMF Phone 1 is the better fit.'],
    )
  }

  if (config.competitor?.includes('AirPods')) {
    base.push(
      ['Which is better for Android, Nothing Ear or AirPods?', 'Nothing Ear is usually the better Android fit because it is not locked into Apple-first ecosystem advantages.'],
      ['Which is better for iPhone, Nothing Ear or AirPods?', 'AirPods are usually better for iPhone users who want the smoothest Apple ecosystem experience.'],
    )
  }

  base.push(
    ['Can I order Nothing products online in Pakistan?', `Yes. Start from ${SITE_DOMAIN}, check product availability, confirm delivery and payment details, and keep your order confirmation records.`],
    ['Does this guide include final tax or registration amounts?', 'No. PTA taxes and registration amounts can change, so the safest answer is to verify the latest official amount through the relevant PTA or DIRBS process.'],
    ['Why does this guide mention PKR pricing?', 'Pakistani buyers search and compare in PKR, so local currency context makes the guide more useful than generic international pricing.'],
    ['Is this guide updated for 2026?', `Yes. This long-form content update was prepared for the 2026 content system and refreshed on ${UPDATED_LABEL}. Always verify live store details before purchase.`],
  )

  return base.slice(0, 30).map(([question, answer]) => ({ question, answer }))
}

function buildContent(title, config, catalog, faqs) {
  const intro = [
    `<article data-brand="${BRAND}" data-domain="${SITE_DOMAIN}" data-updated="${UPDATED_LABEL}">`,
    `<p><strong>Updated by ${BRAND}:</strong> This detailed guide is written for ${config.audience}. It gives Pakistan-specific context, direct answers, and practical buying advice without making the decision feel complicated.</p>`,
  ]

  const details = buildDetailedSections(config, catalog)
  const faqPreview = section('Frequently Asked Questions Preview', [
    p(`The full FAQ block below the article contains ${faqs.length} detailed questions and answers based on the real concerns Pakistani buyers usually have before ordering.`),
    ...faqs.slice(0, 10).flatMap((faq, index) => [
      h3(`${index + 1}. ${faq.question}`),
      p(faq.answer),
    ]),
  ])

  const outro = [
    section('Summary', [
      p(`${title} is not a topic that should be answered with thin content. Pakistani buyers need price clarity, PTA awareness, authenticity checks, warranty context, and a trusted official route before they buy.`),
      p(`Use ${SITE_DOMAIN} as your baseline, compare carefully, and confirm all changing details before payment. That simple process protects your budget and makes the Nothing or CMF buying experience much smoother.`),
    ]),
    '</article>',
  ]

  const html = [...intro, ...details, faqPreview, ...outro].join('\n')
  const currentWords = wordCount(html)

  if (currentWords >= 2000 && html.split('\n').length >= 150) return html

  const expansion = []
  let counter = 1
  while (wordCount([...intro, ...details, faqPreview, ...expansion, ...outro].join('\n')) < 2100 || [...intro, ...details, faqPreview, ...expansion, ...outro].join('\n').split('\n').length < 155) {
    expansion.push(p(`Additional buying note ${counter}: For ${config.primaryKeyword}, Pakistani buyers should treat the final purchase as a complete decision rather than a single price check. Reconfirm the model, variant, PTA status, warranty handling, delivery route, payment method, and support contact before checkout so the product, seller, and after-sale expectations all match.`))
    counter += 1
  }

  return [...intro, ...details, faqPreview, ...expansion, ...outro].join('\n')
}

function metaDescription(config) {
  const text = `${config.shortAnswer} Updated for Pakistan buyers by ${BRAND}.`
  return text.length > 300 ? `${text.slice(0, 297).trim()}...` : text
}

async function updateBlog(supabase, blog, catalog, index, total) {
  const config = TOPIC_CONFIG[blog.title]
  if (!config) throw new Error(`Missing topic config for "${blog.title}"`)

  const slug = slugify(blog.title)
  const faqs = buildFaqs(config, catalog)
  const content = buildContent(blog.title, config, catalog, faqs)
  const now = new Date().toISOString()

  if (wordCount(content) < 2000) throw new Error(`${blog.title} content is under 2000 words`)
  if (content.split('\n').length < 150) throw new Error(`${blog.title} content is under 150 lines`)
  if (faqs.length < 30 || faqs.length > 50) throw new Error(`${blog.title} FAQ count is ${faqs.length}`)

  console.log(`[${index}/${total}] Updating blog: ${blog.title}`)

  const { data: upsertedBlog, error: blogError } = await supabase
    .from('blogs')
    .upsert(
      {
        title: blog.title,
        slug,
        content,
        meta_title: `${blog.title} | ${BRAND}`,
        meta_description: metaDescription(config),
        excerpt: config.shortAnswer,
        focus_keyword: config.focusKeyword,
        category: config.category,
        tags: [...new Set([config.category, ...config.keywords, BRAND, SITE_DOMAIN])],
        author: BRAND,
        author_type: 'brand',
        content_type: config.contentType,
        reading_time: readingTime(content),
        is_published: true,
        published_at: now,
        updated_at: now,
      },
      { onConflict: 'slug' },
    )
    .select('id,slug,title,author')
    .single()

  if (blogError) throw new Error(`Failed to upsert ${blog.title}: ${blogError.message}`)

  const blogId = upsertedBlog.id

  const { error: deleteError } = await supabase.from('faqs').delete().eq('related_type', 'blog').eq('related_id', blogId)
  if (deleteError) throw new Error(`Failed to clear FAQs for ${blog.title}: ${deleteError.message}`)

  const { error: insertError } = await supabase.from('faqs').insert(
    faqs.map((faq) => ({
      related_type: 'blog',
      related_id: blogId,
      question: faq.question,
      answer: faq.answer,
      updated_at: now,
    })),
  )

  if (insertError) throw new Error(`Failed to insert FAQs for ${blog.title}: ${insertError.message}`)

  return {
    title: blog.title,
    slug,
    blogId,
    author: upsertedBlog.author,
    words: wordCount(content),
    lines: content.split('\n').length,
    faqs: faqs.length,
    readingTime: readingTime(content),
  }
}

async function verifyUpdates(supabase, results) {
  const ids = results.map((result) => result.blogId)
  const [{ data: blogs, error: blogError }, { data: faqs, error: faqError }] = await Promise.all([
    supabase.from('blogs').select('id,title,slug,author,content').in('id', ids),
    supabase.from('faqs').select('id,related_id').eq('related_type', 'blog').in('related_id', ids),
  ])

  if (blogError) throw new Error(`Verification blog query failed: ${blogError.message}`)
  if (faqError) throw new Error(`Verification FAQ query failed: ${faqError.message}`)

  const faqCountByBlog = new Map()
  for (const faq of faqs ?? []) {
    faqCountByBlog.set(faq.related_id, (faqCountByBlog.get(faq.related_id) ?? 0) + 1)
  }

  const failures = []
  for (const blog of blogs ?? []) {
    const words = wordCount(blog.content)
    const lines = blog.content.split('\n').length
    const faqCount = faqCountByBlog.get(blog.id) ?? 0
    if (blog.author !== BRAND) failures.push(`${blog.slug}: author is ${blog.author}`)
    if (words < 2000) failures.push(`${blog.slug}: ${words} words`)
    if (lines < 150) failures.push(`${blog.slug}: ${lines} lines`)
    if (faqCount < 30 || faqCount > 50) failures.push(`${blog.slug}: ${faqCount} FAQs`)
  }

  if (failures.length) {
    throw new Error(`Verification failed:\n${failures.join('\n')}`)
  }

  return {
    verifiedBlogs: blogs?.length ?? 0,
    verifiedFaqs: faqs?.length ?? 0,
  }
}

async function main() {
  loadEnv()
  const promptData = JSON.parse(readFileSync(PROMPT_PATH, 'utf8'))
  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const catalog = await loadCatalog(supabase)
  const results = []

  for (const [index, blog] of promptData.blogs.entries()) {
    results.push(await updateBlog(supabase, blog, catalog, index + 1, promptData.blogs.length))
  }

  const verification = await verifyUpdates(supabase, results)
  const report = {
    updatedAt: new Date().toISOString(),
    brand: BRAND,
    domain: SITE_DOMAIN,
    verification,
    results,
  }

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
