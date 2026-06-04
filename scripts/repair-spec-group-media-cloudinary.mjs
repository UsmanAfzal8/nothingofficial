import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEST_ROOT = path.resolve(__dirname, '..')
const SOURCE_ROOT = '/Users/mosin/projects/nothingPakistan'
const REPORT_DIR = path.join(DEST_ROOT, 'migration-reports')
const FETCH_TIMEOUT_MS = 45000
const MAX_PARALLEL_UPLOADS = 3

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) throw new Error(`Missing env file: ${filePath}`)
  const env = {}
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const separatorIndex = trimmed.indexOf('=')
    env[trimmed.slice(0, separatorIndex).trim()] = trimmed
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '')
  }
  return env
}

function requireEnv(env, key, label) {
  if (!env[key]) throw new Error(`Missing ${label} env value: ${key}`)
  return env[key]
}

function createSupabase(env, label) {
  return createClient(requireEnv(env, 'SUPABASE_URL', label), requireEnv(env, 'SUPABASE_SERVICE_ROLE_KEY', label), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function slugify(value, fallback = 'asset') {
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
  return String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(value, maxLength) {
  const text = compactText(value)
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1).replace(/\s+\S*$/, '').trim() || text.slice(0, maxLength - 1).trim()
}

function contextPair(key, value, maxLength = 900) {
  const normalized = truncate(value, maxLength).replace(/[|=]/g, ' ').replace(/\s+/g, ' ').trim()
  return normalized ? `${key}=${normalized}` : null
}

function cloudinarySignature(params, apiSecret) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return createHash('sha1').update(`${payload}${apiSecret}`).digest('hex')
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

async function downloadUrl(url) {
  const response = await withTimeout(
    (signal) => fetch(url, { method: 'GET', redirect: 'follow', signal }),
    FETCH_TIMEOUT_MS,
    `download ${url}`,
  )
  if (!response.ok) throw new Error(`Failed to download ${url}: HTTP ${response.status}`)
  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get('content-type') ?? '',
  }
}

function extensionFromUrl(url) {
  try {
    return path.extname(new URL(url).pathname).replace('.', '').toLowerCase()
  } catch {
    return ''
  }
}

function inferResourceType(url, contentType, mediaType) {
  const ext = extensionFromUrl(url)
  if (mediaType === 'video' || contentType.startsWith('video/') || ['mp4', 'mov', 'm4v', 'webm'].includes(ext)) {
    return { resourceType: 'video', outputExtension: ext || 'mp4', contentType }
  }
  return { resourceType: 'image', outputExtension: ['webp', 'avif'].includes(ext) ? ext : 'webp', contentType }
}

async function prepareAsset(buffer, kind, sourceContentType) {
  if (kind.resourceType !== 'image') return { buffer, contentType: sourceContentType || 'application/octet-stream' }
  if (kind.outputExtension === 'webp' && !sourceContentType.includes('webp')) {
    return { buffer: await sharp(buffer).webp({ quality: 86 }).toBuffer(), contentType: 'image/webp' }
  }
  if (kind.outputExtension === 'avif') return { buffer, contentType: 'image/avif' }
  return { buffer, contentType: sourceContentType || 'image/webp' }
}

async function uploadToCloudinary({ cloudinaryEnv, buffer, contentType, resourceType, folder, publicId, tags, context, fileName }) {
  const timestamp = Math.floor(Date.now() / 1000)
  const params = {
    context,
    folder,
    overwrite: 'true',
    public_id: publicId,
    tags: tags.join(','),
    timestamp,
  }
  const signature = cloudinarySignature(params, requireEnv(cloudinaryEnv, 'CLOUDINARY_API_SECRET', 'destination'))
  const formData = new FormData()
  formData.set('file', new Blob([buffer], { type: contentType || 'application/octet-stream' }), fileName)
  formData.set('api_key', requireEnv(cloudinaryEnv, 'CLOUDINARY_API_KEY', 'destination'))
  formData.set('context', params.context)
  formData.set('folder', params.folder)
  formData.set('overwrite', params.overwrite)
  formData.set('public_id', params.public_id)
  formData.set('tags', params.tags)
  formData.set('timestamp', String(params.timestamp))
  formData.set('signature', signature)

  const cloudName = requireEnv(cloudinaryEnv, 'CLOUDINARY_CLOUD_NAME', 'destination')
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
  const response = await fetch(endpoint, { method: 'POST', body: formData })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(`Cloudinary upload failed for ${publicId}: HTTP ${response.status} ${JSON.stringify(body)}`)
  }
  return body
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

async function checkUrl(url) {
  const response = await withTimeout(
    (signal) => fetch(url, { method: 'HEAD', redirect: 'follow', signal }),
    FETCH_TIMEOUT_MS,
    `HEAD ${url}`,
  )
  return { ok: response.ok, status: response.status, contentType: response.headers.get('content-type') ?? '' }
}

async function main() {
  const sourceEnv = loadEnvFile(path.join(SOURCE_ROOT, '.env.local'))
  const destEnv = loadEnvFile(path.join(DEST_ROOT, '.env.local'))
  const source = createSupabase(sourceEnv, 'source')
  const dest = createSupabase(destEnv, 'destination')

  const { data: sourceRows, error: sourceError } = await source
    .from('spec_groups')
    .select('id,related_type,related_id,title,media_type,media_url,media_alt')
    .not('media_url', 'is', null)
    .order('id', { ascending: true })
  if (sourceError) throw new Error(`Failed to fetch source spec_groups: ${sourceError.message}`)

  const rows = sourceRows ?? []
  const uploaded = []
  const failures = []

  await mapLimit(rows, MAX_PARALLEL_UPLOADS, async (row) => {
    try {
      const downloaded = await downloadUrl(row.media_url)
      const kind = inferResourceType(row.media_url, downloaded.contentType, row.media_type)
      const prepared = await prepareAsset(downloaded.buffer, kind, downloaded.contentType)
      const sourceBaseName = slugify(path.basename(new URL(row.media_url).pathname, path.extname(new URL(row.media_url).pathname)))
      const title = compactText(row.title) || `Spec group ${row.id}`
      const relatedSlug = `${row.related_type}-${row.related_id}`
      const publicId = slugify(`${relatedSlug}-${row.id}-${title}-${sourceBaseName}`).slice(0, 120)
      const folder = `nothing-official-store-pakistan/spec-groups/${slugify(relatedSlug)}/${kind.resourceType}`
      const tags = ['nothing-official-store-pakistan', 'nothing-official-pakistan', 'pakistan-store', 'spec-groups', kind.resourceType]
      const context = [
        contextPair('brand', 'Nothing Official Store Pakistan'),
        contextPair('title', `${title} specification media | Nothing Official Store Pakistan`, 240),
        contextPair('description', `${kind.resourceType} asset for the ${title} specification group, prepared for Nothing Official Store Pakistan in Pakistan.`, 900),
        contextPair('alt', row.media_alt || `${title} specification media for Nothing Official Store Pakistan`, 240),
        contextPair('source_table', 'spec_groups'),
        contextPair('source_row_id', row.id),
        contextPair('related_type', row.related_type),
        contextPair('related_id', row.related_id),
        contextPair('original_url', row.media_url, 900),
      ].filter(Boolean).join('|')

      const result = await uploadToCloudinary({
        cloudinaryEnv: destEnv,
        buffer: prepared.buffer,
        contentType: prepared.contentType,
        resourceType: kind.resourceType,
        folder,
        publicId,
        tags,
        context,
        fileName: `${publicId}.${kind.outputExtension}`,
      })

      const { error: updateError } = await dest
        .from('spec_groups')
        .update({ media_url: result.secure_url })
        .eq('id', row.id)
      if (updateError) throw new Error(`Failed to update destination spec_groups ${row.id}: ${updateError.message}`)

      uploaded.push({
        id: row.id,
        sourceUrl: row.media_url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        format: result.format,
        bytes: result.bytes,
      })
    } catch (error) {
      failures.push({ id: row.id, sourceUrl: row.media_url, error: error.message })
    }
  })

  const validation = []
  await mapLimit(uploaded, MAX_PARALLEL_UPLOADS, async (item) => {
    validation.push({ id: item.id, url: item.secureUrl, ...(await checkUrl(item.secureUrl)) })
  })

  const { data: destinationRows, error: destinationError } = await dest
    .from('spec_groups')
    .select('id,media_url')
    .not('media_url', 'is', null)
    .order('id', { ascending: true })
  if (destinationError) throw new Error(`Failed to fetch destination spec_groups: ${destinationError.message}`)

  const report = {
    generatedAt: new Date().toISOString(),
    sourceRowsWithMedia: rows.length,
    uploadedCount: uploaded.length,
    failures,
    validation: {
      checked: validation.length,
      failed: validation.filter((item) => !item.ok),
    },
    destination: {
      rowsWithMedia: destinationRows?.length ?? 0,
      nonCloudinaryRows: (destinationRows ?? []).filter((row) => {
        try {
          return new URL(row.media_url).hostname !== `res.cloudinary.com`
        } catch {
          return true
        }
      }),
    },
    uploaded,
  }

  mkdirSync(REPORT_DIR, { recursive: true })
  const reportPath = path.join(REPORT_DIR, `${new Date().toISOString().replace(/[:.]/g, '-')}-spec-groups-media-repair.json`)
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify({
    reportPath,
    sourceRowsWithMedia: report.sourceRowsWithMedia,
    uploadedCount: report.uploadedCount,
    failureCount: report.failures.length,
    validationFailed: report.validation.failed.length,
    destinationRowsWithMedia: report.destination.rowsWithMedia,
    destinationNonCloudinaryRows: report.destination.nonCloudinaryRows.length,
  }, null, 2))

  if (failures.length > 0 || report.validation.failed.length > 0 || report.destination.nonCloudinaryRows.length > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
