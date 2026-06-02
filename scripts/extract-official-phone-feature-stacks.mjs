import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUTPUT_DIR = path.join(ROOT, 'database', 'nothing_x_and_nothing_os')
const MOBILE_FILE = path.join(ROOT, 'database', 'mobile.json')

const OFFICIAL_PHONES = [
  {
    handle: 'phone-4a-pro',
    relatedSlug: 'nothing-4a-pro',
    url: 'https://nothing.tech/products/phone-4a-pro?Colour=Silver&Capacity=8%2B128GB',
  },
  {
    handle: 'phone-4a',
    relatedSlug: 'phone-4a',
    url: 'https://nothing.tech/products/phone-4a?Colour=White&Capacity=8%2B128GB',
  },
  {
    handle: 'phone-3',
    relatedSlug: 'phone-3',
    url: 'https://nothing.tech/products/phone-3?Colour=White&Capacity=12%2B256GB',
  },
  {
    handle: 'phone-3a-lite',
    relatedSlug: 'phone-3a-lite',
    url: 'https://nothing.tech/products/phone-3a-lite?Colour=White&Capacity=8%2B128GB',
  },
  {
    handle: 'phone-3a-pro',
    relatedSlug: 'phone-3a-pro',
    url: 'https://nothing.tech/products/phone-3a-pro?Colour=Grey&Capacity=12%2B256GB+%28Pick+up+only%29',
  },
  {
    handle: 'phone-3a',
    relatedSlug: 'phone-3a',
    url: 'https://nothing.tech/products/phone-3a?Colour=Black&Capacity=12%2B256GB',
  },
]

const SKIPPED_WIDGET_TYPES = new Set(['widgetSpecs', 'widgetVideo', 'widgetImage'])

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function slugify(value, fallback = 'feature') {
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

function findImageUrls(value, urls = []) {
  if (!value) return urls

  if (typeof value === 'string') {
    if (value.startsWith('http') && /\.(avif|gif|jpe?g|png|webp)(\?|$)/i.test(value)) urls.push(value)
    return urls
  }

  if (Array.isArray(value)) {
    for (const item of value) findImageUrls(item, urls)
    return urls
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

function firstImageUrl(...values) {
  for (const value of values) {
    const url = findImageUrls(value)[0]
    if (url) return url
  }

  return null
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'user-agent': 'Mozilla/5.0 NothingPakistan official phone feature extractor',
    },
  })

  if (!response.ok) throw new Error(`Fetch failed for ${url}: ${response.status}`)
  return response.text()
}

function normaliseSlides(widget) {
  const slides = []

  for (const [slideIndex, slide] of (widget.slides ?? []).entries()) {
    const title = compactText(slide.title) || compactText(widget.title) || `Slide ${slideIndex + 1}`
    const body = compactText(slide.body ?? slide.description ?? slide.content ?? slide.text) || null
    const imageUrls = findImageUrls(slide.image ?? slide)

    if (imageUrls.length === 0) {
      slides.push({
        source_key: slide._key ?? null,
        title,
        body,
        media_type: 'image',
        image_url: null,
        video_playback_id: null,
        video_url: null,
        thumbnail_url: null,
        sort_order: slides.length,
      })
      continue
    }

    for (const [imageIndex, imageUrl] of imageUrls.entries()) {
      slides.push({
        source_key: imageIndex === 0 ? slide._key ?? null : `${slide._key ?? `slide-${slideIndex}`}-image-${imageIndex + 1}`,
        title,
        body,
        media_type: 'image',
        image_url: imageUrl,
        video_playback_id: null,
        video_url: null,
        thumbnail_url: null,
        sort_order: slides.length,
      })
    }
  }

  return slides
}

