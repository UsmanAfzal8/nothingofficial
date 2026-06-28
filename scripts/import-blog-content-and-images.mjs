import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

const ROOT = process.cwd()
const TMP_DIR = path.join(ROOT, 'tmp', 'blog-assets')
const GENERATED_DIR = path.join(TMP_DIR, 'generated')
const BACKGROUND_PATH = path.join(TMP_DIR, 'canva-background.png')
const PROMPT_PATH = path.join(ROOT, 'blog_prompt.json')
const SITE_URL = 'https://www.nothingpakistan.pk'
const SITE_DOMAIN = 'www.nothingpakistan.pk'
const UPDATED_AT_LABEL = 'June 21, 2026'
const AUTHOR = 'Nothing Pakistan'

mkdirSync(GENERATED_DIR, { recursive: true })

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

function formatPkr(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'Price on request'
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(value)
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
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function p(value) {
  return `<p>${value}</p>`
}

function ul(items) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`
}

function ol(items) {
  return `<ol>${items.map((item) => `<li>${item}</li>`).join('')}</ol>`
}

function section(title, body) {
  return `<section><h2>${escapeHtml(title)}</h2>${body}</section>`
}

function h3(title) {
  return `<h3>${escapeHtml(title)}</h3>`
}

function table(headers, rows) {
  return `
    <table>
      <thead>
        <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `
}

function articleLink(label, href) {
  return `<a href="${href}">${escapeHtml(label)}</a>`
}

function summarizeExcerpt(content) {
  const text = stripHtml(content)
  return text.length > 190 ? `${text.slice(0, 187).trim()}...` : text
}

function estimateReadingTime(content) {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length
  return Math.max(5, Math.round(words / 220))
}

function cloudinarySignature(params, apiSecret) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return createHash('sha1').update(`${payload}${apiSecret}`).digest('hex')
}

async function fetchBuffer(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch asset ${url}: HTTP ${response.status}`)
  }

  return Buffer.from(await response.arrayBuffer())
}

async function ensureBackground() {
  if (existsSync(BACKGROUND_PATH)) return
  throw new Error(`Missing Canva background at ${BACKGROUND_PATH}. Download it first before running the importer.`)
}

async function uploadImageToCloudinary(filePath, slug, title, description) {
  const cloudName = requireEnv('CLOUDINARY_CLOUD_NAME')
  const apiKey = requireEnv('CLOUDINARY_API_KEY')
  const apiSecret = requireEnv('CLOUDINARY_API_SECRET')
  const folder = 'cmfbynothing/blogs'
  const timestamp = Math.floor(Date.now() / 1000)
  const publicId = slug
  const tags = ['cmfbynothing', 'blog', 'hero', slug].join(',')
  const context = [`title=${title}`, `caption=${description.slice(0, 200)}`].join('|')
  const params = {
    context,
    folder,
    overwrite: 'true',
    public_id: publicId,
    tags,
    timestamp,
  }
  const signature = cloudinarySignature(params, apiSecret)
  const formData = new FormData()
  formData.set('file', new Blob([readFileSync(filePath)], { type: 'image/webp' }), path.basename(filePath))
  formData.set('api_key', apiKey)
  formData.set('context', context)
  formData.set('folder', folder)
  formData.set('overwrite', 'true')
  formData.set('public_id', publicId)
  formData.set('tags', tags)
  formData.set('timestamp', String(timestamp))
  formData.set('signature', signature)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(`Cloudinary upload failed for ${filePath}: HTTP ${response.status} ${JSON.stringify(body)}`)
  }

  return body.secure_url
}

function buildTextOverlay({ eyebrow, title, caption, layout = 'left' }) {
  const align = layout === 'right' ? 'end' : 'start'
  const x = layout === 'right' ? 1190 : 110
  const titleLines = title.match(/.{1,26}(\s|$)/g)?.map((line) => line.trim()).filter(Boolean) ?? [title]
  const titleTspans = titleLines
    .slice(0, 3)
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : 84}">${escapeHtml(line)}</tspan>`)
    .join('')

  return Buffer.from(`
    <svg width="1366" height="768" viewBox="0 0 1366 768" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="rgba(0,0,0,0.18)" />
          <stop offset="100%" stop-color="rgba(0,0,0,0.04)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1366" height="768" fill="url(#fade)" />
      <rect x="${layout === 'right' ? 720 : 70}" y="78" width="576" height="612" rx="24" fill="rgba(255,255,255,0.72)" stroke="rgba(0,0,0,0.09)" />
      <text x="${x}" y="150" font-size="22" font-family="Georgia" letter-spacing="6" fill="#202020" text-anchor="${align}">${escapeHtml(eyebrow.toUpperCase())}</text>
      <text x="${x}" y="255" font-size="70" font-family="Georgia" font-weight="700" fill="#050505" text-anchor="${align}">${titleTspans}</text>
      <text x="${x}" y="560" font-size="24" font-family="Georgia" fill="#2a2a2a" text-anchor="${align}">
        <tspan x="${x}" dy="0">${escapeHtml(caption)}</tspan>
      </text>
      <text x="${x}" y="642" font-size="18" font-family="Georgia" fill="#4a4a4a" letter-spacing="3" text-anchor="${align}">${SITE_DOMAIN.toUpperCase()}</text>
    </svg>
  `)
}

async function createHeroImage({ slug, title, eyebrow, caption, layout, assetUrls }) {
  await ensureBackground()
  const background = sharp(BACKGROUND_PATH).resize(1366, 768).grayscale()
  const composites = [{ input: await background.png().toBuffer() }]

  const slots = assetUrls.length > 1
    ? [
        { left: 120, top: 160, width: 420 },
        { left: 560, top: 130, width: 360 },
      ]
    : layout === 'right'
      ? [{ left: 110, top: 145, width: 520 }]
      : [{ left: 740, top: 145, width: 520 }]

  for (const [index, url] of assetUrls.entries()) {
    const slot = slots[index] ?? slots[slots.length - 1]
    const asset = sharp(await fetchBuffer(url))
      .resize({ width: slot.width, height: 500, fit: 'contain', withoutEnlargement: true })
      .grayscale()
      .linear(0.95, 0)
    const shadow = await asset.clone().blur(12).modulate({ brightness: 0.45 }).png().toBuffer()
    const figure = await asset.png().toBuffer()

    composites.push({ input: shadow, left: slot.left + 22, top: slot.top + 32, blend: 'multiply' })
    composites.push({ input: figure, left: slot.left, top: slot.top })
  }

  composites.push({
    input: buildTextOverlay({ eyebrow, title, caption, layout }),
    left: 0,
    top: 0,
  })

  const pngPath = path.join(GENERATED_DIR, `${slug}.png`)
  const webpPath = path.join(GENERATED_DIR, `${slug}.webp`)

  await sharp({
    create: {
      width: 1366,
      height: 768,
      channels: 4,
      background: '#efefea',
    },
  })
    .composite(composites)
    .png()
    .toFile(pngPath)

  await sharp(pngPath).webp({ quality: 88 }).toFile(webpPath)

  return { pngPath, webpPath }
}

function normalizeTitleKey(value) {
  return value.trim().toLowerCase()
}

function pickMobile(catalog, name) {
  const mobile = catalog.mobilesByName.get(normalizeTitleKey(name))
  if (!mobile) throw new Error(`Mobile not found for ${name}`)
  return mobile
}

function pickProduct(catalog, name) {
  const product = catalog.productsByName.get(normalizeTitleKey(name))
  if (!product) throw new Error(`Product not found for ${name}`)
  return product
}

function buildCatalogLink(slug, type = 'products') {
  return `${SITE_URL}/${type}/${slug}`
}

async function loadCatalog(supabase) {
  const [{ data: mobiles, error: mobileError }, { data: products, error: productError }, { data: productImages, error: productImageError }] = await Promise.all([
    supabase.from('mobiles').select('id,name,slug,Price,schema_json').order('id'),
    supabase.from('products').select('id,name,slug,price,product_type').order('id'),
    supabase.from('images').select('related_type,related_id,url,sort_order').eq('related_type', 'product').order('related_id').order('sort_order'),
  ])

  if (mobileError) throw new Error(`Failed to fetch mobiles: ${mobileError.message}`)
  if (productError) throw new Error(`Failed to fetch products: ${productError.message}`)
  if (productImageError) throw new Error(`Failed to fetch product images: ${productImageError.message}`)

  const imageByProductId = new Map()
  for (const row of productImages ?? []) {
    if (!imageByProductId.has(row.related_id) || row.sort_order === 0) {
      imageByProductId.set(row.related_id, row.url)
    }
  }

  const mobileRecords = (mobiles ?? []).map((row) => ({
    ...row,
    price: row.Price,
    image: Array.isArray(row.schema_json?.image) ? row.schema_json.image[0] : row.schema_json?.image || null,
  }))
  const productRecords = (products ?? []).map((row) => ({
    ...row,
    image: imageByProductId.get(row.id) || null,
  }))

  return {
    mobiles: mobileRecords,
    products: productRecords,
    mobilesByName: new Map(mobileRecords.map((row) => [normalizeTitleKey(row.name), row])),
    productsByName: new Map(productRecords.map((row) => [normalizeTitleKey(row.name), row])),
  }
}

