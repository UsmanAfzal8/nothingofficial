import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEST_ROOT = path.resolve(__dirname, '..')
const SOURCE_ROOT = '/Users/mosin/projects/nothingPakistan'
const SOURCE_ENV_PATH = path.join(SOURCE_ROOT, '.env.local')
const DEST_ENV_PATH = path.join(DEST_ROOT, '.env.local')
const REPORT_DIR = path.join(DEST_ROOT, 'migration-reports')
const CANONICAL_SITE_URL = 'https://www.nothingofficial.pk'
const PAGE_SIZE = 1000
const FETCH_TIMEOUT_MS = 45000
const MAX_PARALLEL_MEDIA_CHECKS = 8
const MAX_PARALLEL_UPLOADS = 3
const URL_CHECK_ATTEMPTS = 3

const TABLES = [
  'colors',
  'categories',
  'products',
  'mobiles',
  'images',
  'faqs',
  'blogs',
  'spec_groups',
  'spec_group_items',
  'product_feature_sections',
  'product_feature_slides',
  'category_relations',
  'product_mobiles',
  'reviews',
  'users',
  'orders',
]

const DELETE_ORDER = [
  'product_feature_slides',
  'spec_group_items',
  'category_relations',
  'product_mobiles',
  'reviews',
  'orders',
  'images',
  'faqs',
  'product_feature_sections',
  'spec_groups',
  'products',
  'mobiles',
  'categories',
  'colors',
  'users',
  'blogs',
]

const INSERT_ORDER = [
  'colors',
  'users',
  'categories',
  'products',
  'mobiles',
  'blogs',
  'images',
  'faqs',
  'spec_groups',
  'spec_group_items',
  'product_feature_sections',
  'product_feature_slides',
  'category_relations',
  'product_mobiles',
  'reviews',
  'orders',
]

const CONTENT_FIELDS = new Set([
  'name',
  'title',
  'feature_title',
  'question',
  'answer',
  'body',
  'content',
  'description',
  'short_description',
  'meta_title',
  'meta_description',
  'seo_keywords',
  'canonical_url',
  'seo_description_long',
  'image_alt_text',
  'alt_text',
  'caption',
  'media_alt',
  'schema_json',
])

const HTML_FIELD_RE = /<\/?[a-z][\s\S]*>/i
const URL_RE = /\bhttps?:\/\/[^\s"'<>),\\\]]+/gi
const LEGACY_HOST_RE = /(cdn\.nothingshop\.pk|nothingshop\.pk|bunnycdn\.com|b-cdn\.net|storage\.bunnycdn\.com)/i
const RASTER_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'tif', 'tiff', 'bmp', 'heic', 'heif'])
const PASSTHROUGH_IMAGE_EXTENSIONS = new Set(['webp', 'avif'])
const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'm4v', 'webm', 'avi', 'mkv'])
const RAW_ASSET_EXTENSIONS = new Set(['svg', 'html', 'htm', 'pdf'])

