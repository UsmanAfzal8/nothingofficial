import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SITE_URL = 'https://www.nothingshop.pk'
const PRODUCT_SLUG = 'cmf-buds-pro'
const PRODUCT_NAME = 'CMF Buds Pro'

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
    // Env files are optional when credentials are provided by the shell.
  }
}

loadEnvFile(resolve(process.cwd(), '.env.local'))
loadEnvFile(resolve(process.cwd(), 'env'))

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const canonicalUrl = `${SITE_URL}/products/${PRODUCT_SLUG}`
const imageAltText = `${PRODUCT_NAME} original wireless earbuds in Pakistan with 45 dB ANC`

const seoKeywords = [
  'CMF Buds Pro',
  'CMF Buds Pro price in Pakistan',
  'CMF Buds Pro Pakistan',
  'CMF Buds Pro original Pakistan',
  'CMF Buds Pro buy online Pakistan',
  'CMF Buds Pro Nothing Pakistan',
  'CMF Buds Pro official store Pakistan',
  'CMF Buds Pro COD Pakistan',
  'CMF Buds Pro Karachi',
  'CMF Buds Pro Lahore',
  'CMF Buds Pro Islamabad',
  'CMF Buds Pro Rawalpindi',
  'CMF Buds Pro Faisalabad',
  'CMF Buds Pro Multan',
  'CMF Buds Pro Peshawar',
  'CMF Buds Pro specs Pakistan',
  'CMF Buds Pro ANC earbuds',
  'CMF Buds Pro 45 dB ANC',
  'CMF Buds Pro 39 hours battery',
  'CMF Buds Pro fast charging',
  'CMF Buds Pro Ultra Bass',
  'CMF Buds Pro IP54',
  'CMF Buds Pro Nothing X app',
  'CMF by Nothing earbuds Pakistan',
  'Nothing earbuds price in Pakistan',
  'Nothing buds Pakistan',
  'wireless earbuds Pakistan',
  'ANC earbuds Pakistan',
  'noise cancelling earbuds Pakistan',
  'Bluetooth earbuds Pakistan',
  'original earbuds Pakistan',
  'best earbuds under 15000 Pakistan',
  'earbuds with COD Pakistan',
].join(', ')

const description = [
  'CMF Buds Pro are original CMF by Nothing wireless earbuds for Pakistan, built for deep bass, active noise cancellation, clear calls, and long daily battery life.',
  'They feature up to 45 dB Hybrid Active Noise Cancellation, Ultra Bass sound tuning, 6 HD microphones with Clear Voice Technology, Bluetooth 5.3, fast charging, and up to 39 hours of total playback with the charging case.',
  'Order CMF Buds Pro from Nothing Pakistan for authentic product sourcing, local support, cash on delivery, and delivery across Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, and other cities in Pakistan.',
].join(' ')

const shortDescription = 'Original CMF by Nothing earbuds with 45 dB Hybrid ANC, Ultra Bass, 6 HD mics, fast charging, and up to 39 hours of total playback.'

const seoDescriptionLong = [
  `${PRODUCT_NAME} is positioned for Pakistani buyers who want original CMF by Nothing earbuds with strong noise cancellation, bass-forward sound, reliable calling, and practical battery life at a competitive price. The product targets high-intent searches such as CMF Buds Pro price in Pakistan, buy CMF Buds Pro online, original CMF earbuds Pakistan, ANC earbuds Pakistan, and Nothing earbuds price in Pakistan.`,
  `${PRODUCT_NAME} supports up to 45 dB Hybrid Active Noise Cancellation, making it useful for commuting, office work, study sessions, and daily music listening. The Ultra Bass profile and dynamic driver tuning help the product match commercial searches from buyers who want punchy bass, wireless comfort, and a modern CMF design without moving into a premium price bracket.`,
  `Battery search intent is important for this product. Buds Pro can deliver up to 11 hours of music playback from the earbuds with ANC off and up to 39 hours total with the charging case. With ANC on, playback is listed at up to 6.5 hours from the earbuds and up to 22 hours total with the case. Fast charging support also helps answer common buyer questions before checkout.`,
  `For trust and conversion, this page should make it clear that customers can buy ${PRODUCT_NAME} in Pakistan from Nothing Pakistan with local ordering support, COD availability, visible pricing, and product support. The canonical URL should stay on nothingshop.pk so Google consolidates ranking signals for the official local product page instead of sending authority to another domain.`,
  `The FAQ content covers price, authenticity, ANC, battery life, fast charging, water resistance, calling, wireless charging, device connection, app support, and delivery. This helps Google, AI search systems, and shoppers understand the product quickly while keeping the copy natural and useful instead of keyword stuffed.`,
].join('\n\n')