function buildCommonContext(catalog) {
  const phone2a = pickMobile(catalog, 'Phone (2a)')
  const phone2 = pickMobile(catalog, 'Phone (2)')
  const phone1 = pickMobile(catalog, 'Phone (1)')
  const phone3 = pickMobile(catalog, 'Phone (3)')
  const phone3a = pickMobile(catalog, 'Phone (3a)')
  const phone3aPro = pickMobile(catalog, 'Phone (3a) Pro')
  const phone2aPlus = pickMobile(catalog, 'Phone (2a) Plus')
  const cmfPhone1 = pickMobile(catalog, 'CMF Phone 1')
  const cmfPhone2Pro = pickMobile(catalog, 'CMF Phone 2 Pro')
  const ear3 = pickProduct(catalog, 'Ear (3)')
  const earA = pickProduct(catalog, 'Ear (a)')
  const cmfBudsPro2 = pickProduct(catalog, 'CMF Buds Pro 2')
  const cmfBudsPro = pickProduct(catalog, 'CMF Buds Pro')
  const nothingCable = pickProduct(catalog, 'Nothing USB-C to USB-C Cable')
  const nothingPower45w = pickProduct(catalog, 'Nothing Power 45W')

  return {
    phone2a,
    phone2,
    phone1,
    phone3,
    phone3a,
    phone3aPro,
    phone2aPlus,
    cmfPhone1,
    cmfPhone2Pro,
    ear3,
    earA,
    cmfBudsPro2,
    cmfBudsPro,
    nothingCable,
    nothingPower45w,
    allNothingPhones: [cmfPhone1, phone1, phone2a, phone2aPlus, phone2, phone3a, phone3aPro, phone3, cmfPhone2Pro],
    officialPriceRows: [
      ['CMF Phone 1', formatPkr(cmfPhone1.price), articleLink('View product', buildCatalogLink(cmfPhone1.slug, 'products'))],
      ['Phone (1)', formatPkr(phone1.price), articleLink('View product', buildCatalogLink(phone1.slug, 'products'))],
      ['Phone (2a)', formatPkr(phone2a.price), articleLink('View product', buildCatalogLink(phone2a.slug, 'products'))],
      ['Phone (2a) Plus', formatPkr(phone2aPlus.price), articleLink('View product', buildCatalogLink(phone2aPlus.slug, 'products'))],
      ['Phone (2)', formatPkr(phone2.price), articleLink('View product', buildCatalogLink(phone2.slug, 'products'))],
      ['Phone (3a)', formatPkr(phone3a.price), articleLink('View product', buildCatalogLink(phone3a.slug, 'products'))],
      ['Phone (3a) Pro', formatPkr(phone3aPro.price), articleLink('View product', buildCatalogLink(phone3aPro.slug, 'products'))],
      ['Phone (3)', formatPkr(phone3.price), articleLink('View product', buildCatalogLink(phone3.slug, 'products'))],
      ['CMF Phone 2 Pro', formatPkr(cmfPhone2Pro.price), articleLink('View product', buildCatalogLink(cmfPhone2Pro.slug, 'products'))],
    ],
    competitor: {
      samsungA55: 139999,
      redmiNote13: 44999,
      airpods4: 36999,
      airpodsPro2: 53999,
    },
  }
}

function renderNothingPhonePriceArticle(ctx) {
  return [
    section('Nothing brand at a glance', [
      p(`Nothing is a London-founded consumer technology company best known for its transparent design language, clean Android experience, and ecosystem that connects phones, audio, chargers, and accessories. For Pakistan buyers, the brand matters because it offers a very different look from mainstream phones while still staying practical enough for daily use.`),
      p(`This guide is updated for ${UPDATED_AT_LABEL} and uses the current Nothing Pakistan catalog on ${articleLink(SITE_DOMAIN, SITE_URL)} as the pricing baseline. That is important because many Pakistan search results mix old import listings, non-PTA offers, and unofficial storefronts into the same page.`),
    ].join('')),
    section('Nothing phone price in Pakistan 2026', [
      table(['Model', 'Official catalog price', 'Store link'], ctx.officialPriceRows),
      p(`The quickest takeaway is this: the entry point into the lineup is ${formatPkr(ctx.cmfPhone1.price)} for CMF Phone 1, the most searched mid-range Nothing handset on the store is Phone (2a) at ${formatPkr(ctx.phone2a.price)}, and the premium end reaches ${formatPkr(ctx.phone3.price)} for Phone (3).`),
    ].join('')),
    section('How to read these prices correctly', [
      p(`Pakistan phone buyers should never compare one number in isolation. A correct comparison checks whether the listing is official, whether the product is sold with local support, whether PTA status is already clear, and whether the seller is listing the exact RAM and storage variant you want.`),
      ul([
        `Use official catalog prices as the baseline and treat marketplace prices as secondary reference points.`,
        `Confirm whether you are seeing a new sealed device, an import listing, or a used resale ad.`,
        `Check whether the listing includes only the phone or a full purchase flow with support links and policy pages.`,
        `Ask for the exact model, storage, and PTA guidance before making payment.`,
      ]),
    ].join('')),
    section('Best-value models for different budgets', [
      h3('Budget-conscious buyers'),
      p(`CMF Phone 1 remains the easiest starting point because it brings Nothing ecosystem appeal into a much lower price bracket. It is ideal for buyers who want the look and software direction without stepping into flagship pricing.`),
      h3('Balanced mid-range buyers'),
      p(`Phone (2a) sits in the sweet spot for Pakistan because it balances design, battery life, performance, and price better than many phones that look more generic on the shelf. Phone (3a) and Phone (3a) Pro extend that value ladder for buyers who want a newer design or extra camera flexibility.`),
      h3('Premium buyers'),
      p(`Phone (2) and Phone (3) are the stronger options when your priority is flagship-grade feel, faster chipsets, better display polish, and a more premium overall package. They cost more, but they also make more sense for users who keep a phone for several years.`),
    ].join('')),
    section('Where to buy Nothing phones in Pakistan safely', [
      p(`The safest route is to start on ${articleLink('Nothing Pakistan', SITE_URL)} and move from there to the exact phone page you want. That gives you a consistent support channel, current pricing in PKR, and a cleaner verification trail than random social posts or low-context marketplace ads.`),
      ul([
        `Browse the phone catalog and compare the live store price against your budget.`,
        `Use the store contact or WhatsApp support route if you need help with model selection.`,
        `Check the company verification and policy pages before sending payment.`,
        `Keep screenshots of the listing, invoice, support replies, and payment proof.`,
      ]),
    ].join('')),
    section('How to avoid fake sellers and confusing listings', [
      p(`Most problems in this category do not come from a counterfeit device that looks obviously fake. They come from unclear listings, misrepresented PTA status, storage confusion, and poor after-sale support. That is why the better question is not only “is the phone original?” but “is the entire purchase process verifiable?”`),
      ul([
        `Avoid listings with incomplete model names like “Nothing phone latest” and no exact variant information.`,
        `Do not assume a low market price includes PTA approval.`,
        `If a seller refuses to confirm warranty handling or support channels, pause the order.`,
        `Prefer stores that publish legal business details, contact information, and clear order policies.`,
      ]),
    ].join('')),
    section('Final verdict', [
      p(`For a buyer searching “Nothing Phone price in Pakistan”, the most useful answer is that the lineup now spans from ${formatPkr(ctx.cmfPhone1.price)} to ${formatPkr(ctx.phone3.price)} on the official catalog, with Phone (2a), Phone (3a), and Phone (3a) Pro covering the most practical mid-range decisions. If you want the safest buying route, compare the exact model on the official store first and then verify PTA, payment, and support details before checkout.`),
    ].join('')),
  ].join('')
}

function renderWhereToBuyArticle(ctx) {
  return [
    section('Why “official” matters in Pakistan', [
      p(`When buyers search for an official Nothing Pakistan store, they are usually trying to solve three problems at once: authenticity, support, and pricing clarity. An official-looking product photo on social media is not enough. What matters is whether the store publishes the full purchase context around that product.`),
      ul([
        `Clear company identity`,
        `Visible contact and support route`,
        `Published policies`,
        `Current PKR pricing`,
        `Traceable order confirmation`,
      ]),
    ].join('')),
    section('Best place to start: the official storefront', [
      p(`${articleLink(SITE_DOMAIN, SITE_URL)} is the cleanest place to begin because it lets you compare Nothing and CMF devices, audio products, chargers, and accessories inside one catalog. It also reduces the biggest buying mistake in Pakistan: jumping between mixed marketplace listings that have different seller standards and incomplete model details.`),
      p(`For phones, start with ${articleLink('Phone (2a)', buildCatalogLink(ctx.phone2a.slug, 'mobiles'))}, ${articleLink('Phone (3a)', buildCatalogLink(ctx.phone3a.slug, 'mobiles'))}, and ${articleLink('CMF Phone 1', buildCatalogLink(ctx.cmfPhone1.slug, 'mobiles'))}. For audio, check ${articleLink('Ear (3)', buildCatalogLink(ctx.ear3.slug))} and ${articleLink('CMF Buds Pro 2', buildCatalogLink(ctx.cmfBudsPro2.slug))}.`),
    ].join('')),
    section('Official store vs market sellers', [
      table(
        ['Factor', 'Official store flow', 'Unstructured market listing'],
        [
          ['Pricing', 'Visible PKR catalog pricing', 'Often changes by inbox or phone call'],
          ['Support', 'Published support and contact routes', 'May depend on personal WhatsApp only'],
          ['Verification', 'Company and policy pages available', 'Business identity may be unclear'],
          ['Model clarity', 'Exact model and variant usually listed', 'Names can be shortened or vague'],
          ['After-sale path', 'More structured', 'May become unclear after delivery'],
        ],
      ),
      p(`That does not mean every market seller is automatically bad. It means the official store gives you more verifiable information up front, which is exactly what cautious buyers need.`),
    ].join('')),
    section('How to verify warranty and authenticity', [
      ol([
        `Ask for the exact model and storage variant before paying.`,
        `Check whether the store clearly explains PTA, warranty, or return handling.`,
        `Compare packaging and product photos with the official product page.`,
        `Save screenshots of the listing, invoice, tracking, and support replies.`,
        `Inspect the product quickly on arrival and report mismatches immediately.`,
      ]),
      p(`For accessories, also check compatibility. A genuine accessory is still the wrong purchase if it does not fit your exact phone model.`),
    ].join('')),
    section('Delivery, payment, and trust signals', [
      p(`Pakistan buyers often focus on cash-on-delivery, bank transfer, dispatch speed, and courier coverage. Those are valid concerns, but they should sit inside a broader trust check. The best order is one where the product page, support answers, payment method, and delivery update all line up with each other.`),
      p(`If you need extra reassurance, contact the store before payment with a specific question. Serious sellers answer specific questions clearly. Unclear sellers usually become even less clear after you ask for detail.`),
    ].join('')),
    section('Final verdict', [
      p(`If your goal is to buy Nothing phone Pakistan online with the lowest risk, start from the official storefront and use marketplace listings only as secondary reference points. You will save time, reduce confusion around model variants, and keep the entire purchase trail easier to verify.`),
    ].join('')),
  ].join('')
}

