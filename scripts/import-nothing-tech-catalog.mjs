import { createClient } from '@supabase/supabase-js'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SHOP_ALL_URL = 'https://nothing.tech/collections/shop-all'
const SITE_URL = 'https://www.nothingpakistan.pk'
const REPORT_DIR = path.join(ROOT, 'database', 'nothing-tech-catalog')
const DISCOVERY_REPORT = path.join(REPORT_DIR, 'discovery.json')
const IMPORT_REPORT = path.join(REPORT_DIR, 'import-report.json')
const FETCH_TIMEOUT_MS = Number(process.env.NOTHING_CATALOG_FETCH_TIMEOUT_MS || 45000)
const APPLY = process.argv.includes('--apply')
const REUSE_MEDIA = process.argv.includes('--reuse-media')
const SKIPPED_HANDLES = new Set(['1'])

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

function writeJson(filePath, value) {
  mkdirSync(path.dirname(filePath), { recursive: true })
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function slugify(value, fallback = 'item') {
  const slug = String(value ?? '')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || fallback
}

function localCatalogSlug(handle) {
  return handle.startsWith('nothing-pakistan-') ? handle : `nothing-pakistan-${handle}`
}

function compactText(value) {
  if (!value) return ''
  if (typeof value === 'string') {
    return value
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim()
  }
  if (Array.isArray(value)) return value.map(compactText).filter(Boolean).join(' ').trim()
  if (typeof value === 'object') {
    if (typeof value.text === 'string') return compactText(value.text)
    if (Array.isArray(value.children)) return compactText(value.children)
    if (value.title) return compactText(value.title)
  }
  return ''
}

function firstString(...values) {
  for (const value of values) {
    const text = compactText(value)
    if (text) return text
  }
  return ''
}

function extensionForUrl(url, fallback = '.jpg') {
  const extension = path.extname(new URL(url).pathname).toLowerCase()
  return extension || fallback
}

function mimeTypeForExt(extension) {
  if (extension === '.avif') return 'image/avif'
  if (extension === '.png') return 'image/png'
  if (extension === '.webp') return 'image/webp'
  return 'image/jpeg'
}

function storageBaseUrl(region) {
  return region.toLowerCase() === 'de'
    ? 'https://storage.bunnycdn.com'
    : `https://${region}.storage.bunnycdn.com`
}

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchText(url) {
  const response = await fetchWithTimeout(url, {
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'user-agent': 'Mozilla/5.0 NothingPakistan official catalog sync',
    },
  })
  if (!response.ok) throw new Error(`Fetch failed for ${url}: ${response.status}`)
  return response.text()
}

function parseStreamArrays(html) {
  const arrays = []
  const pattern = /streamController\.enqueue\(("(?:\\.|[^"\\])*")\)/g
  let match

  while ((match = pattern.exec(html))) {
    let payload = JSON.parse(match[1])
    payload = payload.replace(/^P\d+:/, '')
    if (!payload.trim().startsWith('[')) continue

    try {
      arrays.push(JSON.parse(payload))
    } catch {
      // Ignore streamed chunks that are not the product graph.
    }
  }

  return arrays
}

function decodeReactRouterArray(array) {
  const objectMemo = new Map()
  const indexMemo = new Map()
  const resolving = new Set()

  function resolveIndex(index) {
    if (index < 0 || index >= array.length) return null
    if (indexMemo.has(index)) return indexMemo.get(index)
    if (resolving.has(index)) return null

    resolving.add(index)
    const value = resolve(array[index])
    resolving.delete(index)
    indexMemo.set(index, value)
    return value
  }

  function resolve(value) {
    if (typeof value === 'number') return resolveIndex(value)
    if (Array.isArray(value)) return value.map(resolve)
    if (value && typeof value === 'object') {
      if (objectMemo.has(value)) return objectMemo.get(value)
      const object = {}
      objectMemo.set(value, object)

      for (const [key, rawValue] of Object.entries(value)) {
        const resolvedKey = key.startsWith('_') ? resolveIndex(Number(key.slice(1))) : key
        if (resolvedKey) object[resolvedKey] = resolve(rawValue)
      }
      return object
    }
    return value
  }

  return resolveIndex(0)
}