function buildSchemaJson(price) {
  return {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: PRODUCT_NAME,
  brand: {
    '@type': 'Brand',
    name: 'CMF by Nothing',
  },
  sku: PRODUCT_SLUG,
  category: 'Wireless Earbuds',
  description: 'Original CMF Buds Pro wireless earbuds in Pakistan with 45 dB Hybrid ANC, Ultra Bass, 6 HD microphones, fast charging, and up to 39 hours of total playback.',
  image: [
    'https://res.cloudinary.com/dbdsmy4em/image/upload/v1775702876/nothing-pakistan/products/cmf-buds-pro/cmf-buds-pro-orange.webp',
    'https://res.cloudinary.com/dbdsmy4em/image/upload/v1775702874/nothing-pakistan/products/cmf-buds-pro/cmf-buds-pro-white.webp',
    'https://res.cloudinary.com/dbdsmy4em/image/upload/v1775702872/nothing-pakistan/products/cmf-buds-pro/cmf-buds-pro-black.webp',
  ],
  url: canonicalUrl,
  offers: {
    '@type': 'Offer',
    priceCurrency: 'PKR',
    price,
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
    url: canonicalUrl,
  },
  additionalProperty: [
    { '@type': 'PropertyValue', name: 'Noise cancellation', value: 'Up to 45 dB Hybrid Active Noise Cancellation' },
    { '@type': 'PropertyValue', name: 'Battery life', value: 'Up to 39 hours total playback with charging case' },
    { '@type': 'PropertyValue', name: 'Microphones', value: '6 HD microphones with Clear Voice Technology' },
    { '@type': 'PropertyValue', name: 'Water resistance', value: 'IP54 earbuds, IPX2 charging case' },
    { '@type': 'PropertyValue', name: 'Charging', value: 'USB-C wired charging with fast charging support' },
    { '@type': 'PropertyValue', name: 'Connection', value: 'Single device connection' },
  ],
  }
}

const faqs = [
  {
    question: 'What is the price of CMF Buds Pro in Pakistan?',
    answer: 'The CMF Buds Pro price in Pakistan is Rs 13,000 on Nothing Pakistan. Final stock and delivery availability can be confirmed before ordering.',
  },
  {
    question: 'Are CMF Buds Pro original CMF by Nothing earbuds?',
    answer: 'Yes, CMF Buds Pro are CMF by Nothing wireless earbuds. Nothing Pakistan lists them as an original product with local ordering and support.',
  },
  {
    question: 'Does CMF Buds Pro support active noise cancellation?',
    answer: 'Yes, CMF Buds Pro supports up to 45 dB Hybrid Active Noise Cancellation, which helps reduce background noise during travel, work, study, and daily listening.',
  },
  {
    question: 'How long is the CMF Buds Pro battery life?',
    answer: 'With ANC off, CMF Buds Pro can provide up to 11 hours from the earbuds and up to 39 hours total with the charging case. With ANC on, playback is up to 6.5 hours from the earbuds and up to 22 hours total with the case.',
  },
  {
    question: 'Does CMF Buds Pro support fast charging?',
    answer: 'Yes, CMF Buds Pro supports fast charging. A 10-minute charge can give up to 3 hours of listening time with ANC off, depending on volume, settings, and usage.',
  },
  {
    question: 'Is CMF Buds Pro water resistant?',
    answer: 'The CMF Buds Pro earbuds are rated IP54 for dust and water resistance, while the charging case is rated IPX2 splash resistant. They are suitable for daily use but not for swimming or showering.',
  },
  {
    question: 'Is CMF Buds Pro good for calls?',
    answer: 'Yes, CMF Buds Pro has 6 HD microphones with Clear Voice Technology to improve voice clarity and reduce background noise during calls.',
  },
  {
    question: 'Does CMF Buds Pro support wireless charging?',
    answer: 'No, CMF Buds Pro does not support wireless charging. The charging case uses USB-C wired charging.',
  },
  {
    question: 'Can CMF Buds Pro connect to two devices at the same time?',
    answer: 'No, CMF Buds Pro can connect to one device at a time. For switching devices, disconnect from the current device and pair or connect with the next device.',
  },
  {
    question: 'Where can I buy CMF Buds Pro online in Pakistan?',
    answer: 'You can buy CMF Buds Pro online from Nothing Pakistan with delivery support across major cities including Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, and Peshawar.',
  },
]

