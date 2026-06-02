import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const MOBILE_FILE = path.join(ROOT, 'database', 'mobile.json')
const REPORT_FILE = path.join(ROOT, 'database', 'nothing_x_and_nothing_os', 'video-sync-report.json')

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

function compactText(value) {
  if (!value) return ''
  if (typeof value === 'string') return value.replace(/\s+/g, ' ').trim()
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
      // Ignore non-product streamed chunks.
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

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'user-agent': 'Mozilla/5.0 NothingPakistan official feature video sync',
    },
  })

  if (!response.ok) throw new Error(`Fetch failed for ${url}: ${response.status}`)
  return response.text()
}

function findPlaybackId(value) {
  if (!value) return null

  if (typeof value === 'string') {
    const muxMatch = value.match(/stream\.mux\.com\/([^/.?]+)/)
    return muxMatch?.[1] ?? null
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const playbackId = findPlaybackId(item)
      if (playbackId) return playbackId
    }

    return null
  }

  if (typeof value === 'object') {
    if (typeof value.playbackId === 'string') return value.playbackId
    if (typeof value.mediaStream?.playbackId === 'string') return value.mediaStream.playbackId

    for (const item of Object.values(value)) {
      const playbackId = findPlaybackId(item)
      if (playbackId) return playbackId
    }
  }

  return null
}

function muxStreamUrl(playbackId) {
  return `https://stream.mux.com/${playbackId}.m3u8`
}

function muxThumbnailUrl(playbackId) {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=0`
}

function loadMobileBySlug() {
  const mobiles = JSON.parse(readFileSync(MOBILE_FILE, 'utf8'))
  return new Map(mobiles.map((mobile) => [mobile.slug, mobile]))
}

async function syncFeatureVideos(supabase, source, mobile, product) {
  const widgets = product?.sanityContent?.widgets?.filter((widget) => widget._type === 'widgetStack') ?? []
  const stats = {
    sections_seen: 0,
    section_videos_updated: 0,
    slide_videos_updated: 0,
    missing_sections: [],
  }

  for (const widget of widgets) {
    const featureTitle = compactText(widget.title)
    if (!featureTitle) continue

    const featureKey = `official-${slugify(featureTitle)}`
    stats.sections_seen += 1

    const { data: section, error: sectionError } = await supabase
      .from('product_feature_sections')
      .select('id')
      .eq('related_type', 'mobile')
      .eq('related_id', mobile.id)
      .eq('feature_key', featureKey)
      .eq('active', true)
      .maybeSingle()

    if (sectionError) throw sectionError
    if (!section?.id) {
      stats.missing_sections.push(featureKey)
      continue
    }

    const coverPlaybackId = findPlaybackId(widget.cover)
    if (coverPlaybackId) {
      const { error } = await supabase
        .from('product_feature_sections')
        .update({
          cover_video_playback_id: coverPlaybackId,
          cover_video_url: muxStreamUrl(coverPlaybackId),
          cover_thumbnail_url: muxThumbnailUrl(coverPlaybackId),
          updated_at: new Date().toISOString(),
        })
        .eq('id', section.id)

      if (error) throw error
      stats.section_videos_updated += 1
    }

    for (const [slideIndex, slide] of (widget.slides ?? []).entries()) {
      const playbackId = findPlaybackId(slide.video ?? slide.videoAsset ?? slide)
      const sourceKey = slide._key ?? null
      if (!playbackId || !sourceKey) continue

      const { error } = await supabase
        .from('product_feature_slides')
        .update({
          media_type: 'video',
          video_playback_id: playbackId,
          video_url: muxStreamUrl(playbackId),
          thumbnail_url: muxThumbnailUrl(playbackId),
          updated_at: new Date().toISOString(),
        })
        .eq('product_feature_section_id', section.id)
        .eq('source_key', sourceKey)

      if (error) throw error
      stats.slide_videos_updated += 1
    }
  }

  return {
    handle: source.handle,
    related_slug: mobile.slug,
    ...stats,
  }
}

async function main() {
  loadEnv()

  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const mobileBySlug = loadMobileBySlug()
  const report = {
    synced_at: new Date().toISOString(),
    products_checked: OFFICIAL_PHONES.length,
    products_synced: 0,
    section_videos_updated: 0,
    slide_videos_updated: 0,
    products: [],
    failed: [],
  }

  for (const source of OFFICIAL_PHONES) {
    const mobile = mobileBySlug.get(source.relatedSlug)
    if (!mobile) {
      report.failed.push({ handle: source.handle, error: `No local mobile found for ${source.relatedSlug}` })
      continue
    }

    process.stdout.write(`Syncing ${source.handle} feature videos... `)

    try {
      const html = await fetchText(source.url)
      const product = findProductRoute(html)
      if (!product) throw new Error('Could not find official product payload')

      const productReport = await syncFeatureVideos(supabase, source, mobile, product)
      report.products.push(productReport)
      report.products_synced += 1
      report.section_videos_updated += productReport.section_videos_updated
      report.slide_videos_updated += productReport.slide_videos_updated
      process.stdout.write(`${productReport.section_videos_updated} covers, ${productReport.slide_videos_updated} slides\n`)
    } catch (error) {
      report.failed.push({ handle: source.handle, error: error.message })
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
