import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const SEO_FIELDS = [
  'meta_title',
  'meta_description',
  'seo_keywords',
  'canonical_url',
  'schema_json',
  'seo_description_long',
  'image_alt_text',
]

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return

  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) continue

    const separatorIndex = trimmedLine.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmedLine.slice(0, separatorIndex).trim()
    let value = trimmedLine.slice(separatorIndex + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    process.env[key] ||= value
  }
}

function requireEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(projectRoot, relativePath), 'utf8'))
}

function normalizeValue(value) {
  if (value === undefined) return null
  return value
}

function valuesMatch(left, right) {
  return JSON.stringify(normalizeValue(left)) === JSON.stringify(normalizeValue(right))
}

async function syncRows({ supabase, table, localRows, remoteRows }) {
  const remoteById = new Map((remoteRows ?? []).map((row) => [row.id, row]))
  const report = {
    checked: localRows.length,
    changed: 0,
    missingRemoteIds: [],
    updatedIds: [],
  }

  for (const localRow of localRows) {
    const remoteRow = remoteById.get(localRow.id)

    if (!remoteRow) {
      report.missingRemoteIds.push(localRow.id)
      continue
    }

    const patch = {}

    for (const field of SEO_FIELDS) {
      if (!valuesMatch(remoteRow[field], localRow[field])) {
        patch[field] = normalizeValue(localRow[field])
      }
    }

    if (Object.keys(patch).length === 0) {
      continue
    }

    patch.updated_at = new Date().toISOString()

    const { error } = await supabase.from(table).update(patch).eq('id', localRow.id)

    if (error) {
      throw new Error(`Unable to update ${table} id=${localRow.id}: ${error.message}`)
    }

    report.changed += 1
    report.updatedIds.push(localRow.id)
  }

  return report
}

loadDotEnvFile(path.join(projectRoot, '.env.local'))

const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const localProducts = readJson('database/prodcuts.json')
const localMobiles = readJson('database/mobile.json')
const selectColumns = ['id', ...SEO_FIELDS].join(',')
const [
  { data: remoteProducts, error: productsError },
  { data: remoteMobiles, error: mobilesError },
] = await Promise.all([
  supabase.from('products').select(selectColumns).order('id', { ascending: true }),
  supabase.from('mobiles').select(selectColumns).order('id', { ascending: true }),
])

if (productsError) {
  throw new Error(`Unable to read products: ${productsError.message}`)
}

if (mobilesError) {
  throw new Error(`Unable to read mobiles: ${mobilesError.message}`)
}

const report = {
  products: await syncRows({
    supabase,
    table: 'products',
    localRows: localProducts,
    remoteRows: remoteProducts,
  }),
  mobiles: await syncRows({
    supabase,
    table: 'mobiles',
    localRows: localMobiles,
    remoteRows: remoteMobiles,
  }),
}

console.log(JSON.stringify(report, null, 2))
