import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nothingofficial.pk'
const CATEGORY_SLUGS = ['accessories', 'phone-cases', 'featured-covers']

const COVER_PRODUCTS = [
  {
    name: 'Phone (1) Cover',
    slug: 'phone-1-cover',
    mobileSlug: 'phone-1',
    imagePath: 'assets/case/phone-1-case.webp',
    backgroundPath: 'assets/case/phone-1-background.avif',
  },
  {
    name: 'Phone (2) Cover',
    slug: 'phone-2-cover',
    mobileSlug: 'phone-2',
    imagePath: 'assets/case/phone-2-case.webp',
    backgroundPath: 'assets/case/phone-2-background.avif',
  },
  {
    name: 'Phone (3a) Cover',
    slug: 'phone-3a-cover',
    mobileSlug: 'phone-3a',
    imagePath: 'assets/case/Phone-3a-case.webp',
    backgroundPath: 'assets/case/phone-3a-background.avif',
  },
  {
    name: 'Phone (3a) Pro Cover',
    slug: 'phone-3a-pro-cover',
    mobileSlug: 'phone-3a-pro',
    imagePath: 'assets/case/Phone-3a-Pro-case.webp',
    backgroundPath: 'assets/case/phone-3a-pro-background.avif',
  },
]

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

function absolutePath(localPath) {
  return path.isAbsolute(localPath) ? localPath : path.join(ROOT, localPath)
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

function formatPrice(price) {
  return `Rs ${Number(price).toLocaleString('en-PK')}`
}

function buildKeywords(productName, mobileName) {
  return [
    productName,
    `${productName} price in Pakistan`,
    `${productName} Pakistan`,
    `buy ${productName} in Pakistan`,
    `${productName} Nothing Official Store Pakistan`,
    `${productName} original Pakistan`,
    `${productName} online Pakistan`,
    `${mobileName} cover Pakistan`,
    `${mobileName} case Pakistan`,
    `${mobileName} accessories Pakistan`,
    'Nothing phone cover Pakistan',
    'Nothing phone case Pakistan',
    'Nothing accessories Pakistan',
    'Nothing Official Store Pakistan accessories',
    'original Nothing cover Pakistan',
    'phone cover with COD Pakistan',
  ].join(', ')
}

function buildDescription(productName, mobileName, priceLabel) {
  return `${productName} is a model-matched phone cover for ${mobileName}, made for everyday grip, back protection, and a clean fit without hiding the Nothing design language. Price: ${priceLabel}.\n\nThis cover is linked with ${mobileName} so Nothing Official Store Pakistan buyers can find the right accessory from the matching phone page and confirm stock, delivery, and order details before checkout.`
}

function buildSeoLong(productName, mobileName, priceLabel) {
  return `${productName} is listed on Nothing Official Store Pakistan for buyers who want a clean, compatible phone cover for ${mobileName}. It is positioned for customers in Pakistan who care about model-specific fit, daily back protection, clear local pricing, and a simple order route. The current listed price is ${priceLabel}, while live availability can still be confirmed through WhatsApp before payment or dispatch.\n\nThis page is optimized for high-intent searches such as ${productName} price in Pakistan, ${mobileName} cover Pakistan, Nothing phone case Pakistan, and buy original Nothing cover online. The content focuses on compatibility, practical use, delivery support, and local ordering confidence instead of generic accessory copy.\n\nFor buyers comparing cases, the important details are fit, camera cutout alignment, button access, grip, and whether the cover pairs cleanly with a screen protector. This product page connects the cover with ${mobileName} through the catalog so customers can move between the phone and the matching accessory without guessing.\n\nNothing Official Store Pakistan supports customers with product images, visible pricing, FAQs, checkout, and WhatsApp confirmation. This helps shoppers in Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, and other cities confirm the right cover before ordering.\n\nOverall, ${productName} should feel like a practical accessory page for ${mobileName} owners who want original-style presentation, clear compatibility, local support, and a smooth buying experience from Nothing Official Store Pakistan.`
}

function buildProductSchema({ productName, slug, mobileName, mobileSlug, price, imageUrl }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    sku: slug,
    brand: {
      '@type': 'Brand',
      name: 'Nothing',
    },
    category: 'Phone Cover',
    description: `Buy ${productName} in Pakistan for ${mobileName} with model-specific fit, local pricing, delivery support, and WhatsApp stock confirmation.`,
    image: [imageUrl],
    url: `${SITE_URL}/products/${slug}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: `${SITE_URL}/products/${slug}`,
    },
    isRelatedTo: {
      '@type': 'Product',
      name: mobileName,
      url: `${SITE_URL}/products/${mobileSlug}`,
    },
  }
}

function buildFaqs(productName, mobileName, priceLabel) {
  return [
    {
      question: `What is the price of ${productName} in Pakistan?`,
      answer: `The listed price of ${productName} in Pakistan is ${priceLabel}. You can confirm current stock and final delivery details on WhatsApp before ordering.`,
    },
    {
      question: `Which phone is ${productName} made for?`,
      answer: `${productName} is made for ${mobileName}. The product is linked with the matching phone page so buyers can avoid confusion around compatibility.`,
    },
    {
      question: `Is ${productName} available from Nothing Official Store Pakistan?`,
      answer: `Yes, ${productName} is listed on Nothing Official Store Pakistan with local product information, pricing, and order support for Pakistan customers.`,
    },
    {
      question: `Does ${productName} protect the back of ${mobileName}?`,
      answer: `Yes, ${productName} is intended for everyday back protection, improved grip, and cleaner handling while keeping the phone usable for daily carry.`,
    },
    {
      question: `Will ${productName} fit the buttons and camera area properly?`,
      answer: `${productName} is cataloged for ${mobileName}, so the fit is presented around the correct model, including practical access to buttons and the camera area.`,
    },
    {
      question: `Can I use a screen protector with ${productName}?`,
      answer: `Most buyers pair a cover with a screen protector for fuller daily protection. You can confirm the best matching protector for ${mobileName} with Nothing Official Store Pakistan support.`,
    },
    {
      question: `Is ${productName} good for daily use?`,
      answer: `Yes, ${productName} is positioned as a daily-use cover for buyers who want grip, scratch protection, and a clean look without making the phone feel overly bulky.`,
    },
    {
      question: `How do I order ${productName}?`,
      answer: `You can order ${productName} through the product page or contact Nothing Official Store Pakistan on WhatsApp to confirm stock, delivery timing, and payment details first.`,
    },
    {
      question: `Does Nothing Official Store Pakistan deliver ${productName} outside Lahore?`,
      answer: `Yes, Nothing Official Store Pakistan supports delivery across Pakistan. Delivery timing and charges can be confirmed during checkout or through WhatsApp support.`,
    },
    {
      question: `Why should I choose the exact ${mobileName} cover instead of a generic case?`,
      answer: `A model-specific cover is safer because it is selected for the exact phone shape, camera position, and button layout. That helps reduce fit issues after purchase.`,
    },
  ]
}

async function fetchLookup(supabase, table, selectColumns, slugs) {
  const { data, error } = await supabase.from(table).select(selectColumns).in('slug', slugs)
  if (error) throw error
  return new Map((data || []).map((row) => [row.slug, row]))
}

async function replaceCategoryRelations(supabase, productId, categoryIds) {
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

async function replaceMobileLink(supabase, productId, mobileId) {
  const { error: deleteError } = await supabase.from('product_mobiles').delete().eq('product_id', productId)
  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('product_mobiles').insert({
    product_id: productId,
    mobile_id: mobileId,
  })
  if (insertError) throw insertError
}

async function replaceImages(supabase, productId, rows) {
  const { error: deleteError } = await supabase
    .from('images')
    .delete()
    .in('related_type', ['product', 'detail_product'])
    .eq('related_id', productId)
  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('images').insert(rows)
  if (insertError) throw insertError
}

async function replaceFaqs(supabase, productId, faqs) {
  const { error: deleteError } = await supabase.from('faqs').delete().eq('related_type', 'product').eq('related_id', productId)
  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('faqs').insert(
    faqs.map((faq) => ({
      related_type: 'product',
      related_id: productId,
      question: faq.question,
      answer: faq.answer,
      updated_at: new Date().toISOString(),
    })),
  )
  if (insertError) throw insertError
}

async function main() {
  loadEnv()

  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  const bunnyZone = requireEnv('BUNNY_STORAGE_ZONE_NAME')
  const bunnyAccessKey = requireEnv('BUNNY_ACCESS_KEY')
  const bunnyCdnHostname = requireEnv('BUNNY_CDN_HOSTNAME')
  const bunnyStorageBaseUrl = getBunnyStorageBaseUrl(process.env.BUNNY_STORAGE_REGION || 'de')

  for (const item of COVER_PRODUCTS) {
    for (const localPath of [item.imagePath, item.backgroundPath]) {
      const fullPath = absolutePath(localPath)
      if (!existsSync(fullPath)) throw new Error(`Missing asset for ${item.slug}: ${localPath}`)
    }
  }

  const categoryBySlug = await fetchLookup(supabase, 'categories', 'id,slug', CATEGORY_SLUGS)
  const productBySlug = await fetchLookup(supabase, 'products', 'id,name,slug,price,stock_quantity', COVER_PRODUCTS.map((item) => item.slug))
  const mobileBySlug = await fetchLookup(supabase, 'mobiles', 'id,name,slug', COVER_PRODUCTS.map((item) => item.mobileSlug))
  const categoryIds = CATEGORY_SLUGS.map((slug) => categoryBySlug.get(slug)?.id).filter(Boolean)

  if (categoryIds.length !== CATEGORY_SLUGS.length) {
    throw new Error(`Missing one or more categories: ${CATEGORY_SLUGS.join(', ')}`)
  }

  const report = []

  for (const item of COVER_PRODUCTS) {
    const existingProduct = productBySlug.get(item.slug)
    const mobile = mobileBySlug.get(item.mobileSlug)
    if (!mobile) throw new Error(`Missing mobile row: ${item.mobileSlug}`)

    const productImageLocalPath = absolutePath(item.imagePath)
    const backgroundLocalPath = absolutePath(item.backgroundPath)
    const productImageRemotePath = `products/${item.slug}/${item.slug}-01${path.extname(productImageLocalPath).toLowerCase()}`
    const backgroundRemotePath = `products/${item.slug}/${item.slug}-background${path.extname(backgroundLocalPath).toLowerCase()}`
    const productImageUrl = await uploadFileToBunny({
      localPath: productImageLocalPath,
      remotePath: productImageRemotePath,
      bunnyZone,
      bunnyAccessKey,
      bunnyStorageBaseUrl,
      bunnyCdnHostname,
    })
    const backgroundUrl = await uploadFileToBunny({
      localPath: backgroundLocalPath,
      remotePath: backgroundRemotePath,
      bunnyZone,
      bunnyAccessKey,
      bunnyStorageBaseUrl,
      bunnyCdnHostname,
    })
    const price = Number(existingProduct?.price ?? 1499)
    const priceLabel = formatPrice(price)
    const description = buildDescription(item.name, mobile.name, priceLabel)
    const shortDescription = `${item.name} for ${mobile.name} with clean fit, grip, and everyday back protection. Price: ${priceLabel}.`
    const productPayload = {
      name: item.name,
      slug: item.slug,
      description,
      short_description: shortDescription,
      meta_title: `${item.name} Price in Pakistan | Nothing Official Store Pakistan`,
      meta_description: `Buy ${item.name} in Pakistan for ${mobile.name}. Original-style phone cover with clean fit, local price ${priceLabel}, delivery, and WhatsApp support.`,
      seo_keywords: buildKeywords(item.name, mobile.name),
      canonical_url: `${SITE_URL}/products/${item.slug}`,
      schema_json: buildProductSchema({
        productName: item.name,
        slug: item.slug,
        mobileName: mobile.name,
        mobileSlug: mobile.slug,
        price,
        imageUrl: productImageUrl,
      }),
      seo_description_long: buildSeoLong(item.name, mobile.name, priceLabel),
      image_alt_text: `${item.name} original phone cover for ${mobile.name} in Pakistan from Nothing Official Store Pakistan`,
      price,
      stock_quantity: Number(existingProduct?.stock_quantity ?? 10),
      product_type: 'covers',
      updated_at: new Date().toISOString(),
    }

    let productId = existingProduct?.id
    if (productId) {
      const { error } = await supabase.from('products').update(productPayload).eq('id', productId)
      if (error) throw error
    } else {
      const { data, error } = await supabase.from('products').insert(productPayload).select('id').single()
      if (error) throw error
      productId = data.id
    }

    await replaceCategoryRelations(supabase, productId, categoryIds)
    await replaceMobileLink(supabase, productId, mobile.id)
    await replaceImages(supabase, productId, [
      {
        related_type: 'product',
        related_id: productId,
        color_id: null,
        url: productImageUrl,
        alt_text: `${item.name} original phone cover for ${mobile.name} in Pakistan`,
        title: item.name,
        caption: `${item.name} product image for ${mobile.name}`,
        file_name: path.basename(productImageRemotePath),
        slug: `${item.slug}-image-1`,
        sort_order: 0,
        updated_at: new Date().toISOString(),
      },
      {
        related_type: 'detail_product',
        related_id: productId,
        color_id: null,
        url: backgroundUrl,
        alt_text: `${item.name} product background image`,
        title: `${item.name} product background`,
        caption: 'Product background',
        file_name: path.basename(backgroundRemotePath),
        slug: `${item.slug}-product-background`,
        sort_order: 0,
        updated_at: new Date().toISOString(),
      },
    ])
    await replaceFaqs(supabase, productId, buildFaqs(item.name, mobile.name, priceLabel))

    report.push({
      productId,
      slug: item.slug,
      mobile: mobile.slug,
      price: priceLabel,
      imageUrl: productImageUrl,
      backgroundUrl,
    })
    console.log(`Updated ${item.name} -> ${mobile.name}`)
  }

  console.log(JSON.stringify({ updated: report }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