async function main() {
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name, slug, price')
    .eq('slug', PRODUCT_SLUG)
    .single()

  if (productError) throw productError
  const currentPrice = typeof product.price === 'number' ? product.price : null

  const productPayload = {
    name: PRODUCT_NAME,
    description,
    short_description: shortDescription,
    meta_title: 'CMF Buds Pro Price in Pakistan | Nothing Pakistan',
    meta_description: 'Buy original CMF Buds Pro in Pakistan for Rs 13,000 with 45 dB ANC, Ultra Bass, 39 hours playback, COD, and local Nothing Pakistan support.',
    seo_keywords: seoKeywords,
    canonical_url: canonicalUrl,
    schema_json: buildSchemaJson(currentPrice),
    seo_description_long: seoDescriptionLong,
    image_alt_text: imageAltText,
    product_type: 'earbuds',
    updated_at: new Date().toISOString(),
  }

  const { error: updateError } = await supabase
    .from('products')
    .update(productPayload)
    .eq('id', product.id)

  if (updateError) throw updateError

  const { data: images, error: imageFetchError } = await supabase
    .from('images')
    .select('id, url')
    .eq('related_type', 'product')
    .eq('related_id', product.id)
    .order('sort_order')

  if (imageFetchError) throw imageFetchError

  for (const image of images || []) {
    const colorMatch = image.url.match(/cmf-buds-pro-([a-z]+)\.webp/i)
    const color = colorMatch ? `${colorMatch[1].charAt(0).toUpperCase()}${colorMatch[1].slice(1)}` : 'Original'
    const colorAlt = `${PRODUCT_NAME} ${color} original wireless earbuds in Pakistan`

    const { error: imageUpdateError } = await supabase
      .from('images')
      .update({
        alt_text: colorAlt,
        title: `${PRODUCT_NAME} ${color}`,
        caption: `${PRODUCT_NAME} ${color} original CMF by Nothing wireless earbuds available in Pakistan.`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', image.id)

    if (imageUpdateError) throw imageUpdateError
  }

  const { error: deleteFaqError } = await supabase
    .from('faqs')
    .delete()
    .eq('related_type', 'product')
    .eq('related_id', product.id)

  if (deleteFaqError) throw deleteFaqError

  const { error: insertFaqError } = await supabase.from('faqs').insert(
    faqs.map((faq) => ({
      related_type: 'product',
      related_id: product.id,
      question: faq.question,
      answer: faq.answer,
    })),
  )

  if (insertFaqError) throw insertFaqError

  console.log(
    JSON.stringify(
      {
        updated_product: {
          id: product.id,
          slug: PRODUCT_SLUG,
          canonical_url: canonicalUrl,
          price: currentPrice,
          faq_count: faqs.length,
          image_count: images?.length || 0,
        },
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