function findProductRoute(html) {
  for (const array of parseStreamArrays(html)) {
    const root = decodeReactRouterArray(array)
    const loaderData = root?.loaderData ?? {}

    for (const [key, value] of Object.entries(loaderData)) {
      if (key.includes('products') && value?.product) return value.product
    }
  }
  return null
}

function extractShopAllHandles(html) {
  return [...new Set([...html.matchAll(/\/products\/([a-z0-9-]+)/gi)].map((match) => match[1]))]
    .filter((handle) => !SKIPPED_HANDLES.has(handle))
    .sort()
}

function imageUrl(image) {
  if (!image) return null
  if (typeof image === 'string' && image.startsWith('http')) return image
  for (const candidate of [image.url, image.src, image.image?.url, image.asset?.url]) {
    if (typeof candidate === 'string' && candidate.startsWith('http')) return candidate
  }
  return null
}

function productVariants(product) {
  const candidates = [
    product?.variants?.nodes,
    product?.variants,
    product?.adjacentVariants,
  ]
  return candidates.find(Array.isArray) ?? []
}

function selectedOption(variant, names) {
  const options = variant?.selectedOptions ?? variant?.options ?? []
  const match = options.find((option) => names.includes(String(option?.name ?? '').trim().toLowerCase()))
  return String(match?.value ?? '').trim() || null
}

function extractColors(product) {
  const colors = new Map()

  for (const variant of productVariants(product)) {
    const name = selectedOption(variant, ['colour', 'color'])
    const sourceUrl = imageUrl(variant?.image)
    if (!name || !sourceUrl) continue
    const key = name.toLowerCase()
    if (!colors.has(key)) colors.set(key, { name, source_url: sourceUrl })
  }

  const colorOption = (product?.options ?? []).find((option) =>
    ['colour', 'color'].includes(String(option?.name ?? '').trim().toLowerCase()),
  )
  for (const rawValue of colorOption?.values ?? []) {
    const name = typeof rawValue === 'string' ? rawValue : rawValue?.name ?? rawValue?.value
    if (!name) continue
    const key = String(name).toLowerCase()
    if (!colors.has(key)) colors.set(key, { name: String(name), source_url: null })
  }

  if (colors.size === 0) {
    const sourceUrl = imageUrl(product?.selectedOrFirstAvailableVariant?.image) || imageUrl(product?.featuredImage)
    if (sourceUrl) colors.set('default', { name: 'Default', source_url: sourceUrl })
  }

  return [...colors.values()]
}

function extractGallery(product, colorSourceUrls) {
  const nodes = Array.isArray(product?.images?.nodes)
    ? product.images.nodes
    : Array.isArray(product?.images)
      ? product.images
      : []
  const seen = new Set(colorSourceUrls.filter(Boolean))
  const gallery = []

  for (const node of nodes) {
    const sourceUrl = imageUrl(node)
    if (!sourceUrl || seen.has(sourceUrl)) continue
    seen.add(sourceUrl)
    gallery.push({
      source_url: sourceUrl,
      alt_text: firstString(node?.altText, node?.alt, product?.title),
    })
    if (gallery.length >= 8) break
  }
  return gallery
}

function isPhoneHandle(handle) {
  return /^phone-\d/i.test(handle)
}

