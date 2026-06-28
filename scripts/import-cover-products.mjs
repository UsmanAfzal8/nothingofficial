import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const INPUT_PATH = path.join(ROOT, 'abc')
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nothingpakistan.pk'
const PRODUCT_TYPE = 'covers'
const CATEGORY_SLUGS = ['accessories', 'phone-cases']

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

function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function titleCase(value) {
  return String(value)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (/^\d+a?$/i.test(word)) return word.toUpperCase().replace('A', 'a')
      if (word === 'cmf') return 'CMF'
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
    .replace(/\bPolo\b/g, 'Polo')
    .replace(/\bLite\b/g, 'Lite')
    .replace(/\bPro\b/g, 'Pro')
    .replace(/\bPlus\b/g, 'Plus')
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function getMimeType(localPath) {
  try {
    return execFileSync('file', ['--brief', '--mime-type', localPath], { encoding: 'utf8' }).trim()
  } catch {
    const ext = path.extname(localPath).toLowerCase()
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

function parseInput() {
  const linePattern = /^"([^"]+)"\s+(.+?)\s+(\d+(?:\.\d+)?)\s*$/
  const seenSlugs = new Map()

  return readFileSync(INPUT_PATH, 'utf8')
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => line)
    .map(({ line, index }) => {
      const match = line.match(linePattern)
      if (!match) throw new Error(`Could not parse abc line ${index + 1}: ${line}`)

      const [, imagePath, rawName, rawPrice] = match
      const localPath = path.resolve(imagePath)
      if (!existsSync(localPath)) throw new Error(`Missing image on line ${index + 1}: ${localPath}`)

      const baseSlug = slugify(rawName)
      const count = (seenSlugs.get(baseSlug) || 0) + 1
      seenSlugs.set(baseSlug, count)

      return {
        sourceIndex: index + 1,
        localPath,
        rawName: normalize(rawName),
        name: titleCase(rawName),
        baseSlug,
        slug: count === 1 ? baseSlug : `${baseSlug}-${count}`,
        price: Number(rawPrice),
      }
    })
}

