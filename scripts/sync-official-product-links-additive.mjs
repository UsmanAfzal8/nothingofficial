import { createClient } from '@supabase/supabase-js'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const REPORT_DIR = path.join(ROOT, 'database', 'nothing_x_and_nothing_os')
const REPORT_FILE = path.join(REPORT_DIR, 'product-links-additive-sync-report.json')
const SOURCE_NAME = 'user-provided official product links'
const REMOTE_FEATURE_BASE_DIR = 'product-features'
const REMOTE_BACKGROUND_BASE_DIR = 'product-backgrounds'
const FETCH_TIMEOUT_MS = Number(process.env.OFFICIAL_SYNC_FETCH_TIMEOUT_MS || 45000)

const PRODUCT_SOURCES = [
  {
    handle: 'cmf-phone-1',
    relatedType: 'mobile',
    relatedSlug: 'cmf-phone-1',
    url: 'https://intl.nothing.tech/products/cmf-phone-1',
  },
  {
    handle: 'cmf-phone-2-pro',
    relatedType: 'mobile',
    relatedSlug: 'cmf-phone-2-pro',
    url: 'https://intl.nothing.tech/products/cmf-phone-2-pro?Colour=Orange&Capacity=8%2B128GB',
  },
  {
    handle: 'phone-3a',
    relatedType: 'mobile',
    relatedSlug: 'phone-3a-community-edition',
    url: 'https://intl.nothing.tech/products/phone-3a?Colour=Black&Capacity=12%2B256GB',
  },
  {
    handle: 'phone-2a',
    relatedType: 'mobile',
    relatedSlug: 'phone-2a',
    url: 'https://intl.nothing.tech/products/phone-2a?Colour=Milk&Capacity=12%2B256GB',
  },
  {
    handle: 'phone-2a-plus',
    relatedType: 'mobile',
    relatedSlug: 'phone-2a-plus',
    url: 'https://intl.nothing.tech/products/phone-2a-plus?Colour=Grey&Capacity=12%2B256GB',
  },
]

const MANUAL_HANDLE_MAP = new Map([
  ['phone-4a-pro', { relatedType: 'mobile', relatedSlug: 'nothing-4a-pro' }],
])

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