function classify(handle) {
  if (isPhoneHandle(handle)) return { entity_type: 'mobile', category: 'Phones', category_slug: 'phones', product_type: null }
  if (/hoodie|overall|tracksuit|labcoat/i.test(handle)) {
    return { entity_type: 'product', category: 'Apparel', category_slug: 'apparel', product_type: null }
  }
  if (/watch/i.test(handle)) return { entity_type: 'product', category: 'Watches', category_slug: 'watches', product_type: null }
  if (/power/i.test(handle)) return { entity_type: 'product', category: 'Power', category_slug: 'power', product_type: 'charger' }
  if (/case/i.test(handle)) return { entity_type: 'product', category: 'Cases', category_slug: 'cases', product_type: 'covers' }
  if (/headphone/i.test(handle)) return { entity_type: 'product', category: 'Audio', category_slug: 'audio', product_type: null }
  if (/ear|buds/i.test(handle)) return { entity_type: 'product', category: 'Audio', category_slug: 'audio', product_type: 'earbuds' }
  return { entity_type: 'product', category: 'Accessories', category_slug: 'accessories', product_type: null }
}

function buildCatalogRecord(handle, product) {
  const classification = classify(handle)
  const title = firstString(product?.title, handle)
  const description = firstString(product?.description, product?.descriptionHtml, product?.seo?.description)
  const metaDescription = firstString(product?.seo?.description, description).slice(0, 320) || null
  const colors = extractColors(product)

  return {
    source_url: `https://nothing.tech/products/${handle}`,
    handle,
    local_slug: localCatalogSlug(handle),
    title,
    description: description || null,
    meta_title: firstString(product?.seo?.title, title).slice(0, 255),
    meta_description: metaDescription,
    ...classification,
    colors,
    gallery: extractGallery(product, colors.map((color) => color.source_url)),
    capacity_options: [
      ...new Set(productVariants(product).map((variant) => selectedOption(variant, ['capacity'])).filter(Boolean)),
    ],
    official_variant_count: productVariants(product).length,
    has_specs: Array.isArray(product?.sanityContent?.specs) && product.sanityContent.specs.length > 0,
    feature_widget_count: (product?.sanityContent?.widgets ?? []).filter((widget) => widget?._type === 'widgetStack').length,
  }
}

function createBunnyClient() {
  const zone = requireEnv('BUNNY_STORAGE_ZONE_NAME')
  const accessKey = requireEnv('BUNNY_ACCESS_KEY')
  const hostname = requireEnv('BUNNY_CDN_HOSTNAME')
  const baseUrl = storageBaseUrl(process.env.BUNNY_STORAGE_REGION || 'de')

  async function upload(sourceUrl, remotePath) {
    const cdnUrl = `https://${hostname}/${remotePath}`
    if (REUSE_MEDIA || sourceUrl.includes(`://${hostname}/`)) return cdnUrl

    const source = await fetchWithTimeout(sourceUrl)
    if (!source.ok) throw new Error(`Media fetch failed for ${sourceUrl}: ${source.status}`)

    const response = await fetchWithTimeout(`${baseUrl}/${zone}/${remotePath}`, {
      method: 'PUT',
      headers: {
        AccessKey: accessKey,
        'Content-Type': mimeTypeForExt(path.extname(remotePath).toLowerCase()),
      },
      body: Buffer.from(await source.arrayBuffer()),
    })
    if (!response.ok) {
      throw new Error(`Bunny upload failed for ${remotePath}: ${response.status} ${await response.text().catch(() => '')}`)
    }
    return cdnUrl
  }

  return { upload }
}