function parseArgs() {
  const rawArgs = process.argv.slice(2)
  const args = new Set(rawArgs)
  const summaryIndex = rawArgs.indexOf('--summary')
  return {
    summary: args.has('--summary'),
    summaryPath: summaryIndex >= 0 && rawArgs[summaryIndex + 1] && !rawArgs[summaryIndex + 1].startsWith('--')
      ? rawArgs[summaryIndex + 1]
      : null,
    summaryMode: args.has('--summary-dry-run') ? 'dry-run' : args.has('--summary-preflight') ? 'preflight' : null,
    preflight: args.has('--preflight'),
    dryRun: args.has('--replace') ? false : true,
    replace: args.has('--replace'),
    confirmReplace: args.has('--confirm-replace'),
    allowExternalMedia: args.has('--allow-external-media'),
    allowMissingSequenceReset: args.has('--allow-missing-sequence-reset'),
    pruneOrphans: args.has('--prune-orphans'),
    dropSkippedMedia: args.has('--drop-skipped-media'),
    skipMediaChecks: args.has('--skip-media-checks'),
    skipCloudinaryValidation: args.has('--skip-cloudinary-validation'),
    usePlannedCloudinaryUrls: args.has('--use-planned-cloudinary-urls'),
  }
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Missing env file: ${filePath}`)
  }

  const env = {}
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const separatorIndex = trimmed.indexOf('=')
    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '')
    env[key] = value
  }
  return env
}

function requireEnv(env, name, label) {
  if (!env[name]) {
    throw new Error(`Missing ${label} env value: ${name}`)
  }
  return env[name]
}

function createSupabase(env, label) {
  return createClient(requireEnv(env, 'SUPABASE_URL', label), requireEnv(env, 'SUPABASE_SERVICE_ROLE_KEY', label), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function compactText(value) {
  return String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(value, maxLength) {
  const text = compactText(value)
  if (text.length <= maxLength) return text
  const trimmed = text.slice(0, maxLength - 1).replace(/\s+\S*$/, '').trim()
  return trimmed || text.slice(0, maxLength - 1).trim()
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

function uniqueSlug(baseSlug, usedSlugs) {
  let candidate = slugify(baseSlug)
  let suffix = 2
  while (usedSlugs.has(candidate)) {
    candidate = `${slugify(baseSlug)}-${suffix}`
    suffix += 1
  }
  usedSlugs.add(candidate)
  return candidate
}

function priceLabel(row) {
  const price = row.price ?? row.Price ?? row.non_pta_price ?? null
  if (price === null || price === undefined || price === '') return 'the current listed price'
  const number = Number(price)
  if (!Number.isFinite(number)) return `PKR ${price}`
  return `PKR ${number.toLocaleString('en-PK')}`
}

function normalizeBrandCopy(value) {
  if (typeof value !== 'string') return value
  return value
    .replace(/https?:\/\/(?:www\.)?nothingshop\.pk/gi, CANONICAL_SITE_URL)
    .replace(/https?:\/\/cdn\.nothingshop\.pk/gi, CANONICAL_SITE_URL)
    .replace(/\bNothing\s+Pakistan\b/gi, 'Nothing Official Store Pakistan')
    .replace(/\bNothing\s+official\s+store\s+Pakistan\b/gi, 'Nothing Official Store Pakistan')
    .replace(/\bNothing\s+Offical\b/gi, 'Nothing Official')
    .replace(/\bnothingshop\.pk\b/gi, 'nothingofficial.pk')
}

function buildProductCopy(row, slug) {
  const name = compactText(row.name)
  const productType = row.product_type ? compactText(row.product_type).replace(/_/g, ' ') : 'Nothing and CMF product'
  const price = priceLabel(row)
  const stockLine = Number(row.stock_quantity ?? 0) > 0 ? 'stock confirmation before checkout' : 'availability confirmation before checkout'

  return {
    slug,
    meta_title: truncate(`${name} Price in Pakistan | Nothing Official Store Pakistan`, 255),
    meta_description: truncate(
      `Buy original ${name} in Pakistan from Nothing Official Store Pakistan with ${price}, delivery support, authenticity guidance, compatibility help, and ${stockLine}.`,
      158,
    ),
    description: `${name} is listed by Nothing Official Store Pakistan for shoppers who want original Nothing and CMF products with clear Pakistan buying guidance. The page focuses on authenticity, compatibility, delivery expectations, support routes, and live stock confirmation so customers can make a confident purchase decision.`,
    short_description: row.short_description && HTML_FIELD_RE.test(row.short_description)
      ? row.short_description
      : `${name} from Nothing Official Store Pakistan with Pakistan delivery support, authenticity guidance, and ${stockLine}.`,
    seo_description_long: [
      `${name} is prepared for Pakistan buyers comparing ${productType}, current price, stock status, and original product sourcing. Nothing Official Store Pakistan keeps the listing focused on practical purchase questions instead of generic catalogue copy.`,
      `Customers in Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, and other cities can use this page to check ${price}, confirm compatibility, review product media, and contact support before ordering.`,
      `The buying intent for ${name} includes authenticity, delivery timing, cash-on-delivery guidance where available, after-sales support, warranty or support expectations, and whether the product fits a specific Nothing or CMF device setup.`,
      `Internal links should connect ${name} with relevant collections, compatible mobiles, accessories, specifications, images, and FAQs so both shoppers and search engines understand the product context on Nothing Official Store Pakistan.`,
    ].join('\n\n'),
    image_alt_text: `${name} original product in Pakistan from Nothing Official Store Pakistan`,
    seo_keywords: [
      name,
      `${name} price in Pakistan`,
      `${name} Pakistan`,
      `buy ${name} online Pakistan`,
      `original ${name} Pakistan`,
      'Nothing Official Store Pakistan',
      'Nothing Official Store Pakistan',
      'Nothing products Pakistan',
      'CMF products Pakistan',
      'authentic Nothing store Pakistan',
    ].join(', '),
    canonical_url: `${CANONICAL_SITE_URL}/products/${slug}`,
  }
}

function buildMobileCopy(row, slug) {
  const name = compactText(row.name)
  const price = priceLabel(row)
  return {
    slug,
    meta_title: truncate(`${name} Price in Pakistan | Nothing Official Store Pakistan`, 255),
    meta_description: truncate(
      `Check ${name} price in Pakistan at Nothing Official Store Pakistan with PTA guidance, authenticity checks, delivery support, stock confirmation, and local buying help.`,
      158,
    ),
    description: `${name} is listed for Pakistan buyers who want clear phone pricing, PTA and non-PTA context where applicable, stock confirmation, and support before ordering from Nothing Official Store Pakistan.`,
    seo_description_long: [
      `${name} is positioned for high-intent Pakistan searches around Nothing phone price, PTA status, original stock, delivery, and local support. The listing keeps ${price} visible while encouraging final stock and variant confirmation before checkout.`,
      `Buyers comparing Nothing phones in Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, and other cities can use this page to review specs, product media, compatibility, warranty or support guidance, and order routes.`,
      `Nothing Official Store Pakistan writes this page for practical mobile buying questions: whether the device is authentic, how delivery works, what support is available, which accessories are compatible, and how stock is confirmed.`,
    ].join('\n\n'),
    image_alt_text: `${name} original Nothing phone in Pakistan from Nothing Official Store Pakistan`,
    seo_keywords: [
      name,
      `${name} price in Pakistan`,
      `${name} PTA approved Pakistan`,
      `buy ${name} online Pakistan`,
      `original ${name} Pakistan`,
      'Nothing phone Pakistan',
      'Nothing Official Store Pakistan',
      'Nothing Official Store Pakistan',
    ].join(', '),
    canonical_url: `${CANONICAL_SITE_URL}/products/${slug}`,
  }
}

function buildCategoryCopy(row, slug) {
  const name = compactText(row.name)
  return {
    slug,
    meta_title: truncate(`${name} | Nothing Official Store Pakistan`, 255),
    meta_description: truncate(
      `Shop ${name} from Nothing Official Store Pakistan with original Nothing and CMF products, Pakistan delivery support, stock confirmation, and local buying help.`,
      158,
    ),
    canonical_url: `${CANONICAL_SITE_URL}/collections/${slug}`,
  }
}

function buildBlogCopy(row, slug) {
  const title = compactText(row.title)
  return {
    slug,
    meta_title: truncate(`${title} | Nothing Official Store Pakistan`, 255),
    meta_description: truncate(
      `Read ${title} from Nothing Official Store Pakistan for Pakistan buying guidance, product support, compatibility notes, delivery context, and authenticity tips.`,
      158,
    ),
  }
}

function updateSchemaJson(value, row, slug, type) {
  if (!value) return value
  let schema = value
  if (typeof value === 'string') {
    try {
      schema = JSON.parse(value)
    } catch {
      return normalizeBrandCopy(value)
    }
  }

  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) return schema
  const name = compactText(row.name ?? row.title ?? schema.name)
  const pagePath = type === 'category' ? `/collections/${slug}` : `/products/${slug}`
  const copy = type === 'mobile' ? buildMobileCopy(row, slug) : type === 'product' ? buildProductCopy(row, slug) : null
  const next = structuredClone(schema)
  next.url = `${CANONICAL_SITE_URL}${pagePath}`
  if (name) next.name = name
  if (copy?.meta_description) next.description = copy.meta_description
  if (next.offers && typeof next.offers === 'object') {
    next.offers.url = `${CANONICAL_SITE_URL}${pagePath}`
  }
  return next
}

function extractUrlsFromString(value) {
  return Array.from(String(value).matchAll(URL_RE), (match) => match[0].replace(/[.,;:!?]+$/, ''))
}

function collectUrls(value, pathParts = [], out = []) {
  if (typeof value === 'string') {
    for (const url of extractUrlsFromString(value)) {
      out.push({ url, path: pathParts.join('.') })
    }
    return out
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectUrls(item, [...pathParts, String(index)], out))
    return out
  }

  if (value && typeof value === 'object') {
    for (const [key, nestedValue] of Object.entries(value)) {
      collectUrls(nestedValue, [...pathParts, key], out)
    }
  }
  return out
}

function replaceUrlsInValue(value, replacements) {
  if (typeof value === 'string') {
    let next = value
    for (const [from, to] of replacements.entries()) {
      next = next.split(from).join(to)
    }
    return normalizeBrandCopy(next)
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceUrlsInValue(item, replacements))
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nestedValue]) => [key, replaceUrlsInValue(nestedValue, replacements)]))
  }
  return value
}

function removeSkippedUrlsFromString(value, skippedUrls) {
  let next = value
  for (const url of skippedUrls) {
    next = next.split(url).join('')
  }
  return normalizeBrandCopy(next)
}

function removeSkippedUrlsFromValue(value, skippedUrls) {
  if (typeof value === 'string') {
    return removeSkippedUrlsFromString(value, skippedUrls)
  }
  if (Array.isArray(value)) {
    return value.map((item) => removeSkippedUrlsFromValue(item, skippedUrls))
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nestedValue]) => [key, removeSkippedUrlsFromValue(nestedValue, skippedUrls)]))
  }
  return value
}

function buildContextMaps(rowsByTable) {
  const productsById = new Map((rowsByTable.products ?? []).map((row) => [row.id, row]))
  const mobilesById = new Map((rowsByTable.mobiles ?? []).map((row) => [row.id, row]))
  const categoriesById = new Map((rowsByTable.categories ?? []).map((row) => [row.id, row]))
  const featureSectionsById = new Map((rowsByTable.product_feature_sections ?? []).map((row) => [row.id, row]))
  const specGroupsById = new Map((rowsByTable.spec_groups ?? []).map((row) => [row.id, row]))
  return { productsById, mobilesById, categoriesById, featureSectionsById, specGroupsById }
}

function relatedSlugForRow(table, row, maps) {
  if (table === 'products') return row.slug
  if (table === 'mobiles') return row.slug
  if (table === 'categories') return row.slug
  if (row.related_type === 'product') return maps.productsById.get(row.related_id)?.slug ?? `product-${row.related_id}`
  if (row.related_type === 'mobile') return maps.mobilesById.get(row.related_id)?.slug ?? `mobile-${row.related_id}`
  if (row.related_type === 'category') return maps.categoriesById.get(row.related_id)?.slug ?? `category-${row.related_id}`
  if (table === 'product_feature_slides') {
    const section = maps.featureSectionsById.get(row.product_feature_section_id)
    if (section) return relatedSlugForRow('product_feature_sections', section, maps)
  }
  if (table === 'spec_group_items') {
    const group = maps.specGroupsById.get(row.spec_group_id)
    if (group) return relatedSlugForRow('spec_groups', group, maps)
  }
  return `${table}-${row.id ?? 'row'}`
}

function inferMediaKind(url, contentType = '') {
  const cleanUrl = url.split('?')[0]
  const ext = cleanUrl.includes('.') ? cleanUrl.split('.').pop().toLowerCase() : ''
  if (contentType.includes('video/') || VIDEO_EXTENSIONS.has(ext)) return { resourceType: 'video', extension: ext || 'mp4', mediaType: 'video' }
  if (contentType.includes('image/svg') || ext === 'svg') return { resourceType: 'raw', extension: 'svg', mediaType: 'svg' }
  if (contentType.includes('text/html') || ext === 'html' || ext === 'htm') return { resourceType: 'raw', extension: ext || 'html', mediaType: 'html' }
  if (contentType.includes('image/') || RASTER_EXTENSIONS.has(ext) || PASSTHROUGH_IMAGE_EXTENSIONS.has(ext)) {
    return { resourceType: 'image', extension: ext || 'jpg', mediaType: 'image' }
  }
  return { resourceType: 'raw', extension: ext || 'bin', mediaType: 'raw' }
}

function extensionFromUrl(url) {
  const cleanUrl = url.split('?')[0]
  if (!cleanUrl.includes('.')) return ''
  return cleanUrl.split('.').pop().toLowerCase()
}

function hasMediaExtension(url) {
  const ext = extensionFromUrl(url)
  return RASTER_EXTENSIONS.has(ext) || PASSTHROUGH_IMAGE_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext) || RAW_ASSET_EXTENSIONS.has(ext)
}

function isMediaFieldPath(table, fieldPath) {
  if (/canonical_url$/i.test(fieldPath) || /schema_json\.(url|offers\.url)$/i.test(fieldPath)) return false
  if (table === 'images' && fieldPath === 'url') return true
  return /(^|\.)(image|image_url|video_url|thumbnail_url|cover_image_url|cover_video_url|cover_thumbnail_url|media_url|file_name)$/i.test(fieldPath)
    || /(image|video|thumbnail|media|asset|file|gallery|poster|playback)/i.test(fieldPath)
}

function isOwnedOrAllowedUrl(url, sourceEnv, options) {
  if (options.allowExternalMedia) return true
  let host = ''
  try {
    host = new URL(url).hostname.toLowerCase()
  } catch {
    return false
  }

  const allowedHosts = new Set([
    'www.nothingofficial.pk',
    'nothingofficial.pk',
    'cdn.nothingofficial.pk',
    'www.nothingofficial.pk',
    'nothingofficial.pk',
    String(sourceEnv.BUNNY_CDN_HOSTNAME ?? '').toLowerCase(),
  ].filter(Boolean))

  return allowedHosts.has(host) || host.endsWith('.b-cdn.net') || host.endsWith('.bunnycdn.com')
}

async function withTimeout(promise, timeoutMs, label) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
  try {
    return await promise(controller.signal)
  } finally {
    clearTimeout(timeout)
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function checkUrlOnce(url) {
  try {
    const head = await withTimeout(
      (signal) => fetch(url, { method: 'HEAD', redirect: 'follow', signal }),
      FETCH_TIMEOUT_MS,
      `HEAD ${url}`,
    )
    if (head.ok) {
      return {
        ok: true,
        status: head.status,
        contentType: head.headers.get('content-type') ?? '',
        contentLength: head.headers.get('content-length') ?? null,
      }
    }
    if (![403, 405, 501].includes(head.status)) {
      return { ok: false, status: head.status, contentType: head.headers.get('content-type') ?? '', contentLength: null }
    }

    const get = await withTimeout(
      (signal) => fetch(url, { method: 'GET', redirect: 'follow', headers: { Range: 'bytes=0-0' }, signal }),
      FETCH_TIMEOUT_MS,
      `GET ${url}`,
    )
    return {
      ok: get.ok || get.status === 206,
      status: get.status,
      contentType: get.headers.get('content-type') ?? '',
      contentLength: get.headers.get('content-length') ?? null,
    }
  } catch (error) {
    return { ok: false, status: null, contentType: '', contentLength: null, error: error.message }
  }
}

async function checkUrl(url) {
  let lastResult = null
  for (let attempt = 1; attempt <= URL_CHECK_ATTEMPTS; attempt += 1) {
    const result = await checkUrlOnce(url)
    if (result.ok) {
      return attempt === 1 ? result : { ...result, attempts: attempt }
    }
    lastResult = { ...result, attempts: attempt }
    if (result.status !== null && ![408, 425, 429, 500, 502, 503, 504].includes(result.status)) {
      return lastResult
    }
    if (attempt < URL_CHECK_ATTEMPTS) {
      await sleep(500 * attempt)
    }
  }
  return lastResult
}

async function downloadUrl(url) {
  const response = await withTimeout(
    (signal) => fetch(url, { method: 'GET', redirect: 'follow', signal }),
    FETCH_TIMEOUT_MS,
    `download ${url}`,
  )
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: HTTP ${response.status}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  return {
    buffer,
    contentType: response.headers.get('content-type') ?? '',
    contentLength: response.headers.get('content-length') ?? null,
  }
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length)
  let index = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const currentIndex = index
      index += 1
      results[currentIndex] = await worker(items[currentIndex], currentIndex)
    }
  })
  await Promise.all(workers)
  return results
}

function cloudinarySignature(params, apiSecret) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return createHash('sha1').update(`${payload}${apiSecret}`).digest('hex')
}

function sanitizePublicId(value) {
  return slugify(value, 'asset').slice(0, 120)
}

function cloudinaryContextValue(value, maxLength = 900) {
  return truncate(String(value ?? ''), maxLength)
    .replace(/[|=]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cloudinaryContextPair(key, value, maxLength) {
  const normalized = cloudinaryContextValue(value, maxLength)
  return normalized ? `${key}=${normalized}` : null
}

function buildCloudinaryAssetCopy({ table, row, fieldPath, mediaType, relatedSlug }) {
  const entityName = compactText(row.name ?? row.title ?? relatedSlug)
  const fieldLabel = compactText(String(fieldPath || 'asset').replace(/[._-]+/g, ' '))
  const readableTable = compactText(String(table).replace(/_/g, ' '))
  const readableMedia = mediaType === 'html' ? 'HTML content' : mediaType
  const title = `${entityName} ${fieldLabel} | Nothing Official Store Pakistan`
  const description = `${readableMedia} asset for ${entityName} from the ${readableTable} catalogue, prepared for Nothing Official Store Pakistan in Pakistan with clean Cloudinary delivery metadata.`
  const alt = `${entityName} ${fieldLabel} for Nothing Official Store Pakistan`

  return {
    title,
    description,
    alt,
    caption: `${entityName} asset for Pakistan shoppers`,
  }
}

function buildCloudinaryTarget({ table, row, fieldPath, url, mediaType, relatedSlug, extension, outputExtension }) {
  const rowLabel = sanitizePublicId(row.slug ?? row.name ?? row.title ?? `${table}-${row.id ?? 'row'}`)
  const fieldLabel = sanitizePublicId(fieldPath || 'asset')
  const sourceLabel = sanitizePublicId(path.basename(url.split('?')[0], path.extname(url.split('?')[0])) || rowLabel)
  const folder = `nothing-official-store-pakistan/${sanitizePublicId(table)}/${sanitizePublicId(relatedSlug)}/${sanitizePublicId(mediaType)}`
  const publicId = sanitizePublicId(`${rowLabel}-${fieldLabel}-${sourceLabel}`)
  const tags = ['nothing-official-store-pakistan', 'nothing-official-pakistan', 'pakistan-store', table, mediaType]
  const assetCopy = buildCloudinaryAssetCopy({ table, row, fieldPath, mediaType, relatedSlug })
  const context = [
    cloudinaryContextPair('brand', 'Nothing Official Store Pakistan'),
    cloudinaryContextPair('title', assetCopy.title, 240),
    cloudinaryContextPair('description', assetCopy.description, 900),
    cloudinaryContextPair('alt', assetCopy.alt, 240),
    cloudinaryContextPair('caption', assetCopy.caption, 240),
    cloudinaryContextPair('source_table', table),
    cloudinaryContextPair('source_row_id', row.id ?? ''),
    cloudinaryContextPair('related_slug', relatedSlug),
    cloudinaryContextPair('media_type', mediaType),
    cloudinaryContextPair('seo_terms', 'Pakistan store original Nothing CMF'),
    cloudinaryContextPair('original_extension', extension),
    cloudinaryContextPair('output_extension', outputExtension ?? extension),
  ].filter(Boolean).join('|')
  return { folder, publicId, tags, context }
}

function plannedCloudinaryUrl(target, extension = 'webp') {
  return `cloudinary://planned/${target.folder}/${target.publicId}.${extension}`
}

