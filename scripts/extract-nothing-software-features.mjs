import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const INPUT_FILE = path.join(ROOT, 'database', 'specs', 'products.json')
const OUTPUT_DIR = path.join(ROOT, 'database', 'nothing_x_and_nothing_os')
const FEATURE_FALLBACKS = {
  'phone-3a-community-edition': 'phone-3a',
}
const FEATURE_MATCHERS = [
  {
    pattern: /^nothing os(?:\s+(.+))?$/i,
    feature_key: 'nothing-os',
    feature_title: 'Nothing OS',
  },
  {
    pattern: /^nothing x(?:\s+app)?$/i,
    feature_key: 'nothing-x',
    feature_title: 'Nothing X',
  },
]

function writeJson(filePath, value) {
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
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 NothingPakistan feature extractor',
      accept: 'text/html,application/xhtml+xml',
    },
  })

  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)
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
    const route = root?.loaderData?.['routes/products.$handle']
    if (route?.product) return route.product
  }

  return null
}

function compactText(value) {
  if (!value) return ''
  if (typeof value === 'string') return decodeHtml(value).replace(/\s+/g, ' ').trim()
  if (Array.isArray(value)) return value.map(compactText).filter(Boolean).join('\n\n').trim()
  if (typeof value.text === 'string') return compactText(value.text)
  if (Array.isArray(value.children)) return compactText(value.children.map((child) => child?.text ?? '').join(''))
  return ''
}

function findImageUrl(value) {
  if (!value) return null
  if (typeof value === 'string') {
    return value.startsWith('http') && /\.(avif|gif|jpe?g|png|webp)(\?|$)/i.test(value) ? value : null
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findImageUrl(item)
      if (found) return found
    }
    return null
  }
  if (typeof value === 'object') {
    if (typeof value.url === 'string' && value.url.startsWith('http')) return value.url
    if (typeof value.asset?.url === 'string' && value.asset.url.startsWith('http')) return value.asset.url
    if (typeof value.image?.url === 'string' && value.image.url.startsWith('http')) return value.image.url

    for (const item of Object.values(value)) {
      const found = findImageUrl(item)
      if (found) return found
    }
  }

  return null
}

function findPlaybackId(value) {
  if (!value) return null
  if (typeof value === 'string') return null
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findPlaybackId(item)
      if (found) return found
    }
    return null
  }
  if (typeof value === 'object') {
    if (typeof value.playbackId === 'string') return value.playbackId
    if (typeof value.playback_id === 'string') return value.playback_id
    if (typeof value.asset?.playbackId === 'string') return value.asset.playbackId

    for (const item of Object.values(value)) {
      const found = findPlaybackId(item)
      if (found) return found
    }
  }

  return null
}

function mediaFrom(value) {
  const playbackId = findPlaybackId(value)
  if (playbackId) {
    return {
      media_type: 'video',
      image_url: null,
      video_playback_id: playbackId,
      video_url: `https://stream.mux.com/${playbackId}.m3u8`,
      thumbnail_url: `https://image.mux.com/${playbackId}/thumbnail.jpg`,
    }
  }

  return {
    media_type: 'image',
    image_url: findImageUrl(value),
    video_playback_id: null,
    video_url: null,
    thumbnail_url: null,
  }
}

function detectFeature(title) {
  const cleanTitle = compactText(title)

  for (const matcher of FEATURE_MATCHERS) {
    const match = cleanTitle.match(matcher.pattern)
    if (!match) continue

    return {
      feature_key: matcher.feature_key,
      feature_title: matcher.feature_title,
      feature_version: match[1]?.trim() || null,
      title: cleanTitle,
    }
  }

  return null
}

function collectWidgetStacks(value, stacks = []) {
  if (!value) return stacks
  if (Array.isArray(value)) {
    for (const item of value) collectWidgetStacks(item, stacks)
    return stacks
  }
  if (typeof value !== 'object') return stacks

  if (value._type === 'widgetStack' || Array.isArray(value.widgets)) {
    const title = compactText(value.title)
    if (title) stacks.push(value)
  }

  for (const item of Object.values(value)) collectWidgetStacks(item, stacks)
  return stacks
}

function normaliseSlide(slide, index) {
  const media = mediaFrom(slide.media ?? slide.image ?? slide.video ?? slide)

  return {
    source_key: slide._key ?? slide.source_key ?? null,
    title: compactText(slide.title) || `Slide ${index + 1}`,
    body: compactText(slide.body ?? slide.description ?? slide.content) || null,
    ...media,
    sort_order: index,
  }
}

