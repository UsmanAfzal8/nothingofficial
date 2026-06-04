import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SITE_URL = 'https://www.nothingofficial.pk'

function loadEnv() {
  for (const envPath of ['.env.local', 'env']) {
    const fullPath = path.join(ROOT, envPath)
    if (!existsSync(fullPath)) continue

    for (const line of readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue

      const separatorIndex = trimmed.indexOf('=')
      const key = trimmed.slice(0, separatorIndex)
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '')
      process.env[key] ||= value
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env value: ${name}`)
  return value
}

function getMimeType(localPath) {
  try {
    return execFileSync('file', ['--brief', '--mime-type', localPath], { encoding: 'utf8' }).trim()
  } catch {
    const ext = path.extname(localPath).toLowerCase()
    if (ext === '.avif') return 'image/avif'
    if (ext === '.webp') return 'image/webp'
    if (ext === '.png') return 'image/png'
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
    return 'application/octet-stream'
  }
}

function slugify(value) {
  return value
    .toString()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
}

function getBunnyStorageBaseUrl(region) {
  return region.toLowerCase() === 'de' ? 'https://storage.bunnycdn.com' : `https://${region}.storage.bunnycdn.com`
}

async function uploadFileToBunny({ localPath, remotePath, bunnyZone, bunnyAccessKey, bunnyStorageBaseUrl, bunnyCdnHostname }) {
  const response = await fetch(`${bunnyStorageBaseUrl}/${bunnyZone}/${remotePath}`, {
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

function buildProductSchema({ name, slug, description, price, imageUrls, category, brandName, additionalProperty }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
    sku: slug,
    category,
    description,
    image: imageUrls,
    url: `${SITE_URL}/products/${slug}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: `${SITE_URL}/products/${slug}`,
    },
    additionalProperty,
  }
}

const PRODUCT_RECORDS = [
  {
    name: 'CMF Watch Pro 2',
    slug: 'cmf-watch-pro-2',
    price: 14500,
    productType: null,
    primaryColorName: 'Ash Grey',
    colorHexByName: {
      'Ash Grey': '#B6B7B2',
      Blue: '#1E6FFF',
      'Dark Grey': '#4B4B4B',
      Orange: '#F97316',
    },
    gallery: [
      {
        colorName: 'Ash Grey',
        localPath: 'assets/nothing products/watchpro2/CMF-Watch-Pro-2-Ash-Grey.webp',
      },
      {
        colorName: 'Blue',
        localPath: 'assets/nothing products/watchpro2/CMF-Watch-Pro-2-Blue.webp',
      },
      {
        colorName: 'Dark Grey',
        localPath: 'assets/nothing products/watchpro2/CMF-Watch-Pro-2-dark-grey.webp',
      },
      {
        colorName: 'Orange',
        localPath: 'assets/nothing products/watchpro2/CMF-Watch-Pro-2-Orange.webp',
      },
    ],
    background: {
      localPath: 'assets/nothing products/watchpro2/cmf-watch-pro-2-background.avif',
      fileName: 'cmf-watch-pro-2-background.avif',
    },
    metaTitle: 'CMF Watch Pro 2 Price in Pakistan | Nothing Official Store Pakistan',
    metaDescription:
      'Buy CMF Watch Pro 2 in Pakistan for Rs 14,500 with AMOLED display, health tracking, Bluetooth calling, long battery life, and local Nothing Official Store Pakistan support.',
    shortDescription:
      'CMF Watch Pro 2 is a smart wearable for Pakistan buyers who want AMOLED clarity, fitness tracking, and Bluetooth calling in the CMF ecosystem.',
    description:
      'CMF Watch Pro 2 is a CMF by Nothing smartwatch for Pakistan buyers who want a premium-looking wearable with AMOLED display quality, fitness and health tracking, Bluetooth calling, and practical battery life. Nothing Official Store Pakistan lists CMF Watch Pro 2 with local pricing, product images, ordering support, and WhatsApp confirmation before checkout.',
    seoDescriptionLong: [
      'CMF Watch Pro 2 is positioned for Pakistani buyers who want a smartwatch with a cleaner CMF design, visible local pricing, and a direct route to ordering from Nothing Official Store Pakistan. The page is built for high-intent searches such as CMF Watch Pro 2 price in Pakistan, CMF Watch Pro 2 smartwatch Pakistan, original CMF Watch Pro 2, and buy CMF Watch Pro 2 online in Pakistan.',
      'The product is relevant to shoppers comparing smartwatch display quality, battery life, health tracking, workout support, Bluetooth calling, and CMF ecosystem value. The page should answer those commercial questions clearly while keeping the product experience simple and easy to trust.',
      'For local SEO, the page is written for shoppers across Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, and other Pakistani cities where customers want original product sourcing, live price confirmation, and support before placing an order.',
      'Internal linking should connect CMF Watch Pro 2 with CMF collections, the watches collection, and compatible CMF phones so users can move from wearables into the broader ecosystem. That structure also helps search engines understand the product as part of the CMF lineup on Nothing Official Store Pakistan.',
    ].join('\n\n'),
    imageAltText: 'CMF Watch Pro 2 original smartwatch in Pakistan from Nothing Official Store Pakistan',
    seoKeywords: [
      'CMF Watch Pro 2',
      'CMF Watch Pro 2 price in Pakistan',
      'CMF Watch Pro 2 Pakistan',
      'CMF Watch Pro 2 smartwatch Pakistan',
      'buy CMF Watch Pro 2 online Pakistan',
      'original CMF Watch Pro 2 Pakistan',
      'CMF watch price in Pakistan',
      'CMF smartwatch Pakistan',
      'Nothing Official Store Pakistan watch',
      'CMF by Nothing smartwatch',
      'smart watch Pakistan',
      'Bluetooth calling watch Pakistan',
      'AMOLED smart watch Pakistan',
      'fitness watch Pakistan',
      'health tracking watch Pakistan',
    ].join(', '),
    categorySlugs: ['cmf', 'watches'],
    mobileSlugs: ['cmf-phone-1', 'cmf-phone-2-pro'],
    faqs: [
      ['What is the price of CMF Watch Pro 2 in Pakistan?', 'CMF Watch Pro 2 price in Pakistan is Rs 14,500 on Nothing Official Store Pakistan. Final stock and delivery confirmation can be checked before ordering.'],
      ['Is CMF Watch Pro 2 an original CMF by Nothing smartwatch?', 'Yes, CMF Watch Pro 2 is listed as a CMF by Nothing wearable on Nothing Official Store Pakistan with local product support and ordering help.'],
      ['Where can I buy CMF Watch Pro 2 online in Pakistan?', 'You can buy CMF Watch Pro 2 online from Nothing Official Store Pakistan through the product page, the order flow, or WhatsApp support for quick confirmation.'],
      ['Does CMF Watch Pro 2 support Bluetooth calling?', 'Yes, CMF Watch Pro 2 is positioned as a smartwatch for buyers who want modern wearable convenience including calling support and connected daily use.'],
      ['Is CMF Watch Pro 2 good for fitness and health tracking?', 'Yes, CMF Watch Pro 2 is suited to buyers who want workout support, daily health tracking, and a clean smartwatch interface in one wearable.'],
      ['Does Nothing Official Store Pakistan deliver CMF Watch Pro 2 across Pakistan?', 'Yes, Nothing Official Store Pakistan supports delivery queries for CMF Watch Pro 2 across major cities in Pakistan, subject to courier coverage and stock confirmation.'],
      ['Can I confirm CMF Watch Pro 2 stock on WhatsApp before ordering?', 'Yes, WhatsApp is one of the fastest ways to confirm live stock, latest price, and order details for CMF Watch Pro 2.'],
      ['What colors are available for CMF Watch Pro 2?', 'CMF Watch Pro 2 is being added with Ash Grey, Blue, Dark Grey, and Orange color options on Nothing Official Store Pakistan.'],
      ['Why is CMF Watch Pro 2 listed in the watches and CMF collections?', 'CMF Watch Pro 2 is part of the CMF wearable lineup, so it belongs in the dedicated watches collection and the broader CMF collection for easier browsing.'],
      ['Can CMF Watch Pro 2 be explored with CMF phones on Nothing Official Store Pakistan?', 'Yes, Nothing Official Store Pakistan can link CMF Watch Pro 2 with CMF phone pages so shoppers can browse the ecosystem more easily.'],
    ],
    schemaCategory: 'Smart Watch',
    schemaAdditionalProperty: [
      { '@type': 'PropertyValue', name: 'Category', value: 'Smartwatch' },
      { '@type': 'PropertyValue', name: 'Display', value: 'AMOLED display' },
      { '@type': 'PropertyValue', name: 'Calling', value: 'Bluetooth calling support' },
      { '@type': 'PropertyValue', name: 'Tracking', value: 'Fitness and health tracking' },
      { '@type': 'PropertyValue', name: 'Market', value: 'Pakistan' },
    ],
  },
  {
    name: 'CMF Neckband Pro',
    slug: 'cmf-neckband-pro',
    price: 8999,
    productType: 'earbuds',
    primaryColorName: 'Black',
    colorHexByName: {
      Black: '#000000',
      'Light Grey': '#D3D3D3',
      Orange: '#F97316',
    },
    gallery: [
      {
        colorName: 'Black',
        localPath: 'assets/nothing products/nechbandpro/Nothing-CMF-Neckband-Pro-Black.webp',
      },
      {
        colorName: 'Light Grey',
        localPath: 'assets/nothing products/nechbandpro/Nothing-CMF-Neckband-Pro-Light-Grey.webp',
      },
      {
        colorName: 'Orange',
        localPath: 'assets/nothing products/nechbandpro/Nothing-CMF-Neckband-Pro-with-Noise-Cancellation.webp',
      },
    ],
    background: {
      localPath: 'assets/nothing products/nechbandpro/cmf_neckban_pro_background.webp',
      fileName: 'cmf-neckband-pro-background.webp',
    },
    metaTitle: 'CMF Neckband Pro Price in Pakistan | Nothing Official Store Pakistan',
    metaDescription:
      'Buy CMF Neckband Pro in Pakistan for Rs 8,999 with wireless neckband comfort, strong daily audio performance, ANC-focused listening, and local Nothing Official Store Pakistan support.',
    shortDescription:
      'CMF Neckband Pro is a wireless neckband for Pakistan buyers who want comfortable all-day audio, noise-focused listening, and practical battery life at a sharp price.',
    description:
      'CMF Neckband Pro is a CMF by Nothing wireless neckband for Pakistan buyers who want dependable daily audio, comfortable around-the-neck wear, and a cleaner alternative to true wireless earbuds. Nothing Official Store Pakistan lists CMF Neckband Pro with local pricing, real product images, ordering support, and WhatsApp confirmation before checkout.',
    seoDescriptionLong: [
      'CMF Neckband Pro is built for Pakistani shoppers who want original CMF audio at an accessible price with local support through Nothing Official Store Pakistan. The page is optimized for searches such as CMF Neckband Pro price in Pakistan, original CMF neckband Pakistan, buy CMF Neckband Pro online, and CMF audio products Pakistan.',
      'The product is especially relevant for users comparing wireless neckband comfort, daily music use, ANC-oriented listening, call convenience, and battery life without moving into higher-priced audio categories. That makes it a strong fit for practical audio shoppers and students in Pakistan.',
      'For local search intent, the listing is positioned for buyers in Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, and other cities who want clear price visibility, original product sourcing, and easy order confirmation before purchase.',
      'Internal linking should connect CMF Neckband Pro to the audio collection, the CMF collection, and compatible CMF phone pages so users can discover it naturally from both audio and ecosystem routes on Nothing Official Store Pakistan.',
    ].join('\n\n'),
    imageAltText: 'CMF Neckband Pro original wireless neckband in Pakistan from Nothing Official Store Pakistan',
    seoKeywords: [
      'CMF Neckband Pro',
      'CMF Neckband Pro price in Pakistan',
      'CMF Neckband Pro Pakistan',
      'buy CMF Neckband Pro online Pakistan',
      'original CMF Neckband Pro Pakistan',
      'CMF neckband Pakistan',
      'CMF audio Pakistan',
      'Nothing Official Store Pakistan neckband',
      'wireless neckband Pakistan',
      'Bluetooth neckband Pakistan',
      'neckband with ANC Pakistan',
      'CMF by Nothing audio',
      'daily use neckband Pakistan',
      'budget audio Pakistan',
      'neckband price in Pakistan',
    ].join(', '),
    categorySlugs: ['cmf', 'audio'],
    mobileSlugs: ['cmf-phone-1', 'cmf-phone-2-pro'],
    faqs: [
      ['What is the price of CMF Neckband Pro in Pakistan?', 'CMF Neckband Pro price in Pakistan is Rs 8,999 on Nothing Official Store Pakistan. Final stock, city coverage, and delivery details can be confirmed before ordering.'],
      ['Is CMF Neckband Pro an original CMF by Nothing product?', 'Yes, CMF Neckband Pro is listed as a CMF by Nothing audio product on Nothing Official Store Pakistan with local support routes and ordering help.'],
      ['Where can I buy CMF Neckband Pro online in Pakistan?', 'You can buy CMF Neckband Pro online from Nothing Official Store Pakistan through the product page, order flow, or WhatsApp support for fast confirmation.'],
      ['Who should consider CMF Neckband Pro?', 'CMF Neckband Pro is a good fit for buyers who prefer wireless neckband comfort, practical daily audio, and value-focused CMF design in Pakistan.'],
      ['Does CMF Neckband Pro belong in the audio collection?', 'Yes, CMF Neckband Pro is an audio product, so it is being added to the audio collection as well as the broader CMF collection on Nothing Official Store Pakistan.'],
      ['Can I confirm CMF Neckband Pro stock on WhatsApp?', 'Yes, WhatsApp is one of the easiest ways to confirm live stock, latest price, and order details for CMF Neckband Pro.'],
      ['Does Nothing Official Store Pakistan deliver CMF Neckband Pro across Pakistan?', 'Yes, Nothing Official Store Pakistan supports delivery queries for CMF Neckband Pro across major Pakistani cities, subject to stock and courier availability.'],
      ['What colors are available for CMF Neckband Pro?', 'CMF Neckband Pro is being added with Black, Light Grey, and Orange color options on Nothing Official Store Pakistan.'],
      ['Why is CMF Neckband Pro linked with CMF phones?', 'CMF Neckband Pro is part of the CMF ecosystem, so linking it with CMF phones helps shoppers discover compatible audio products more easily.'],
      ['Is CMF Neckband Pro suitable for everyday use?', 'Yes, CMF Neckband Pro is positioned as a practical everyday audio option for music, calls, commuting, and general wireless listening.'],
    ],
    schemaCategory: 'Wireless Neckband',
    schemaAdditionalProperty: [
      { '@type': 'PropertyValue', name: 'Category', value: 'Wireless neckband audio' },
      { '@type': 'PropertyValue', name: 'Fit', value: 'Neckband design' },
      { '@type': 'PropertyValue', name: 'Use case', value: 'Daily audio and calls' },
      { '@type': 'PropertyValue', name: 'Collection', value: 'Audio' },
      { '@type': 'PropertyValue', name: 'Market', value: 'Pakistan' },
    ],
  },
]

loadEnv()

const supabaseUrl = requireEnv('SUPABASE_URL')
const supabaseKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
const bunnyZone = requireEnv('BUNNY_STORAGE_ZONE_NAME')
const bunnyAccessKey = requireEnv('BUNNY_ACCESS_KEY')
const bunnyCdnHostname = requireEnv('BUNNY_CDN_HOSTNAME')
const bunnyStorageBaseUrl = getBunnyStorageBaseUrl(process.env.BUNNY_STORAGE_REGION || 'de')

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function fetchLookup(table, selectColumns, keyField = 'slug') {
  const { data, error } = await supabase.from(table).select(selectColumns)
  if (error) throw error
  return new Map((data || []).map((row) => [row[keyField], row]))
}

async function getOrCreateColor(name, hexCode) {
  const { data: existingRows, error: findError } = await supabase
    .from('colors')
    .select('id,name')
    .eq('name', name)
    .order('id', { ascending: true })
    .limit(1)
  if (findError) throw findError

  const existing = existingRows?.[0]
  if (existing?.id) return existing.id

  const { data, error } = await supabase
    .from('colors')
    .insert({
      name,
      hex_code: hexCode,
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

async function replaceImages(relatedType, relatedId, rows) {
  const { error: deleteError } = await supabase.from('images').delete().eq('related_type', relatedType).eq('related_id', relatedId)
  if (deleteError) throw deleteError

  if (rows.length === 0) return

  const { error: insertError } = await supabase.from('images').insert(rows)
  if (insertError) throw insertError
}

async function replaceFaqs(productId, faqs) {
  const { error: deleteError } = await supabase.from('faqs').delete().eq('related_type', 'product').eq('related_id', productId)
  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('faqs').insert(
    faqs.map(([question, answer]) => ({
      related_type: 'product',
      related_id: productId,
      question,
      answer,
      updated_at: new Date().toISOString(),
    })),
  )
  if (insertError) throw insertError
}

async function replaceCategoryRelations(productId, categoryIds) {
  const { error: deleteError } = await supabase
    .from('category_relations')
    .delete()
    .eq('related_type', 'product')
    .eq('related_id', productId)
  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('category_relations').insert(
    categoryIds.map((categoryId) => ({
      category_id: categoryId,
      related_type: 'product',
      related_id: productId,
      updated_at: new Date().toISOString(),
    })),
  )
  if (insertError) throw insertError
}

async function replaceMobileLinks(productId, mobileIds) {
  const { error: deleteError } = await supabase.from('product_mobiles').delete().eq('product_id', productId)
  if (deleteError) throw deleteError

  if (mobileIds.length === 0) return

  const { error: insertError } = await supabase.from('product_mobiles').insert(
    mobileIds.map((mobileId) => ({
      product_id: productId,
      mobile_id: mobileId,
    })),
  )
  if (insertError) throw insertError
}

async function main() {
  const categoryBySlug = await fetchLookup('categories', 'id,slug')
  const mobileBySlug = await fetchLookup('mobiles', 'id,slug')
  const productBySlug = await fetchLookup('products', 'id,slug')

  const summary = []

  for (const record of PRODUCT_RECORDS) {
    for (const image of record.gallery) {
      if (!existsSync(path.join(ROOT, image.localPath))) {
        throw new Error(`Missing gallery image: ${image.localPath}`)
      }
    }

    if (!existsSync(path.join(ROOT, record.background.localPath))) {
      throw new Error(`Missing background image: ${record.background.localPath}`)
    }

    const colorIdByName = new Map()
    for (const [name, hex] of Object.entries(record.colorHexByName)) {
      colorIdByName.set(name, await getOrCreateColor(name, hex))
    }

    const mainColorId = colorIdByName.get(record.primaryColorName) || null
    const canonicalUrl = `${SITE_URL}/products/${record.slug}`

    const productPayload = {
      name: record.name,
      slug: record.slug,
      description: record.description,
      short_description: record.shortDescription,
      meta_title: record.metaTitle,
      meta_description: record.metaDescription,
      seo_keywords: record.seoKeywords,
      canonical_url: canonicalUrl,
      seo_description_long: record.seoDescriptionLong,
      image_alt_text: record.imageAltText,
      price: record.price,
      stock_quantity: 10,
      main_color_id: mainColorId,
      product_type: record.productType,
      updated_at: new Date().toISOString(),
    }

    const existing = productBySlug.get(record.slug)
    let productId = existing?.id || null

    if (existing?.id) {
      const { error } = await supabase.from('products').update(productPayload).eq('id', existing.id)
      if (error) throw error
      productId = existing.id
    } else {
      const { data, error } = await supabase.from('products').insert(productPayload).select('id').single()
      if (error) throw error
      productId = data.id
    }

    const uploadedGalleryRows = []
    const uploadedGalleryUrls = []
    for (let index = 0; index < record.gallery.length; index += 1) {
      const item = record.gallery[index]
      const localPath = path.join(ROOT, item.localPath)
      const fileName = `${record.slug}-${slugify(item.colorName)}${path.extname(localPath).toLowerCase()}`
      const remotePath = `products/${record.slug}/${fileName}`
      const publicUrl = await uploadFileToBunny({
        localPath,
        remotePath,
        bunnyZone,
        bunnyAccessKey,
        bunnyStorageBaseUrl,
        bunnyCdnHostname,
      })
      const colorId = colorIdByName.get(item.colorName) || null

      uploadedGalleryUrls.push(publicUrl)
      uploadedGalleryRows.push({
        related_type: 'product',
        related_id: productId,
        color_id: colorId,
        url: publicUrl,
        alt_text: `${record.name} ${item.colorName} original product in Pakistan from Nothing Official Store Pakistan`,
        title: `${record.name} ${item.colorName}`,
        caption: `${record.name} ${item.colorName} available on Nothing Official Store Pakistan.`,
        file_name: fileName,
        slug: `${record.slug}-${slugify(item.colorName)}`,
        sort_order: index,
        updated_at: new Date().toISOString(),
      })
    }

    await replaceImages('product', productId, uploadedGalleryRows)

    const backgroundLocalPath = path.join(ROOT, record.background.localPath)
    const backgroundRemotePath = `products/${record.slug}/${record.background.fileName}`
    const backgroundUrl = await uploadFileToBunny({
      localPath: backgroundLocalPath,
      remotePath: backgroundRemotePath,
      bunnyZone,
      bunnyAccessKey,
      bunnyStorageBaseUrl,
      bunnyCdnHostname,
    })

    await replaceImages('detail_product', productId, [
      {
        related_type: 'detail_product',
        related_id: productId,
        color_id: null,
        url: backgroundUrl,
        alt_text: `${record.name} product background image`,
        title: `${record.name} background`,
        caption: 'Product background',
        file_name: record.background.fileName,
        slug: `${record.slug}-background`,
        sort_order: 0,
        updated_at: new Date().toISOString(),
      },
    ])

    const schemaJson = buildProductSchema({
      name: record.name,
      slug: record.slug,
      description: record.metaDescription,
      price: record.price,
      imageUrls: uploadedGalleryUrls,
      category: record.schemaCategory,
      brandName: 'CMF by Nothing',
      additionalProperty: record.schemaAdditionalProperty,
    })

    const { error: schemaError } = await supabase
      .from('products')
      .update({ schema_json: schemaJson, updated_at: new Date().toISOString() })
      .eq('id', productId)
    if (schemaError) throw schemaError

    await replaceFaqs(productId, record.faqs)

    const categoryIds = record.categorySlugs.map((slug) => categoryBySlug.get(slug)?.id).filter((value) => typeof value === 'number')
    await replaceCategoryRelations(productId, categoryIds)

    const mobileIds = record.mobileSlugs.map((slug) => mobileBySlug.get(slug)?.id).filter((value) => typeof value === 'number')
    await replaceMobileLinks(productId, mobileIds)

    summary.push({
      name: record.name,
      slug: record.slug,
      productId,
      galleryImages: uploadedGalleryRows.length,
      faqs: record.faqs.length,
      categories: record.categorySlugs,
      mobiles: record.mobileSlugs,
    })
  }

  console.log(JSON.stringify({ insertedOrUpdated: summary }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
