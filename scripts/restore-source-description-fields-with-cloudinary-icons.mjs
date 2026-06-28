import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEST_ROOT = path.resolve(__dirname, '..')
const SOURCE_ROOT = '/Users/mosin/projects/nothingPakistan'
const REPORT_DIR = path.join(DEST_ROOT, 'migration-reports')
const URL_RE = /\bhttps?:\/\/[^\s"'<>),\\\]]+/gi
const TARGETS = [
  { table: 'products', field: 'short_description' },
  { table: 'mobiles', field: 'description' },
]

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

function contextPair(key, value) {
  const normalized = compactText(value).replace(/[|=]/g, ' ').slice(0, 900).trim()
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

async function fetchAllRows(supabase, table, field) {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select(`id,slug,name,${field}`).order('id', { ascending: true }).range(from, from + 999)
    if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`)
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return rows
}

function collectUrls(value) {
  if (typeof value !== 'string') return []
  return [...value.matchAll(URL_RE)].map((item) => item[0])
}

function cloudinaryIconUrl(cloudName, sourceUrl) {
  const sourcePath = new URL(sourceUrl).pathname
  const basename = path.basename(sourcePath, path.extname(sourcePath))
  const publicId = slugify(basename)
  return `https://res.cloudinary.com/${cloudName}/raw/upload/nothing-official-store-pakistan/icons/product-detail/${publicId}.svg`
}

async function urlExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    return response.ok
  } catch {
    return false
  }
}

