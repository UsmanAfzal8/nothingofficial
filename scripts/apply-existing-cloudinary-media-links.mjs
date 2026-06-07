import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEST_ROOT = path.resolve(__dirname, '..')
const SOURCE_ROOT = '/Users/mosin/projects/nothingPakistan'
const REPORT_DIR = path.join(DEST_ROOT, 'migration-reports')
const DEFAULT_MIGRATION_REPORT = path.join(REPORT_DIR, '2026-06-04T00-44-57-865Z-replace.json')

const TABLES = [
  'products',
  'mobiles',
  'images',
  'product_feature_sections',
  'product_feature_slides',
  'orders',
]

const URL_RE = /\bhttps?:\/\/[^\s"'<>),\\\]]+/gi
const MEDIA_FIELD_RE = /(^|\.)(image|image_url|video_url|thumbnail_url|cover_image_url|cover_video_url|cover_thumbnail_url|media_url|url|file_name)$/i
const MEDIA_HINT_RE = /(image|video|thumbnail|media|asset|file|gallery|poster|playback)/i
const PAGE_URL_PATH_RE = /^(canonical_url|schema_json\.url|schema_json\.offers\.url|schema_json\.offers\.availability|schema_json\.offers\.itemCondition|schema_json\.@context|schema_json\.isRelatedTo)/i
const DEST_MEDIA_HOSTS = new Set(['www.cmfbynothing.pk', 'cmfbynothing.pk'])

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

async function fetchAllRows(supabase, table) {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select('*').order('id', { ascending: true }).range(from, from + 999)
    if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`)
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return rows
}

function collectUrls(value, pathParts = [], out = []) {
  if (typeof value === 'string') {
    for (const match of value.matchAll(URL_RE)) {
      out.push({ path: pathParts.join('.'), url: match[0] })
    }
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => collectUrls(item, [...pathParts, index], out))
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      collectUrls(item, [...pathParts, key], out)
    }
  }
  return out
}

function getValueAtPath(row, dottedPath) {
  const parts = dottedPath.split('.')
  let current = row
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    current = current[part]
  }
  return current
}

function setValueAtPath(row, dottedPath, value) {
  const parts = dottedPath.split('.')
  const next = { ...row }
  let current = next
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index]
    const oldValue = current[part]
    current[part] = Array.isArray(oldValue) ? [...oldValue] : { ...oldValue }
    current = current[part]
  }
  current[parts[parts.length - 1]] = value
  return next
}

function topLevelField(pathValue) {
  return pathValue.split('.')[0]
}

function isCloudinaryUrl(url) {
  try {
    return new URL(url).hostname === 'res.cloudinary.com'
  } catch {
    return false
  }
}

function isDestinationMediaOccurrence(occurrence) {
  if (PAGE_URL_PATH_RE.test(occurrence.path)) return false
  if (!MEDIA_FIELD_RE.test(occurrence.path) && !MEDIA_HINT_RE.test(occurrence.path)) return false
  try {
    return DEST_MEDIA_HOSTS.has(new URL(occurrence.url).hostname.toLowerCase())
  } catch {
    return false
  }
}

function sourceUrlForOccurrence(sourceRow, pathValue) {
  const value = getValueAtPath(sourceRow, pathValue)
  if (typeof value !== 'string') return null
  const urls = [...value.matchAll(URL_RE)].map((item) => item[0])
  return urls.length === 1 ? urls[0] : null
}

function loadCloudinaryMap(reportPath) {
  const report = JSON.parse(readFileSync(reportPath, 'utf8'))
  const entries = report.media?.uploaded ?? []
  const map = new Map()
  for (const entry of entries) {
    if (entry.originalUrl && entry.secureUrl) map.set(entry.originalUrl, entry.secureUrl)
  }
  return map
}

async function checkUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    return { ok: response.ok, status: response.status, contentType: response.headers.get('content-type') ?? '' }
  } catch (error) {
    return { ok: false, status: null, error: error.message }
  }
}

async function main() {
  const reportArgIndex = process.argv.indexOf('--report')
  const reportPath = reportArgIndex >= 0 && process.argv[reportArgIndex + 1]
    ? path.resolve(DEST_ROOT, process.argv[reportArgIndex + 1])
    : DEFAULT_MIGRATION_REPORT
  const dryRun = process.argv.includes('--dry-run')

  const sourceEnv = loadEnvFile(path.join(SOURCE_ROOT, '.env.local'))
  const destEnv = loadEnvFile(path.join(DEST_ROOT, '.env.local'))
  const source = createSupabase(sourceEnv, 'source')
  const dest = createSupabase(destEnv, 'destination')
  const cloudinaryBySourceUrl = loadCloudinaryMap(reportPath)

  const sourceRowsByTable = {}
  const destinationRowsByTable = {}
  for (const table of TABLES) {
    sourceRowsByTable[table] = await fetchAllRows(source, table)
    destinationRowsByTable[table] = await fetchAllRows(dest, table)
  }

  const sourceByTableId = Object.fromEntries(
    TABLES.map((table) => [table, new Map(sourceRowsByTable[table].map((row) => [row.id, row]))]),
  )

  const replacements = []
  const skipped = []
  for (const table of TABLES) {
    for (const destinationRow of destinationRowsByTable[table]) {
      for (const occurrence of collectUrls(destinationRow)) {
        if (!isDestinationMediaOccurrence(occurrence)) continue
        const sourceRow = sourceByTableId[table].get(destinationRow.id)
        const sourceUrl = sourceRow ? sourceUrlForOccurrence(sourceRow, occurrence.path) : null
        const cloudinaryUrl = sourceUrl ? cloudinaryBySourceUrl.get(sourceUrl) : null
        if (!sourceUrl || !cloudinaryUrl) {
          skipped.push({
            table,
            id: destinationRow.id,
            path: occurrence.path,
            destinationUrl: occurrence.url,
            sourceUrl,
            reason: sourceUrl ? 'cloudinary_mapping_not_found' : 'source_url_not_found',
          })
          continue
        }
        replacements.push({
          table,
          id: destinationRow.id,
          path: occurrence.path,
          destinationUrl: occurrence.url,
          sourceUrl,
          cloudinaryUrl,
        })
      }
    }
  }

  const updatesByRow = new Map()
  for (const replacement of replacements) {
    const key = `${replacement.table}:${replacement.id}`
    const current = updatesByRow.get(key) ?? {
      table: replacement.table,
      id: replacement.id,
      row: destinationRowsByTable[replacement.table].find((row) => row.id === replacement.id),
      fields: new Set(),
      replacements: [],
    }
    current.row = setValueAtPath(current.row, replacement.path, replacement.cloudinaryUrl)
    current.fields.add(topLevelField(replacement.path))
    current.replacements.push(replacement)
    updatesByRow.set(key, current)
  }

  const updateFailures = []
  if (!dryRun) {
    for (const update of updatesByRow.values()) {
      const payload = {}
      for (const field of update.fields) payload[field] = update.row[field]
      const { error } = await dest.from(update.table).update(payload).eq('id', update.id)
      if (error) updateFailures.push({ table: update.table, id: update.id, error: error.message })
    }
  }

  const afterRowsByTable = {}
  const remainingNothingOfficialMedia = []
  const cloudinaryUrls = new Set()
  if (!dryRun) {
    for (const table of TABLES) {
      afterRowsByTable[table] = await fetchAllRows(dest, table)
      for (const row of afterRowsByTable[table]) {
        for (const occurrence of collectUrls(row)) {
          if (isDestinationMediaOccurrence(occurrence)) {
            remainingNothingOfficialMedia.push({ table, id: row.id, path: occurrence.path, url: occurrence.url })
          }
          if (isCloudinaryUrl(occurrence.url)) {
            cloudinaryUrls.add(occurrence.url)
          }
        }
      }
    }
  }

  const validation = []
  if (!dryRun) {
    for (const url of cloudinaryUrls) {
      validation.push({ url, ...(await checkUrl(url)) })
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    sourceReportPath: reportPath,
    dryRun,
    cloudinaryMapSize: cloudinaryBySourceUrl.size,
    replacementCount: replacements.length,
    skipped,
    updateFailures,
    remainingNothingOfficialMedia,
    validation: {
      checked: validation.length,
      failed: validation.filter((item) => !item.ok),
    },
    replacementSummary: replacements.reduce((acc, item) => {
      const key = `${item.table}.${item.path}`
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {}),
    replacements,
  }

  mkdirSync(REPORT_DIR, { recursive: true })
  const outputPath = path.join(REPORT_DIR, `${new Date().toISOString().replace(/[:.]/g, '-')}-existing-cloudinary-link-apply${dryRun ? '-dry-run' : ''}.json`)
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify({
    reportPath: outputPath,
    dryRun,
    cloudinaryMapSize: report.cloudinaryMapSize,
    replacementCount: report.replacementCount,
    skippedCount: report.skipped.length,
    updateFailureCount: report.updateFailures.length,
    remainingNothingOfficialMedia: report.remainingNothingOfficialMedia.length,
    validationChecked: report.validation.checked,
    validationFailed: report.validation.failed.length,
    replacementSummary: report.replacementSummary,
  }, null, 2))

  if (!dryRun && (report.updateFailures.length > 0 || report.remainingNothingOfficialMedia.length > 0 || report.validation.failed.length > 0)) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