function normaliseFeature(stack, product) {
  const feature = detectFeature(stack.title)
  if (!feature) return null

  const rawSlides = Array.isArray(stack.widgets) ? stack.widgets : Array.isArray(stack.slides) ? stack.slides : []
  const cover = mediaFrom(stack.cover ?? stack.media ?? stack)

  return {
    related_type: product.related_type,
    related_id: product.related_id,
    related_slug: product.related_slug,
    source_handle: product.handle,
    source_name: product.name,
    source_url: product.specs_url,
    source_key: stack._key ?? stack.source_key ?? null,
    feature_key: feature.feature_key,
    feature_title: feature.feature_title,
    feature_version: feature.feature_version,
    title: feature.title || feature.feature_title,
    display_context: 'mobile',
    cover_image_url: cover.media_type === 'image' ? cover.image_url : null,
    cover_video_playback_id: cover.video_playback_id,
    cover_video_url: cover.video_url,
    cover_thumbnail_url: cover.thumbnail_url,
    sort_order: 0,
    slides: rawSlides.map(normaliseSlide),
  }
}

function cloneFeatureForProduct(feature, product, fallbackHandle) {
  return {
    ...feature,
    related_type: product.related_type,
    related_id: product.related_id,
    related_slug: product.related_slug,
    source_handle: product.handle,
    source_name: product.name,
    source_url: product.specs_url,
    source_fallback_handle: fallbackHandle,
    slides: (feature.slides ?? []).map((slide) => ({ ...slide })),
  }
}

async function main() {
  if (!existsSync(INPUT_FILE)) throw new Error(`Missing ${INPUT_FILE}`)
  mkdirSync(OUTPUT_DIR, { recursive: true })

  const input = JSON.parse(readFileSync(INPUT_FILE, 'utf8'))
  const products = input.products ?? []
  const extractedByHandle = new Map()
  const index = {
    source_file: 'database/specs/products.json',
    generated_at: new Date().toISOString(),
    output_dir: 'database/nothing_x_and_nothing_os',
    products_checked: products.length,
    products_with_features: 0,
    products_without_features: 0,
    products_failed: 0,
    features: [],
    missing: [],
    failed: [],
  }

  for (const product of products) {
    process.stdout.write(`Checking ${product.handle}... `)

    try {
      const html = await fetchText(product.specs_url)
      const routeProduct = findProductRoute(html)
      if (!routeProduct) throw new Error('Could not find product payload in page')

      const stacks = collectWidgetStacks(routeProduct.sanityContent)
      let features = stacks.map((stack) => normaliseFeature(stack, product)).filter(Boolean)

      if (features.length === 0 && FEATURE_FALLBACKS[product.handle]) {
        const fallbackHandle = FEATURE_FALLBACKS[product.handle]
        const fallbackFeatures = extractedByHandle.get(fallbackHandle) ?? []
        features = fallbackFeatures.map((feature) => cloneFeatureForProduct(feature, product, fallbackHandle))
      }

      if (features.length === 0) {
        index.products_without_features += 1
        index.missing.push({
          name: product.name,
          handle: product.handle,
          specs_url: product.specs_url,
          related_type: product.related_type,
          related_id: product.related_id,
          related_slug: product.related_slug,
          reason: 'No Nothing OS or Nothing X section found',
        })
        process.stdout.write('missing\n')
        continue
      }

      const fileName = `${product.handle}.json`
      const filePath = path.join(OUTPUT_DIR, fileName)
      writeJson(filePath, {
        name: product.name,
        handle: product.handle,
        specs_url: product.specs_url,
        related_type: product.related_type,
        related_id: product.related_id,
        related_slug: product.related_slug,
        features,
      })

      extractedByHandle.set(product.handle, features.map((feature) => ({
        ...feature,
        slides: (feature.slides ?? []).map((slide) => ({ ...slide })),
      })))

      index.products_with_features += 1
      for (const feature of features) {
        index.features.push({
          name: product.name,
          handle: product.handle,
          specs_url: product.specs_url,
          related_type: product.related_type,
          related_id: product.related_id,
          related_slug: product.related_slug,
          feature_key: feature.feature_key,
          feature_title: feature.feature_title,
          feature_version: feature.feature_version,
          slides_count: feature.slides.length,
          json_file: `database/nothing_x_and_nothing_os/${fileName}`,
        })
      }
      process.stdout.write(`${features.map((feature) => feature.feature_title).join(', ')}\n`)
    } catch (error) {
      index.products_failed += 1
      index.failed.push({
        name: product.name,
        handle: product.handle,
        specs_url: product.specs_url,
        related_type: product.related_type,
        related_id: product.related_id,
        related_slug: product.related_slug,
        error: error.message,
      })
      process.stdout.write(`failed: ${error.message}\n`)
    }
  }

  writeJson(path.join(OUTPUT_DIR, 'products.json'), index)
  writeJson(path.join(OUTPUT_DIR, 'missing-products.json'), index.missing)
  writeJson(path.join(OUTPUT_DIR, 'failed-products.json'), index.failed)

  console.log(`\nWrote ${OUTPUT_DIR}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
