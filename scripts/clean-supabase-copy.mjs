import { createClient } from '@supabase/supabase-js'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const reportDir = path.join(projectRoot, 'seo-output')
const reportPath = path.join(reportDir, 'supabase-copy-cleanup-report.json')

function loadEnv() {
  for (const envFile of ['.env.local', 'env']) {
    const fullPath = path.join(projectRoot, envFile)
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

function normalizeWhitespace(value) {
  return value
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,.;:!?]){2,}/g, '$1')
    .trim()
}

function sanitizeCopy(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return value
  }

  if (/<ul\b|<li\b|<img\b/i.test(value)) {
    return value
  }

  let next = value
    .replace(/\bPrice:\s*(?:Rs\.?|PKR)\s*[\d,]+(?:\s*\/-)?\.?/gi, '')
    .replace(/\b(?:currently\s+)?listed\s+at\s+(?:Rs\.?|PKR)\s*[\d,]+(?:\s*\/-)?(?:\s+on\s+Nothing\s+Pakistan)?/gi, 'listed on Nothing Official Store Pakistan')
    .replace(/\bprice\s+in\s+Pakistan\s+is\s+(?:Rs\.?|PKR)\s*[\d,]+(?:\s*\/-)?/gi, 'price in Pakistan is shown on the product page')
    .replace(/\bprice\s+is\s+(?:Rs\.?|PKR)\s*[\d,]+(?:\s*\/-)?/gi, 'price is shown on the product page')
    .replace(/\bwith updated price\b/gi, 'with live pricing')
    .replace(/\bupdated price\b/gi, 'live pricing')
    .replace(/\blocal pricing\b/gi, 'live catalog details')
    .replace(/\bprice context\b/gi, 'product context')
    .replace(/\bvisible pricing\b/gi, 'live product details')
    .replace(/\bvisible price\b/gi, 'live product details')
    .replace(/\bcurrent pricing\b/gi, 'live catalog details')
    .replace(/\bcurrent price\b/gi, 'live catalog price')
    .replace(/\blatest price\b/gi, 'live catalog price')
    .replace(/\bprice, stock\b/gi, 'stock')
    .replace(/\bprice, stock status\b/gi, 'stock status')
    .replace(/\bconfirm [^,.!?]*price[^,.!?]*/gi, (match) => match.replace(/\bprice\b/gi, 'live catalog details'))
    .replace(/\bthe price of ([^.?!]+)/gi, 'the live catalog price of $1')
    .replace(/\b(?:Rs\.?|PKR)\s*[\d,]+(?:\s*\/-)?/gi, '')
    .replace(/\(\s*\)/g, '')

  next = normalizeWhitespace(next)

  return next || value
}

function diffFields(row, fields) {
  const updates = {}
  const changedFields = []

  for (const field of fields) {
    const currentValue = row[field]
    const nextValue = sanitizeCopy(currentValue)
    if (typeof currentValue === 'string' && nextValue !== currentValue) {
      updates[field] = nextValue
      changedFields.push(field)
    }
  }

  return { updates, changedFields }
}

async function run() {
  loadEnv()

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials')
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const [productsResponse, mobilesResponse] = await Promise.all([
    supabase.from('products').select('id, slug, description, short_description, meta_description, seo_description_long'),
    supabase.from('mobiles').select('id, slug, description, meta_description, seo_description_long'),
  ])

  if (productsResponse.error) throw productsResponse.error
  if (mobilesResponse.error) throw mobilesResponse.error

  const report = {
    generatedAt: new Date().toISOString(),
    productsUpdated: 0,
    mobilesUpdated: 0,
    productsScanned: (productsResponse.data ?? []).length,
    mobilesScanned: (mobilesResponse.data ?? []).length,
    productChanges: [],
    mobileChanges: [],
  }

  for (const row of productsResponse.data ?? []) {
    const { updates, changedFields } = diffFields(row, ['description', 'short_description', 'meta_description', 'seo_description_long'])
    if (changedFields.length === 0) continue

    updates.updated_at = new Date().toISOString()

    const { error } = await supabase.from('products').update(updates).eq('id', row.id)
    if (error) throw error

    report.productsUpdated += 1
    report.productChanges.push({
      id: row.id,
      slug: row.slug,
      changedFields,
    })
  }

  for (const row of mobilesResponse.data ?? []) {
    const { updates, changedFields } = diffFields(row, ['description', 'meta_description', 'seo_description_long'])
    if (changedFields.length === 0) continue

    updates.updated_at = new Date().toISOString()

    const { error } = await supabase.from('mobiles').update(updates).eq('id', row.id)
    if (error) throw error

    report.mobilesUpdated += 1
    report.mobileChanges.push({
      id: row.id,
      slug: row.slug,
      changedFields,
    })
  }

  mkdirSync(reportDir, { recursive: true })
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify(report, null, 2))
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
