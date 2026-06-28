import { createClient } from '@supabase/supabase-js'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'database', 'nothing_x_and_nothing_os')
const INDEX_FILE = path.join(DATA_DIR, 'products.json')
const REPORT_FILE = path.join(DATA_DIR, 'upload-import-report.json')
const REMOTE_BASE_DIR = 'product-features'
const MAX_HLS_WIDTH = Number(process.env.PRODUCT_FEATURE_MAX_HLS_WIDTH || 1280)

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

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

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

function getBunnyStorageBaseUrl(region) {
  return region.toLowerCase() === 'de' ? 'https://storage.bunnycdn.com' : `https://${region}.storage.bunnycdn.com`
}

function extensionForUrl(url, fallback = '.jpg') {
  const ext = path.extname(new URL(url).pathname).toLowerCase()
  return ext || fallback
}

function mimeTypeForExt(ext) {
  if (ext === '.avif') return 'image/avif'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.m3u8') return 'application/vnd.apple.mpegurl'
  if (ext === '.m4s' || ext === '.mp4' || ext === '.cmfv') return 'video/mp4'
  if (ext === '.png') return 'image/png'
  if (ext === '.ts') return 'video/mp2t'
  if (ext === '.webp') return 'image/webp'
  return 'application/octet-stream'
}

function createBunnyClient() {
  const bunnyZone = requireEnv('BUNNY_STORAGE_ZONE_NAME')
  const bunnyAccessKey = requireEnv('BUNNY_ACCESS_KEY')
  const bunnyCdnHostname = requireEnv('BUNNY_CDN_HOSTNAME')
  const bunnyStorageBaseUrl = getBunnyStorageBaseUrl(process.env.BUNNY_STORAGE_REGION || 'de')

  async function uploadBuffer(buffer, remotePath, contentType) {
    const response = await fetch(`${bunnyStorageBaseUrl}/${bunnyZone}/${remotePath}`, {
      method: 'PUT',
      headers: {
        AccessKey: bunnyAccessKey,
        'Content-Type': contentType,
      },
      body: buffer,
    })

    if (!response.ok) {
      throw new Error(`Bunny upload failed for ${remotePath}: ${response.status} ${await response.text().catch(() => '')}`)
    }

    return `https://${bunnyCdnHostname}/${remotePath}`
  }

  return { uploadBuffer }
}

