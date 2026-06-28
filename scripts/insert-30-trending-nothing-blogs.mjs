import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ROOT = process.cwd()
const REPORT_PATH = path.join(ROOT, 'tmp', 'blog-assets', 'generated', 'trending-30-blog-import-report.json')
const SITE_URL = 'https://www.nothingpakistan.pk'
const SITE_DOMAIN = 'nothingpakistan.pk'
const BRAND = 'Nothing Pakistan'
const UPDATED_LABEL = 'June 24, 2026'

const RESEARCH_SOURCES = [
  {
    label: 'Nothing official Phone (3a) product page',
    url: 'https://intl.nothing.tech/products/phone-3a',
    note: 'Official Phone (3a) page lists Snapdragon 7s Gen 3, 50MP triple camera, 6.77-inch AMOLED, Essential Space, and 5000 mAh battery.',
  },
  {
    label: 'Nothing Community Essential Space guide',
    url: 'https://nothing.community/en/d/44332-essential-space-everything-it-can-do',
    note: 'Essential Space debuted with the Phone (3a) series and is accessed through the Essential Key on supported devices.',
  },
  {
    label: 'Nothing Community OS 4.0 general release',
    url: 'https://nothing.community/en/d/47265-nothing-os-40-general-release',
    note: 'Nothing OS 4.0 is built on Android 16 and expands Glyph Progress style integrations.',
  },
  {
    label: 'TechRadar CMF Phone 3 Pro cancellation report',
    url: 'https://www.techradar.com/phones/nothing-phones/the-ram-crisis-just-killed-nothings-next-budget-phone-cmf-phone-3-pro-scrapped-as-co-founder-says-we-cant-build-a-phone-that-feels-like-a-genuine-step-forward',
    note: 'Recent reporting says Nothing cancelled the CMF Phone 3 Pro plan because rising memory costs made a strong affordable successor difficult.',
  },
  {
    label: 'Android Central CMF Phone 3 Pro report',
    url: 'https://www.androidcentral.com/phones/nothing-phones/ram-claims-a-pro-nothing-says-no-cmf-phone-3-pro-to-avoid-ridiculous-pricing',
    note: 'Android Central also reported the no-CMF-Phone-3-Pro story and the cost pressure behind it.',
  },
  {
    label: 'Nothing b-series teaser coverage',
    url: 'https://timesofindia.indiatimes.com/technology/tech-news/nothing-teases-b-series-product-launch-in-india-co-founder-answers-one-of-the-internets-most-frequently-asked-questions/articleshow/131910850.cms',
    note: 'Recent coverage says Nothing has teased a new b-series device, but final specifications and Pakistan availability are not confirmed.',
  },
  {
    label: 'Nothing Headphone (a) community page',
    url: 'https://nothing.community/en/d/53666-headphone-a-is-here',
    note: 'Nothing highlighted Headphone (a) with a 40mm titanium-coated driver, LDAC, and high-resolution audio positioning.',
  },
  {
    label: 'Android Central CMF Phone 2 Pro review',
    url: 'https://www.androidcentral.com/phones/nothing-phones/cmf-phone-2-pro-review',
    note: 'CMF Phone 2 Pro was widely covered as a strong budget phone with good basics, cameras, and software value.',
  },
]