async function upsertCategory(supabase, record) {
  const { data, error } = await supabase
    .from('categories')
    .upsert({
      name: record.category,
      slug: record.category_slug,
      meta_title: `${record.category} | Nothing Pakistan`,
      meta_description: `Browse official Nothing ${record.category.toLowerCase()} product information and media in Pakistan.`,
      canonical_url: `${SITE_URL}/collections/${record.category_slug}`,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'slug' })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

async function upsertColor(supabase, name) {
  const { data: existing, error: findError } = await supabase
    .from('colors')
    .select('id')
    .ilike('name', name)
    .limit(1)
  if (findError) throw findError
  if (existing?.[0]) return existing[0].id

  const { data, error } = await supabase
    .from('colors')
    .insert({ name, hex_code: null, updated_at: new Date().toISOString() })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

async function upsertCatalogItem(supabase, record, mainColorId) {
  const common = {
    name: record.title,
    slug: record.local_slug,
    description: record.description,
    meta_title: record.meta_title,
    meta_description: record.meta_description,
    canonical_url: `${SITE_URL}/products/${record.local_slug}`,
    image_alt_text: `${record.title} official product image`,
    updated_at: new Date().toISOString(),
  }

  if (record.entity_type === 'mobile') {
    const { data, error } = await supabase
      .from('mobiles')
      .upsert({
        ...common,
        'Price': null,
        original_price: null,
        pta_tax: null,
        non_pta_price: null,
      }, { onConflict: 'slug' })
      .select('id')
      .single()
    if (error) throw error
    return data.id
  }

  const { data, error } = await supabase
    .from('products')
    .upsert({
      ...common,
      short_description: record.meta_description,
      price: null,
      stock_quantity: 0,
      main_color_id: mainColorId,
      product_type: record.product_type,
    }, { onConflict: 'slug' })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

async function upsertImage(supabase, row) {
  const { error } = await supabase
    .from('images')
    .upsert(row, { onConflict: 'related_type,related_id,slug' })
  if (error) throw error
}

async function importRecord(supabase, bunny, record) {
  const colorIds = new Map()
  for (const color of record.colors) {
    colorIds.set(color.name, await upsertColor(supabase, color.name))
  }

  const categoryId = await upsertCategory(supabase, record)
  const mainColorId = colorIds.get(record.colors[0]?.name) ?? null
  const relatedId = await upsertCatalogItem(supabase, record, mainColorId)
  const relatedType = record.entity_type
  let imagesUploaded = 0

  for (const [index, color] of record.colors.entries()) {
    if (!color.source_url) continue
    const extension = extensionForUrl(color.source_url)
    const colorSlug = slugify(color.name)
    const remotePath = `products/${record.handle}/colors/${colorSlug}/primary${extension}`
    const cdnUrl = await bunny.upload(color.source_url, remotePath)
    imagesUploaded += 1

    await upsertImage(supabase, {
      related_type: relatedType,
      related_id: relatedId,
      color_id: colorIds.get(color.name),
      url: cdnUrl,
      alt_text: `${record.title} in ${color.name}`,
      title: `${record.title} — ${color.name}`,
      caption: color.name,
      file_name: path.basename(remotePath),
      slug: `official-color-${colorSlug}`,
      sort_order: index * 10,
      updated_at: new Date().toISOString(),
    })
  }

  for (const [index, image] of record.gallery.entries()) {
    const extension = extensionForUrl(image.source_url)
    const remotePath = `products/${record.handle}/gallery/${String(index + 1).padStart(2, '0')}${extension}`
    const cdnUrl = await bunny.upload(image.source_url, remotePath)
    imagesUploaded += 1

    await upsertImage(supabase, {
      related_type: relatedType,
      related_id: relatedId,
      color_id: null,
      url: cdnUrl,
      alt_text: image.alt_text || `${record.title} official gallery image ${index + 1}`,
      title: `${record.title} official gallery image ${index + 1}`,
      caption: 'Official product gallery',
      file_name: path.basename(remotePath),
      slug: `official-gallery-${String(index + 1).padStart(2, '0')}`,
      sort_order: 500 + index,
      updated_at: new Date().toISOString(),
    })
  }

  const { error: relationError } = await supabase
    .from('category_relations')
    .upsert({
      category_id: categoryId,
      related_type: relatedType,
      related_id: relatedId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'category_id,related_type,related_id' })
  if (relationError) throw relationError

  return {
    related_type: relatedType,
    related_id: relatedId,
    colors: colorIds.size,
    images_uploaded: imagesUploaded,
  }
}

async function assertFreshOrOfficialOnly(supabase, handles) {
  const [{ data: products, error: productError }, { data: mobiles, error: mobileError }] = await Promise.all([
    supabase.from('products').select('slug'),
    supabase.from('mobiles').select('slug'),
  ])
  if (productError) throw productError
  if (mobileError) throw mobileError

  const unexpected = [...(products ?? []), ...(mobiles ?? [])]
    .map((row) => row.slug)
    .filter((slug) => !handles.includes(slug))

  if (unexpected.length > 0) {
    throw new Error(`Catalog import stopped because non-official rows already exist: ${unexpected.slice(0, 10).join(', ')}`)
  }
}

async function discover() {
  const collectionHtml = await fetchText(SHOP_ALL_URL)
  const handles = extractShopAllHandles(collectionHtml)
  const records = []
  const failed = []

  for (const [index, handle] of handles.entries()) {
    process.stdout.write(`[${index + 1}/${handles.length}] Discovering ${handle}... `)
    try {
      const html = await fetchText(`https://nothing.tech/products/${handle}`)
      const product = findProductRoute(html)
      if (!product) throw new Error('Official product payload was not found')
      const record = buildCatalogRecord(handle, product)
      records.push(record)
      process.stdout.write(`${record.colors.length} colors, ${record.gallery.length} gallery images\n`)
    } catch (error) {
      failed.push({ handle, error: error.message })
      process.stdout.write(`failed: ${error.message}\n`)
    }
  }

  return {
    generated_at: new Date().toISOString(),
    source_url: SHOP_ALL_URL,
    summary: {
      handles_seen: handles.length,
      products_discovered: records.length,
      mobiles: records.filter((record) => record.entity_type === 'mobile').length,
      products: records.filter((record) => record.entity_type === 'product').length,
      colors: records.reduce((total, record) => total + record.colors.length, 0),
      gallery_images: records.reduce((total, record) => total + record.gallery.length, 0),
      products_with_specs: records.filter((record) => record.has_specs).length,
      feature_widgets: records.reduce((total, record) => total + record.feature_widget_count, 0),
      failed: failed.length,
    },
    failed,
    products: records,
  }
}

async function main() {
  loadEnv()
  const discovery = await discover()
  writeJson(DISCOVERY_REPORT, discovery)
  console.log(`Wrote ${DISCOVERY_REPORT}`)

  if (!APPLY) {
    console.log(JSON.stringify(discovery.summary, null, 2))
    return
  }

  if (discovery.failed.length > 0) {
    throw new Error(`Import stopped because ${discovery.failed.length} official products failed discovery`)
  }

  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const bunny = createBunnyClient()
  const handles = discovery.products.map((record) => record.local_slug)
  await assertFreshOrOfficialOnly(supabase, handles)

  const report = {
    imported_at: new Date().toISOString(),
    source_url: SHOP_ALL_URL,
    products: [],
    failed: [],
    summary: {
      imported: 0,
      failed: 0,
      colors: 0,
      images_uploaded: 0,
    },
  }

  for (const [index, record] of discovery.products.entries()) {
    process.stdout.write(`[${index + 1}/${discovery.products.length}] Importing ${record.handle}... `)
    try {
      const result = await importRecord(supabase, bunny, record)
      report.products.push({ handle: record.handle, ...result })
      report.summary.imported += 1
      report.summary.colors += result.colors
      report.summary.images_uploaded += result.images_uploaded
      process.stdout.write(`${result.colors} colors, ${result.images_uploaded} images\n`)
    } catch (error) {
      report.failed.push({ handle: record.handle, error: error.message })
      report.summary.failed += 1
      process.stdout.write(`failed: ${error.message}\n`)
    }
  }

  writeJson(IMPORT_REPORT, report)
  console.log(`Wrote ${IMPORT_REPORT}`)
  console.log(JSON.stringify(report.summary, null, 2))
  if (report.failed.length > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