function concreteCloudinaryUrl(cloudName, resourceType, plannedUrl) {
  if (!plannedUrl.startsWith('cloudinary://planned/')) return plannedUrl
  const assetPath = plannedUrl.slice('cloudinary://planned/'.length)
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${assetPath}`
}

async function convertIfNeeded(buffer, kind) {
  if (kind.resourceType !== 'image') {
    return { buffer, extension: kind.extension, contentType: '' }
  }
  if (PASSTHROUGH_IMAGE_EXTENSIONS.has(kind.extension)) {
    return { buffer, extension: kind.extension, contentType: kind.extension === 'avif' ? 'image/avif' : 'image/webp' }
  }
  const converted = await sharp(buffer, { animated: kind.extension === 'gif' }).webp({ quality: 86 }).toBuffer()
  return { buffer: converted, extension: 'webp', contentType: 'image/webp' }
}

async function uploadToCloudinary({ cloudinaryEnv, buffer, fileName, resourceType, folder, publicId, tags, context, contentType }) {
  const timestamp = Math.floor(Date.now() / 1000)
  const params = {
    context,
    folder,
    overwrite: 'true',
    public_id: publicId,
    tags: tags.join(','),
    timestamp,
  }
  const signature = cloudinarySignature(params, cloudinaryEnv.CLOUDINARY_API_SECRET)
  const formData = new FormData()
  formData.set('file', new Blob([buffer], { type: contentType || 'application/octet-stream' }), fileName)
  formData.set('api_key', cloudinaryEnv.CLOUDINARY_API_KEY)
  formData.set('context', params.context)
  formData.set('folder', params.folder)
  formData.set('overwrite', params.overwrite)
  formData.set('public_id', params.public_id)
  formData.set('tags', params.tags)
  formData.set('timestamp', String(params.timestamp))
  formData.set('signature', signature)

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudinaryEnv.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`
  const response = await fetch(endpoint, { method: 'POST', body: formData })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(`Cloudinary upload failed for ${publicId}: HTTP ${response.status} ${JSON.stringify(body)}`)
  }
  return body
}

async function uploadHtmlAsset({ cloudinaryEnv, html, table, row, field }) {
  const target = buildHtmlAssetTarget({ table, row, field })
  const result = await uploadToCloudinary({
    cloudinaryEnv,
    buffer: Buffer.from(html, 'utf8'),
    fileName: `${target.publicId}.html`,
    resourceType: 'raw',
    folder: target.folder,
    publicId: target.publicId,
    tags: target.tags,
    context: target.context,
    contentType: 'text/html',
  })
  return result.secure_url
}

function buildHtmlAssetTarget({ table, row, field }) {
  const relatedSlug = slugify(row.slug ?? row.name ?? row.title ?? `${table}-${row.id ?? 'row'}`)
  return buildCloudinaryTarget({
    table,
    row,
    fieldPath: field,
    url: `${relatedSlug}-${field}.html`,
    mediaType: 'html',
    relatedSlug,
    extension: 'html',
    outputExtension: 'html',
  })
}

async function uploadRemoteAsset({ url, table, row, fieldPath, maps, cloudinaryEnv, mediaCheck }) {
  const downloaded = await downloadUrl(url)
  const kind = inferMediaKind(url, downloaded.contentType || mediaCheck?.contentType || '')
  const converted = await convertIfNeeded(downloaded.buffer, kind)
  const relatedSlug = relatedSlugForRow(table, row, maps)
  const target = buildCloudinaryTarget({
    table,
    row,
    fieldPath,
    url,
    mediaType: kind.mediaType,
    relatedSlug,
    extension: kind.extension,
    outputExtension: converted.extension,
  })
  const result = await uploadToCloudinary({
    cloudinaryEnv,
    buffer: converted.buffer,
    fileName: `${target.publicId}.${converted.extension}`,
    resourceType: kind.resourceType,
    folder: target.folder,
    publicId: target.publicId,
    tags: target.tags,
    context: target.context,
    contentType: converted.contentType || downloaded.contentType || 'application/octet-stream',
  })
  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    bytes: result.bytes,
    format: result.format,
    originalUrl: url,
  }
}

async function fetchCount(supabase, table) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
  if (error) throw new Error(`Failed to count ${table}: ${error.message}`)
  return count ?? 0
}

async function fetchAllRows(supabase, table) {
  const rows = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1
    const { data, error } = await supabase.from(table).select('*').order('id', { ascending: true }).range(from, to)
    if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`)
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE_SIZE) break
  }
  return rows
}

async function fetchSampleRow(supabase, table) {
  const { data, error } = await supabase.from(table).select('*').limit(1)
  if (error) throw new Error(`Failed to fetch sample row from ${table}: ${error.message}`)
  return data?.[0] ?? null
}

async function fetchDestinationTableColumns(destEnv) {
  const response = await fetch(`${requireEnv(destEnv, 'SUPABASE_URL', 'destination')}/rest/v1/`, {
    headers: {
      apikey: requireEnv(destEnv, 'SUPABASE_SERVICE_ROLE_KEY', 'destination'),
      Authorization: `Bearer ${requireEnv(destEnv, 'SUPABASE_SERVICE_ROLE_KEY', 'destination')}`,
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch destination REST schema: HTTP ${response.status}`)
  }

  const openApi = await response.json()
  const definitions = openApi.definitions ?? openApi.components?.schemas ?? {}
  const columnsByTable = {}
  for (const table of TABLES) {
    const properties = definitions[table]?.properties
    if (!properties) {
      throw new Error(`Destination REST schema does not expose table columns for ${table}`)
    }
    columnsByTable[table] = new Set(Object.keys(properties))
  }
  return columnsByTable
}