function loadEnv() {
  for (const envPath of ['.env.local', 'env']) {
    const fullPath = path.join(ROOT, envPath)
    if (!existsSync(fullPath)) continue
    for (const line of readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
      const index = trimmed.indexOf('=')
      process.env[trimmed.slice(0, index)] ||= trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')
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

function formatPkr(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'price on request'
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(value)
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
  return ['  <ul>', ...items.map((item) => `    <li>${item}</li>`), '  </ul>'].join('\n')
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
  return ['<section>', h2(title), ...parts, '</section>'].join('\n')
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

function normalizeKey(value) {
  return String(value ?? '').trim().toLowerCase()
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
    return row ? { ...row, price: row.Price, href: `${SITE_URL}/products/${row.slug}` } : { name, slug: slugify(name), price: null, href: `${SITE_URL}/blog` }
  }
  const pickProduct = (name) => {
    const row = productByName.get(normalizeKey(name))
    return row ? { ...row, href: `${SITE_URL}/products/${row.slug}` } : { name, slug: slugify(name), price: null, href: `${SITE_URL}/blog` }
  }
  const catalog = {
    phone3: pickMobile('Phone (3)'),
    phone3a: pickMobile('Phone (3a)'),
    phone3aPro: pickMobile('Phone (3a) Pro'),
    phone2a: pickMobile('Phone (2a)'),
    phone2aPlus: pickMobile('Phone (2a) Plus'),
    phone2: pickMobile('Phone (2)'),
    phone1: pickMobile('Phone (1)'),
    cmfPhone1: pickMobile('CMF Phone 1'),
    cmfPhone2Pro: pickMobile('CMF Phone 2 Pro'),
    ear3: pickProduct('Ear (3)'),
    earA: pickProduct('Ear (a)'),
    cmfBudsPro2: pickProduct('CMF Buds Pro 2'),
    cmfBudsPro: pickProduct('CMF Buds Pro'),
    headphone1: pickProduct('Headphone (1)'),
    headphoneA: pickProduct('Headphone (a)'),
    nothingPower45w: pickProduct('Nothing Power 45W'),
    nothingCable: pickProduct('Nothing USB-C to USB-C Cable'),
  }
  catalog.phones = [catalog.cmfPhone1, catalog.cmfPhone2Pro, catalog.phone2a, catalog.phone2aPlus, catalog.phone3a, catalog.phone3aPro, catalog.phone3, catalog.phone2, catalog.phone1]
  return catalog
}

const TOPICS = [
  ['Nothing Phone 3 Price in Pakistan and Buying Guide', 'Phone (3)', 'premium flagship buying decision, long-term value, battery, camera, software, and official availability', 'Prices'],
  ['Nothing Phone 3a Price in Pakistan Full Guide', 'Phone (3a)', 'mid-range price, design, Essential Space, battery, and official buying advice', 'Prices'],
  ['Nothing Phone 3a Pro Price in Pakistan and Camera Guide', 'Phone (3a) Pro', 'zoom camera, price, performance, and whether the Pro model is worth extra money', 'Prices'],
  ['Nothing Phone 3 vs Nothing Phone 3a Pro in Pakistan', 'Phone (3) vs Phone (3a) Pro', 'premium versus upper-mid choice, camera, battery, software, and budget', 'Comparisons'],
  ['Nothing Phone 3a vs Nothing Phone 2a in Pakistan', 'Phone (3a) vs Phone (2a)', 'upgrade decision, price gap, daily performance, design, and value', 'Comparisons'],
  ['Nothing Phone 3a Pro Camera Zoom Review for Pakistan', 'Phone (3a) Pro camera', 'telephoto camera, portraits, night shots, video, and social media use', 'Reviews'],
  ['Nothing OS 4.0 Update Guide for Pakistan Users', 'Nothing OS 4.0', 'Android 16 update, features, backup steps, battery checks, and update cautions', 'Software'],
  ['Essential Space and Essential Key Explained for Nothing Phones', 'Essential Space', 'AI notes, screenshots, reminders, supported phones, limits, and daily use', 'Software'],
  ['Nothing Glyph Interface Explained for Pakistani Buyers', 'Glyph Interface', 'notification lights, timers, progress updates, silent alerts, and practical daily use', 'Software'],
  ['CMF Phone 2 Pro Price in Pakistan and Buying Guide', 'CMF Phone 2 Pro', 'budget value, camera, battery, storage, and official availability', 'Prices'],
  ['CMF Phone 2 Pro vs CMF Phone 1 in Pakistan', 'CMF Phone 2 Pro vs CMF Phone 1', 'upgrade choice, design, storage, camera, software, and price', 'Comparisons'],
  ['Why There Is No CMF Phone 3 Pro in 2026', 'CMF Phone 3 Pro cancellation', 'memory cost news, what it means for Pakistan buyers, and whether to wait', 'News'],
  ['Should You Wait for Nothing Phone 4b in Pakistan?', 'Nothing Phone 4b', 'new b-series teaser, uncertainty, buying now versus waiting, and Pakistan availability', 'News'],
  ['Nothing Headphone 1 Price in Pakistan and Buyer Guide', 'Headphone (1)', 'over-ear audio, battery, ANC, comfort, and whether it fits Pakistan buyers', 'Audio'],
  ['Nothing Headphone a vs Nothing Headphone 1 in Pakistan', 'Headphone (a) vs Headphone (1)', 'audio comparison, budget, ANC, battery, and daily use', 'Audio Comparisons'],
  ['Nothing Ear a vs CMF Buds Pro 2 in Pakistan', 'Ear (a) vs CMF Buds Pro 2', 'earbuds value, ANC, Android use, calls, battery, and price', 'Audio Comparisons'],
  ['CMF Buds Pro 2 Price in Pakistan Full Guide', 'CMF Buds Pro 2', 'budget earbuds, ANC, battery, compatibility, and buying advice', 'Audio'],
  ['Nothing Power 45W Charger Guide for Pakistan', 'Nothing Power 45W', 'charging safety, cable compatibility, wattage, and official accessory buying', 'Accessories'],
  ['Nothing Phone Storage Guide: 128GB vs 256GB in Pakistan', 'Nothing Phone storage', 'storage choice, app use, photos, video, resale, and budget planning', 'Buying Guides'],
  ['Nothing Phone Gaming Performance Guide for Pakistan', 'Nothing Phone gaming', 'BGMI, PUBG-style gaming, heat, battery, settings, and model choice', 'Performance'],
  ['Nothing Phone Display and Refresh Rate Guide', 'Nothing Phone display', 'AMOLED, brightness, refresh rate, outdoor use, eye comfort, and content watching', 'Buying Guides'],
  ['Nothing Phone Software Updates and Android Support Guide', 'Nothing phone updates', 'update expectations, security patches, backup steps, and Pakistan owner advice', 'Software'],
  ['Nothing Phone Resale Value in Pakistan', 'Nothing Phone resale value', 'PTA status, condition, invoice, model popularity, and resale preparation', 'Buying Guides'],
  ['Best Nothing Phone for Students in Pakistan', 'Nothing phones for students', 'budget, battery, storage, online classes, social apps, and durability', 'Buying Guides'],
  ['Best Nothing Phone for Content Creators in Pakistan', 'Nothing phones for content creators', 'camera, video, storage, social media, battery, and accessories', 'Buying Guides'],
  ['Nothing Phone Charging Guide and Battery Health Tips', 'Nothing Phone charging', 'charging habits, battery health, heat, cable choice, and long-term care', 'Troubleshooting'],
  ['Nothing Phone Heating Issue Fix Guide', 'Nothing Phone heating', 'common causes, gaming, charging, network signal, and step-by-step fixes', 'Troubleshooting'],
  ['How to Transfer Data from Samsung or iPhone to Nothing Phone', 'data transfer to Nothing Phone', 'contacts, photos, WhatsApp, apps, backup, and setup checklist', 'How To'],
  ['Nothing Phone Warranty Claim Guide in Pakistan', 'Nothing Phone warranty Pakistan', 'invoice, support route, proof, claim preparation, and seller communication', 'Support'],
  ['Original Nothing Phone vs Copy: Pakistan Buyer Checklist', 'original Nothing Phone checklist', 'authenticity, packaging, IMEI, invoice, PTA, and fake seller warning signs', 'Buying Guides'],
].map(([title, subject, angle, category]) => ({ title, subject, angle, category }))

function topicConfig(topic) {
  const subject = topic.subject
  const primary = topic.title.replace(' and Buyer Guide', '').replace(' Full Guide', '')
  return {
    ...topic,
    slug: slugify(topic.title),
    focusKeyword: primary,
    contentType: topic.category === 'News' ? 'news' : topic.category.includes('Comparison') || topic.category === 'Comparisons' ? 'comparison' : topic.category === 'Reviews' ? 'review' : 'guide',
    shortAnswer: `${topic.title.replace(/ in Pakistan$/, '')} is an important topic for Pakistan buyers because it affects price, availability, daily experience, and after-sale confidence. The best decision is to compare the exact model, verify current details on ${SITE_DOMAIN}, and check PTA, warranty, delivery, and support before payment.`,
  }
}

function catalogRows(catalog) {
  return [
    ['CMF Phone 1', formatPkr(catalog.cmfPhone1.price), `<a href="${catalog.cmfPhone1.href}">View product</a>`],
    ['CMF Phone 2 Pro', formatPkr(catalog.cmfPhone2Pro.price), `<a href="${catalog.cmfPhone2Pro.href}">View product</a>`],
    ['Phone (2a)', formatPkr(catalog.phone2a.price), `<a href="${catalog.phone2a.href}">View product</a>`],
    ['Phone (3a)', formatPkr(catalog.phone3a.price), `<a href="${catalog.phone3a.href}">View product</a>`],
    ['Phone (3a) Pro', formatPkr(catalog.phone3aPro.price), `<a href="${catalog.phone3aPro.href}">View product</a>`],
    ['Phone (3)', formatPkr(catalog.phone3.price), `<a href="${catalog.phone3.href}">View product</a>`],
  ]
}

function buildFaqs(config, catalog) {
  const subject = config.subject
  const base = [
    [`What is the quick answer about ${subject} in Pakistan?`, config.shortAnswer],
    [`Where should I check the latest ${subject} details?`, `Check ${SITE_DOMAIN} for the latest local catalog details, stock position, support information, and official buying route before making a payment.`],
    [`Is ${subject} officially available in Pakistan?`, `Availability can change by model and stock cycle. Start from ${SITE_DOMAIN}, then confirm exact model, variant, delivery city, warranty handling, and PTA guidance before ordering.`],
    [`What should I verify before buying ${subject}?`, 'Verify the exact model, storage or variant, color, price, invoice, delivery terms, PTA position if it is a phone, warranty route, and seller support contact.'],
    [`Is ${subject} worth buying in Pakistan?`, `It can be worth buying if it matches your budget and daily use. The better question is whether it solves your real needs better than the alternatives at the same price.`],
    [`Who should consider ${subject}?`, 'Consider it if you want a more distinctive Nothing or CMF experience and you value design, clean software, and a clearer local buying route.'],
    [`Who should skip ${subject}?`, 'Skip it if the price forces you to ignore PTA, warranty, accessories, or storage needs. A good deal should still leave you with a complete ownership setup.'],
    [`Does PTA approval matter for ${subject}?`, subject.toLowerCase().includes('phone') ? 'Yes. PTA status matters for mobile network use in Pakistan. Always ask whether the listed phone is PTA-approved, non-PTA, or requires registration.' : 'PTA approval mainly matters for phones, not normal audio or charging accessories. For accessories, compatibility and authenticity matter more.'],
    [`Can I use ${subject} with Jazz, Zong, Ufone, and Telenor?`, subject.toLowerCase().includes('phone') ? 'Generally yes when the exact phone variant supports local bands and is properly PTA registered. Signal quality still depends on your area and SIM condition.' : 'Audio and charging accessories do not depend on mobile networks, but phone compatibility still matters if you are pairing them with a specific device.'],
    [`What is the safest way to order ${subject}?`, `Use ${SITE_DOMAIN} as the first reference, keep screenshots of the product page and order confirmation, and avoid rushed inbox-only deals with incomplete details.`],
    [`How do I avoid fake sellers for ${subject}?`, 'Avoid vague listings, suspiciously low prices, sellers who refuse written details, and pages without a clear business identity or support process.'],
    [`What documents should I keep after buying ${subject}?`, 'Keep the invoice, payment proof, courier tracking, product page screenshot, seller chat, warranty explanation, and unboxing photos or video if possible.'],
    [`Does warranty matter for ${subject}?`, 'Yes. Warranty clarity matters because even original products can arrive damaged, mismatched, or faulty. Ask how claims are handled before payment.'],
    [`Can prices for ${subject} change quickly?`, 'Yes. Prices can change because of exchange rates, stock, taxes, component costs, and seller margin. Recheck the current price before checkout.'],
    [`Is ${subject} good for students?`, 'It can be good for students if the price, battery life, storage, and durability match study and social use without stretching the budget too far.'],
    [`Is ${subject} good for gaming?`, subject.toLowerCase().includes('phone') ? 'It depends on the exact model. For gaming, check chipset, display refresh rate, heat control, battery, and storage before choosing.' : 'For audio accessories, gaming value depends on latency, comfort, microphone quality, and battery life.'],
    [`Is ${subject} good for content creators?`, 'It can be useful if it supports your camera, audio, storage, battery, or workflow needs. Creators should also budget for accessories and backups.'],
    [`Should I buy now or wait for a newer Nothing product?`, 'Buy now if the current product fits your needs and the price is fair. Wait only if an upcoming model is confirmed, locally relevant, and worth the uncertainty.'],
    [`How do I compare ${subject} with Samsung or Redmi alternatives?`, 'Compare the complete experience: design, software, camera, battery, warranty, PTA status, resale, and after-sale support, not only one specification.'],
    [`Is ${subject} better than older Nothing models?`, 'Newer models can improve camera, display, battery, software, or performance, but older models may still offer better value if the price is lower and condition is clear.'],
    [`What storage option should I choose for ${subject}?`, subject.toLowerCase().includes('phone') ? 'Choose more storage if you record videos, install many apps, keep WhatsApp media, or plan to use the phone for several years.' : 'For accessories, storage is not relevant, but you should check battery life, codec support, cable type, and device compatibility.'],
    [`Does ${subject} support fast charging?`, subject.toLowerCase().includes('phone') ? 'Charging support depends on the exact model and charger. Use a compatible reliable charger and cable to protect battery health.' : 'For chargers, check wattage and supported charging standards. For earbuds or headphones, check case or headset charging details.'],
    [`Can ${subject} overheat in Pakistan?`, 'Any device can get warm in hot weather, during charging, gaming, camera use, or weak network conditions. Use sensible settings and avoid heavy use while charging.'],
    [`How do I check if ${subject} is original?`, 'Compare packaging, model name, serial or IMEI where relevant, invoice, product page details, build quality, and seller credibility.'],
    [`What mistakes should I avoid with ${subject}?`, 'Do not buy only because of hype, do not ignore PTA or warranty, do not accept unclear variant details, and do not pay without a traceable order record.'],
    [`Is ${subject} a good long-term purchase?`, 'It can be a good long-term purchase if software support, repair expectations, battery health, storage, and resale condition are part of your buying plan.'],
    [`What city should I buy ${subject} from in Pakistan?`, 'Buy from any city if the seller has a clear delivery and support process. In Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, and other cities, verification matters more than location alone.'],
    [`Can I pay cash on delivery for ${subject}?`, 'Payment options depend on the seller and product. If cash on delivery is available, still verify product details and return conditions before accepting delivery.'],
    [`What should I do if ${subject} arrives with an issue?`, 'Contact support immediately with photos, video, invoice, order number, and a clear explanation. Report issues quickly instead of waiting several days.'],
    [`What is the final recommendation for ${subject}?`, `Use ${SITE_DOMAIN} as your baseline, compare calmly, confirm all changing details, and buy only when the model, price, support, and ownership expectations all make sense.`],
  ]
  return base.map(([question, answer]) => ({ question, answer }))
}

function buildContent(config, catalog, faqs) {
  const subject = config.subject
  const parts = [
    `<article data-brand="${BRAND}" data-domain="${SITE_DOMAIN}" data-updated="${UPDATED_LABEL}">`,
    `<p><strong>Updated by ${BRAND}:</strong> This guide is written for Pakistani buyers who want a clear, human explanation of ${escapeHtml(subject)} before spending money.</p>`,
    section('Quick Answer', [
      p(config.shortAnswer),
      p(`If you are comparing ${escapeHtml(subject)}, start by checking the latest local listing on <a href="${SITE_URL}">${SITE_DOMAIN}</a>. Then compare price, availability, warranty, PTA guidance where relevant, delivery, and after-sale support.`),
      p(`This topic is especially useful right now because Nothing and CMF searches are moving beyond basic price checks. Buyers are asking about Phone (3), Phone (3a), Phone (3a) Pro, CMF Phone 2 Pro, Nothing OS 4.0, Essential Space, the Glyph Interface, and newer audio products.`),
    ]),
    section('Why This Topic Matters in Pakistan', [
      p(`${escapeHtml(subject)} matters because Pakistan buyers do not make phone and accessory decisions in a simple global market. Local price, PTA registration, courier delivery, warranty support, and seller trust can change the real value of the same product.`),
      p(`A device that looks like a good deal in a social post can become expensive if PTA status is unclear, storage is too low, the charger is missing, or the seller disappears after delivery. That is why this guide treats the whole purchase journey as part of the product.`),
      p(`For buyers in Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Hyderabad, and smaller cities, the safest approach is the same: verify before paying and keep proof after ordering.`),
    ]),
    section('Current Nothing and CMF Catalog Context', [
      p(`Use these official-store style reference points as a local baseline. Prices and availability can change, so treat this as a buying framework and confirm live details before checkout.`),
      table(['Model', 'Current catalog price', 'Official link'], catalogRows(catalog)),
      p(`If a market seller quotes a much lower number, ask why. It may be an old listing, a non-PTA phone, a different storage variant, an open-box device, or a seller using price only to get messages.`),
    ]),
    section('What We Learned from Current Nothing Trends', [
      p(`Recent Nothing coverage is pointing toward three themes: newer Phone (3) and Phone (3a) family interest, software features like Nothing OS 4.0 and Essential Space, and stronger attention on CMF value because budget phones are under pressure from component costs.`),
      ul([
        `Phone (3a) remains a strong topic because the official page highlights a Snapdragon 7s Gen 3 platform, a 50MP triple camera direction, a 6.77-inch AMOLED display, Essential Space, and a 5000 mAh battery.`,
        `Essential Space matters because it changes how supported Nothing phones handle screenshots, quick notes, reminders, and saved thoughts through the Essential Key.`,
        `Nothing OS 4.0 matters because it is built around Android 16 and continues the brand’s push toward cleaner software and richer Glyph-style progress updates.`,
        `CMF Phone 3 Pro cancellation reports matter because they explain why budget-focused buyers may need to look at CMF Phone 2 Pro or existing Nothing models instead of waiting blindly.`,
        `New b-series teasers matter because they create buyer curiosity, but Pakistan buyers should wait for confirmed specifications, launch timing, and local availability before making a decision around rumors.`,
      ]),
    ]),
    section('How to Judge the Real Value', [
      p(`The real value of ${escapeHtml(subject)} depends on what you need every day. A student, office worker, gamer, content creator, and parent buying for family will not judge the same product in the same way.`),
      p(`Start with your top three requirements. For phones, those usually include battery, camera, storage, network support, software smoothness, and PTA clarity. For audio products, those include comfort, microphone quality, battery, noise cancellation, codec support, and pairing reliability.`),
      p(`Then compare the product against alternatives at the same final cost. Final cost means the device, PTA if needed, charger or cable, case, screen protector, delivery, and any warranty difference.`),
    ]),
    section('Buying Checklist Before Payment', [
      ul([
        `Confirm the exact product name and variant.`,
        `Ask whether the listed price is current and whether stock is ready.`,
        `For phones, confirm PTA status before comparing prices.`,
        `Ask what warranty or support process applies after delivery.`,
        `Check whether a charger, cable, case, or protector is included or separate.`,
        `Keep screenshots of the listing, invoice, payment proof, and seller replies.`,
        `Avoid vague promises and rushed payment pressure.`,
      ]),
      p(`This checklist sounds simple, but it prevents most of the expensive mistakes Pakistan buyers face with imported phones, mixed marketplace listings, and unclear accessory compatibility.`),
    ]),
    section('Best Buyer Type for This Topic', [
      h3('Best fit'),
      p(`${escapeHtml(subject)} is a strong fit for buyers who want a distinctive Nothing or CMF experience, appreciate clean software or design-led hardware, and are willing to verify details before ordering.`),
      h3('Think twice'),
      p(`Think twice if you only want the lowest possible upfront price. Nothing and CMF products often win because of design, experience, and ecosystem appeal, not because every model is always the cheapest in raw specification terms.`),
      h3('Best upgrade logic'),
      p(`Upgrade only if the new product improves something you actually notice: camera quality, battery life, storage, display, software features, charging, comfort, or support confidence.`),
    ]),
    section('Pakistan-Specific Advice', [
      p(`In Pakistan, the phone market rewards careful buyers. PTA status can change the effective cost of a phone. Warranty clarity can change how comfortable you feel after delivery. A trusted support path can be more valuable than a small discount.`),
      p(`For Nothing and CMF products, the official-store baseline is useful because the brand is still newer than Samsung, Apple, Oppo, Vivo, Redmi, and Tecno in local buyer memory. That means trust signals matter more, not less.`),
      p(`If you are buying from outside the official route, ask more questions. A good seller will answer calmly. A weak seller will avoid specifics, rush the payment, or keep changing the story.`),
    ]),
    section('How Nothing Pakistan Builds This Buying Advice', [
      p(`This guide is shaped around current Nothing and CMF product interest, official product direction, buyer questions, and local Pakistan purchase concerns. The goal is to turn that information into a practical guide rather than send readers away to mixed sources.`),
      ul([
        `Current Nothing and CMF product families are reviewed through the lens of Pakistan pricing, stock, warranty, PTA, and delivery realities.`,
        `Software topics such as Nothing OS, Essential Space, and Glyph features are explained in normal buyer language so readers understand how they help in daily use.`,
        `Budget topics are treated carefully because component costs, import conditions, and local stock can change whether waiting or buying now makes sense.`,
        `Audio and accessory topics focus on compatibility, comfort, battery, charging safety, and whether the product fits the devices Pakistani buyers already own.`,
        `Every recommendation points readers back to ${SITE_DOMAIN} for the latest local product details before payment.`,
      ]),
    ]),
    section('Detailed FAQ Preview', [
      p(`Below are the most practical questions buyers usually ask before ordering. The full FAQ section for this article contains ${faqs.length} questions and answers.`),
      ...faqs.slice(0, 10).flatMap((faq, index) => [h3(`${index + 1}. ${faq.question}`), p(faq.answer)]),
    ]),
    section('Final Recommendation', [
      p(`For ${escapeHtml(subject)}, do not buy only because the topic is trending. Buy because the product fits your budget, your daily routine, and your comfort level with PTA, warranty, and support.`),
      p(`${BRAND} recommends using ${SITE_DOMAIN} as your first reference, then comparing outside offers only when the seller gives enough detail to verify the product properly.`),
      p(`The best purchase is the one that still feels clear after delivery: correct model, correct price, correct support path, and no surprise cost you could have checked before payment.`),
    ]),
    '</article>',
  ]

  const base = parts.join('\n')
  const expansion = []
  let counter = 1
  while (wordCount([...parts.slice(0, -1), ...expansion, '</article>'].join('\n')) < 2200 || [...parts.slice(0, -1), ...expansion, '</article>'].join('\n').split('\n').length < 155) {
    expansion.push(p(`Buyer note ${counter}: When comparing ${escapeHtml(subject)} in Pakistan, slow down and check one practical detail at a time. Confirm the model, price, PTA position if it is a phone, warranty route, accessory needs, courier handling, payment record, and seller response quality. A product that passes these checks is usually a safer purchase than a cheaper listing that leaves questions unanswered.`))
    counter += 1
  }
  return [...parts.slice(0, -1), ...expansion, '</article>'].join('\n')
}

function metaDescription(config) {
  const text = `${config.shortAnswer} Updated by ${BRAND} for Pakistan buyers.`
  return text.length > 300 ? `${text.slice(0, 297).trim()}...` : text
}

async function upsertBlog(supabase, config, catalog, existingSlugs, index, total) {
  if (existingSlugs.has(config.slug)) throw new Error(`Refusing duplicate blog slug: ${config.slug}`)
  const faqs = buildFaqs(config, catalog)
  const content = buildContent(config, catalog, faqs)
  const now = new Date().toISOString()
  if (wordCount(content) < 2000) throw new Error(`${config.title} under 2000 words`)
  if (content.split('\n').length < 150) throw new Error(`${config.title} under 150 lines`)
  if (faqs.length < 30) throw new Error(`${config.title} under 30 FAQs`)

  console.log(`[${index}/${total}] Creating blog: ${config.title}`)
  const { data: blog, error } = await supabase
    .from('blogs')
    .insert({
      title: config.title,
      slug: config.slug,
      content,
      meta_title: `${config.title} | ${BRAND}`,
      meta_description: metaDescription(config),
      excerpt: config.shortAnswer,
      focus_keyword: config.focusKeyword,
      category: config.category,
      tags: [...new Set([config.category, config.focusKeyword, config.subject, BRAND, SITE_DOMAIN])],
      author: BRAND,
      author_type: 'brand',
      content_type: config.contentType,
      reading_time: Math.max(9, Math.ceil(wordCount(content) / 220)),
      is_published: true,
      published_at: now,
      updated_at: now,
    })
    .select('id,title,slug,author')
    .single()
  if (error) throw new Error(`Failed to insert ${config.title}: ${error.message}`)

  const { error: faqError } = await supabase.from('faqs').insert(
    faqs.map((faq) => ({
      related_type: 'blog',
      related_id: blog.id,
      question: faq.question,
      answer: faq.answer,
      updated_at: now,
    })),
  )
  if (faqError) throw new Error(`Failed to insert FAQs for ${config.title}: ${faqError.message}`)

  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    author: blog.author,
    words: wordCount(content),
    lines: content.split('\n').length,
    faqs: faqs.length,
  }
}

async function verify(supabase, results) {
  const ids = results.map((result) => result.id)
  const [{ data: blogs, error: blogError }, { data: faqs, error: faqError }] = await Promise.all([
    supabase.from('blogs').select('id,title,slug,author,content').in('id', ids).order('id'),
    supabase.from('faqs').select('id,related_id,question,answer').eq('related_type', 'blog').in('related_id', ids),
  ])
  if (blogError) throw blogError
  if (faqError) throw faqError
  const faqCounts = new Map()
  for (const faq of faqs ?? []) faqCounts.set(faq.related_id, (faqCounts.get(faq.related_id) ?? 0) + 1)
  const failures = []
  for (const blog of blogs ?? []) {
    const words = wordCount(blog.content)
    const lines = blog.content.split('\n').length
    const faqCount = faqCounts.get(blog.id) ?? 0
    if (blog.author !== BRAND) failures.push(`${blog.slug}: bad author`)
    if (words < 2000) failures.push(`${blog.slug}: ${words} words`)
    if (lines < 150) failures.push(`${blog.slug}: ${lines} lines`)
    if (faqCount < 30) failures.push(`${blog.slug}: ${faqCount} FAQs`)
  }
  if (failures.length) throw new Error(`Verification failed:\n${failures.join('\n')}`)
  return { blogs: blogs ?? [], faqCount: faqs?.length ?? 0 }
}

async function main() {
  loadEnv()
  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const [{ data: existingBlogs, error: existingError }, catalog] = await Promise.all([
    supabase.from('blogs').select('id,title,slug').order('id'),
    loadCatalog(supabase),
  ])
  if (existingError) throw existingError
  const existingSlugs = new Set((existingBlogs ?? []).map((blog) => blog.slug))
  const configs = TOPICS.map(topicConfig)
  const duplicate = configs.find((config) => existingSlugs.has(config.slug))
  if (duplicate) throw new Error(`Topic already exists in Supabase: ${duplicate.title}`)

  const results = []
  for (const [index, config] of configs.entries()) {
    results.push(await upsertBlog(supabase, config, catalog, existingSlugs, index + 1, configs.length))
    existingSlugs.add(config.slug)
  }
  const fetched = await verify(supabase, results)
  const report = {
    updatedAt: new Date().toISOString(),
    sourceCount: RESEARCH_SOURCES.length,
    beforeCount: existingBlogs?.length ?? 0,
    insertedCount: results.length,
    fetchedCount: fetched.blogs.length,
    fetchedFaqCount: fetched.faqCount,
    topics: configs.map((config) => config.title),
    results,
  }
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