function renderComparisonArticle(ctx, competitorName, competitorPrice, focus) {
  return [
    section('Quick answer', [
      p(`For most Pakistan buyers, Phone (2a) wins if you care about distinctive design, a cleaner software feel, and long-term day-to-day satisfaction. ${competitorName} becomes the stronger pick only if your priority leans more heavily toward the specific strengths it brings in ${focus}.`),
    ].join('')),
    section('Price comparison in Pakistan', [
      table(
        ['Model', 'Current Pakistan price', 'Positioning'],
        [
          ['Nothing Phone (2a)', formatPkr(ctx.phone2a.price), 'Design-led mid-range with strong software identity'],
          [competitorName, formatPkr(competitorPrice), 'Mainstream mid-range alternative'],
        ],
      ),
      p(`Price alone does not decide this matchup. The more useful question is whether you want a phone that feels different from the rest of the market or one that stays closer to mainstream expectations.`),
    ].join('')),
    section('Design and in-hand feel', [
      p(`Phone (2a) stands out immediately because Nothing treats industrial design as a core selling point rather than an afterthought. The shape, back treatment, and visual identity feel intentional. ${competitorName}, by contrast, is easier to recognize as a conventional market-friendly mid-ranger.`),
      p(`That difference matters more than many buyers expect. A phone is handled dozens of times every day. If you enjoy the look and feel of your device, that value compounds over time.`),
    ].join('')),
    section('Performance and daily speed', [
      p(`For social apps, messaging, streaming, browsing, maps, and casual gaming, both phones are strong enough for daily Pakistan usage. The practical difference is not whether one opens WhatsApp slightly faster. It is whether the software stays clean, predictable, and pleasant over months of use.`),
      p(`Nothing’s advantage here is the overall feel of the experience. Buyers who care about visual polish and a less cluttered UI tend to prefer Phone (2a).`),
    ].join('')),
    section('Camera, battery, and software experience', [
      p(`Camera quality should be judged by your own priorities. Some users want stronger daylight detail, others want more reliable portraits, and many simply want stable social-media-ready results. Battery life also depends on brightness, network strength, and app behavior, but Phone (2a) generally appeals to buyers who want all-day reliability without extra software noise.`),
      p(`Software is where Nothing often separates itself. A clean interface, useful widgets, and a more refined design language can make the phone feel premium even when the price stays mid-range.`),
    ].join('')),
    section('Which one should Pakistan buyers choose?', [
      ul([
        `Choose Phone (2a) if you want stronger design identity, cleaner software, and a phone that feels less generic.`,
        `Choose ${competitorName} if you are already comfortable with that ecosystem and prefer the brand’s more familiar approach.`,
        `If both are close in price, Phone (2a) is usually the more interesting and more memorable buy.`,
      ]),
    ].join('')),
  ].join('')
}

function renderBrandIntroArticle(ctx) {
  return [
    section('What is Nothing in simple words?', [
      p(`Nothing is a consumer technology brand built around the idea that personal tech should feel exciting again. Instead of hiding every part of the device behind generic styling, the brand became known for transparent-inspired design, thoughtful glyph lighting, and a very clean visual language across phones and audio products.`),
      p(`For Pakistan buyers, the easiest way to understand Nothing is this: it is a modern Android-first brand that tries to look and feel more intentional than typical mass-market phones.`),
    ].join('')),
    section('Where did the company come from?', [
      p(`Nothing was founded in London and quickly grew attention by launching products that looked different from the rest of the market. The company built its early reputation through earbuds and then expanded into phones, accessories, and the wider CMF sub-brand.`),
      p(`That background matters because the brand did not become popular by competing only on specs. It built attention through design, community, and a more distinctive product story.`),
    ].join('')),
    section('Nothing design philosophy', [
      ul([
        `Transparent-inspired industrial design that makes the hardware feel visible and deliberate.`,
        `A software experience that tries to stay cleaner than many heavy Android skins.`,
        `A connected ecosystem across phones, earbuds, chargers, cables, and accessories.`,
        `A strong visual identity that younger buyers immediately recognize online.`,
      ]),
    ].join('')),
    section('Product lineup available to Pakistan buyers', [
      table(['Category', 'Examples on the store', 'Why it matters'], [
        ['Phones', `Phone (2a), Phone (3a), Phone (3a) Pro, Phone (3), ${'CMF Phone 1'}`, 'Covers entry-level to premium buying decisions'],
        ['Audio', 'Ear (3), Ear (a), CMF Buds Pro 2, CMF Buds Pro', 'Strong ecosystem products beyond phones'],
        ['Power', 'Nothing Power 45W, Nothing USB-C Cable', 'Important for everyday ownership'],
      ]),
      p(`A Pakistan buyer can therefore approach Nothing as a broader ecosystem rather than a single one-off phone purchase.`),
    ].join('')),
    section('Why the brand is getting popular in Pakistan', [
      p(`Pakistan’s younger buyers respond strongly to products that feel visually fresh and socially visible. Nothing fits that perfectly. It offers a look that stands out on TikTok, Instagram, and YouTube while still staying practical for normal daily use.`),
      p(`At the same time, the brand sits in a useful position between ultra-premium flagships and commodity-looking budget phones. That makes it attractive to buyers who want something new without moving into the highest Apple or Samsung spend bracket.`),
    ].join('')),
  ].join('')
}

function renderPtaApprovalArticle(ctx) {
  return [
    section('What PTA approval means', [
      p(`PTA approval is the process that allows a mobile device IMEI to operate fully on Pakistani cellular networks after registration. If a phone is not properly registered, it may work temporarily or on Wi-Fi only, but it can face network restrictions for long-term SIM use.`),
      p(`This is why Pakistan buyers should always separate three different questions: Is the phone original? Is the seller trustworthy? And what is the PTA status of this exact unit?`),
    ].join('')),
    section('Are Nothing phones PTA approved by default?', [
      p(`There is no one-size-fits-all answer because PTA status depends on how a device enters Pakistan and how the seller is handling that import flow. Some devices may be sold with clear PTA guidance. Others may still require the buyer to complete or confirm registration.`),
      p(`That is why you should ask the seller directly before payment instead of assuming that every store listing automatically includes PTA in the quoted price.`),
    ].join('')),
    section('How the registration process works', [
      ol([
        `Note the phone model and IMEI details.`,
        `Create or log into the DIRBS / PTA registration flow.`,
        `Submit the device details and required identity information.`,
        `Review the tax amount shown for that device.`,
        `Pay the required amount through the approved payment route.`,
        `Keep your confirmation records until the approval is reflected properly.`,
      ]),
    ].join('')),
    section('Cost expectations and buyer caution', [
      p(`PTA cost depends on the device category, import route, and the valuation framework applied at the time of registration. That means the same model can be discussed very differently online if one listing is quoting a non-PTA phone and another is quoting a registered device.`),
      p(`The safest buying move is to ask for the PTA position in writing before you pay. A vague answer like “ho jayega” is not the same thing as a confirmed process.`),
    ].join('')),
    section('Best practice for Pakistan buyers', [
      ul([
        `Ask whether the quoted price is for a PTA-approved or non-PTA device.`,
        `Ask for the IMEI or the exact registration handling process where appropriate.`,
        `Save screenshots of the listing and the seller’s PTA explanation.`,
        `Do not compare PTA and non-PTA offers as if they are the same product state.`,
      ]),
    ].join('')),
  ].join('')
}