function decodeHtml(value) {
  return String(value ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function compactText(value) {
  if (!value) return ''
  if (typeof value === 'string') return decodeHtml(value).replace(/\s+/g, ' ').trim()
  if (Array.isArray(value)) return value.map(compactText).filter(Boolean).join(' ').trim()
  if (typeof value === 'object') {
    if (typeof value.text === 'string') return compactText(value.text)
    if (Array.isArray(value.children)) return compactText(value.children)
    if (value.title) return compactText(value.title)
  }

  return ''
}

function extensionForUrl(url, fallback = '.jpg') {
  const ext = path.extname(new URL(url).pathname).toLowerCase()
  return ext || fallback
}

function mimeTypeForExt(ext) {
  if (ext === '.avif') return 'image/avif'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  return 'application/octet-stream'
}

function getBunnyStorageBaseUrl(region) {
  return region.toLowerCase() === 'de' ? 'https://storage.bunnycdn.com' : `https://${region}.storage.bunnycdn.com`
}

function createBunnyClient() {
  const bunnyZone = requireEnv('BUNNY_STORAGE_ZONE_NAME')
  const bunnyAccessKey = requireEnv('BUNNY_ACCESS_KEY')
  const bunnyCdnHostname = requireEnv('BUNNY_CDN_HOSTNAME')
  const bunnyStorageBaseUrl = getBunnyStorageBaseUrl(process.env.BUNNY_STORAGE_REGION || 'de')

  async function uploadRemoteFile(sourceUrl, remotePath) {
    const cdnUrl = `https://${bunnyCdnHostname}/${remotePath}`

    if (sourceUrl.includes(`://${bunnyCdnHostname}/`)) {
      return cdnUrl
    }

    const response = await fetchWithTimeout(sourceUrl)
    if (!response.ok) throw new Error(`Fetch failed for ${sourceUrl}: ${response.status}`)

    const uploadResponse = await fetchWithTimeout(`${bunnyStorageBaseUrl}/${bunnyZone}/${remotePath}`, {
      method: 'PUT',
      headers: {
        AccessKey: bunnyAccessKey,
        'Content-Type': mimeTypeForExt(path.extname(remotePath).toLowerCase()),
      },
      body: Buffer.from(await response.arrayBuffer()),
    })

    if (!uploadResponse.ok) {
      throw new Error(`Bunny upload failed for ${remotePath}: ${uploadResponse.status} ${await uploadResponse.text().catch(() => '')}`)
    }

    return cdnUrl
  }

  return { uploadRemoteFile }
}

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchText(url) {
  const response = await fetchWithTimeout(url, {
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'user-agent': 'Mozilla/5.0 NothingPakistan official shop-all additive sync',
    },
  })

  if (!response.ok) throw new Error(`Fetch failed for ${url}: ${response.status}`)
  return response.text()
}

function parseStreamArrays(html) {
  const arrays = []
  const re = /streamController\.enqueue\(("(?:\\.|[^"\\])*")\)/g
  let match

  while ((match = re.exec(html))) {
    let payload = JSON.parse(match[1])
    payload = payload.replace(/^P\d+:/, '')

    if (!payload.trim().startsWith('[')) continue

    try {
      arrays.push(JSON.parse(payload))
    } catch {
      // Some streamed chunks are not the product graph.
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

function findImageUrls(value, urls = []) {
  if (!value) return urls

  if (typeof value === 'string') {
    if (value.startsWith('http') && /\.(avif|gif|jpe?g|png|webp)(\?|$)/i.test(value)) urls.push(value)
    return urls
  }

  if (Array.isArray(value)) {
    for (const item of value) findImageUrls(item, urls)
    return [...new Set(urls)]
  }

  if (typeof value === 'object') {
    for (const key of ['url', 'src']) {
      if (typeof value[key] === 'string' && value[key].startsWith('http') && /\.(avif|gif|jpe?g|png|webp)(\?|$)/i.test(value[key])) {
        urls.push(value[key])
      }
    }

    if (typeof value.asset?.url === 'string') urls.push(value.asset.url)
    if (typeof value.image?.url === 'string') urls.push(value.image.url)

    for (const item of Object.values(value)) findImageUrls(item, urls)
  }

  return [...new Set(urls)]
}

function findPlaybackIds(value, ids = []) {
  if (!value) return ids

  if (typeof value === 'string') {
    const muxMatch = value.match(/stream\.mux\.com\/([^/.?]+)/)
    if (muxMatch?.[1]) ids.push(muxMatch[1])
    return ids
  }

  if (Array.isArray(value)) {
    for (const item of value) findPlaybackIds(item, ids)
    return [...new Set(ids)]
  }

  if (typeof value === 'object') {
    if (typeof value.playbackId === 'string') ids.push(value.playbackId)
    if (typeof value.mediaStream?.playbackId === 'string') ids.push(value.mediaStream.playbackId)

    for (const item of Object.values(value)) findPlaybackIds(item, ids)
  }

  return [...new Set(ids)]
}

function muxStreamUrl(playbackId) {
  return `https://stream.mux.com/${playbackId}.m3u8`
}

function muxThumbnailUrl(playbackId) {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=0`
}

function extractShopAllHandles(html) {
  return [...new Set([...html.matchAll(/\/products\/([a-z0-9-]+)/gi)].map((match) => match[1]))]
    .filter((handle) => !SKIPPED_HANDLES.has(handle))
    .sort()
}

function extractBackgrounds(product) {
  const sections = product?.sanityContent?.sections ?? []
  const backgrounds = []
  const seen = new Set()

  for (const [sectionIndex, section] of sections.entries()) {
    const title = compactText(section.title) || `Background ${sectionIndex + 1}`
    const imageUrls = findImageUrls(section.background)

    for (const [imageIndex, sourceUrl] of imageUrls.entries()) {
      if (!sourceUrl || seen.has(sourceUrl)) continue

      seen.add(sourceUrl)
      backgrounds.push({
        sourceUrl,
        title,
        slug: `official-background-${String(sectionIndex + 1).padStart(2, '0')}-${slugify(title)}${imageIndex > 0 ? `-${String(imageIndex + 1).padStart(2, '0')}` : ''}`,
        sortOrder: sectionIndex * 10 + imageIndex,
      })
    }
  }

  return backgrounds
}

function getFeatureMedia(widget) {
  const coverPlaybackId = findPlaybackIds(widget.cover)[0] ?? null
  const coverImageUrl = findImageUrls(widget.cover, [])[0] ?? findImageUrls(widget.image, [])[0] ?? findImageUrls(widget.slides, [])[0] ?? null

  return {
    coverImageUrl,
    coverVideoPlaybackId: coverPlaybackId,
    coverVideoUrl: coverPlaybackId ? muxStreamUrl(coverPlaybackId) : null,
    coverThumbnailUrl: coverPlaybackId ? muxThumbnailUrl(coverPlaybackId) : coverImageUrl,
  }
}

function normaliseSlides(widget) {
  const slides = []

  for (const [slideIndex, slide] of (widget.slides ?? []).entries()) {
    const title = compactText(slide.title) || compactText(widget.title) || `Slide ${slideIndex + 1}`
    const body = compactText(slide.body ?? slide.description ?? slide.content ?? slide.text) || null
    const playbackId = findPlaybackIds(slide.video ?? slide.videoAsset ?? slide)[0] ?? null
    const imageUrls = findImageUrls(slide.image ?? slide)
    const mediaUrls = imageUrls.length > 0 ? imageUrls : [null]

    for (const [imageIndex, imageUrl] of mediaUrls.entries()) {
      slides.push({
        source_key: imageIndex === 0 ? slide._key ?? `slide-${slideIndex}` : `${slide._key ?? `slide-${slideIndex}`}-image-${imageIndex + 1}`,
        title,
        body,
        media_type: playbackId ? 'video' : 'image',
        image_url: imageUrl,
        video_playback_id: playbackId,
        video_url: playbackId ? muxStreamUrl(playbackId) : null,
        thumbnail_url: playbackId ? muxThumbnailUrl(playbackId) : imageUrl,
        sort_order: slides.length,
      })
    }
  }

  return slides
}

function normaliseFeatures(product, source, local) {
  const widgets = product?.sanityContent?.widgets?.filter((widget) => widget._type === 'widgetStack') ?? []

  return widgets
    .map((widget, widgetIndex) => {
      const title = compactText(widget.title)
      if (!title) return null

      const subtitle = compactText(widget.subtitle)
      const media = getFeatureMedia(widget)

      return {
        related_type: local.relatedType,
        related_id: local.id,
        related_slug: local.slug,
        source_handle: source.handle,
        source_url: source.url,
        source_key: widget._key ?? null,
        feature_key: `official-${slugify(title)}`,
        feature_title: title,
        feature_version: subtitle || null,
        title: subtitle ? `${title}: ${subtitle}` : title,
        display_context: local.relatedType === 'mobile' ? 'mobile' : 'all',
        cover_image_url: media.coverImageUrl,
        cover_video_playback_id: media.coverVideoPlaybackId,
        cover_video_url: media.coverVideoUrl,
        cover_thumbnail_url: media.coverThumbnailUrl,
        sort_order: widgetIndex,
        slides: normaliseSlides(widget),
      }
    })
    .filter(Boolean)
}

async function loadLocalCatalog(supabase) {
  const [{ data: products, error: productError }, { data: mobiles, error: mobileError }] = await Promise.all([
    supabase.from('products').select('id, slug, name'),
    supabase.from('mobiles').select('id, slug, name'),
  ])

  if (productError) throw productError
  if (mobileError) throw mobileError

  return {
    productsBySlug: new Map((products ?? []).map((product) => [product.slug, product])),
    mobilesBySlug: new Map((mobiles ?? []).map((mobile) => [mobile.slug, mobile])),
  }
}

function resolveLocalProduct(handle, catalog) {
  const manual = MANUAL_HANDLE_MAP.get(handle)

  if (manual) {
    const row = manual.relatedType === 'mobile'
      ? catalog.mobilesBySlug.get(manual.relatedSlug)
      : catalog.productsBySlug.get(manual.relatedSlug)

    return row ? { ...row, relatedType: manual.relatedType } : null
  }

  const product = catalog.productsBySlug.get(handle)
  if (product) return { ...product, relatedType: 'product' }

  const mobile = catalog.mobilesBySlug.get(handle)
  if (mobile) return { ...mobile, relatedType: 'mobile' }

  return null
}

function resolveLocalSource(source, catalog) {
  if (source.relatedType && source.relatedSlug) {
    const row = source.relatedType === 'mobile'
      ? catalog.mobilesBySlug.get(source.relatedSlug)
      : catalog.productsBySlug.get(source.relatedSlug)

    return row ? { ...row, relatedType: source.relatedType } : null
  }

  return resolveLocalProduct(source.handle, catalog)
}

function detailRelatedType(relatedType) {
  return relatedType === 'mobile' ? 'detail_mobile' : 'detail_product'
}

async function getExistingBackgroundSlugs(supabase, local) {
  const { data, error } = await supabase
    .from('images')
    .select('id, slug')
    .eq('related_type', detailRelatedType(local.relatedType))
    .eq('related_id', local.id)
    .or('slug.like.official-background-%,caption.eq.Official product background')

  if (error) throw error

  return new Set((data ?? []).map((row) => row.slug).filter(Boolean))
}

async function insertMissingBackgrounds(supabase, bunny, source, local, product, report) {
  const existingSlugs = await getExistingBackgroundSlugs(supabase, local)
  const backgrounds = extractBackgrounds(product)
  let inserted = 0
  let skipped = 0

  for (const background of backgrounds) {
    if (existingSlugs.has(background.slug)) {
      skipped += 1
      continue
    }

    const ext = extensionForUrl(background.sourceUrl)
    const remotePath = `${REMOTE_BACKGROUND_BASE_DIR}/${source.handle}/${background.slug}${ext}`
    const cdnUrl = await bunny.uploadRemoteFile(background.sourceUrl, remotePath)
    report.images_uploaded += 1

    const { error } = await supabase.from('images').insert({
      related_type: detailRelatedType(local.relatedType),
      related_id: local.id,
      color_id: null,
      url: cdnUrl,
      alt_text: `${product.title} official ${background.title} background`,
      title: `${product.title} ${background.title}`,
      caption: 'Official product background',
      file_name: path.basename(remotePath),
      slug: background.slug,
      sort_order: background.sortOrder,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error
    existingSlugs.add(background.slug)
    inserted += 1
  }

  return { seen: backgrounds.length, inserted, skipped }
}

function onlyMissingMediaPatch(existing, incoming, fields) {
  const patch = {}

  for (const field of fields) {
    if (!existing[field] && incoming[field]) {
      patch[field] = incoming[field]
    }
  }

  if (Object.keys(patch).length > 0) {
    patch.updated_at = new Date().toISOString()
  }

  return patch
}

async function uploadFeatureImage(bunny, sourceUrl, remotePath) {
  if (!sourceUrl) return null
  if (sourceUrl.includes('cdn.nothingshop.pk/')) return sourceUrl

  return bunny.uploadRemoteFile(sourceUrl, remotePath)
}

async function prepareFeatureMedia(bunny, source, feature, report) {
  const featureDir = `${REMOTE_FEATURE_BASE_DIR}/${source.handle}/${feature.feature_key}`
  process.stdout.write(`\n  preparing feature "${feature.feature_title}" (${feature.slides?.length ?? 0} slides)`)
  const originalCoverImageUrl = feature.cover_image_url

  if (feature.cover_image_url && !feature.cover_image_url.includes('cdn.nothingshop.pk/')) {
    const ext = extensionForUrl(feature.cover_image_url)
    process.stdout.write(' cover')
    feature.cover_image_url = await uploadFeatureImage(bunny, feature.cover_image_url, `${featureDir}/cover${ext}`)
    report.images_uploaded += 1
  }

  if (feature.cover_thumbnail_url === originalCoverImageUrl && feature.cover_image_url) {
    feature.cover_thumbnail_url = feature.cover_image_url
  }

  if (feature.cover_thumbnail_url && !feature.cover_thumbnail_url.includes('cdn.nothingshop.pk/') && !feature.cover_thumbnail_url.includes('image.mux.com/')) {
    process.stdout.write(' thumb')
    feature.cover_thumbnail_url = await uploadFeatureImage(bunny, feature.cover_thumbnail_url, `${featureDir}/cover-thumb.jpg`)
    report.images_uploaded += 1
  }

  for (const slide of feature.slides ?? []) {
    const slideSlug = `${String(slide.sort_order ?? 0).padStart(2, '0')}-${slugify(slide.title)}`
    const slideDir = `${featureDir}/${slideSlug}`
    const originalSlideImageUrl = slide.image_url

    if (slide.image_url && !slide.image_url.includes('cdn.nothingshop.pk/')) {
      const ext = extensionForUrl(slide.image_url)
      process.stdout.write(` s${slide.sort_order}`)
      slide.image_url = await uploadFeatureImage(bunny, slide.image_url, `${slideDir}/image${ext}`)
      report.images_uploaded += 1
    }

    if (slide.thumbnail_url === originalSlideImageUrl && slide.image_url) {
      slide.thumbnail_url = slide.image_url
    }

    if (slide.thumbnail_url && !slide.thumbnail_url.includes('cdn.nothingshop.pk/') && !slide.thumbnail_url.includes('image.mux.com/')) {
      process.stdout.write(` t${slide.sort_order}`)
      slide.thumbnail_url = await uploadFeatureImage(bunny, slide.thumbnail_url, `${slideDir}/thumb.jpg`)
      report.images_uploaded += 1
    }
  }

  process.stdout.write(' done')
}

async function syncFeature(supabase, bunny, source, feature, report) {
  const { data: existingSections, error: findError } = await supabase
    .from('product_feature_sections')
    .select('id, cover_image_url, cover_video_playback_id, cover_video_url, cover_thumbnail_url')
    .eq('related_type', feature.related_type)
    .eq('related_id', feature.related_id)
    .eq('feature_key', feature.feature_key)
    .eq('active', true)

  if (findError) throw findError

  let sectionId = existingSections?.[0]?.id ?? null
  let existingSlides = []

  if (!sectionId) {
    await prepareFeatureMedia(bunny, source, feature, report)

    const { data: insertedSection, error: sectionError } = await supabase
      .from('product_feature_sections')
      .insert({
        related_type: feature.related_type,
        related_id: feature.related_id,
        source_key: feature.source_key ?? null,
        feature_key: feature.feature_key,
        feature_title: feature.feature_title,
        feature_version: feature.feature_version ?? null,
        title: feature.title,
        display_context: feature.display_context ?? feature.related_type,
        cover_image_url: feature.cover_image_url ?? null,
        cover_video_playback_id: feature.cover_video_playback_id ?? null,
        cover_video_url: feature.cover_video_url ?? null,
        cover_thumbnail_url: feature.cover_thumbnail_url ?? null,
        sort_order: Number(feature.sort_order ?? 0),
        active: true,
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (sectionError) throw sectionError
    sectionId = insertedSection.id
    report.sections_inserted += 1
  } else {
    const { data, error: slideFindError } = await supabase
      .from('product_feature_slides')
      .select('id, source_key, sort_order, title, media_type, image_url, video_playback_id, video_url, thumbnail_url')
      .eq('product_feature_section_id', sectionId)

    if (slideFindError) throw slideFindError
    existingSlides = data ?? []

    const slidesBySourceKey = new Map(existingSlides.filter((slide) => slide.source_key).map((slide) => [slide.source_key, slide]))
    const slidesByTitleOrder = new Map(existingSlides.map((slide) => [`${slide.sort_order}:${slide.title}`, slide]))
    const sectionPatch = onlyMissingMediaPatch(existingSections[0], feature, [
      'cover_image_url',
      'cover_video_playback_id',
      'cover_video_url',
      'cover_thumbnail_url',
    ])
    const needsSlideWork = (feature.slides ?? []).some((slide) => {
      const existingSlide = (slide.source_key ? slidesBySourceKey.get(slide.source_key) : null) ?? slidesByTitleOrder.get(`${slide.sort_order}:${slide.title}`)

      if (!existingSlide) return true

      const slidePatch = onlyMissingMediaPatch(existingSlide, slide, [
        'image_url',
        'video_playback_id',
        'video_url',
        'thumbnail_url',
      ])

      return Object.keys(slidePatch).length > 0 || (!existingSlide.media_type && slide.media_type)
    })

    if (Object.keys(sectionPatch).length === 0 && !needsSlideWork) {
      return
    }

    await prepareFeatureMedia(bunny, source, feature, report)

    const patch = onlyMissingMediaPatch(existingSections[0], feature, [
      'cover_image_url',
      'cover_video_playback_id',
      'cover_video_url',
      'cover_thumbnail_url',
    ])

    if (Object.keys(patch).length > 0) {
      const { error } = await supabase.from('product_feature_sections').update(patch).eq('id', sectionId)
      if (error) throw error
      report.sections_media_filled += 1
    }
  }

  const slidesBySourceKey = new Map((existingSlides ?? []).filter((slide) => slide.source_key).map((slide) => [slide.source_key, slide]))
  const slidesByTitleOrder = new Map((existingSlides ?? []).map((slide) => [`${slide.sort_order}:${slide.title}`, slide]))

  for (const slide of feature.slides ?? []) {
    const existingSlide = (slide.source_key ? slidesBySourceKey.get(slide.source_key) : null) ?? slidesByTitleOrder.get(`${slide.sort_order}:${slide.title}`)

    if (!existingSlide) {
      const { error } = await supabase.from('product_feature_slides').insert({
        product_feature_section_id: sectionId,
        source_key: slide.source_key ?? null,
        title: slide.title,
        body: slide.body ?? null,
        media_type: slide.media_type ?? 'image',
        image_url: slide.image_url ?? null,
        video_playback_id: slide.video_playback_id ?? null,
        video_url: slide.video_url ?? null,
        thumbnail_url: slide.thumbnail_url ?? null,
        sort_order: Number(slide.sort_order ?? 0),
        active: true,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
      report.slides_inserted += 1
      continue
    }

    const patch = onlyMissingMediaPatch(existingSlide, slide, [
      'image_url',
      'video_playback_id',
      'video_url',
      'thumbnail_url',
    ])

    if (!existingSlide.media_type && slide.media_type) {
      patch.media_type = slide.media_type
    }

    if (Object.keys(patch).length > 0) {
      const { error } = await supabase.from('product_feature_slides').update(patch).eq('id', existingSlide.id)
      if (error) throw error
      report.slides_media_filled += 1
    }
  }
}

async function syncFeatures(supabase, bunny, source, local, product, report) {
  const features = normaliseFeatures(product, source, local)
  const slidesSeen = features.reduce((total, feature) => total + feature.slides.length, 0)

  if (local.relatedType === 'mobile' && features.length > 0) {
    const { data: existingSections, error: sectionError } = await supabase
      .from('product_feature_sections')
      .select('id')
      .eq('related_type', local.relatedType)
      .eq('related_id', local.id)
      .in('feature_key', features.map((feature) => feature.feature_key))
      .eq('active', true)

    if (sectionError) throw sectionError

    if ((existingSections ?? []).length >= features.length) {
      const sectionIds = (existingSections ?? []).map((section) => section.id)
      const { data: existingSlides, error: slideError } = sectionIds.length > 0
        ? await supabase
            .from('product_feature_slides')
            .select('id')
            .in('product_feature_section_id', sectionIds)
            .eq('active', true)
        : { data: [], error: null }

      if (slideError) throw slideError

      if ((existingSlides ?? []).length >= slidesSeen) {
        return { seen: features.length, slidesSeen, skippedExisting: true }
      }
    }
  }

  for (const feature of features) {
    await syncFeature(supabase, bunny, source, feature, report)
  }

  return { seen: features.length, slidesSeen, skippedExisting: false }
}

async function main() {
  loadEnv()

  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const bunny = createBunnyClient()
  const catalog = await loadLocalCatalog(supabase)
  const report = {
    synced_at: new Date().toISOString(),
    source: SOURCE_NAME,
    handles_seen: PRODUCT_SOURCES.length,
    products_synced: 0,
    products_skipped: 0,
    backgrounds_seen: 0,
    backgrounds_inserted: 0,
    backgrounds_skipped_existing: 0,
    feature_sections_seen: 0,
    feature_slides_seen: 0,
    sections_inserted: 0,
    sections_media_filled: 0,
    slides_inserted: 0,
    slides_media_filled: 0,
    images_uploaded: 0,
    failed: [],
    skipped: [],
    products: [],
  }

  for (const source of PRODUCT_SOURCES) {
    const local = resolveLocalSource(source, catalog)

    if (!local) {
      report.products_skipped += 1
      report.skipped.push({ handle: source.handle, relatedSlug: source.relatedSlug ?? null, reason: 'No matching local product/mobile slug' })
      continue
    }

    process.stdout.write(`Syncing ${source.handle} -> ${local.relatedType}:${local.slug}... `)

    try {
      const productHtml = await fetchText(source.url)
      const product = findProductRoute(productHtml)
      if (!product) throw new Error('Could not find official product payload')

      const backgroundStats = await insertMissingBackgrounds(supabase, bunny, source, local, product, report)
      const featureStats = await syncFeatures(supabase, bunny, source, local, product, report)

      report.backgrounds_seen += backgroundStats.seen
      report.backgrounds_inserted += backgroundStats.inserted
      report.backgrounds_skipped_existing += backgroundStats.skipped
      report.feature_sections_seen += featureStats.seen
      report.feature_slides_seen += featureStats.slidesSeen
      report.products_synced += 1
      report.products.push({
        handle: source.handle,
        url: source.url,
        local: `${local.relatedType}:${local.slug}`,
        title: product.title,
        backgrounds: backgroundStats,
        features: featureStats,
      })

      process.stdout.write(`${backgroundStats.inserted}/${backgroundStats.seen} backgrounds, ${featureStats.seen} features, ${featureStats.slidesSeen} slides\n`)
    } catch (error) {
      report.failed.push({ handle: source.handle, url: source.url, local: `${local.relatedType}:${local.slug}`, error: error.message })
      process.stdout.write(`failed: ${error.message}\n`)
    }
  }

  writeJson(REPORT_FILE, report)
  console.log(`\nWrote ${REPORT_FILE}`)

  if (report.failed.length > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