function transformSeoRows(rowsByTable, report) {
  const transformed = Object.fromEntries(TABLES.map((table) => [table, (rowsByTable[table] ?? []).map((row) => ({ ...row }))]))
  const productSlugs = new Set()
  const mobileSlugs = new Set()
  const categorySlugs = new Set()
  const blogSlugs = new Set()

  for (const row of transformed.products) {
    const old = { ...row }
    const slug = uniqueSlug(row.slug ?? row.name, productSlugs)
    Object.assign(row, buildProductCopy(row, slug))
    row.schema_json = updateSchemaJson(row.schema_json, row, slug, 'product')
    pushRewriteReport(report, 'products', row.id, old, row)
  }

  for (const row of transformed.mobiles) {
    const old = { ...row }
    const slug = uniqueSlug(row.slug ?? row.name, mobileSlugs)
    Object.assign(row, buildMobileCopy(row, slug))
    row.schema_json = updateSchemaJson(row.schema_json, row, slug, 'mobile')
    pushRewriteReport(report, 'mobiles', row.id, old, row)
  }

  for (const row of transformed.categories) {
    const old = { ...row }
    const slug = uniqueSlug(row.slug ?? row.name, categorySlugs)
    Object.assign(row, buildCategoryCopy(row, slug))
    row.schema_json = updateSchemaJson(row.schema_json, row, slug, 'category')
    pushRewriteReport(report, 'categories', row.id, old, row)
  }

  for (const row of transformed.blogs) {
    const old = { ...row }
    const slug = uniqueSlug(row.slug ?? row.title, blogSlugs)
    Object.assign(row, buildBlogCopy(row, slug))
    row.content = normalizeBrandCopy(row.content)
    pushRewriteReport(report, 'blogs', row.id, old, row)
  }

  for (const row of transformed.faqs) {
    const old = { ...row }
    row.question = rewriteFaqQuestion(row.question, row, transformed)
    row.answer = rewriteFaqAnswer(row.answer, row, transformed)
    pushRewriteReport(report, 'faqs', row.id, old, row)
  }

  for (const [table, rows] of Object.entries(transformed)) {
    for (const row of rows) {
      for (const [key, value] of Object.entries(row)) {
        if (CONTENT_FIELDS.has(key) && typeof value === 'string') {
          row[key] = normalizeBrandCopy(value)
        }
      }
    }
  }

  return transformed
}

function relatedFaqEntity(row, rowsByTable) {
  const table = row.related_type === 'product'
    ? 'products'
    : row.related_type === 'mobile'
      ? 'mobiles'
      : row.related_type === 'category'
        ? 'categories'
        : null
  const relatedRow = table ? (rowsByTable[table] ?? []).find((item) => item.id === row.related_id) : null
  const name = compactText(relatedRow?.name ?? relatedRow?.title ?? '')
  return {
    name: name || 'this item',
    type: row.related_type || 'item',
    price: relatedRow ? priceLabel(relatedRow) : null,
  }
}

function rewriteFaqQuestion(question, row, rowsByTable) {
  const normalized = normalizeBrandCopy(question)
  const entity = relatedFaqEntity(row, rowsByTable)
  if (!normalized) {
    return `What should I confirm before buying ${entity.name} from Nothing Official Store Pakistan?`
  }
  return normalized
}

function faqIntentSentence(question, answer, entity) {
  const text = compactText(`${question} ${answer}`).toLowerCase()
  if (/\b(price|cost|rs|pkr)\b/.test(text)) {
    return `For ${entity.name}, confirm the live ${entity.price ?? 'Pakistan price'} before checkout because stock, variant, and offer changes can affect the final total.`
  }
  if (/\b(compatible|compatibility|fit|supports?|charger|charging|model|phone)\b/.test(text)) {
    return `For ${entity.name}, Nothing Official Store Pakistan recommends checking device compatibility, connector support, and variant details before ordering in Pakistan.`
  }
  if (/\b(deliver|delivery|shipping|order|buy|cash on delivery|cod|checkout|online)\b/.test(text)) {
    return `For ${entity.name}, Pakistan delivery timing, checkout options, and current stock should be confirmed at order time with Nothing Official Store Pakistan.`
  }
  if (/\b(original|authentic|genuine|warranty|support|replace|return)\b/.test(text)) {
    return `For ${entity.name}, buyers should confirm authenticity, support routes, and warranty or after-sales guidance with Nothing Official Store Pakistan before purchase.`
  }
  if (/\b(stock|available|availability|variant|color)\b/.test(text)) {
    return `For ${entity.name}, available stock, color, and variant details can change, so confirm the current listing before placing an order in Pakistan.`
  }
  return `For ${entity.name}, Nothing Official Store Pakistan can help confirm authenticity, compatibility, delivery options, current stock, and support guidance before you place an order.`
}

function rewriteFaqAnswer(answer, row, rowsByTable) {
  const entity = relatedFaqEntity(row, rowsByTable)
  const normalized = normalizeBrandCopy(answer)
  const base = normalized || `This answer applies to ${entity.name} for Pakistan buyers.`
  const sentence = faqIntentSentence(row.question, base, entity)
  const punctuatedBase = /[.!?]$/.test(base) ? base : `${base}.`
  return `${punctuatedBase} ${sentence}`
}

function pushRewriteReport(report, table, id, oldRow, newRow) {
  const changedFields = []
  for (const key of Object.keys(newRow)) {
    if (JSON.stringify(oldRow[key]) !== JSON.stringify(newRow[key])) {
      changedFields.push(key)
    }
  }
  if (changedFields.length > 0) {
    report.contentRewrites.push({ table, id, changedFields })
  }
}

function findHtmlFields(rowsByTable) {
  const htmlFields = []
  for (const [table, rows] of Object.entries(rowsByTable)) {
    for (const row of rows) {
      for (const [field, value] of Object.entries(row)) {
        if (typeof value !== 'string') continue
        if (!CONTENT_FIELDS.has(field) && field !== 'short_description') continue
        if (HTML_FIELD_RE.test(value)) {
          htmlFields.push({ table, id: row.id, field, length: value.length })
        }
      }
    }
  }
  return htmlFields
}

async function buildMediaPlan(rowsByTable, sourceEnv, options, report) {
  const maps = buildContextMaps(rowsByTable)
  const occurrences = []
  const urlsByValue = new Map()

  for (const [table, rows] of Object.entries(rowsByTable)) {
    for (const row of rows) {
      const rowUrls = collectUrls(row)
      for (const item of rowUrls) {
        const occurrence = {
          table,
          id: row.id ?? null,
          fieldPath: item.path,
          url: item.url,
          legacy: LEGACY_HOST_RE.test(item.url),
          ownedOrAllowed: isOwnedOrAllowedUrl(item.url, sourceEnv, options),
        }
        occurrences.push(occurrence)
        if (!urlsByValue.has(item.url)) urlsByValue.set(item.url, [])
        urlsByValue.get(item.url).push(occurrence)
      }
    }
  }

  const uniqueUrls = Array.from(urlsByValue.keys()).sort()
  const candidateUrls = uniqueUrls.filter((url) => {
    const occurrence = urlsByValue.get(url)[0]
    return hasMediaExtension(url) || isMediaFieldPath(occurrence.table, occurrence.fieldPath)
  })
  const checks = new Map()
  if (!options.skipMediaChecks) {
    await mapLimit(candidateUrls, MAX_PARALLEL_MEDIA_CHECKS, async (url) => {
      checks.set(url, await checkUrl(url))
    })
  }

  const replacements = new Map()
  const skipped = []
  const nonMedia = []
  const planned = []

  for (const url of uniqueUrls) {
    const occurrence = urlsByValue.get(url)[0]
    const mediaCandidate = hasMediaExtension(url) || isMediaFieldPath(occurrence.table, occurrence.fieldPath)
    if (!mediaCandidate) {
      nonMedia.push({ url, occurrences: urlsByValue.get(url).length, reason: 'non_media_url' })
      continue
    }

    const check = checks.get(url) ?? { ok: true, status: 'not_checked', contentType: '', contentLength: null }
    const kind = inferMediaKind(url, check.contentType)
    const confirmedMedia = kind.resourceType !== 'raw' || ['svg', 'html', 'htm', 'pdf'].includes(kind.extension) || isMediaFieldPath(occurrence.table, occurrence.fieldPath)
    if (!confirmedMedia) {
      nonMedia.push({ url, occurrences: urlsByValue.get(url).length, reason: 'non_media_url', check })
      continue
    }

    if (!occurrence.ownedOrAllowed) {
      skipped.push({
        url,
        reason: 'external_media_requires_business_reuse_confirmation',
        occurrences: urlsByValue.get(url).length,
        occurrenceSamples: urlsByValue.get(url).slice(0, 10),
        check,
      })
      continue
    }
    if (!check.ok) {
      skipped.push({
        url,
        reason: 'broken_or_unreachable_media',
        occurrences: urlsByValue.get(url).length,
        occurrenceSamples: urlsByValue.get(url).slice(0, 10),
        check,
      })
      continue
    }

    const row = rowsByTable[occurrence.table].find((candidate) => candidate.id === occurrence.id) ?? {}
    const relatedSlug = relatedSlugForRow(occurrence.table, row, maps)
    const target = buildCloudinaryTarget({
      table: occurrence.table,
      row,
      fieldPath: occurrence.fieldPath,
      url,
      mediaType: kind.mediaType,
      relatedSlug,
      extension: kind.extension,
    })
    const plannedExtension = kind.resourceType === 'image' && !PASSTHROUGH_IMAGE_EXTENSIONS.has(kind.extension) ? 'webp' : kind.extension
    const plannedUrl = plannedCloudinaryUrl(target, plannedExtension)
    replacements.set(url, plannedUrl)
    planned.push({
      url,
      occurrences: urlsByValue.get(url).length,
      resourceType: kind.resourceType,
      mediaType: kind.mediaType,
      conversion: kind.resourceType === 'image' && !PASSTHROUGH_IMAGE_EXTENSIONS.has(kind.extension) ? `${kind.extension || 'image'} -> webp` : 'none',
      target: { folder: target.folder, publicId: target.publicId, tags: target.tags },
      plannedUrl,
      check,
    })
  }

  report.media = {
    uniqueUrls: uniqueUrls.length,
    occurrences: occurrences.length,
    plannedReplacements: planned.length,
    skippedCount: skipped.length,
    nonMediaCount: nonMedia.length,
    planned,
    skipped,
    nonMedia,
  }

  return { replacements, checks, maps, occurrences, skipped, planned }
}