function renderCmfPriceArticle(ctx) {
  return [
    section('Current CMF Phone 1 price in Pakistan', [
      p(`As of ${UPDATED_AT_LABEL}, CMF Phone 1 is listed on the Nothing Pakistan catalog at ${formatPkr(ctx.cmfPhone1.price)}. That makes it one of the most accessible entry points into the broader Nothing ecosystem for Pakistan buyers who want the brand style without moving into a premium phone budget.`),
      table(['Model', 'Official store price', 'Store link'], [[
        'CMF Phone 1',
        formatPkr(ctx.cmfPhone1.price),
        articleLink('Open product page', buildCatalogLink(ctx.cmfPhone1.slug, 'mobiles')),
      ]]),
    ].join('')),
    section('Why CMF Phone 1 matters', [
      p(`CMF exists as the more value-focused side of the Nothing ecosystem. The idea is simple: keep the design language interesting, stay practical on price, and build a phone that feels fresher than generic entry-level Android hardware.`),
      p(`For Pakistan buyers, that is a compelling combination because many budget and lower-mid phones offer decent specs but very little personality.`),
    ].join('')),
    section('Where CMF Phone 1 fits in the lineup', [
      p(`CMF Phone 1 sits below the main Nothing flagship ladder and makes the most sense for students, first-job buyers, and practical shoppers who want a lower cost of entry. It can also appeal to people who like the brand but do not need the added spend of Phone (2a), Phone (3a), or Phone (3).`),
      p(`Compared with purely spec-driven budget devices, the stronger argument for CMF Phone 1 is not only raw numbers. It is the total package of design, software identity, and ecosystem fit.`),
    ].join('')),
    section('Pros and cons', [
      ul([
        `<strong>Pros:</strong> lower entry price, strong visual identity, easier ecosystem entry, official store listing in PKR.`,
        `<strong>Cons:</strong> not the most premium choice in the lineup, and serious power users may still prefer a higher-tier Nothing model.`,
      ]),
    ].join('')),
    section('Is it worth buying?', [
      p(`Yes, CMF Phone 1 is worth shortlisting if your budget is tight but you still want a phone that feels more intentional than the average low-mid Android option. If you can stretch upward, Phone (2a) gives a better all-round experience. But if you want the cleanest entry into the brand, CMF Phone 1 does its job very well.`),
    ].join('')),
  ].join('')
}

function renderEarVsAirpodsArticle(ctx) {
  return [
    section('Price and positioning in Pakistan', [
      table(['Product', 'Current Pakistan price', 'Best fit'], [
        ['Nothing Ear (3)', formatPkr(ctx.ear3.price), 'Premium Android-first sound and design buyers'],
        ['CMF Buds Pro 2', formatPkr(ctx.cmfBudsPro2.price), 'Value-focused buyers who still want ANC'],
        ['Apple AirPods 4', formatPkr(ctx.competitor.airpods4), 'Best fit for iPhone users in Apple ecosystem'],
        ['AirPods Pro 2', formatPkr(ctx.competitor.airpodsPro2), 'Premium Apple choice with deeper ecosystem benefits'],
      ]),
      p(`This comparison is not just about sound. It is about ecosystem fit. If you use Android, Nothing products usually offer a cleaner value story. If you use an iPhone, AirPods still hold the advantage because of their tighter native integration.`),
    ].join('')),
    section('Sound quality and daily use', [
      p(`Nothing Ear (3) aims at buyers who want a more distinctive design and a more enthusiast-friendly feel. CMF Buds Pro 2 sits on the practical side with a much lower price. AirPods remain strong for convenience, consistent call handling, and frictionless Apple pairing.`),
      p(`For Pakistan buyers, the right answer depends on whether you value ecosystem convenience more than price efficiency.`),
    ].join('')),
    section('Battery, compatibility, and value', [
      ul([
        `Android users usually get better price-to-feature value from Nothing Ear and CMF Buds Pro 2.`,
        `iPhone users who care about seamless pairing and switching still get the strongest convenience from AirPods.`,
        `If budget matters, CMF Buds Pro 2 is one of the easiest recommendations in this whole category.`,
      ]),
    ].join('')),
    section('Final recommendation', [
      p(`Choose Nothing Ear or CMF Buds Pro 2 if you use Android and want stronger value in Pakistan. Choose AirPods if your world already revolves around iPhone, iCloud, and Apple device switching. For pure value per rupee, CMF Buds Pro 2 is especially hard to ignore.`),
    ].join('')),
  ].join('')
}

function renderPopularityArticle(ctx) {
  return [
    section('Reason 1: the design is genuinely different', [
      p(`Nothing phones are not getting popular in Pakistan only because of specs. They are getting attention because people can recognize them instantly. In a market full of visually similar slabs, that matters.`),
    ].join('')),
    section('Reason 2: strong youth and social-media appeal', [
      p(`The brand photographs well, films well, and travels well across reels, shorts, and unboxing content. That gives it an influence multiplier that many competitors do not have, especially among younger urban buyers.`),
    ].join('')),
    section('Reason 3: better balance than many mainstream alternatives', [
      p(`Phones like ${articleLink('Phone (2a)', buildCatalogLink(ctx.phone2a.slug, 'mobiles'))} and ${articleLink('Phone (3a)', buildCatalogLink(ctx.phone3a.slug, 'mobiles'))} land in a very attractive middle zone. They are not bargain-basement phones, but they also do not force buyers into the cost of a flagship iPhone or Galaxy S device.`),
    ].join('')),
    section('Reason 4: the ecosystem makes the brand feel complete', [
      p(`Earbuds, chargers, cables, and accessories help the brand feel like a real lifestyle ecosystem instead of a one-product experiment. That completeness matters when buyers want more than a single impulse purchase.`),
    ].join('')),
    section('Market outlook', [
      p(`The popularity trend is likely to continue in Pakistan as long as Nothing keeps launching visually distinctive models at practical prices. The more the official store strengthens support and trust signals, the easier it becomes for curious buyers to convert into paying customers.`),
    ].join('')),
  ].join('')
}

function renderBatteryDrainArticle(ctx) {
  return [
    section('Why battery drain happens on Nothing phones', [
      p(`Battery drain is rarely caused by one dramatic fault. In most Pakistan usage patterns, it is a combination of screen brightness, weak network zones, background syncing, location services, aggressive social apps, and update-related indexing after a fresh install.`),
    ].join('')),
    section('Step-by-step fixes', [
      ol([
        `Restart the phone and check whether the drain is temporary after an update.`,
        `Open battery settings and identify the apps with the highest background activity.`,
        `Reduce always-on brightness and unnecessary display wake behavior.`,
        `Turn off 5G preference in areas where 4G is more stable, because unstable signal hunts can increase drain.`,
        `Limit background refresh for apps you do not need all day.`,
        `Update apps and the operating system, then re-check drain after a full charge cycle.`,
      ]),
    ].join('')),
    section('Pakistan-specific checks', [
      p(`Signal quality matters a lot. If you move through weak-coverage areas every day, the phone may spend extra energy maintaining network stability. That means what looks like a battery issue is sometimes a network-condition issue.`),
    ].join('')),
    section('When to seek support', [
      p(`If drain stays extreme after app cleanup, software updates, and a few full charge cycles, contact the seller or service route with screenshots of battery usage. That gives support something measurable to work with instead of a vague complaint.`),
    ].join('')),
  ].join('')
}

function renderBestPhoneArticle(ctx) {
  return [
    section('Best Nothing phones by budget in 2026', [
      table(['Budget tier', 'Best pick', 'Current official price', 'Why it wins'], [
        ['Entry', 'CMF Phone 1', formatPkr(ctx.cmfPhone1.price), 'Lowest entry into the ecosystem with strong brand identity'],
        ['Mid-range', 'Phone (2a)', formatPkr(ctx.phone2a.price), 'Best overall balance of price, design, and daily experience'],
        ['Upper mid-range', 'Phone (3a) Pro', formatPkr(ctx.phone3aPro.price), 'Good step-up for buyers who want a newer, richer package'],
        ['Premium', 'Phone (3)', formatPkr(ctx.phone3.price), 'Strongest flagship feel in the current store lineup'],
      ]),
    ].join('')),
    section('Why Phone (2a) is the safest recommendation for most people', [
      p(`Phone (2a) remains the easiest blanket recommendation because it lands in the middle of the lineup without feeling compromised. It is easier to justify than an expensive flagship for many Pakistan buyers and more aspirational than a low-end budget phone.`),
    ].join('')),
    section('Who should buy higher up the range?', [
      p(`Move up to Phone (3a) Pro or Phone (3) if camera flexibility, premium feel, or a longer ownership cycle matters more than immediate savings. These models suit buyers who keep a phone for years and want a more polished long-term experience.`),
    ].join('')),
    section('Who should stay with CMF Phone 1?', [
      p(`Stay with CMF Phone 1 if your budget is tight and you want to maximize value while still getting into the ecosystem. It is not the most powerful phone in the catalog, but it is a very sensible buy.`),
    ].join('')),
  ].join('')
}

function renderWorthItArticle(ctx) {
  return [
    section('The short answer', [
      p(`Yes, Nothing phones are worth considering in Pakistan if you care about design, cleaner software, and a phone that does not look like every other device on the shelf. They are not automatically the best option for every budget, but they are often the most interesting option.`),
    ].join('')),
    section('Price-to-performance perspective', [
      p(`“Worth it” depends on which model you mean. CMF Phone 1 is worth it for low-budget buyers. Phone (2a) is worth it for the mid-range majority. Phone (3) is worth it for buyers who want a premium Nothing experience and are comfortable with the higher spend.`),
    ].join('')),
    section('Where Nothing wins', [
      ul([
        `Distinctive industrial design`,
        `Cleaner overall software feel`,
        `Stronger brand personality`,
        `A growing ecosystem beyond the phone itself`,
      ]),
    ].join('')),
    section('Where you still need to compare carefully', [
      p(`If your priority is only the absolute strongest hardware number for the money, you should still compare Nothing phones against Samsung, Redmi, and other Android alternatives. The reason many people still choose Nothing is that the ownership experience feels more special, not only faster on paper.`),
    ].join('')),
  ].join('')
}

