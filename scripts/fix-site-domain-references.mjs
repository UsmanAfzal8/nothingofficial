import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const projectRoot = process.cwd()
const pageSize = 1000
const canonicalDomain = 'www.nothingpakistan.pk'
const canonicalOrigin = `https://${canonicalDomain}`
const canonicalEmailDomain = 'nothingpakistan.pk'
const oldEmailPattern = /@(?:(?:www|ww)\.)?(?:nothingofficial|nothingpakistan)\.pk\b/gi
const oldOriginPattern = /https?:\/\/(?:(?:www|ww)\.)?(?:nothingofficial|nothingpakistan)\.pk\b/gi
const oldDomainPattern =
  /(?<![@.\w])(?:(?:www|ww)\.)?nothingofficial\.pk\b|(?<![@.\w])(?:ww\.)?nothingpakistan\.pk\b/gi

function loadEnv() {
  for (const envFile of ['.env.local', 'env']) {
    const fullPath = path.join(projectRoot, envFile)
    if (!existsSync(fullPath)) continue

    for (const line of readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue

      const separatorIndex = trimmed.indexOf('=')
      const key = trimmed.slice(0, separatorIndex).trim()
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '')
      process.env[key] ||= value
    }
  }
}

function replaceSiteDomain(value) {
  let replacements = 0

  const replaceValue = (input) => {
    if (typeof input === 'string') {
      return input
        .replace(oldEmailPattern, (match) => {
          const replacement = `@${canonicalEmailDomain}`
          if (match.toLowerCase() === replacement) return match

          replacements += 1
          return replacement
        })
        .replace(oldOriginPattern, (match) => {
          if (match.toLowerCase() === canonicalOrigin) return match

          replacements += 1
          return canonicalOrigin
        })
        .replace(oldDomainPattern, () => {
          replacements += 1
          return canonicalDomain
        })
    }

    if (Array.isArray(input)) {
      return input.map(replaceValue)
    }

    if (input && typeof input === 'object') {
      return Object.fromEntries(Object.entries(input).map(([key, nestedValue]) => [key, replaceValue(nestedValue)]))
    }

    return input
  }

  return {
    value: replaceValue(value),
    replacements,
  }
}

async function getExposedTables(supabaseUrl, supabaseKey) {
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      apikey: supabaseKey,
      authorization: `Bearer ${supabaseKey}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Could not read the Supabase Data API schema: HTTP ${response.status}`)
  }

  const schema = await response.json()
  return Object.entries(schema.definitions ?? {})
    .filter(([, definition]) => Object.hasOwn(definition.properties ?? {}, 'id'))
    .map(([table]) => table)
    .sort()
}

async function fetchAll(supabase, table) {
  const rows = []

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .range(from, from + pageSize - 1)

    if (error) throw new Error(`${table}: ${error.message}`)

    rows.push(...(data ?? []))
    if ((data ?? []).length < pageSize) break
  }

  return rows
}

async function run() {
  loadEnv()

  const apply = process.argv.includes('--apply')
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const tables = await getExposedTables(supabaseUrl, supabaseKey)
  const report = {
    mode: apply ? 'apply' : 'dry-run',
    canonicalDomain,
    tablesScanned: tables.length,
    rowsScanned: 0,
    rowsMatched: 0,
    referencesMatched: 0,
    rowsUpdated: 0,
    tables: {},
  }

  for (const table of tables) {
    const rows = await fetchAll(supabase, table)
    const tableReport = {
      rowsScanned: rows.length,
      rowsMatched: 0,
      referencesMatched: 0,
      rowsUpdated: 0,
      fields: {},
    }

    report.rowsScanned += rows.length

    for (const row of rows) {
      const updates = {}
      let rowReplacements = 0

      for (const [field, currentValue] of Object.entries(row)) {
        if (field === 'id') continue

        const result = replaceSiteDomain(currentValue)
        if (result.replacements === 0) continue

        updates[field] = result.value
        rowReplacements += result.replacements
        tableReport.fields[field] = (tableReport.fields[field] ?? 0) + result.replacements
      }

      if (rowReplacements === 0) continue

      tableReport.rowsMatched += 1
      tableReport.referencesMatched += rowReplacements

      if (apply) {
        if (Object.hasOwn(row, 'updated_at')) {
          updates.updated_at = new Date().toISOString()
        }

        const { error } = await supabase.from(table).update(updates).eq('id', row.id)
        if (error) throw new Error(`${table} id=${row.id}: ${error.message}`)

        tableReport.rowsUpdated += 1
      }
    }

    report.rowsMatched += tableReport.rowsMatched
    report.referencesMatched += tableReport.referencesMatched
    report.rowsUpdated += tableReport.rowsUpdated

    if (tableReport.rowsMatched > 0) {
      report.tables[table] = tableReport
    }
  }

  console.log(JSON.stringify(report, null, 2))
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