async function applyMediaReplacements(rowsByTable, mediaPlan, options, cloudinaryEnv, report) {
  if (options.dryRun) {
    for (const [table, rows] of Object.entries(rowsByTable)) {
      rowsByTable[table] = rows.map((row) => replaceUrlsInValue(row, mediaPlan.replacements))
    }
    return rowsByTable
  }

  if (options.usePlannedCloudinaryUrls) {
    const plannedByUrl = new Map(mediaPlan.planned.map((item) => [item.url, item]))
    const concreteReplacements = new Map()
    const plannedUploads = []
    for (const [url, plannedUrl] of mediaPlan.replacements.entries()) {
      const planned = plannedByUrl.get(url)
      if (!planned) continue
      const secureUrl = concreteCloudinaryUrl(cloudinaryEnv.CLOUDINARY_CLOUD_NAME, planned.resourceType, plannedUrl)
      concreteReplacements.set(url, secureUrl)
      plannedUploads.push({
        secureUrl,
        originalUrl: url,
        publicId: planned.target.publicId,
        resourceType: planned.resourceType,
        plannedOnly: true,
      })
    }
    for (const [table, rows] of Object.entries(rowsByTable)) {
      rowsByTable[table] = rows.map((row) => replaceUrlsInValue(row, concreteReplacements))
    }
    report.media.uploaded = plannedUploads
    report.media.usedPlannedCloudinaryUrls = true
    return rowsByTable
  }

  const uploadResults = []
  const uploadFailures = []
  const realReplacements = new Map()
  const uploadableUrls = Array.from(mediaPlan.replacements.keys())

  await mapLimit(uploadableUrls, MAX_PARALLEL_UPLOADS, async (url) => {
    const occurrence = mediaPlan.occurrences.find((item) => item.url === url)
    try {
      if (!occurrence) {
        throw new Error('No media occurrence found for planned replacement URL.')
      }
      const row = rowsByTable[occurrence.table].find((candidate) => candidate.id === occurrence.id) ?? {}
      const result = await uploadRemoteAsset({
        url,
        table: occurrence.table,
        row,
        fieldPath: occurrence.fieldPath,
        maps: mediaPlan.maps,
        cloudinaryEnv,
        mediaCheck: mediaPlan.checks.get(url),
      })
      realReplacements.set(url, result.secureUrl)
      uploadResults.push(result)
    } catch (error) {
      uploadFailures.push({
        url,
        reason: 'download_or_upload_failed_during_replace',
        occurrences: mediaPlan.occurrences.filter((item) => item.url === url).length,
        occurrenceSamples: mediaPlan.occurrences.filter((item) => item.url === url).slice(0, 10),
        error: error.message,
      })
    }
  })

  if (uploadFailures.length > 0) {
    report.media.uploadFailures = uploadFailures
    report.media.skipped.push(...uploadFailures)
    report.media.skippedCount = report.media.skipped.length
    if (!options.dropSkippedMedia) {
      throw new Error(`${uploadFailures.length} media uploads failed during replace. Rerun with --drop-skipped-media to remove those URLs or retry after fixing availability.`)
    }
    rowsByTable = dropSkippedMedia(rowsByTable, uploadFailures, report)
  }

  for (const [table, rows] of Object.entries(rowsByTable)) {
    rowsByTable[table] = rows.map((row) => replaceUrlsInValue(row, realReplacements))
  }

  report.media.uploaded = uploadResults
  return rowsByTable
}

async function applyHtmlUploads(rowsByTable, options, cloudinaryEnv, report) {
  const htmlFields = findHtmlFields(rowsByTable).map((fieldInfo) => {
    const row = rowsByTable[fieldInfo.table].find((candidate) => candidate.id === fieldInfo.id) ?? {}
    const target = buildHtmlAssetTarget({ table: fieldInfo.table, row, field: fieldInfo.field })
    return {
      ...fieldInfo,
      target: {
        folder: target.folder,
        publicId: target.publicId,
        tags: target.tags,
      },
      plannedUrl: plannedCloudinaryUrl(target, 'html'),
    }
  })
  report.htmlAssets = {
    plannedCount: htmlFields.length,
    planned: htmlFields,
    uploaded: [],
  }

  if (options.dryRun) return rowsByTable

  for (const fieldInfo of htmlFields) {
    const row = rowsByTable[fieldInfo.table].find((candidate) => candidate.id === fieldInfo.id)
    if (!row || typeof row[fieldInfo.field] !== 'string') continue
    const secureUrl = await uploadHtmlAsset({
      cloudinaryEnv,
      html: row[fieldInfo.field],
      table: fieldInfo.table,
      row,
      field: fieldInfo.field,
    })
    row[fieldInfo.field] = secureUrl
    report.htmlAssets.uploaded.push({ ...fieldInfo, secureUrl })
  }

  return rowsByTable
}

function validateRows(rowsByTable, report, replacements, options) {
  const validations = {
    slugUniqueness: [],
    legacyUrlHits: [],
    relations: [],
  }

  for (const table of ['products', 'mobiles', 'categories']) {
    const seen = new Map()
    for (const row of rowsByTable[table] ?? []) {
      if (!row.slug) continue
      if (seen.has(row.slug)) {
        validations.slugUniqueness.push({ table, slug: row.slug, ids: [seen.get(row.slug), row.id] })
      } else {
        seen.set(row.slug, row.id)
      }
    }
  }

  for (const [table, rows] of Object.entries(rowsByTable)) {
    for (const row of rows) {
      for (const { url, path: fieldPath } of collectUrls(row)) {
        if (LEGACY_HOST_RE.test(url) && !String(fieldPath).startsWith('archived')) {
          validations.legacyUrlHits.push({ table, id: row.id ?? null, fieldPath, url })
        }
      }
      for (const [field, value] of Object.entries(row)) {
        if (typeof value === 'string' && LEGACY_HOST_RE.test(value)) {
          validations.legacyUrlHits.push({ table, id: row.id ?? null, fieldPath: field, value: truncate(value, 180) })
        }
      }
    }
  }

  const productIds = new Set((rowsByTable.products ?? []).map((row) => row.id))
  const mobileIds = new Set((rowsByTable.mobiles ?? []).map((row) => row.id))
  const categoryIds = new Set((rowsByTable.categories ?? []).map((row) => row.id))
  const colorIds = new Set((rowsByTable.colors ?? []).map((row) => row.id))
  const userIds = new Set((rowsByTable.users ?? []).map((row) => row.id))
  const specGroupIds = new Set((rowsByTable.spec_groups ?? []).map((row) => row.id))
  const featureSectionIds = new Set((rowsByTable.product_feature_sections ?? []).map((row) => row.id))

  for (const row of rowsByTable.categories ?? []) {
    if (row.parent_id && !categoryIds.has(row.parent_id)) validations.relations.push({ table: 'categories', id: row.id, field: 'parent_id', missingId: row.parent_id })
  }
  for (const row of rowsByTable.products ?? []) {
    if (row.main_color_id && !colorIds.has(row.main_color_id)) validations.relations.push({ table: 'products', id: row.id, field: 'main_color_id', missingId: row.main_color_id })
  }
  for (const row of rowsByTable.images ?? []) {
    if (row.color_id && !colorIds.has(row.color_id)) validations.relations.push({ table: 'images', id: row.id, field: 'color_id', missingId: row.color_id })
    validateRelated(row, 'images', validations, productIds, mobileIds, categoryIds)
  }
  for (const row of rowsByTable.faqs ?? []) {
    validateRelated(row, 'faqs', validations, productIds, mobileIds, categoryIds)
  }
  for (const row of rowsByTable.spec_groups ?? []) {
    validateRelated(row, 'spec_groups', validations, productIds, mobileIds, categoryIds)
  }
  for (const row of rowsByTable.spec_group_items ?? []) {
    if (!specGroupIds.has(row.spec_group_id)) validations.relations.push({ table: 'spec_group_items', id: row.id, field: 'spec_group_id', missingId: row.spec_group_id })
  }
  for (const row of rowsByTable.product_feature_sections ?? []) {
    validateRelated(row, 'product_feature_sections', validations, productIds, mobileIds, categoryIds)
  }
  for (const row of rowsByTable.product_feature_slides ?? []) {
    if (!featureSectionIds.has(row.product_feature_section_id)) validations.relations.push({ table: 'product_feature_slides', id: row.id, field: 'product_feature_section_id', missingId: row.product_feature_section_id })
  }
  for (const row of rowsByTable.category_relations ?? []) {
    if (!categoryIds.has(row.category_id)) validations.relations.push({ table: 'category_relations', id: row.id, field: 'category_id', missingId: row.category_id })
    validateRelated(row, 'category_relations', validations, productIds, mobileIds, categoryIds)
  }
  for (const row of rowsByTable.product_mobiles ?? []) {
    if (row.product_id && !productIds.has(row.product_id)) validations.relations.push({ table: 'product_mobiles', id: row.id, field: 'product_id', missingId: row.product_id })
    if (row.mobile_id && !mobileIds.has(row.mobile_id)) validations.relations.push({ table: 'product_mobiles', id: row.id, field: 'mobile_id', missingId: row.mobile_id })
  }
  for (const row of rowsByTable.reviews ?? []) {
    if (row.product_id && !productIds.has(row.product_id)) validations.relations.push({ table: 'reviews', id: row.id, field: 'product_id', missingId: row.product_id })
  }
  for (const row of rowsByTable.orders ?? []) {
    if (row.user_id && !userIds.has(row.user_id)) validations.relations.push({ table: 'orders', id: row.id, field: 'user_id', missingId: row.user_id })
  }

  validations.ok = validations.slugUniqueness.length === 0 && validations.legacyUrlHits.length === 0 && validations.relations.length === 0
  validations.relationSummary = summarizeRelationIssues(validations.relations)
  validations.note = options.dryRun
    ? 'Dry-run validates transformed rows before writing. Cloudinary 200 checks are performed only after real uploads in replace mode.'
    : 'Replace mode validates transformed rows before insertion and destination rows after insertion.'
  report.validations = validations
  return validations
}