function renderAccessoriesArticle(ctx) {
  return [
    section('Core accessories every Nothing phone owner should consider', [
      ul([
        `${articleLink('Nothing Power 45W', buildCatalogLink(ctx.nothingPower45w.slug))} for reliable charging`,
        `${articleLink('Nothing USB-C to USB-C Cable', buildCatalogLink(ctx.nothingCable.slug))} if you need a fresh or spare cable`,
        `A model-specific cover and protector for daily protection`,
        `${articleLink('CMF Buds Pro 2', buildCatalogLink(ctx.cmfBudsPro2.slug))} or ${articleLink('Ear (3)', buildCatalogLink(ctx.ear3.slug))} for audio`,
      ]),
    ].join('')),
    section('How to choose safely', [
      p(`Start with your exact phone model. A cover or protector that fits Phone (2a) may not fit Phone (3a) Pro. A charger that is fine for your phone may be underpowered for your laptop or overkill for a simple travel setup.`),
      p(`The safest way to buy is to build the accessory list around your real use case instead of buying random “must-have” extras.`),
    ].join('')),
    section('Safety tips', [
      ul([
        `Verify compatibility before payment.`,
        `Check whether the charger includes a cable or requires one separately.`,
        `Keep product page screenshots and order confirmation records.`,
        `Inspect accessories quickly on delivery for fit and packaging condition.`,
      ]),
    ].join('')),
  ].join('')
}

function renderReviewArticle(ctx) {
  return [
    section('Design and first impression', [
      p(`Phone (2a) makes a strong first impression because it feels recognizably Nothing without demanding flagship money. The design is cleaner and more memorable than many mid-range competitors, which is one of the main reasons the phone became such a popular search term in Pakistan.`),
    ].join('')),
    section('Performance and software', [
      p(`For typical Pakistan usage, Phone (2a) is comfortably fast enough for messaging, media, social apps, photos, maps, and day-to-day multitasking. More importantly, the software feel is cleaner than many mid-range alternatives, which makes the phone seem more refined over time.`),
    ].join('')),
    section('Camera and battery', [
      p(`The camera setup is dependable for everyday photos, stories, and casual videos. Battery life is one of the phone’s practical strengths, especially for buyers who want a full day without constant charging anxiety.`),
    ].join('')),
    section('Pros and cons', [
      ul([
        `<strong>Pros:</strong> strong design identity, balanced price, cleaner software, good all-day usefulness.`,
        `<strong>Cons:</strong> premium buyers may still want a stronger flagship model, and spec-maximizers may compare harder with other brands.`,
      ]),
    ].join('')),
    section('Final verdict', [
      p(`Phone (2a) is one of the easiest Nothing phones to recommend in Pakistan because it gets the core balance right. It is stylish without being impractical, distinctive without being expensive, and polished enough to feel special after the first week of ownership.`),
    ].join('')),
  ].join('')
}

function renderNothingVsSamsungArticle(ctx) {
  return [
    section('Brand difference', [
      p(`Samsung sells familiarity, breadth, and a massive market footprint. Nothing sells design identity, freshness, and a more curated feel. That means the better brand depends on what you personally value in a phone.`),
    ].join('')),
    section('Pricing and value', [
      p(`Samsung has options across every price tier, but Nothing often feels more interesting in the mid-range because it gives buyers a clearer sense of character. Models like Phone (2a), Phone (3a), and Phone (3a) Pro are easier to remember than many spec-similar Samsung mid-rangers.`),
    ].join('')),
    section('Software and experience', [
      p(`Nothing’s software advantage is the feeling of simplicity and design cohesion. Samsung’s advantage is its deep ecosystem and familiarity. If you want the cleaner, more minimal route, Nothing usually feels better. If you want the broadest mainstream comfort, Samsung remains strong.`),
    ].join('')),
    section('Final recommendation', [
      p(`For Pakistan buyers who are tired of conventional-looking phones, Nothing is the more exciting choice. For buyers who want to stay inside the most familiar Android path, Samsung still makes sense. The real decision is whether you want personality or predictability.`),
    ].join('')),
  ].join('')
}

function renderCmfBeginnerArticle() {
  return [
    section('CMF by Nothing in simple terms', [
      p(`CMF by Nothing is the value-focused arm of the broader Nothing ecosystem. The purpose is to offer more accessible pricing while keeping the brand’s attention to design and product identity.`),
    ].join('')),
    section('How CMF differs from Nothing', [
      table(['Area', 'Nothing', 'CMF by Nothing'], [
        ['Positioning', 'More design-led flagship and upper-mid products', 'More budget-conscious, practical value products'],
        ['Typical buyers', 'Buyers who want the full signature Nothing experience', 'Buyers who want a lower entry price'],
        ['Examples', 'Phone (2a), Phone (3), Ear (3)', 'CMF Phone 1, CMF Buds Pro 2, CMF chargers'],
      ]),
    ].join('')),
    section('Why Pakistan buyers care', [
      p(`CMF matters in Pakistan because it lowers the barrier to entry. Many buyers like the Nothing look and software direction, but they want a more practical spend level. CMF gives them that route.`),
    ].join('')),
  ].join('')
}

function renderPtaTaxArticle(ctx) {
  return [
    section('How PTA tax works in practical terms', [
      p(`PTA tax is not a flat charge you can guess by brand name alone. It depends on how the device is classified and how the registration is being completed at the time. That is why buyers should use official systems for the exact amount instead of relying on screenshots from old social posts.`),
    ].join('')),
    section('What buyers usually get wrong', [
      ul([
        `They compare PTA and non-PTA offers as if they are identical.`,
        `They assume a low marketplace price includes registration.`,
        `They ask for “tax” without asking for the exact device state and import context.`,
      ]),
    ].join('')),
    section('Best practice', [
      p(`Before paying for any Nothing phone, ask whether the quoted price is PTA-inclusive, PTA-ready, or non-PTA. Save the response in writing. That one habit prevents a huge amount of confusion later.`),
    ].join('')),
  ].join('')
}

function renderNetworkArticle(ctx) {
  return [
    section('Short answer', [
      p(`Yes, Nothing phones generally work on Jazz, Zong, Ufone, and Telenor in Pakistan as long as the specific device variant supports the required local bands and the phone is properly registered for network use.`),
    ].join('')),
    section('What affects compatibility', [
      ul([
        `PTA registration status`,
        `The exact international variant you bought`,
        `Local operator coverage in your city`,
        `Whether you are checking 4G or 5G behavior`,
      ]),
    ].join('')),
    section('Practical expectation for buyers', [
      p(`4G use is typically the easier baseline to expect. 5G should be treated as a second-layer question that depends on operator rollout, band support, and local coverage stability. If mobile data quality matters for your work, test early and keep records of any problem you need to raise.`),
    ].join('')),
  ].join('')
}

function renderCameraArticle(ctx) {
  return [
    section('How to judge Nothing phone cameras in Pakistan', [
      p(`A useful camera review should reflect real usage: daylight streets, indoor family shots, restaurant lighting, portraits, casual product photos, and quick social video. Numbers alone do not tell that full story.`),
    ].join('')),
    section('Daylight and social use', [
      p(`Nothing phones generally appeal because their image output is consistent enough for daily stories, posts, and sharing. Daylight use is the easiest place to see the brand’s balanced tuning.`),
    ].join('')),
    section('Night, portraits, and video', [
      p(`Night performance always depends on the model tier, but buyers should focus on reliability rather than chasing miracle expectations. Portraits and short video clips matter more to many Pakistan users than extreme benchmark camera tests.`),
    ].join('')),
    section('Bottom line', [
      p(`If your goal is a dependable everyday camera inside a more design-led phone, Nothing models remain very competitive. If camera is your only deciding factor, compare model by model rather than judging the whole brand with one assumption.`),
    ].join('')),
  ].join('')
}

function renderBudgetArticle(ctx) {
  return [
    section('Best budget Nothing phone right now', [
      p(`The clearest budget pick is CMF Phone 1 at ${formatPkr(ctx.cmfPhone1.price)}. It gives buyers the lowest-cost entry into the ecosystem while still carrying the design story that makes the brand interesting.`),
    ].join('')),
    section('Second-best low budget route', [
      p(`If your budget stretches a little further, Phone (2a) at ${formatPkr(ctx.phone2a.price)} becomes the more balanced all-round recommendation. It costs more, but it also gives a stronger long-term experience.`),
    ].join('')),
    section('Who should buy what?', [
      ul([
        `Buy CMF Phone 1 if affordability is the first priority.`,
        `Buy Phone (2a) if you can pay more for a better long-term balance.`,
        `Skip higher-tier options if they force you to cut corners on PTA or accessories.`,
      ]),
    ].join('')),
  ].join('')
}