async function fetchBuffer(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Fetch failed for ${url}: ${response.status}`)
  return Buffer.from(await response.arrayBuffer())
}

async function uploadRemoteFile(bunny, sourceUrl, remotePath) {
  const buffer = await fetchBuffer(sourceUrl)
  return bunny.uploadBuffer(buffer, remotePath, mimeTypeForExt(path.extname(remotePath).toLowerCase()))
}

function parseMasterVariants(m3u8, baseUrl) {
  const lines = m3u8.split(/\r?\n/)
  const variants = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (!line.startsWith('#EXT-X-STREAM-INF')) continue

    const nextUri = lines.slice(index + 1).find((candidate) => candidate.trim() && !candidate.startsWith('#'))
    if (!nextUri) continue

    const resolution = line.match(/RESOLUTION=(\d+)x(\d+)/)
    variants.push({
      url: new URL(nextUri.trim(), baseUrl).toString(),
      width: resolution ? Number(resolution[1]) : 0,
      height: resolution ? Number(resolution[2]) : 0,
    })
  }

  return variants
}

function chooseVariant(variants) {
  const sorted = [...variants].sort((a, b) => b.width - a.width)
  return sorted.find((variant) => variant.width <= MAX_HLS_WIDTH) ?? sorted[sorted.length - 1] ?? null
}

function replaceAttributeUri(line, replacement) {
  return line.replace(/URI="[^"]+"/, `URI="${replacement}"`)
}

async function mirrorMediaPlaylist(bunny, playlistUrl, remoteDir) {
  const playlistText = await fetch(playlistUrl).then((response) => {
    if (!response.ok) throw new Error(`Fetch failed for ${playlistUrl}: ${response.status}`)
    return response.text()
  })

  const rewritten = []
  let assetIndex = 0

  for (const rawLine of playlistText.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (!line) {
      rewritten.push(rawLine)
      continue
    }

    const uriAttribute = line.match(/URI="([^"]+)"/)
    if (line.startsWith('#') && uriAttribute) {
      const sourceUrl = new URL(uriAttribute[1], playlistUrl).toString()
      const ext = extensionForUrl(sourceUrl, '.bin')
      const fileName = `asset-${String(assetIndex).padStart(3, '0')}${ext}`
      await uploadRemoteFile(bunny, sourceUrl, `${remoteDir}/${fileName}`)
      assetIndex += 1
      rewritten.push(replaceAttributeUri(rawLine, fileName))
      continue
    }

    if (line.startsWith('#')) {
      rewritten.push(rawLine)
      continue
    }

    const sourceUrl = new URL(line, playlistUrl).toString()
    const ext = extensionForUrl(sourceUrl, '.ts')
    const fileName = `segment-${String(assetIndex).padStart(3, '0')}${ext}`
    await uploadRemoteFile(bunny, sourceUrl, `${remoteDir}/${fileName}`)
    assetIndex += 1
    rewritten.push(fileName)
  }

  const playlistPath = `${remoteDir}/video.m3u8`
  const cdnUrl = await bunny.uploadBuffer(Buffer.from(rewritten.join('\n')), playlistPath, mimeTypeForExt('.m3u8'))

  return { cdnUrl, assetsUploaded: assetIndex + 1 }
}

async function mirrorHlsVideo(bunny, sourceUrl, remoteDir) {
  const masterText = await fetch(sourceUrl).then((response) => {
    if (!response.ok) throw new Error(`Fetch failed for ${sourceUrl}: ${response.status}`)
    return response.text()
  })
  const variants = parseMasterVariants(masterText, sourceUrl)
  const variant = chooseVariant(variants)

  if (variant) return mirrorMediaPlaylist(bunny, variant.url, remoteDir)
  return mirrorMediaPlaylist(bunny, sourceUrl, remoteDir)
}

async function checkSupabaseTables(supabase) {
  const { error: sectionError } = await supabase
    .from('product_feature_sections')
    .select('id,feature_version')
    .limit(1)
  if (sectionError) throw new Error(`Supabase product_feature_sections check failed: ${sectionError.message}`)

  const { error: slideError } = await supabase.from('product_feature_slides').select('id').limit(1)
  if (slideError) throw new Error(`Supabase product_feature_slides check failed: ${slideError.message}`)
}

async function uploadFeatureMedia(bunny, productData, report) {
  let changed = false

  for (const feature of productData.features ?? []) {
    const featureDir = `${REMOTE_BASE_DIR}/${productData.handle}/${feature.feature_key}`

    if (feature.cover_image_url && !feature.cover_image_url.includes('cdn.nothingpakistan.pk/')) {
      const ext = extensionForUrl(feature.cover_image_url)
      feature.cover_image_url = await uploadRemoteFile(bunny, feature.cover_image_url, `${featureDir}/cover${ext}`)
      report.images_uploaded += 1
      changed = true
    }

    if (feature.cover_thumbnail_url && !feature.cover_thumbnail_url.includes('cdn.nothingpakistan.pk/')) {
      feature.cover_thumbnail_url = await uploadRemoteFile(bunny, feature.cover_thumbnail_url, `${featureDir}/cover-thumb.jpg`)
      report.images_uploaded += 1
      changed = true
    }

    if (feature.cover_video_url && !feature.cover_video_url.includes('cdn.nothingpakistan.pk/')) {
      const mirrored = await mirrorHlsVideo(bunny, feature.cover_video_url, `${featureDir}/cover-video`)
      feature.cover_video_url = mirrored.cdnUrl
      report.videos_uploaded += 1
      report.video_assets_uploaded += mirrored.assetsUploaded
      changed = true
    }

    for (const slide of feature.slides ?? []) {
      const slideSlug = `${String(slide.sort_order ?? 0).padStart(2, '0')}-${slugify(slide.title)}`
      const slideDir = `${featureDir}/${slideSlug}`

      if (slide.image_url && !slide.image_url.includes('cdn.nothingpakistan.pk/')) {
        const ext = extensionForUrl(slide.image_url)
        slide.image_url = await uploadRemoteFile(bunny, slide.image_url, `${slideDir}/image${ext}`)
        report.images_uploaded += 1
        changed = true
      }

      if (slide.thumbnail_url && !slide.thumbnail_url.includes('cdn.nothingpakistan.pk/')) {
        slide.thumbnail_url = await uploadRemoteFile(bunny, slide.thumbnail_url, `${slideDir}/thumb.jpg`)
        report.images_uploaded += 1
        changed = true
      }

      if (slide.video_url && !slide.video_url.includes('cdn.nothingpakistan.pk/')) {
        const mirrored = await mirrorHlsVideo(bunny, slide.video_url, `${slideDir}/video`)
        slide.video_url = mirrored.cdnUrl
        report.videos_uploaded += 1
        report.video_assets_uploaded += mirrored.assetsUploaded
        changed = true
      }
    }
  }

  return changed
}

async function importProductFeatures(supabase, productData, report) {
  for (const feature of productData.features ?? []) {
    const { data: existingSections, error: findError } = await supabase
      .from('product_feature_sections')
      .select('id')
      .eq('related_type', feature.related_type)
      .eq('related_id', feature.related_id)
      .eq('feature_key', feature.feature_key)

    if (findError) throw findError

    const existingIds = (existingSections ?? []).map((row) => row.id)
    if (existingIds.length > 0) {
      const { error: slideDeleteError } = await supabase
        .from('product_feature_slides')
        .delete()
        .in('product_feature_section_id', existingIds)
      if (slideDeleteError) throw slideDeleteError

      const { error: sectionDeleteError } = await supabase
        .from('product_feature_sections')
        .delete()
        .eq('related_type', feature.related_type)
        .eq('related_id', feature.related_id)
        .eq('feature_key', feature.feature_key)
      if (sectionDeleteError) throw sectionDeleteError
    }

    const sectionRow = {
      related_type: feature.related_type,
      related_id: feature.related_id,
      source_key: feature.source_key ?? null,
      feature_key: feature.feature_key,
      feature_title: feature.feature_title,
      feature_version: feature.feature_version ?? null,
      title: feature.title,
      display_context: feature.display_context ?? 'mobile',
      cover_image_url: feature.cover_image_url ?? null,
      cover_video_playback_id: feature.cover_video_playback_id ?? null,
      cover_video_url: feature.cover_video_url ?? null,
      cover_thumbnail_url: feature.cover_thumbnail_url ?? null,
      sort_order: Number(feature.sort_order ?? 0),
      active: true,
      updated_at: new Date().toISOString(),
    }

    const { data: insertedSection, error: sectionError } = await supabase
      .from('product_feature_sections')
      .insert(sectionRow)
      .select('id')
      .single()

    if (sectionError) throw sectionError

    report.sections_imported += 1

    const slideRows = (feature.slides ?? []).map((slide) => ({
      product_feature_section_id: insertedSection.id,
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
    }))

    if (slideRows.length > 0) {
      const { error: slideError } = await supabase.from('product_feature_slides').insert(slideRows)
      if (slideError) throw slideError
      report.slides_imported += slideRows.length
    }
  }
}

async function main() {
  loadEnv()

  if (!existsSync(INDEX_FILE)) throw new Error(`Missing ${INDEX_FILE}. Run scripts/extract-nothing-software-features.mjs first.`)

  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  await checkSupabaseTables(supabase)

  const bunny = createBunnyClient()
  const index = readJson(INDEX_FILE)
  const report = {
    imported_at: new Date().toISOString(),
    products_seen: index.features.length,
    products_imported: 0,
    sections_imported: 0,
    slides_imported: 0,
    images_uploaded: 0,
    videos_uploaded: 0,
    video_assets_uploaded: 0,
    failed: [],
  }

  mkdirSync(DATA_DIR, { recursive: true })

  for (const featureSummary of index.features) {
    const filePath = path.join(ROOT, featureSummary.json_file)
    process.stdout.write(`Importing ${featureSummary.handle} ${featureSummary.feature_key}... `)

    try {
      const productData = readJson(filePath)
      const changed = await uploadFeatureMedia(bunny, productData, report)
      if (changed) writeJson(filePath, productData)

      await importProductFeatures(supabase, productData, report)
      report.products_imported += 1
      process.stdout.write('done\n')
    } catch (error) {
      report.failed.push({
        handle: featureSummary.handle,
        feature_key: featureSummary.feature_key,
        error: error.message,
      })
      process.stdout.write(`failed: ${error.message}\n`)
    }
  }

  writeJson(REPORT_FILE, report)

  if (report.failed.length > 0) {
    throw new Error(`${report.failed.length} feature imports failed. See database/nothing_x_and_nothing_os/upload-import-report.json`)
  }

  console.log(`\nWrote ${REPORT_FILE}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