function summarizeRelationIssues(relations) {
  const byTable = {}
  const missingByRelation = {}
  for (const issue of relations) {
    byTable[issue.table] = (byTable[issue.table] ?? 0) + 1
    const relationKey = issue.related_type
      ? `${issue.table}.${issue.related_type}`
      : `${issue.table}.${issue.field ?? 'unknown'}`
    if (!missingByRelation[relationKey]) {
      missingByRelation[relationKey] = {
        count: 0,
        missingIds: [],
      }
    }
    missingByRelation[relationKey].count += 1
    if (issue.missingId !== undefined && !missingByRelation[relationKey].missingIds.includes(issue.missingId)) {
      missingByRelation[relationKey].missingIds.push(issue.missingId)
    }
  }

  for (const value of Object.values(missingByRelation)) {
    value.missingIds.sort((a, b) => Number(a) - Number(b))
  }

  return {
    total: relations.length,
    byTable,
    missingByRelation,
  }
}

function validateRelated(row, table, validations, productIds, mobileIds, categoryIds) {
  if (row.related_type === 'product' && !productIds.has(row.related_id)) {
    validations.relations.push({ table, id: row.id, related_type: row.related_type, missingId: row.related_id })
  }
  if (row.related_type === 'mobile' && !mobileIds.has(row.related_id)) {
    validations.relations.push({ table, id: row.id, related_type: row.related_type, missingId: row.related_id })
  }
  if (row.related_type === 'category' && !categoryIds.has(row.related_id)) {
    validations.relations.push({ table, id: row.id, related_type: row.related_type, missingId: row.related_id })
  }
}

function pruneOrphanRows(rowsByTable, validations, report) {
  const prunableTables = new Set([
    'images',
    'faqs',
    'category_relations',
    'product_mobiles',
    'reviews',
    'spec_group_items',
    'product_feature_slides',
  ])
  const pruneKeys = new Set()
  const removed = []
  const unprunable = []

  for (const issue of validations.relations) {
    if (!prunableTables.has(issue.table) || issue.id === undefined || issue.id === null) {
      unprunable.push(issue)
      continue
    }
    pruneKeys.add(`${issue.table}:${issue.id}`)
  }

  for (const table of Object.keys(rowsByTable)) {
    const rows = rowsByTable[table] ?? []
    if (!prunableTables.has(table)) continue
    const nextRows = []
    for (const row of rows) {
      const key = `${table}:${row.id}`
      if (pruneKeys.has(key)) {
        removed.push({ table, id: row.id })
      } else {
        nextRows.push(row)
      }
    }
    rowsByTable[table] = nextRows
  }

  const removedByTable = removed.reduce((acc, item) => {
    acc[item.table] = (acc[item.table] ?? 0) + 1
    return acc
  }, {})

  report.orphanPruning = {
    enabled: true,
    removedCount: removed.length,
    removedByTable,
    removed,
    unprunableCount: unprunable.length,
    unprunable,
    note: 'Opt-in pruning removes dependent rows whose parent rows are missing from the selected migration tables. This intentionally makes destination row counts differ from raw source counts for those dependent tables.',
  }

  return rowsByTable
}

function dropSkippedMedia(rowsByTable, skipped, report) {
  const previous = report.skippedMediaDropping
  const skippedUrls = new Set(skipped.map((item) => item.url))
  const requiredImageRowIds = new Set()
  const removedRequiredImageRows = []

  for (const item of skipped) {
    for (const occurrence of item.occurrenceSamples ?? []) {
      if (occurrence.table === 'images' && occurrence.fieldPath === 'url') {
        requiredImageRowIds.add(occurrence.id)
      }
    }
  }

  for (const row of rowsByTable.images ?? []) {
    if (typeof row.url === 'string' && skippedUrls.has(row.url)) {
      requiredImageRowIds.add(row.id)
    }
  }

  if (requiredImageRowIds.size > 0) {
    rowsByTable.images = (rowsByTable.images ?? []).filter((row) => {
      if (!requiredImageRowIds.has(row.id)) return true
      removedRequiredImageRows.push({ id: row.id, url: row.url })
      return false
    })
  }

  for (const [table, rows] of Object.entries(rowsByTable)) {
    rowsByTable[table] = rows.map((row) => {
      if (table === 'images' && requiredImageRowIds.has(row.id)) return row
      return removeSkippedUrlsFromValue(row, skippedUrls)
    })
  }

  const batch = {
    skippedUrlCount: skippedUrls.size,
    removedRequiredImageRows,
    strippedUrlCount: skippedUrls.size,
  }

  report.skippedMediaDropping = {
    enabled: true,
    skippedUrlCount: (previous?.skippedUrlCount ?? 0) + batch.skippedUrlCount,
    removedRequiredImageRows: [...(previous?.removedRequiredImageRows ?? []), ...removedRequiredImageRows],
    strippedUrlCount: (previous?.strippedUrlCount ?? 0) + batch.strippedUrlCount,
    batches: [...(previous?.batches ?? []), batch],
    note: 'Opt-in mode removes skipped external/broken media URLs from transformed rows. Required images.url rows are pruned because images.url is not nullable.',
  }

  return rowsByTable
}

function findSkippedUrlHits(rowsByTable, skipped) {
  const skippedUrls = new Set(skipped.map((item) => item.url))
  const hits = []

  for (const [table, rows] of Object.entries(rowsByTable)) {
    for (const row of rows) {
      for (const occurrence of collectUrls(row)) {
        if (skippedUrls.has(occurrence.url)) {
          hits.push({
            table,
            id: row.id ?? null,
            fieldPath: occurrence.path,
            url: occurrence.url,
          })
        }
      }
    }
  }

  return hits
}

async function deleteDestinationRows(dest) {
  for (const table of DELETE_ORDER) {
    const { error } = await dest.from(table).delete().gte('id', 0)
    if (error) throw new Error(`Failed to clear ${table}: ${error.message}`)
  }
}

function filterRowsToDestinationColumns(rowsByTable, columnsByTable, report) {
  const stripped = []
  const filteredRowsByTable = {}

  for (const [table, rows] of Object.entries(rowsByTable)) {
    const columns = columnsByTable[table]
    if (!columns) {
      filteredRowsByTable[table] = rows
      continue
    }

    filteredRowsByTable[table] = rows.map((row) => {
      const filtered = {}
      for (const [key, value] of Object.entries(row)) {
        if (columns.has(key)) {
          filtered[key] = value
        } else {
          stripped.push({ table, id: row.id ?? null, field: key })
        }
      }
      return filtered
    })
  }

  const strippedByTable = stripped.reduce((acc, item) => {
    acc[item.table] = (acc[item.table] ?? 0) + 1
    return acc
  }, {})

  report.destinationColumnFiltering = {
    strippedCount: stripped.length,
    strippedByTable,
    strippedSamples: stripped.slice(0, 200),
  }

  return filteredRowsByTable
}

async function insertRows(dest, table, rows) {
  if (!rows.length) return
  for (let index = 0; index < rows.length; index += 500) {
    const chunk = rows.slice(index, index + 500)
    const { error } = await dest.from(table).insert(chunk)
    if (error) throw new Error(`Failed to insert ${table}: ${error.message}`)
  }
}

async function insertDestinationRows(dest, rowsByTable, columnsByTable, report) {
  rowsByTable = filterRowsToDestinationColumns(rowsByTable, columnsByTable, report)
  const categories = rowsByTable.categories ?? []
  const categoriesWithParent = categories.filter((row) => row.parent_id)
  if (categories.length) {
    rowsByTable.categories = categories.map((row) => ({ ...row, parent_id: null }))
  }

  for (const table of INSERT_ORDER) {
    await insertRows(dest, table, rowsByTable[table] ?? [])
  }

  for (const row of categoriesWithParent) {
    const { error } = await dest.from('categories').update({ parent_id: row.parent_id }).eq('id', row.id)
    if (error) throw new Error(`Failed to restore category parent_id for ${row.id}: ${error.message}`)
  }

  rowsByTable.categories = categories
}

function sequenceSql(table) {
  return `select setval(pg_get_serial_sequence('public.${table}', 'id'), coalesce((select max(id) from public.${table}), 0) + 1, false);`
}

async function resetSequencesIfPossible(dest, report) {
  const sqlStatements = TABLES.map(sequenceSql)
  report.sequenceReset = {
    attempted: true,
    method: null,
    ok: false,
    manualSql: sqlStatements,
  }

  const fixedHelper = await dest.rpc('reset_nothing_official_migration_sequences')
  if (!fixedHelper.error) {
    report.sequenceReset.method = 'rpc:reset_nothing_official_migration_sequences'
    report.sequenceReset.ok = true
    return
  }
  report.sequenceReset.fixedHelperError = fixedHelper.error.message

  const resetSequenceResults = []
  let resetSequenceOk = true
  for (const table of TABLES) {
    const { error } = await dest.rpc('reset_sequence', { table_name: `public.${table}` })
    resetSequenceResults.push({ table, ok: !error, error: error?.message ?? null })
    if (error) {
      resetSequenceOk = false
      break
    }
  }
  if (resetSequenceOk) {
    report.sequenceReset.method = 'rpc:reset_sequence(table_name)'
    report.sequenceReset.ok = true
    report.sequenceReset.resetSequenceResults = resetSequenceResults
    return
  }
  report.sequenceReset.resetSequenceResults = resetSequenceResults

  for (const rpcName of ['exec_sql', 'execute_sql', 'run_sql']) {
    const { error } = await dest.rpc(rpcName, { sql: sqlStatements.join('\n') })
    if (!error) {
      report.sequenceReset.method = `rpc:${rpcName}`
      report.sequenceReset.ok = true
      return
    }
    report.sequenceReset.lastError = `${rpcName}: ${error.message}`
  }
}

async function detectSequenceResetMethod(dest) {
  const fixedHelper = await dest.rpc('nothing_official_migration_sequence_reset_ready')
  if (!fixedHelper.error) return 'rpc:reset_nothing_official_migration_sequences'

  const resetSequence = await dest.rpc('reset_sequence', { table_name: 'public.colors' })
  if (!resetSequence.error) return 'rpc:reset_sequence(table_name)'

  for (const rpcName of ['exec_sql', 'execute_sql', 'run_sql']) {
    const { error } = await dest.rpc(rpcName, { sql: 'select 1;' })
    if (!error) return `rpc:${rpcName}`
  }
  return null
}