function buildArticles(ctx) {
  return {
    'Nothing Phone Price in Pakistan (2026 Updated Guide)': {
      category: 'Prices',
      focusKeyword: 'Nothing Phone price in Pakistan',
      contentType: 'guide',
      metaTitle: 'Nothing Phone Price in Pakistan (2026 Updated Guide)',
      metaDescription: `Updated Nothing phone price in Pakistan guide for ${UPDATED_AT_LABEL}. Compare official PKR prices, buying tips, PTA guidance, and safe purchase advice for Nothing and CMF phones.`,
      hero: { eyebrow: 'Price Guide', caption: 'Updated official catalog pricing and buying advice for Pakistan buyers.', layout: 'left', assetUrls: [ctx.phone2a.image] },
      faqs: [
        ['What is the latest Nothing Phone price in Pakistan?', `The official Nothing Pakistan catalog currently spans from ${formatPkr(ctx.cmfPhone1.price)} for CMF Phone 1 up to ${formatPkr(ctx.phone3.price)} for Phone (3), with Phone (2a) listed at ${formatPkr(ctx.phone2a.price)}.`],
        ['Where can I buy Nothing Phone in Pakistan?', `The safest starting point is ${SITE_DOMAIN}, where you can compare current PKR pricing, support, and policy information in one place.`],
        ['Are Nothing phones officially available in Pakistan?', `They are available through the official local storefront experience, but you should still verify the exact model, stock position, and PTA status before payment.`],
        ['How do I avoid fake Nothing sellers?', `Use stores that publish business identity, support routes, policy pages, and exact product variants instead of vague inbox-only listings.`],
      ],
      render: renderNothingPhonePriceArticle,
    },
    'Where to Buy Nothing Phone Officially in Pakistan': {
      category: 'Buying Guides',
      focusKeyword: 'official Nothing Pakistan store',
      contentType: 'guide',
      metaTitle: 'Where to Buy Nothing Phone Officially in Pakistan',
      metaDescription: 'Learn where to buy Nothing phone officially in Pakistan, how to compare official vs market sellers, and how to verify authenticity, warranty, and support before payment.',
      hero: { eyebrow: 'Official Buying', caption: 'How to verify the seller, the phone, and the full order flow.', layout: 'right', assetUrls: [ctx.phone3a.image] },
      faqs: [
        ['What is the official Nothing Pakistan store?', `${SITE_DOMAIN} is the primary official storefront route for comparing Nothing and CMF products in Pakistan.`],
        ['How do I verify a seller is original?', 'Check business identity, support channels, order confirmation quality, and the exact product page before payment.'],
        ['Should I trust cheaper marketplace offers?', 'Only after confirming whether they are new, PTA-registered, and backed by a verifiable after-sale support path.'],
        ['Can I buy Nothing phone online in Pakistan safely?', 'Yes, but only if the store gives you enough evidence to verify the model, PTA guidance, payment route, and delivery process.'],
      ],
      render: renderWhereToBuyArticle,
    },
    'Nothing Phone 2a vs Samsung A55 in Pakistan': {
      category: 'Comparisons',
      focusKeyword: 'Nothing Phone 2a vs Samsung A55',
      contentType: 'comparison',
      metaTitle: 'Nothing Phone 2a vs Samsung A55 in Pakistan',
      metaDescription: 'Detailed Pakistan comparison of Nothing Phone 2a vs Samsung A55 covering price, design, software, camera priorities, battery, and which one is the smarter buy.',
      hero: { eyebrow: 'Phone Comparison', caption: 'Two very different mid-range buying philosophies in Pakistan.', layout: 'left', assetUrls: [ctx.phone2a.image, ctx.phone3a.image] },
      faqs: [
        ['Which is better in Pakistan: Nothing Phone 2a or Samsung A55?', 'Phone (2a) is usually the better pick for buyers who want design identity and cleaner software, while Samsung A55 fits buyers who prefer a more familiar mainstream path.'],
        ['What is the current price gap?', `Phone (2a) is listed at ${formatPkr(ctx.phone2a.price)} on the official Nothing Pakistan catalog, while Samsung A55 commonly sits around ${formatPkr(ctx.competitor.samsungA55)} in Pakistan.`],
        ['Which phone feels more premium?', 'Samsung A55 can feel more conventional-premium, but Phone (2a) feels more distinctive and memorable in hand.'],
      ],
      render: (data) => renderComparisonArticle(data, 'Samsung Galaxy A55', data.competitor.samsungA55, 'ecosystem familiarity and mainstream brand comfort'),
    },
    'What is Nothing Brand? Full Introduction for Pakistan': {
      category: 'Brand',
      focusKeyword: 'What is Nothing brand',
      contentType: 'blog',
      metaTitle: 'What is Nothing Brand? Full Introduction for Pakistan',
      metaDescription: 'A simple but detailed introduction to the Nothing brand for Pakistan buyers covering the company story, design philosophy, product lineup, and why it is growing fast locally.',
      hero: { eyebrow: 'Brand Intro', caption: 'The company, the design language, and why Pakistan buyers care.', layout: 'right', assetUrls: [ctx.phone3.image] },
      faqs: [
        ['What is the Nothing brand?', 'Nothing is a design-led consumer technology brand known for phones, earbuds, chargers, and a distinctive visual identity.'],
        ['Is Nothing a Chinese company?', 'Nothing is widely presented as a London-founded consumer technology company, even though manufacturing and supply chains are global like most electronics brands.'],
        ['Is Nothing officially available in Pakistan?', 'Yes, the brand now has a structured local storefront presence and catalog flow for Pakistan buyers.'],
      ],
      render: renderBrandIntroArticle,
    },
    'Are Nothing Phones PTA Approved in Pakistan?': {
      category: 'PTA',
      focusKeyword: 'Nothing Phones PTA Approved in Pakistan',
      contentType: 'faq',
      metaTitle: 'Are Nothing Phones PTA Approved in Pakistan?',
      metaDescription: 'Learn what PTA approval means for Nothing phones in Pakistan, how registration works, what buyers should ask before payment, and how to avoid confusion about taxed vs non-taxed listings.',
      hero: { eyebrow: 'PTA Guide', caption: 'What registration really means for Pakistan phone buyers.', layout: 'left', assetUrls: [ctx.phone2.image] },
      faqs: [
        ['Are Nothing phones PTA approved by default in Pakistan?', 'Not automatically in every case. PTA position depends on how the device is being sold and whether registration is already completed or still required.'],
        ['What does PTA approval mean?', 'It means the device is properly registered to operate on Pakistani mobile networks for long-term SIM use.'],
        ['Should I ask the seller about PTA before paying?', 'Yes. Always ask whether the quoted price is PTA-inclusive, non-PTA, or still requires a registration step.'],
      ],
      render: renderPtaApprovalArticle,
    },
    'CMF Phone 1 Price in Pakistan Full Guide': {
      category: 'Prices',
      focusKeyword: 'CMF Phone 1 Pakistan price',
      contentType: 'guide',
      metaTitle: 'CMF Phone 1 Price in Pakistan Full Guide',
      metaDescription: 'Complete Pakistan guide to CMF Phone 1 price, value, who should buy it, and whether it is the right low-budget entry into the Nothing ecosystem.',
      hero: { eyebrow: 'CMF Price Guide', caption: 'A clean value entry into the Nothing ecosystem.', layout: 'right', assetUrls: [ctx.cmfPhone1.image] },
      faqs: [
        ['What is the CMF Phone 1 price in Pakistan?', `CMF Phone 1 is currently listed at ${formatPkr(ctx.cmfPhone1.price)} on the official Nothing Pakistan catalog.`],
        ['Is CMF Phone 1 worth buying?', 'Yes, especially for budget-focused buyers who want the Nothing design direction without stretching into higher-tier phones.'],
        ['Where can I buy CMF Phone 1 in Pakistan?', `Start from ${SITE_DOMAIN} so you can verify the latest price, policies, and support path.`],
      ],
      render: renderCmfPriceArticle,
    },
    'Nothing Ear vs AirPods in Pakistan': {
      category: 'Audio Comparisons',
      focusKeyword: 'Nothing Ear vs AirPods in Pakistan',
      contentType: 'comparison',
      metaTitle: 'Nothing Ear vs AirPods in Pakistan',
      metaDescription: 'Pakistan comparison of Nothing Ear vs AirPods covering price, sound, ecosystem compatibility, battery, and which option is better for Android and iPhone users.',
      hero: { eyebrow: 'Audio Comparison', caption: 'Android-friendly value versus Apple ecosystem convenience.', layout: 'left', assetUrls: [ctx.ear3.image, ctx.cmfBudsPro2.image] },
      faqs: [
        ['Are Nothing earbuds better than AirPods for Android?', 'For many Android buyers, yes, because the price-to-feature ratio is usually stronger and the ecosystem fit is cleaner.'],
        ['What is cheaper in Pakistan: Nothing Ear or AirPods?', `CMF Buds Pro 2 at ${formatPkr(ctx.cmfBudsPro2.price)} and Ear (3) at ${formatPkr(ctx.ear3.price)} are generally more affordable than Apple AirPods 4 and AirPods Pro 2 in Pakistan.`],
        ['Should iPhone users still choose AirPods?', 'Usually yes, if seamless Apple ecosystem integration matters more than price efficiency.'],
      ],
      render: renderEarVsAirpodsArticle,
    },
    'Why Nothing Phones Are Getting Popular in Pakistan': {
      category: 'Market Trends',
      focusKeyword: 'Why Nothing Phones are getting popular in Pakistan',
      contentType: 'blog',
      metaTitle: 'Why Nothing Phones Are Getting Popular in Pakistan',
      metaDescription: 'A detailed Pakistan market analysis of why Nothing phones are becoming more popular, including design, youth appeal, pricing, and social media momentum.',
      hero: { eyebrow: 'Market Trend', caption: 'Design, youth appeal, and a stronger story than generic Android rivals.', layout: 'right', assetUrls: [ctx.phone3a.image, ctx.phone2a.image] },
      faqs: [
        ['Why are Nothing phones trending in Pakistan?', 'Because they look different, feel more modern, and appeal strongly to younger buyers who care about design and social-media visibility.'],
        ['Is the popularity only about looks?', 'No. The price ladder, software feel, and growing ecosystem also make the brand easier to recommend.'],
      ],
      render: renderPopularityArticle,
    },
    'Nothing Phone Battery Drain Fix Guide': {
      category: 'Troubleshooting',
      focusKeyword: 'Nothing Phone battery drain fix',
      contentType: 'guide',
      metaTitle: 'Nothing Phone Battery Drain Fix Guide',
      metaDescription: 'Step-by-step Nothing Phone battery drain fix guide for Pakistan users covering app behavior, network issues, brightness, updates, and when to ask for support.',
      hero: { eyebrow: 'Troubleshooting', caption: 'Practical battery fixes for everyday Pakistan usage.', layout: 'left', assetUrls: [ctx.phone2a.image] },
      faqs: [
        ['Why is my Nothing phone battery draining fast?', 'The usual causes are background apps, signal instability, high brightness, post-update indexing, and always-on features running more than needed.'],
        ['Can network coverage affect battery life?', 'Yes. Weak or unstable signal conditions can force the phone to spend more power maintaining connectivity.'],
        ['When should I contact support?', 'When drain stays extreme after app cleanup, updates, and a few full charge cycles.'],
      ],
      render: renderBatteryDrainArticle,
    },
    'Best Nothing Phone to Buy in Pakistan 2026': {
      category: 'Buying Guides',
      focusKeyword: 'Best Nothing Phone to buy in Pakistan 2026',
      contentType: 'guide',
      metaTitle: 'Best Nothing Phone to Buy in Pakistan 2026',
      metaDescription: 'The best Nothing phone buying guide for Pakistan in 2026, broken down by entry, mid-range, upper mid-range, and premium budgets.',
      hero: { eyebrow: 'Best Picks', caption: 'Which Nothing phone makes the most sense for your budget?', layout: 'right', assetUrls: [ctx.cmfPhone1.image, ctx.phone2a.image] },
      faqs: [
        ['Which is the best Nothing phone in Pakistan right now?', 'For most buyers, Phone (2a) is still the best all-round recommendation.'],
        ['Which is the best budget Nothing phone?', `CMF Phone 1 is the best low-budget pick at ${formatPkr(ctx.cmfPhone1.price)}.`],
        ['Which Nothing phone is best for premium buyers?', `Phone (3) is the strongest premium choice in the current official catalog at ${formatPkr(ctx.phone3.price)}.`],
      ],
      render: renderBestPhoneArticle,
    },
    'Nothing Phone vs Redmi Note 13 in Pakistan': {
      category: 'Comparisons',
      focusKeyword: 'Nothing Phone vs Redmi Note 13 in Pakistan',
      contentType: 'comparison',
      metaTitle: 'Nothing Phone vs Redmi Note 13 in Pakistan',
      metaDescription: 'Pakistan comparison of Nothing Phone and Redmi Note 13 on price, design, software, camera expectations, and which one offers better value for your style of use.',
      hero: { eyebrow: 'Phone Comparison', caption: 'Distinctive design and clean software versus pure budget pragmatism.', layout: 'left', assetUrls: [ctx.phone2a.image, ctx.cmfPhone1.image] },
      faqs: [
        ['Which is better: Nothing Phone or Redmi Note 13?', 'Nothing is usually better for buyers who care about design and cleaner software, while Redmi Note 13 appeals more to strict budget shoppers.'],
        ['Is Redmi Note 13 cheaper in Pakistan?', `Yes. Redmi Note 13 usually sits around ${formatPkr(ctx.competitor.redmiNote13)}, well below many Nothing models.`],
        ['Is Nothing still worth the extra money?', 'Often yes, if the cleaner experience and stronger design identity matter to you over pure low-price buying.'],
      ],
      render: (data) => renderComparisonArticle(data, 'Redmi Note 13', data.competitor.redmiNote13, 'aggressive low-price competition'),
    },
    'Is Nothing Phone Worth It in Pakistan?': {
      category: 'Buying Guides',
      focusKeyword: 'Is Nothing Phone worth it in Pakistan',
      contentType: 'guide',
      metaTitle: 'Is Nothing Phone Worth It in Pakistan?',
      metaDescription: 'A balanced analysis of whether Nothing phones are worth buying in Pakistan based on pricing, alternatives, ecosystem, design, and everyday user experience.',
      hero: { eyebrow: 'Buying Decision', caption: 'When the design premium is worth paying for and when it is not.', layout: 'right', assetUrls: [ctx.phone3.image] },
      faqs: [
        ['Are Nothing phones worth it in Pakistan?', 'Yes, especially for buyers who care about design, software feel, and owning something less generic than the average Android phone.'],
        ['Which Nothing phone has the best value?', 'Phone (2a) remains the strongest all-round value pick for most Pakistan buyers.'],
        ['When should I skip Nothing?', 'Skip it if your only goal is the cheapest possible hardware per rupee and you do not care about design or software refinement.'],
      ],
      render: renderWorthItArticle,
    },
    'Nothing Phone Accessories Guide in Pakistan': {
      category: 'Accessories',
      focusKeyword: 'Nothing Phone accessories in Pakistan',
      contentType: 'guide',
      metaTitle: 'Nothing Phone Accessories Guide in Pakistan',
      metaDescription: 'A practical accessories guide for Nothing phone owners in Pakistan covering chargers, cables, cases, protectors, earbuds, and safe compatibility checks.',
      hero: { eyebrow: 'Accessories', caption: 'The charger, cable, case, protector, and audio picks that matter most.', layout: 'left', assetUrls: [ctx.nothingPower45w.image, ctx.nothingCable.image] },
      faqs: [
        ['Which accessories should I buy first for a Nothing phone?', 'Most buyers should start with a charger, cable, protector, and case, then add earbuds if needed.'],
        ['Do I need the official 45W charger?', 'Not always, but it is one of the safest and cleanest official charging options in the local catalog.'],
        ['How do I avoid buying the wrong case or protector?', 'Match the exact phone model and variant before placing the order.'],
      ],
      render: renderAccessoriesArticle,
    },
    'Nothing Phone 2a Full Review Pakistan': {
      category: 'Reviews',
      focusKeyword: 'Nothing Phone 2a full review Pakistan',
      contentType: 'review',
      metaTitle: 'Nothing Phone 2a Full Review Pakistan',
      metaDescription: 'Detailed Nothing Phone 2a review for Pakistan covering design, software, camera, battery, strengths, trade-offs, and who should buy it.',
      hero: { eyebrow: 'Full Review', caption: 'Why Phone (2a) remains the easiest Nothing phone to recommend.', layout: 'right', assetUrls: [ctx.phone2a.image] },
      faqs: [
        ['Is Nothing Phone 2a good for Pakistan users?', 'Yes. It is one of the strongest balanced mid-range Nothing choices for Pakistan buyers.'],
        ['What is the current price of Phone (2a)?', `Phone (2a) is currently listed at ${formatPkr(ctx.phone2a.price)} on the official local catalog.`],
        ['Is Phone (2a) better than CMF Phone 1?', 'Yes for most buyers, because it offers a more complete mid-range experience.'],
      ],
      render: renderReviewArticle,
    },
    'Nothing vs Samsung Phones in Pakistan': {
      category: 'Comparisons',
      focusKeyword: 'Nothing vs Samsung phones in Pakistan',
      contentType: 'comparison',
      metaTitle: 'Nothing vs Samsung Phones in Pakistan',
      metaDescription: 'Brand-level comparison of Nothing vs Samsung phones in Pakistan, covering design, software feel, pricing philosophy, and which type of buyer each brand suits best.',
      hero: { eyebrow: 'Brand Comparison', caption: 'Personality versus familiarity in the Pakistan smartphone market.', layout: 'left', assetUrls: [ctx.phone3.image, ctx.phone2a.image] },
      faqs: [
        ['Which brand is better in Pakistan: Nothing or Samsung?', 'Neither is universally better. Nothing suits buyers who want distinction, while Samsung suits buyers who prefer familiarity.'],
        ['Does Nothing have better software than Samsung?', 'Many buyers find Nothing cleaner and more minimal, while Samsung offers a broader mainstream ecosystem.'],
        ['Is Samsung safer to buy?', 'Samsung is more familiar, but a properly verified official Nothing purchase can also be very safe.'],
      ],
      render: renderNothingVsSamsungArticle,
    },
    'What is CMF by Nothing? Beginner Guide': {
      category: 'Brand',
      focusKeyword: 'What is CMF by Nothing',
      contentType: 'blog',
      metaTitle: 'What is CMF by Nothing? Beginner Guide',
      metaDescription: 'Beginner-friendly explanation of CMF by Nothing covering its concept, product range, budget positioning, and why Pakistan buyers are paying attention to it.',
      hero: { eyebrow: 'CMF Intro', caption: 'The accessible side of the Nothing ecosystem for value-focused buyers.', layout: 'right', assetUrls: [ctx.cmfPhone1.image] },
      faqs: [
        ['What is CMF by Nothing?', 'CMF by Nothing is the more budget-focused side of the Nothing product family.'],
        ['Is CMF separate from Nothing?', 'It is a sub-brand with a different pricing position, but it still sits inside the same wider product ecosystem.'],
        ['Why is CMF popular in Pakistan?', 'Because it makes the brand story more affordable for buyers who still care about design.'],
      ],
      render: renderCmfBeginnerArticle,
    },
    'Nothing Phone PTA Tax in Pakistan Explained': {
      category: 'PTA',
      focusKeyword: 'Nothing Phone PTA tax in Pakistan',
      contentType: 'faq',
      metaTitle: 'Nothing Phone PTA Tax in Pakistan Explained',
      metaDescription: 'A practical guide to Nothing Phone PTA tax in Pakistan, including how to think about cost, why non-PTA prices confuse buyers, and what to ask before checkout.',
      hero: { eyebrow: 'PTA Tax', caption: 'How to think about phone tax without falling for misleading comparisons.', layout: 'left', assetUrls: [ctx.phone3a.image] },
      faqs: [
        ['Is PTA tax the same for every Nothing phone?', 'No. It depends on the exact device and registration context.'],
        ['Should I trust old PTA tax screenshots?', 'No. Use official channels for the current amount instead of relying on outdated social posts.'],
        ['Why do some prices look much lower?', 'Because they may be quoting a non-PTA device instead of a registered one.'],
      ],
      render: renderPtaTaxArticle,
    },
    'Does Nothing Phone Work on Jazz and Zong in Pakistan?': {
      category: 'Network',
      focusKeyword: 'Does Nothing Phone work on Jazz and Zong in Pakistan',
      contentType: 'faq',
      metaTitle: 'Does Nothing Phone Work on Jazz and Zong in Pakistan?',
      metaDescription: 'Network compatibility guide for Nothing phones in Pakistan covering Jazz, Zong, Ufone, and Telenor, plus PTA, 4G, 5G, and practical signal considerations.',
      hero: { eyebrow: 'Network Guide', caption: 'What really determines mobile network compatibility in Pakistan.', layout: 'right', assetUrls: [ctx.phone2.image] },
      faqs: [
        ['Do Nothing phones work on Jazz and Zong?', 'Yes, generally they do, as long as the device variant supports local bands and the phone is properly registered.'],
        ['What about Ufone and Telenor?', 'The same principle applies: variant support, local coverage, and PTA status matter more than the brand name alone.'],
        ['Will 5G work everywhere?', 'No. 5G depends on local rollout, band support, and area-specific coverage quality.'],
      ],
      render: renderNetworkArticle,
    },
    'Nothing Phone Camera Review Pakistan': {
      category: 'Reviews',
      focusKeyword: 'Nothing Phone camera review Pakistan',
      contentType: 'review',
      metaTitle: 'Nothing Phone Camera Review Pakistan',
      metaDescription: 'A practical camera review of Nothing phones for Pakistan usage, covering daylight, portraits, low light, video, and what matters most for everyday buyers.',
      hero: { eyebrow: 'Camera Review', caption: 'How Nothing phone cameras perform in real everyday Pakistan use.', layout: 'left', assetUrls: [ctx.phone3aPro.image] },
      faqs: [
        ['Are Nothing phone cameras good in Pakistan?', 'Yes, especially for everyday daylight, social media, portraits, and casual video use.'],
        ['Which Nothing phone is best for camera buyers?', 'That depends on the model tier, but higher-tier Nothing phones and Pro variants usually make more sense for camera-focused buyers.'],
        ['Should I buy Nothing only for the camera?', 'Compare model by model. The camera is a strength, but the bigger appeal is usually the total design and software experience.'],
      ],
      render: renderCameraArticle,
    },
    'Best Budget Nothing Phone in Pakistan': {
      category: 'Buying Guides',
      focusKeyword: 'Best budget Nothing Phone in Pakistan',
      contentType: 'guide',
      metaTitle: 'Best Budget Nothing Phone in Pakistan',
      metaDescription: 'Find the best budget Nothing phone in Pakistan with a simple comparison of CMF Phone 1, Phone (2a), and what to buy if you want the strongest value per rupee.',
      hero: { eyebrow: 'Budget Pick', caption: 'The smartest low-cost entry into the Nothing ecosystem.', layout: 'right', assetUrls: [ctx.cmfPhone1.image, ctx.phone2a.image] },
      faqs: [
        ['Which is the best budget Nothing phone?', 'CMF Phone 1 is the strongest pure budget pick right now.'],
        ['Is Phone (2a) still worth more money?', 'Yes, if you can stretch the budget and want a more complete mid-range phone.'],
        ['Should I prioritize accessories too?', 'Yes. A phone decision should leave room for a charger, cable, and protection if you need them.'],
      ],
      render: renderBudgetArticle,
    },
  }
}