function normaliseFeature(widget, product, source) {
  if (widget._type !== 'widgetStack' || SKIPPED_WIDGET_TYPES.has(widget._type)) return null

  const title = compactText(widget.title)
  if (!title) return null

  const subtitle = compactText(widget.subtitle)
  const slides = normaliseSlides(widget)
  const coverImageUrl = firstImageUrl(widget.cover, widget.image, widget.slides)

  return {
    related_type: 'mobile',
    related_id: product.id,
    related_slug: product.slug,
    source_handle: source.handle,
    source_name: source.name,
    source_url: source.url,
    source_key: widget._key ?? null,
    feature_key: `official-${slugify(title)}`,
    feature_title: title,
    feature_version: subtitle || null,
    title: subtitle ? `${title}: ${subtitle}` : title,
    display_context: 'mobile',
    cover_image_url: coverImageUrl,
    cover_video_playback_id: null,
    cover_video_url: null,
    cover_thumbnail_url: coverImageUrl,
    sort_order: source.sortOrder,
    slides,
  }
}

function loadMobileBySlug() {
  if (!existsSync(MOBILE_FILE)) throw new Error(`Missing ${MOBILE_FILE}`)
  const mobiles = JSON.parse(readFileSync(MOBILE_FILE, 'utf8'))
  return new Map(mobiles.map((mobile) => [mobile.slug, mobile]))
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true })

  const mobileBySlug = loadMobileBySlug()
  const index = {
    source: 'https://nothing.tech/collections/phones',
    generated_at: new Date().toISOString(),
    output_dir: 'database/nothing_x_and_nothing_os',
    products_checked: OFFICIAL_PHONES.length,
    products_with_features: 0,
    products_without_features: 0,
    products_failed: 0,
    features: [],
    missing: [],
    failed: [],
  }

  for (const [productIndex, source] of OFFICIAL_PHONES.entries()) {
    const mobile = mobileBySlug.get(source.relatedSlug)
    if (!mobile) {
      index.products_failed += 1
      index.failed.push({ ...source, error: `No local mobile found for slug ${source.relatedSlug}` })
      continue
    }

    process.stdout.write(`Checking ${source.handle}... `)

    try {
      const html = await fetchText(source.url)
      const routeProduct = findProductRoute(html)
      if (!routeProduct?.sanityContent?.widgets) throw new Error('Could not find official product widgets')

      const widgets = routeProduct.sanityContent.widgets.filter((widget) => widget._type === 'widgetStack')
      const features = widgets
        .map((widget, widgetIndex) =>
          normaliseFeature(widget, mobile, {
            ...source,
            name: routeProduct.title,
            sortOrder: productIndex * 100 + widgetIndex,
          }),
        )
        .filter(Boolean)

      if (features.length === 0) {
        index.products_without_features += 1
        index.missing.push({ ...source, related_type: 'mobile', related_id: mobile.id, related_slug: mobile.slug })
        process.stdout.write('missing\n')
        continue
      }

      const fileName = `${source.handle}.json`
      writeJson(path.join(OUTPUT_DIR, fileName), {
        name: routeProduct.title,
        handle: source.handle,
        specs_url: source.url,
        related_type: 'mobile',
        related_id: mobile.id,
        related_slug: mobile.slug,
        features,
      })

      index.products_with_features += 1
      index.features.push({
        name: routeProduct.title,
        handle: source.handle,
        specs_url: source.url,
        related_type: 'mobile',
        related_id: mobile.id,
        related_slug: mobile.slug,
        feature_key: 'official-phone-feature-stacks',
        feature_title: 'Official phone feature stacks',
        slides_count: features.reduce((total, feature) => total + feature.slides.length, 0),
        json_file: `database/nothing_x_and_nothing_os/${fileName}`,
      })

      process.stdout.write(`${features.length} stacks, ${index.features.at(-1).slides_count} slides\n`)
    } catch (error) {
      index.products_failed += 1
      index.failed.push({
        ...source,
        related_type: 'mobile',
        related_id: mobile.id,
        related_slug: mobile.slug,
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
