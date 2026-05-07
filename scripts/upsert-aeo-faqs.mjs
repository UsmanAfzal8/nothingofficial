import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

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
    // Shell env vars can provide credentials.
  }
}

loadEnvFile(resolve(process.cwd(), '.env.local'))
loadEnvFile(resolve(process.cwd(), 'env'))

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const forceUpdate = process.argv.includes('--force')

function normalizeName(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function formatPrice(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return `Rs ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(value)}`
}

function isSkippedProduct(product) {
  if (product.product_type === 'protector') return true

  const source = `${product.name || ''} ${product.slug || ''}`.toLowerCase()
  return /\b(cover|covers|case|cases|protector|protectors|sheet|glass|privacy|uv|9d|jelly)\b/.test(source)
}

function classifyProduct(product) {
  const source = `${product.name || ''} ${product.slug || ''} ${product.product_type || ''}`.toLowerCase()

  if (product.product_type === 'charger' || source.includes('power') || source.includes('gan')) return 'charger'
  if (product.product_type === 'data_cable' || source.includes('cable')) return 'cable'
  if (product.product_type === 'earbuds' || source.includes('buds') || source.includes('ear')) return 'earbuds'
  if (source.includes('headphone')) return 'headphone'
  if (source.includes('watch')) return 'watch'

  return 'product'
}

function highlightText(item, fallback) {
  const text = stripHtml(item.short_description || item.description || item.meta_description || '')
  if (!text) return fallback
  return text.length > 180 ? `${text.slice(0, 177).trim()}...` : text
}

function productTypeLabel(type) {
  const labels = {
    charger: 'charger',
    cable: 'USB-C cable',
    earbuds: 'wireless earbuds',
    headphone: 'headphones',
    watch: 'smart watch',
    product: 'product',
  }

  return labels[type] || labels.product
}

function buildProductFaqs(product) {
  const name = normalizeName(product.name)
  const type = classifyProduct(product)
  const label = productTypeLabel(type)
  const priceLabel = formatPrice(product.price)
  const priceAnswer = priceLabel
    ? `${name} price in Pakistan is ${priceLabel} on Nothing Pakistan. Prices are read from the live catalog, so the page updates when the Supabase price is changed.`
    : `${name} price in Pakistan is shown on the product page when available. You can also contact Nothing Pakistan on WhatsApp for the latest price and stock.`
  const highlight = highlightText(product, `${name} is listed for buyers in Pakistan who want original Nothing or CMF products with local ordering support.`)

  return [
    ['What is the price of ' + name + ' in Pakistan?', priceAnswer],
    ['Where can I buy original ' + name + ' in Pakistan?', `You can buy ${name} from Nothing Pakistan through the product page, order form, or WhatsApp support.`],
    ['Is ' + name + ' original?', `${name} is listed as an original Nothing Pakistan catalog item. The team can confirm stock, packaging, and availability before order confirmation.`],
    ['Does Nothing Pakistan offer cash on delivery for ' + name + '?', `Cash on delivery may be available for ${name} in supported cities. Final COD eligibility is confirmed when your order is processed.`],
    ['How long does delivery take for ' + name + '?', `Estimated delivery for ${name} is usually shown on the product page. Delivery timing can vary by city, courier coverage, and order confirmation time.`],
    ['Can I order ' + name + ' on WhatsApp?', `Yes, you can contact Nothing Pakistan on WhatsApp to confirm ${name} price, stock, delivery city, and ordering details.`],
    ['Is ' + name + ' available in Karachi, Lahore, and Islamabad?', `${name} can be ordered for major Pakistani cities such as Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, and Peshawar, subject to courier coverage.`],
    ['What are the key highlights of ' + name + '?', highlight],
    ['Is ' + name + ' suitable for daily use?', `Yes, ${name} is positioned for daily use by buyers who want a reliable ${label} with local ordering support in Pakistan.`],
    ['Does ' + name + ' come with local support?', `Nothing Pakistan provides order support for ${name}. Warranty, replacement, or after-sales help depends on the item condition and order confirmation details.`],
    ['Can I return or exchange ' + name + '?', `If ${name} arrives damaged, incorrect, or defective, contact support quickly so the team can review the return or exchange request.`],
    ['How do I confirm stock for ' + name + '?', `Use the product page order button or WhatsApp contact option to confirm live stock for ${name} before finalizing the order.`],
    ['Does the listed price of ' + name + ' include delivery charges?', `The visible price is the product price. Delivery charges, if any, are confirmed during checkout or WhatsApp order confirmation.`],
    ['Is ' + name + ' good value in Pakistan?', `${name} is useful for shoppers comparing original Nothing and CMF products in Pakistan with visible pricing, local delivery, and WhatsApp help.`],
    ['Can I buy ' + name + ' online from Nothing Pakistan?', `Yes, ${name} can be ordered online from Nothing Pakistan using the Buy Now flow or by contacting support on WhatsApp.`],
    ['What should I check before ordering ' + name + '?', `Before ordering ${name}, confirm the latest price, stock status, delivery city, color or variant if applicable, and return support details.`],
    ['Does ' + name + ' work with Nothing and CMF devices?', `${name} is listed in the Nothing Pakistan catalog. Compatibility depends on the product type, so confirm your exact device model before ordering.`],
    ['Are images of ' + name + ' shown on the product page?', `Yes, the ${name} page shows product images where available so buyers can review the design, color, and product style before ordering.`],
    ['Why should I order ' + name + ' from Nothing Pakistan?', `Nothing Pakistan keeps ${name} in a local catalog with updated pricing, product details, order support, and delivery guidance for Pakistani buyers.`],
    ['How often is the ' + name + ' price updated?', `The ${name} price is managed from Supabase and shown dynamically on the website, so catalog updates can reflect without editing local website files.`],
  ]
}

function buildMobileFaqs(mobile) {
  const name = normalizeName(mobile.name)
  const priceLabel = formatPrice(mobile.Price)
  const priceAnswer = priceLabel
    ? `${name} price in Pakistan is ${priceLabel} on Nothing Pakistan. This price is read from Supabase, so it can be updated from the live catalog.`
    : `${name} price in Pakistan is shown on the phone page when available. You can contact Nothing Pakistan on WhatsApp for the latest price.`
  const highlight = highlightText(mobile, `${name} is listed for Pakistani buyers who want Nothing or CMF phone information, accessories, ordering support, and delivery guidance.`)

  return [
    ['What is the price of ' + name + ' in Pakistan?', priceAnswer],
    ['Where can I buy ' + name + ' in Pakistan?', `You can order ${name} from Nothing Pakistan through the phone page or WhatsApp support, subject to stock availability.`],
    ['Is ' + name + ' available on Nothing Pakistan?', `${name} is listed on Nothing Pakistan. Stock and final availability should be confirmed before placing the order.`],
    ['Is ' + name + ' PTA approved?', `PTA approval status for ${name} should be confirmed with support before purchase, because availability and approval details can vary by stock batch.`],
    ['Does Nothing Pakistan deliver ' + name + ' across Pakistan?', `Nothing Pakistan can support delivery for ${name} to many Pakistani cities, subject to courier coverage and order confirmation.`],
    ['Can I buy ' + name + ' on cash on delivery?', `Cash on delivery for ${name} may be available in supported areas. The team confirms COD eligibility during order processing.`],
    ['How long does delivery take for ' + name + '?', `The product page shows an estimated delivery window for ${name}. Actual timing depends on your city, confirmation time, and courier service.`],
    ['Can I contact WhatsApp for ' + name + '?', `Yes, you can contact Nothing Pakistan on WhatsApp to confirm ${name} price, stock, PTA status, color, and delivery details.`],
    ['What are the key highlights of ' + name + '?', highlight],
    ['Which accessories are available for ' + name + '?', `Compatible accessories for ${name}, such as chargers, protectors, covers, earbuds, and cables, may appear on the same phone page when linked in the catalog.`],
    ['Does ' + name + ' come with warranty or support?', `Warranty and support for ${name} depend on the confirmed stock and order terms. Ask support before purchase for current coverage details.`],
    ['Can I return or exchange ' + name + '?', `If ${name} arrives damaged, incorrect, or defective, contact support quickly so the team can review the return or exchange request.`],
    ['Is ' + name + ' original?', `${name} is listed in the Nothing Pakistan catalog. Confirm packaging, stock, and order details with support before finalizing your purchase.`],
    ['Which cities can receive ' + name + ' delivery?', `${name} may be delivered to cities such as Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, and Peshawar where courier service is available.`],
    ['How do I confirm current stock of ' + name + '?', `Use the WhatsApp contact option or order form to confirm live stock for ${name} before checkout is finalized.`],
    ['Does the ' + name + ' price include delivery?', `The visible price is the phone price. Delivery fees, if any, are confirmed during checkout or WhatsApp order confirmation.`],
    ['Can I compare ' + name + ' with accessories on the same page?', `Yes, the ${name} page is designed to show the phone information and linked accessories together when relationships exist in Supabase.`],
    ['Are colors or variants available for ' + name + '?', `Available colors or variants for ${name} depend on current stock and product images. Confirm the exact option before placing an order.`],
    ['Why does the ' + name + ' price update automatically?', `The ${name} price is read from Supabase instead of local JSON, so changing it in the database updates the website dynamically.`],
    ['Is ' + name + ' suitable for buyers in Pakistan?', `${name} is listed for Pakistani buyers who want local pricing, ordering support, delivery guidance, and compatible accessories in one place.`],
  ]
}

async function fetchExistingFaqCounts() {
  const { data, error } = await supabase.from('faqs').select('id, related_type, related_id')
  if (error) throw error

  const counts = new Map()
  for (const faq of data || []) {
    const key = `${faq.related_type}:${faq.related_id}`
    counts.set(key, (counts.get(key) || 0) + 1)
  }

  return counts
}

async function replaceFaqs(relatedType, relatedId, faqs) {
  const { error: deleteError } = await supabase.from('faqs').delete().eq('related_type', relatedType).eq('related_id', relatedId)
  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('faqs').insert(
    faqs.map(([question, answer]) => ({
      related_type: relatedType,
      related_id: relatedId,
      question,
      answer,
    })),
  )

  if (insertError) throw insertError
}

async function main() {
  const [{ data: products, error: productError }, { data: mobiles, error: mobileError }, existingCounts] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, slug, product_type, price, description, short_description, meta_description')
      .order('id', { ascending: true }),
    supabase
      .from('mobiles')
      .select('id, name, slug, Price, description, meta_description')
      .order('id', { ascending: true }),
    fetchExistingFaqCounts(),
  ])

  if (productError) throw productError
  if (mobileError) throw mobileError

  const report = {
    productsInserted: 0,
    mobilesInserted: 0,
    skippedProducts: 0,
    alreadyComplete: 0,
    rowsInserted: 0,
  }

  for (const mobile of mobiles || []) {
    const key = `mobile:${mobile.id}`
    if (!forceUpdate && (existingCounts.get(key) || 0) >= 20) {
      report.alreadyComplete += 1
      continue
    }

    const faqs = buildMobileFaqs(mobile)
    await replaceFaqs('mobile', mobile.id, faqs)
    report.mobilesInserted += 1
    report.rowsInserted += faqs.length
  }

  for (const product of products || []) {
    if (isSkippedProduct(product)) {
      report.skippedProducts += 1
      continue
    }

    const key = `product:${product.id}`
    if (!forceUpdate && (existingCounts.get(key) || 0) >= 20) {
      report.alreadyComplete += 1
      continue
    }

    const faqs = buildProductFaqs(product)
    await replaceFaqs('product', product.id, faqs)
    report.productsInserted += 1
    report.rowsInserted += faqs.length
  }

  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