async function upsertBlogWithRelations(supabase, post, imageUrl) {
  const { data: upsertedBlog, error: blogError } = await supabase
    .from('blogs')
    .upsert({
      title: post.title,
      slug: post.slug,
      content: post.content,
      meta_title: post.metaTitle,
      meta_description: post.metaDescription,
      excerpt: post.excerpt,
      focus_keyword: post.focusKeyword,
      category: post.category,
      tags: post.tags,
      author: AUTHOR,
      author_type: 'staff',
      content_type: post.contentType,
      reading_time: post.readingTime,
      is_published: true,
      published_at: post.publishedAt,
      updated_at: post.updatedAt,
    }, {
      onConflict: 'slug',
    })
    .select('id')
    .single()

  if (blogError) throw new Error(`Failed to upsert blog "${post.title}": ${blogError.message}`)

  const blogId = upsertedBlog.id

  const { error: deleteImageError } = await supabase.from('images').delete().eq('related_type', 'blog').eq('related_id', blogId)
  if (deleteImageError) throw new Error(`Failed to clear old images for "${post.title}": ${deleteImageError.message}`)

  const { error: deleteFaqError } = await supabase.from('faqs').delete().eq('related_type', 'blog').eq('related_id', blogId)
  if (deleteFaqError) throw new Error(`Failed to clear old FAQs for "${post.title}": ${deleteFaqError.message}`)

  const { data: insertedImage, error: imageError } = await supabase
    .from('images')
    .insert({
      related_type: 'blog',
      related_id: blogId,
      url: imageUrl,
      alt_text: `${post.title} hero image for Nothing Pakistan blog`,
      title: post.title,
      caption: post.metaDescription,
      file_name: `${post.slug}.webp`,
      slug: post.slug,
      sort_order: 0,
    })
    .select('id')
    .single()

  if (imageError) throw new Error(`Failed to insert image for "${post.title}": ${imageError.message}`)

  const faqRows = post.faqs.map(([question, answer]) => ({
    related_type: 'blog',
    related_id: blogId,
    question,
    answer,
  }))
  const { error: faqError } = await supabase.from('faqs').insert(faqRows)
  if (faqError) throw new Error(`Failed to insert FAQs for "${post.title}": ${faqError.message}`)

  const { error: updateFeaturedError } = await supabase.from('blogs').update({ featured_image_id: insertedImage.id }).eq('id', blogId)
  if (updateFeaturedError) throw new Error(`Failed to set featured image for "${post.title}": ${updateFeaturedError.message}`)

  return { blogId, imageId: insertedImage.id }
}