async function uploadSvgToCloudinary(destEnv, sourceUrl) {
  const cloudName = requireEnv(destEnv, 'CLOUDINARY_CLOUD_NAME', 'destination')
  const existingUrl = cloudinaryIconUrl(cloudName, sourceUrl)
  if (await urlExists(existingUrl)) {
    return { secureUrl: existingUrl, uploaded: false }
  }

  const response = await fetch(sourceUrl, { method: 'GET', redirect: 'follow' })
  if (!response.ok) throw new Error(`Failed to download SVG ${sourceUrl}: HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  const basename = path.basename(new URL(sourceUrl).pathname, path.extname(new URL(sourceUrl).pathname))
  const publicId = slugify(basename)
  const folder = 'nothing-official-store-pakistan/icons/product-detail'
  const tags = ['nothing-pakistan', 'nothing-pakistan', 'pakistan-store', 'product-detail-icon', publicId]
  const context = [
    contextPair('brand', 'Nothing Pakistan'),
    contextPair('title', `${basename} icon | Nothing Pakistan`),
    contextPair('description', `${basename} SVG icon used in product and mobile description content for Nothing Pakistan.`),
    contextPair('source_url', sourceUrl),
  ].filter(Boolean).join('|')
  const timestamp = Math.floor(Date.now() / 1000)
  const params = {
    context,
    folder,
    overwrite: 'true',
    public_id: publicId,
    tags: tags.join(','),
    timestamp,
  }
  const signature = cloudinarySignature(params, requireEnv(destEnv, 'CLOUDINARY_API_SECRET', 'destination'))
  const formData = new FormData()
  formData.set('file', new Blob([buffer], { type: 'image/svg+xml' }), `${publicId}.svg`)
  formData.set('api_key', requireEnv(destEnv, 'CLOUDINARY_API_KEY', 'destination'))
  formData.set('context', params.context)
  formData.set('folder', params.folder)
  formData.set('overwrite', params.overwrite)
  formData.set('public_id', params.public_id)
  formData.set('tags', params.tags)
  formData.set('timestamp', String(params.timestamp))
  formData.set('signature', signature)

  const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
    method: 'POST',
    body: formData,
  })
  const body = await uploadResponse.json().catch(() => null)
  if (!uploadResponse.ok) {
    throw new Error(`Cloudinary SVG upload failed for ${sourceUrl}: HTTP ${uploadResponse.status} ${JSON.stringify(body)}`)
  }

  return { secureUrl: body.secure_url, uploaded: true }
}

function replaceAllUrls(value, replacements) {
  if (typeof value !== 'string') return value
  let next = value
  for (const [sourceUrl, cloudinaryUrl] of replacements.entries()) {
    next = next.split(sourceUrl).join(cloudinaryUrl)
  }
  return next
}

function restoreSourceUrls(value, replacements) {
  if (typeof value !== 'string') return value
  let next = value
  for (const [sourceUrl, cloudinaryUrl] of replacements.entries()) {
    next = next.split(cloudinaryUrl).join(sourceUrl)
  }
  return next
}

function normalizeStoreCopy(value) {
  if (typeof value !== 'string') return value

  return value
    .replace(/Nothing Pakistan/g, 'Nothing Pakistan')
    .replace(/nothing pakistan/g, 'nothing pakistan')
    .replace(/Nothing Pakistan/g, 'Nothing Pakistan')
    .replace(/nothing pakistan/g, 'nothing pakistan')
    .replace(/Nothing Shop Pakistan/g, 'Nothing Pakistan')
    .replace(/\bnothingshop\.pk\b/g, 'www.nothingpakistan.pk')
}

async function main() {
  const sourceEnv = loadEnvFile(path.join(SOURCE_ROOT, '.env.local'))
  const destEnv = loadEnvFile(path.join(DEST_ROOT, '.env.local'))
  const source = createSupabase(sourceEnv, 'source')
  const dest = createSupabase(destEnv, 'destination')

  const sourceRowsByTarget = {}
  const allIconUrls = new Set()
  for (const target of TARGETS) {
    const rows = await fetchAllRows(source, target.table, target.field)
    sourceRowsByTarget[`${target.table}.${target.field}`] = rows
    for (const row of rows) {
      for (const url of collectUrls(row[target.field])) {
        if (/^https:\/\/cdn\.nothingshop\.pk\/icons\/product-detail\/.+\.svg$/i.test(url)) {
          allIconUrls.add(url)
        }
      }
    }
  }

  const replacements = new Map()
  const iconUploads = []
  for (const sourceUrl of [...allIconUrls].sort()) {
    const result = await uploadSvgToCloudinary(destEnv, sourceUrl)
    replacements.set(sourceUrl, result.secureUrl)
    iconUploads.push({ sourceUrl, secureUrl: result.secureUrl, uploaded: result.uploaded })
  }

  const updatedRows = []
  for (const target of TARGETS) {
    const rows = sourceRowsByTarget[`${target.table}.${target.field}`]
    for (const row of rows) {
      const exactSourceValue = row[target.field]
      const nextValue = normalizeStoreCopy(replaceAllUrls(exactSourceValue, replacements))
      const { error } = await dest.from(target.table).update({ [target.field]: nextValue }).eq('id', row.id)
      if (error) throw new Error(`Failed to update ${target.table}.${target.field} id ${row.id}: ${error.message}`)
      updatedRows.push({ table: target.table, field: target.field, id: row.id, slug: row.slug, changed: nextValue !== exactSourceValue })
    }
  }

  const validation = []
  for (const target of TARGETS) {
    const sourceRows = sourceRowsByTarget[`${target.table}.${target.field}`]
    const sourceById = new Map(sourceRows.map((row) => [row.id, row]))
    const destinationRows = await fetchAllRows(dest, target.table, target.field)
    for (const row of destinationRows) {
      const sourceRow = sourceById.get(row.id)
      const restored = restoreSourceUrls(row[target.field], replacements)
      const expectedSourceValue = normalizeStoreCopy(sourceRow?.[target.field])
      validation.push({
        table: target.table,
        field: target.field,
        id: row.id,
        exactAfterRestoringUrls: restored === expectedSourceValue,
        destinationSourceIconUrlHits: collectUrls(row[target.field]).filter((url) => url.includes('cdn.nothingpakistan.pk/icons/product-detail')).length,
      })
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    uniqueIconUrls: allIconUrls.size,
    iconUploads,
    updatedRows,
    validation,
    failedValidation: validation.filter((item) => !item.exactAfterRestoringUrls || item.destinationSourceIconUrlHits > 0),
  }

  mkdirSync(REPORT_DIR, { recursive: true })
  const reportPath = path.join(REPORT_DIR, `${new Date().toISOString().replace(/[:.]/g, '-')}-restore-source-description-fields.json`)
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify({
    reportPath,
    uniqueIconUrls: report.uniqueIconUrls,
    uploadedIcons: iconUploads.filter((item) => item.uploaded).length,
    reusedIcons: iconUploads.filter((item) => !item.uploaded).length,
    updatedRows: updatedRows.length,
    changedRows: updatedRows.filter((item) => item.changed).length,
    failedValidation: report.failedValidation.length,
  }, null, 2))

  if (report.failedValidation.length > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