async function validateCloudinaryUrls(report) {
  const uploaded = [...(report.media.uploaded ?? []), ...(report.htmlAssets.uploaded ?? [])]
  const urls = uploaded.map((item) => item.secureUrl).filter(Boolean)
  const checks = []
  await mapLimit(urls, MAX_PARALLEL_MEDIA_CHECKS, async (url) => {
    checks.push({ url, ...(await checkUrl(url)) })
  })
  report.cloudinaryValidation = {
    checked: checks.length,
    failed: checks.filter((check) => !check.ok),
    checks,
  }
}

async function validateDestinationCounts(dest, expectedCounts, report) {
  const destinationCounts = {}
  for (const table of TABLES) {
    destinationCounts[table] = await fetchCount(dest, table)
  }
  report.destinationAfterCounts = destinationCounts
  report.destinationExpectedCounts = expectedCounts
  report.destinationCountMatches = Object.fromEntries(TABLES.map((table) => [table, destinationCounts[table] === expectedCounts[table]]))
}

async function fetchDestinationRows(dest) {
  const rowsByTable = {}
  for (const table of TABLES) {
    rowsByTable[table] = await fetchAllRows(dest, table)
  }
  return rowsByTable
}

async function validateDestinationRows(dest, mediaPlan, report, options) {
  const destinationRows = await fetchDestinationRows(dest)
  const destinationValidationReport = {}
  const destinationValidations = validateRows(destinationRows, destinationValidationReport, mediaPlan.replacements, options)
  const skippedUrlHits = mediaPlan.skipped.length > 0 ? findSkippedUrlHits(destinationRows, mediaPlan.skipped) : []

  report.destinationValidations = {
    ok: destinationValidations.ok && skippedUrlHits.length === 0,
    slugUniqueness: destinationValidations.slugUniqueness,
    legacyUrlHits: destinationValidations.legacyUrlHits,
    relations: destinationValidations.relations,
    relationSummary: destinationValidations.relationSummary,
    skippedUrlHits: skippedUrlHits.length,
    skippedUrlHitSamples: skippedUrlHits.slice(0, 200),
  }

  return report.destinationValidations
}