async function main() {
  loadEnv()
  await ensureBackground()

  const prompts = JSON.parse(readFileSync(PROMPT_PATH, 'utf8'))
  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const catalog = await loadCatalog(supabase)
  const ctx = buildCommonContext(catalog)
  const articleDefinitions = buildArticles(ctx)
  const results = []

  for (const prompt of prompts.blogs) {
    const definition = articleDefinitions[prompt.title]
    if (!definition) {
      throw new Error(`No article generator found for title: ${prompt.title}`)
    }

    const slug = slugify(prompt.title)
    const content = definition.render(ctx)
    const excerpt = summarizeExcerpt(content)
    const readingTime = estimateReadingTime(content)
    const { webpPath } = await createHeroImage({
      slug,
      title: prompt.title,
      eyebrow: definition.hero.eyebrow,
      caption: definition.hero.caption,
      layout: definition.hero.layout,
      assetUrls: definition.hero.assetUrls.filter(Boolean),
    })

    const imageUrl = await uploadImageToCloudinary(webpPath, slug, prompt.title, definition.metaDescription)
    const blogPayload = {
      title: prompt.title,
      slug,
      content,
      metaTitle: definition.metaTitle,
      metaDescription: definition.metaDescription,
      excerpt,
      focusKeyword: definition.focusKeyword,
      category: definition.category,
      tags: [definition.focusKeyword, 'Nothing Pakistan', 'CMF by Nothing Pakistan', 'buy Nothing Pakistan'],
      contentType: definition.contentType,
      readingTime,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      faqs: definition.faqs,
    }

    const relationIds = await upsertBlogWithRelations(supabase, blogPayload, imageUrl)
    results.push({
      title: prompt.title,
      slug,
      blogId: relationIds.blogId,
      imageId: relationIds.imageId,
      imageUrl,
      webpPath,
    })
  }

  const reportPath = path.join(GENERATED_DIR, 'blog-import-report.json')
  writeFileSync(reportPath, JSON.stringify({ updatedAt: new Date().toISOString(), results }, null, 2))
  console.log(JSON.stringify({ reportPath, imported: results.length, results }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
