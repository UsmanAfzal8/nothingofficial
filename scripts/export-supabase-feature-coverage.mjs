import { createClient } from '@supabase/supabase-js'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUTPUT_FILE = path.join(ROOT, 'database', 'supabase-product-feature-coverage.json')
const PAGE_SIZE = 1000

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
  mkdirSync(path.dirname(filePath), { recursive: true })
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function keyFor(relatedType, relatedId) {
  return `${relatedType}:${relatedId}`
}

function increment(map, key, amount = 1) {
  map.set(key, (map.get(key) ?? 0) + amount)
}

async function fetchAll(supabase, table, columns, orderColumn = 'id') {
  const rows = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order(orderColumn, { ascending: true })
      .range(from, to)

    if (error) throw new Error(`${table} fetch failed: ${error.message}`)
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE_SIZE) break
  }

  return rows
}

function buildCoverageRows({ mobiles, products, specGroups, specItems, featureSections, featureSlides }) {
  const specGroupsByRelated = new Map()
  const specItemsByGroup = new Map()
  const specItemsByRelated = new Map()
  const featureSectionsByRelated = new Map()
  const featureSlidesBySection = new Map()

  for (const item of specItems) {
    increment(specItemsByGroup, item.spec_group_id)
  }

  for (const group of specGroups) {
    const relatedKey = keyFor(group.related_type, group.related_id)
    const groupItemsCount = specItemsByGroup.get(group.id) ?? 0

    if (!specGroupsByRelated.has(relatedKey)) specGroupsByRelated.set(relatedKey, [])
    specGroupsByRelated.get(relatedKey).push({
      id: group.id,
      title: group.title,
      icon_key: group.icon_key ?? null,
      items_count: groupItemsCount,
      sort_order: group.sort_order ?? 0,
    })

    increment(specItemsByRelated, relatedKey, groupItemsCount)
  }

  for (const slide of featureSlides) {
    increment(featureSlidesBySection, slide.product_feature_section_id)
  }

  for (const section of featureSections) {
    const relatedKey = keyFor(section.related_type, section.related_id)

    if (!featureSectionsByRelated.has(relatedKey)) featureSectionsByRelated.set(relatedKey, [])
    featureSectionsByRelated.get(relatedKey).push({
      id: section.id,
      feature_key: section.feature_key,
      feature_title: section.feature_title,
      feature_version: section.feature_version ?? null,
      title: section.title,
      display_context: section.display_context,
      slides_count: featureSlidesBySection.get(section.id) ?? 0,
      sort_order: section.sort_order ?? 0,
    })
  }

  const catalogRows = [
    ...mobiles.map((row) => ({
      related_type: 'mobile',
      related_id: row.id,
      name: row.name,
      slug: row.slug,
    })),
    ...products.map((row) => ({
      related_type: 'product',
      related_id: row.id,
      name: row.name,
      slug: row.slug,
    })),
  ].sort((a, b) => {
    if (a.related_type !== b.related_type) return a.related_type.localeCompare(b.related_type)
    return a.name.localeCompare(b.name)
  })

  return catalogRows.map((row) => {
    const relatedKey = keyFor(row.related_type, row.related_id)
    const specGroupsForRow = specGroupsByRelated.get(relatedKey) ?? []
    const featureSectionsForRow = featureSectionsByRelated.get(relatedKey) ?? []

    return {
      related_type: row.related_type,
      related_id: row.related_id,
      name: row.name,
      slug: row.slug,
      has_specs: specGroupsForRow.length > 0,
      has_product_feature_sections: featureSectionsForRow.length > 0,
    }
  })
}

async function main() {
  loadEnv()

  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const [mobiles, products, specGroups, specItems, featureSections, featureSlides] = await Promise.all([
    fetchAll(supabase, 'mobiles', 'id,name,slug'),
    fetchAll(supabase, 'products', 'id,name,slug'),
    fetchAll(supabase, 'spec_groups', 'id,related_type,related_id,title,icon_key,sort_order'),
    fetchAll(supabase, 'spec_group_items', 'id,spec_group_id'),
    fetchAll(
      supabase,
      'product_feature_sections',
      'id,related_type,related_id,feature_key,feature_title,feature_version,title,display_context,sort_order',
    ),
    fetchAll(supabase, 'product_feature_slides', 'id,product_feature_section_id'),
  ])

  const rows = buildCoverageRows({ mobiles, products, specGroups, specItems, featureSections, featureSlides })
  const filteredRows = rows.filter((row) => row.has_specs || row.has_product_feature_sections)
  const output = {
    generated_at: new Date().toISOString(),
    source: 'supabase',
    summary: {
      mobiles: mobiles.length,
      products: products.length,
      catalog_rows: rows.length,
      included_rows: filteredRows.length,
      rows_with_specs: rows.filter((row) => row.has_specs).length,
      rows_without_specs: rows.filter((row) => !row.has_specs).length,
      rows_with_product_feature_sections: rows.filter((row) => row.has_product_feature_sections).length,
      rows_without_product_feature_sections: rows.filter((row) => !row.has_product_feature_sections).length,
      spec_groups: specGroups.length,
      spec_group_items: specItems.length,
      product_feature_sections: featureSections.length,
      product_feature_slides: featureSlides.length,
    },
    rows: filteredRows,
  }

  writeJson(OUTPUT_FILE, output)
  console.log(`Wrote ${OUTPUT_FILE}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