function buildMobileAliases(mobile) {
  const names = new Set([mobile.name, mobile.slug.replace(/-/g, ' ')])
  if (/^phone\s*\(/i.test(mobile.name)) names.add(`Nothing ${mobile.name}`)
  if (/^phone\s*\(/i.test(mobile.name)) names.add(mobile.name.replace(/[()]/g, ''))
  if (/^phone\s*\(/i.test(mobile.name)) names.add(`Nothing ${mobile.name.replace(/[()]/g, '')}`)
  if (/^cmf\s+/i.test(mobile.name)) names.add(mobile.name)

  return [...names]
    .map((name) => ({ mobile, alias: normalize(name) }))
    .filter(({ alias }) => alias)
    .sort((left, right) => right.alias.length - left.alias.length)
}

function detectMobile(entry, aliases) {
  const match = aliases.find(({ alias }) => entry.rawName.startsWith(alias))
  if (!match) throw new Error(`Could not match mobile for "${entry.name}"`)
  return match.mobile
}

function buildProductSchema({ entry, imageUrls }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: entry.name,
    brand: {
      '@type': 'Brand',
      name: entry.name.startsWith('CMF') ? 'CMF by Nothing' : 'Nothing',
    },
    sku: entry.slug,
    category: 'Phone Cover',
    description: `Buy ${entry.name} in Pakistan from Nothing Pakistan with compatible device support, live stock confirmation, and nationwide ordering help.`,
    image: imageUrls,
    url: `${SITE_URL}/products/${entry.slug}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: entry.price,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: `${SITE_URL}/products/${entry.slug}`,
    },
  }
}

async function fetchLookup(supabase, table, selectColumns, keyField = 'slug') {
  const { data, error } = await supabase.from(table).select(selectColumns)
  if (error) throw error
  return new Map((data || []).map((row) => [row[keyField], row]))
}

async function replaceCategoryRelations(supabase, productId, categoryIds) {
  const { error: deleteError } = await supabase
    .from('category_relations')
    .delete()
    .eq('related_type', 'product')
    .eq('related_id', productId)
  if (deleteError) throw deleteError

  if (categoryIds.length === 0) return

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

async function replaceImages(supabase, productId, imageRows) {
  const { error: deleteError } = await supabase.from('images').delete().eq('related_type', 'product').eq('related_id', productId)
  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('images').insert(imageRows)
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

  const entries = parseInput()

  const categoryBySlug = await fetchLookup(supabase, 'categories', 'id,slug')
  const productBySlug = await fetchLookup(supabase, 'products', 'id,slug')
  const mobiles = [...(await fetchLookup(supabase, 'mobiles', 'id,name,slug')).values()]
  const mobileAliases = mobiles.flatMap(buildMobileAliases)
  const categoryIds = CATEGORY_SLUGS.map((slug) => categoryBySlug.get(slug)?.id).filter(Boolean)

  const imported = []

  for (const entry of entries) {
    const { slug } = entry
    const mobile = detectMobile(entry, mobileAliases)
    const ext = path.extname(entry.localPath).toLowerCase() || '.webp'
    const fileName = `${slug}${ext}`
    const remotePath = `products/${slug}/${fileName}`
    const publicUrl = await uploadFileToBunny({
      localPath: entry.localPath,
      remotePath,
      bunnyZone,
      bunnyAccessKey,
      bunnyStorageBaseUrl,
      bunnyCdnHostname,
    })
    const imageRows = [
      {
        related_type: 'product',
        related_id: null,
        color_id: null,
        url: publicUrl,
        alt_text: `${entry.name} original cover in Pakistan from Nothing Pakistan`,
        title: entry.name,
        caption: `${entry.name} compatible with ${mobile.name}.`,
        file_name: fileName,
        slug,
        sort_order: 0,
        updated_at: new Date().toISOString(),
      },
    ]

    const description = `Buy ${entry.name} in Pakistan from Nothing Pakistan. This cover is linked with ${mobile.name} for easier compatibility browsing, with local price, delivery, and WhatsApp stock confirmation support.`
    const productPayload = {
      name: entry.name,
      slug,
      description,
      short_description: `${entry.name} for ${mobile.name}, available in Pakistan from Nothing Pakistan.`,
      meta_title: `${entry.name} Price in Pakistan | Nothing Pakistan`,
      meta_description: `Buy ${entry.name} in Pakistan for Rs ${entry.price.toLocaleString('en-PK')} with compatible ${mobile.name} support and quick order confirmation.`,
      seo_keywords: [
        entry.name,
        `${entry.name} price in Pakistan`,
        `${entry.name} Pakistan`,
        `${mobile.name} cover Pakistan`,
        `${mobile.name} case Pakistan`,
        'Nothing phone cover Pakistan',
        'Nothing Pakistan accessories',
      ].join(', '),
      canonical_url: `${SITE_URL}/products/${slug}`,
      schema_json: buildProductSchema({ entry, imageUrls: [publicUrl] }),
      seo_description_long: `${entry.name} is a compatible phone cover for ${mobile.name} buyers in Pakistan. It is listed with a local Nothing Pakistan price of Rs ${entry.price.toLocaleString('en-PK')} and connected to the matching mobile page so shoppers can find the right accessory quickly.`,
      image_alt_text: `${entry.name} original cover in Pakistan from Nothing Pakistan`,
      price: entry.price,
      stock_quantity: 10,
      product_type: PRODUCT_TYPE,
      updated_at: new Date().toISOString(),
    }

    const existing = productBySlug.get(slug)
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

    await replaceCategoryRelations(supabase, productId, categoryIds)
    await replaceMobileLink(supabase, productId, mobile.id)
    await replaceImages(
      supabase,
      productId,
      imageRows.map((row) => ({ ...row, related_id: productId })),
    )

    imported.push({ productId, slug, name: entry.name, mobile: mobile.slug, imageCount: imageRows.length })
    console.log(`${existing?.id ? 'Updated' : 'Inserted'} ${entry.name} -> ${mobile.slug} (${slug})`)
  }

  console.log(`Imported ${imported.length} cover products.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