function writeReport(report, mode) {
  mkdirSync(REPORT_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const reportPath = path.join(REPORT_DIR, `${stamp}-${mode}.json`)
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  return reportPath
}

function findLatestReportPath(mode = null) {
  if (!existsSync(REPORT_DIR)) {
    throw new Error(`Report directory does not exist: ${REPORT_DIR}`)
  }

  const files = readdirSync(REPORT_DIR)
    .filter((file) => file.endsWith('.json'))
    .filter((file) => !mode || file.endsWith(`-${mode}.json`))
    .sort()

  if (files.length === 0) {
    throw new Error(`No ${mode ? `${mode} ` : ''}JSON reports found in ${REPORT_DIR}`)
  }

  return path.join(REPORT_DIR, files[files.length - 1])
}

function summarizeContentRewrites(report) {
  const rewrites = report.contentRewrites ?? []
  const removedKeys = new Set((report.orphanPruning?.removed ?? []).map((item) => `${item.table}:${item.id}`))
  const keptRewrites = rewrites.filter((item) => !removedKeys.has(`${item.table}:${item.id}`))
  const byTable = (items) => items.reduce((acc, item) => {
    acc[item.table] = (acc[item.table] ?? 0) + 1
    return acc
  }, {})

  return {
    count: rewrites.length,
    byTable: byTable(rewrites),
    keptAfterPruningCount: keptRewrites.length,
    keptAfterPruningByTable: byTable(keptRewrites),
  }
}

function summarizeReport(reportPath) {
  const resolvedPath = path.isAbsolute(reportPath) ? reportPath : path.resolve(DEST_ROOT, reportPath)
  const report = JSON.parse(readFileSync(resolvedPath, 'utf8'))
  const sourceCounts = report.sourceCounts ?? {}
  const transformedCounts = report.transformedCounts ?? null
  const countMismatches = transformedCounts
    ? Object.fromEntries(
        TABLES
          .filter((table) => sourceCounts[table] !== transformedCounts[table])
          .map((table) => [table, { source: sourceCounts[table], transformed: transformedCounts[table] }]),
      )
    : null

  return {
    reportPath: resolvedPath,
    mode: report.mode,
    generatedAt: report.generatedAt,
    preflight: report.preflight ?? null,
    counts: {
      source: sourceCounts,
      destinationBefore: report.destinationBeforeCounts ?? null,
      transformed: transformedCounts,
      mismatches: countMismatches,
      destinationAfter: report.destinationAfterCounts ?? null,
      destinationExpected: report.destinationExpectedCounts ?? null,
      destinationCountMatches: report.destinationCountMatches ?? null,
    },
    media: report.media
      ? {
          uniqueUrls: report.media.uniqueUrls,
          plannedReplacements: report.media.plannedReplacements,
          skippedCount: report.media.skippedCount,
          skippedReasons: (report.media.skipped ?? []).reduce((acc, item) => {
            acc[item.reason] = (acc[item.reason] ?? 0) + 1
            return acc
          }, {}),
          nonMediaCount: report.media.nonMediaCount,
        }
      : null,
    htmlAssets: report.htmlAssets
      ? {
          plannedCount: report.htmlAssets.plannedCount,
          uploadedCount: report.htmlAssets.uploaded?.length ?? 0,
        }
      : null,
    contentRewrites: summarizeContentRewrites(report),
    validations: report.validations
      ? {
          ok: report.validations.ok,
          slugConflicts: report.validations.slugUniqueness?.length ?? 0,
          legacyUrlHits: report.validations.legacyUrlHits?.length ?? 0,
          relationIssues: report.validations.relations?.length ?? 0,
          relationSummary: report.validations.relationSummary ?? null,
        }
      : null,
    orphanPruning: report.orphanPruning
      ? {
          removedCount: report.orphanPruning.removedCount,
          removedByTable: report.orphanPruning.removedByTable,
          unprunableCount: report.orphanPruning.unprunableCount,
        }
      : null,
    skippedMediaDropping: report.skippedMediaDropping
      ? {
          skippedUrlCount: report.skippedMediaDropping.skippedUrlCount,
          removedRequiredImageRows: report.skippedMediaDropping.removedRequiredImageRows?.length ?? 0,
          strippedUrlCount: report.skippedMediaDropping.strippedUrlCount,
        }
      : null,
    skippedMediaValidation: report.skippedMediaValidation ?? null,
    destinationValidations: report.destinationValidations ?? null,
    cloudinaryValidation: report.cloudinaryValidation
      ? {
          checked: report.cloudinaryValidation.checked,
          failed: report.cloudinaryValidation.failed?.length ?? 0,
        }
      : null,
    sequenceReset: report.sequenceReset ?? null,
    blocked: report.blocked ?? false,
    blockReason: report.blockReason ?? null,
  }
}

async function main() {
  const options = parseArgs()
  if (options.summary || options.summaryMode) {
    const reportPath = options.summaryPath ? path.resolve(DEST_ROOT, options.summaryPath) : findLatestReportPath(options.summaryMode)
    console.log(JSON.stringify(summarizeReport(reportPath), null, 2))
    return
  }

  if (options.replace && !options.confirmReplace) {
    throw new Error('Refusing destructive replacement without --confirm-replace.')
  }

  const sourceEnv = loadEnvFile(SOURCE_ENV_PATH)
  const destEnv = loadEnvFile(DEST_ENV_PATH)
  const source = createSupabase(sourceEnv, 'source')
  const dest = createSupabase(destEnv, 'destination')

  if (!options.dryRun) {
    for (const key of ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']) {
      requireEnv(destEnv, key, 'destination')
    }
  }

  const report = {
    mode: options.preflight ? 'preflight' : options.dryRun ? 'dry-run' : 'replace',
    generatedAt: new Date().toISOString(),
    sourceRoot: SOURCE_ROOT,
    destinationRoot: DEST_ROOT,
    canonicalSiteUrl: CANONICAL_SITE_URL,
    options: {
      preflight: options.preflight,
      allowExternalMedia: options.allowExternalMedia,
      allowMissingSequenceReset: options.allowMissingSequenceReset,
      pruneOrphans: options.pruneOrphans,
      dropSkippedMedia: options.dropSkippedMedia,
      skipMediaChecks: options.skipMediaChecks,
      skipCloudinaryValidation: options.skipCloudinaryValidation,
      usePlannedCloudinaryUrls: options.usePlannedCloudinaryUrls,
    },
    tables: {},
    contentRewrites: [],
  }
  const destinationColumnsByTable = await fetchDestinationTableColumns(destEnv)
  report.destinationColumns = Object.fromEntries(
    Object.entries(destinationColumnsByTable).map(([table, columns]) => [table, Array.from(columns).sort()]),
  )

  const sourceCounts = {}
  const destinationCounts = {}
  for (const table of TABLES) {
    sourceCounts[table] = await fetchCount(source, table)
    destinationCounts[table] = await fetchCount(dest, table)
    const sourceSampleRow = await fetchSampleRow(source, table)
    report.tables[table] = {
      sourceCount: sourceCounts[table],
      destinationCount: destinationCounts[table],
      sourceColumns: sourceSampleRow ? Object.keys(sourceSampleRow) : [],
    }
  }
  report.sourceCounts = sourceCounts
  report.destinationBeforeCounts = destinationCounts

  if (options.preflight) {
    const sequenceResetMethod = await detectSequenceResetMethod(dest)
    const destinationProjectRef = new URL(requireEnv(destEnv, 'SUPABASE_URL', 'destination')).hostname.split('.')[0]
    const sequenceResetDashboardSqlUrl = `https://supabase.com/dashboard/project/${destinationProjectRef}/sql/new`
    const sourceTablesReadable = TABLES.every((table) => typeof sourceCounts[table] === 'number')
    const destinationTablesReadable = TABLES.every((table) => typeof destinationCounts[table] === 'number')
    const destinationEmpty = TABLES.every((table) => destinationCounts[table] === 0)
    const cloudinaryCredentialsPresent = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].every((key) => Boolean(destEnv[key]))
    report.preflight = {
      ok: sourceTablesReadable && destinationTablesReadable && destinationEmpty && cloudinaryCredentialsPresent && Boolean(sequenceResetMethod),
      sourceTablesReadable,
      destinationTablesReadable,
      destinationEmpty,
      cloudinaryCredentialsPresent,
      destinationProjectRef,
      sequenceResetMethod,
      sequenceResetHelperSql: path.join(DEST_ROOT, 'supabase', 'migration-sequence-reset.sql'),
      sequenceResetMigrationSql: path.join(DEST_ROOT, 'supabase', 'migrations', '20260603225600_nothing_official_migration_sequence_reset.sql'),
      sequenceResetDashboardSqlUrl,
      note: sequenceResetMethod
        ? 'Sequence reset helper is reachable. A replace run can reset serial sequences after inserts.'
        : `Sequence reset helper is not reachable. Run supabase/migration-sequence-reset.sql in the destination Supabase SQL editor before replace: ${sequenceResetDashboardSqlUrl}. Use --allow-missing-sequence-reset only if resetting sequences manually.`,
    }
    const reportPath = writeReport(report, report.mode)
    console.log(JSON.stringify({ mode: report.mode, reportPath, preflight: report.preflight, sourceCounts, destinationBeforeCounts: destinationCounts }, null, 2))
    return
  }

  const sourceRows = {}
  for (const table of TABLES) {
    sourceRows[table] = await fetchAllRows(source, table)
  }

  let transformedRows = transformSeoRows(sourceRows, report)
  const preMediaReport = {}
  const preMediaValidations = validateRows(transformedRows, preMediaReport, new Map(), options)
  report.preMediaValidations = {
    ok: preMediaValidations.ok,
    slugUniqueness: preMediaValidations.slugUniqueness,
    relations: preMediaValidations.relations,
    relationSummary: preMediaValidations.relationSummary,
  }
  if (options.pruneOrphans && preMediaValidations.relations.length > 0) {
    transformedRows = pruneOrphanRows(transformedRows, preMediaValidations, report)
  }
  const postPruneReport = {}
  const postPruneValidations = options.pruneOrphans
    ? validateRows(transformedRows, postPruneReport, new Map(), options)
    : preMediaValidations
  if (options.pruneOrphans) {
    report.postPruneValidations = {
      ok: postPruneValidations.ok,
      slugUniqueness: postPruneValidations.slugUniqueness,
      relations: postPruneValidations.relations,
      relationSummary: postPruneValidations.relationSummary,
    }
  }
  if (!options.dryRun && (postPruneValidations.slugUniqueness.length > 0 || postPruneValidations.relations.length > 0)) {
    report.blocked = true
    report.blockReason = 'Relation or slug validation failed before any Cloudinary uploads or destination replacement.'
    const reportPath = writeReport(report, report.mode)
    throw new Error(`Validation failed before uploads/replacement. Report written to ${reportPath}`)
  }
  report.preMediaCounts = Object.fromEntries(TABLES.map((table) => [table, transformedRows[table]?.length ?? 0]))

  const mediaPlan = await buildMediaPlan(transformedRows, sourceEnv, options, report)
  if (mediaPlan.skipped.length > 0 && options.dropSkippedMedia) {
    transformedRows = dropSkippedMedia(transformedRows, mediaPlan.skipped, report)
  }
  const skippedUrlHits = mediaPlan.skipped.length > 0 ? findSkippedUrlHits(transformedRows, mediaPlan.skipped) : []
  report.skippedMediaValidation = {
    skippedUrlHits: skippedUrlHits.length,
    hits: skippedUrlHits.slice(0, 200),
  }
  if (!options.dryRun && mediaPlan.skipped.length > 0 && !options.dropSkippedMedia) {
    report.blocked = true
    report.blockReason = 'Skipped external or broken media remains. Review report.media.skipped, then rerun with --drop-skipped-media or --allow-external-media where reuse is permitted.'
    const reportPath = writeReport(report, report.mode)
    throw new Error(`Skipped media blocked replacement before uploads/writes. Report written to ${reportPath}`)
  }
  if (!options.dryRun && skippedUrlHits.length > 0) {
    report.blocked = true
    report.blockReason = 'Skipped media URLs are still present after drop handling.'
    const reportPath = writeReport(report, report.mode)
    throw new Error(`Skipped media remains after drop handling. Report written to ${reportPath}`)
  }
  report.transformedCounts = Object.fromEntries(TABLES.map((table) => [table, transformedRows[table]?.length ?? 0]))
  report.sourceToTransformedCountMatches = Object.fromEntries(TABLES.map((table) => [table, sourceCounts[table] === report.transformedCounts[table]]))
  transformedRows = await applyMediaReplacements(transformedRows, mediaPlan, options, destEnv, report)
  transformedRows = await applyHtmlUploads(transformedRows, options, destEnv, report)
  const finalSkippedUrlHits = mediaPlan.skipped.length > 0 ? findSkippedUrlHits(transformedRows, mediaPlan.skipped) : []
  report.skippedMediaValidation = {
    skippedUrlHits: finalSkippedUrlHits.length,
    hits: finalSkippedUrlHits.slice(0, 200),
  }
  report.transformedCounts = Object.fromEntries(TABLES.map((table) => [table, transformedRows[table]?.length ?? 0]))
  report.sourceToTransformedCountMatches = Object.fromEntries(TABLES.map((table) => [table, sourceCounts[table] === report.transformedCounts[table]]))
  const validations = validateRows(transformedRows, report, mediaPlan.replacements, options)

  if (!options.dryRun && finalSkippedUrlHits.length > 0) {
    report.blocked = true
    report.blockReason = 'Skipped media URLs are still present after final media replacement/drop handling.'
    const reportPath = writeReport(report, report.mode)
    throw new Error(`Skipped media remains after final drop handling. Report written to ${reportPath}`)
  }

  if (!options.dryRun && (validations.relations.length > 0 || validations.slugUniqueness.length > 0)) {
    report.blocked = true
    report.blockReason = 'Relation or slug validation failed before destination replacement.'
    const reportPath = writeReport(report, report.mode)
    throw new Error(`Validation failed before replacement. Report written to ${reportPath}`)
  }

  if (!options.dryRun && options.usePlannedCloudinaryUrls && !options.skipCloudinaryValidation) {
    await validateCloudinaryUrls(report)
    if ((report.cloudinaryValidation.failed ?? []).length > 0) {
      report.blocked = true
      report.blockReason = 'Planned Cloudinary URL validation failed before destination replacement.'
      const reportPath = writeReport(report, report.mode)
      throw new Error(`Planned Cloudinary validation failed before replacement. Report written to ${reportPath}`)
    }
  }

  if (!options.dryRun) {
    const sequenceResetMethod = await detectSequenceResetMethod(dest)
    if (!sequenceResetMethod && !options.allowMissingSequenceReset) {
      report.blocked = true
      report.blockReason = 'Destination has no exec_sql/execute_sql/run_sql RPC for resetting serial sequences. Add a SQL helper or rerun with --allow-missing-sequence-reset if you will reset sequences manually.'
      const reportPath = writeReport(report, report.mode)
      throw new Error(`Refusing replacement before destructive writes because sequence reset is unavailable. Report written to ${reportPath}`)
    }
    await deleteDestinationRows(dest)
    await insertDestinationRows(dest, transformedRows, destinationColumnsByTable, report)
    await resetSequencesIfPossible(dest, report)
    await validateDestinationCounts(dest, report.transformedCounts, report)
    const destinationValidations = await validateDestinationRows(dest, mediaPlan, report, options)
    const countMismatches = Object.entries(report.destinationCountMatches).filter(([, matches]) => !matches)
    if (!destinationValidations.ok || countMismatches.length > 0) {
      report.blocked = true
      report.blockReason = 'Destination post-insert validation failed. Inspect destinationValidations and destinationCountMatches.'
      const reportPath = writeReport(report, report.mode)
      throw new Error(`Destination validation failed after replacement. Report written to ${reportPath}`)
    }
    if (!options.skipCloudinaryValidation) {
      await validateCloudinaryUrls(report)
      if ((report.cloudinaryValidation.failed ?? []).length > 0) {
        report.blocked = true
        report.blockReason = 'Cloudinary URL validation failed after upload.'
        const reportPath = writeReport(report, report.mode)
        throw new Error(`Cloudinary validation failed after replacement. Report written to ${reportPath}`)
      }
    }
  }

  const reportPath = writeReport(report, report.mode)
  console.log(JSON.stringify({
    mode: report.mode,
    reportPath,
    sourceCounts,
    destinationBeforeCounts: destinationCounts,
    transformedCounts: report.transformedCounts,
    sourceToTransformedCountMatches: report.sourceToTransformedCountMatches,
    media: {
      uniqueUrls: report.media.uniqueUrls,
      plannedReplacements: report.media.plannedReplacements,
      skippedCount: report.media.skippedCount,
      skippedReasons: report.media.skipped.reduce((acc, item) => {
        acc[item.reason] = (acc[item.reason] ?? 0) + 1
        return acc
      }, {}),
      nonMediaCount: report.media.nonMediaCount,
    },
    htmlAssets: report.htmlAssets,
    contentRewrites: summarizeContentRewrites(report),
    validations: {
      ok: report.validations.ok,
      slugConflicts: report.validations.slugUniqueness.length,
      legacyUrlHits: report.validations.legacyUrlHits.length,
      relationIssues: report.validations.relations.length,
      relationSummary: report.validations.relationSummary,
    },
    orphanPruning: report.orphanPruning ?? null,
    skippedMediaDropping: report.skippedMediaDropping ?? null,
    skippedMediaValidation: report.skippedMediaValidation ?? null,
    destinationValidations: report.destinationValidations ?? null,
    destinationCountMatches: report.destinationCountMatches ?? null,
    cloudinaryValidation: report.cloudinaryValidation
      ? {
          checked: report.cloudinaryValidation.checked,
          failed: report.cloudinaryValidation.failed.length,
        }
      : null,
    sequenceReset: report.sequenceReset ?? null,
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
