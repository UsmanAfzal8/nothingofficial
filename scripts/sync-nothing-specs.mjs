import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUTPUT_DIR = path.join(ROOT, 'database', 'specs')
const COLLECTION_URL = 'https://nothing.tech/collections/shop-all'
const PHONE_4A_TEMPLATE = path.join(ROOT, 'database', 'spec-groups-template.json')

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

function decodeJwtRole(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return decoded.role ?? null
  } catch {
    return null
  }
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(ROOT, relativePath), 'utf8'))
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

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function getBunnyStorageBaseUrl(region) {
  return region.toLowerCase() === 'de' ? 'https://storage.bunnycdn.com' : `https://${region}.storage.bunnycdn.com`
}

function extensionForUrl(url) {
  const pathname = new URL(url).pathname
  const ext = path.extname(pathname).toLowerCase()
  return ext || '.jpg'
}

function mimeTypeForExt(ext) {
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.avif') return 'image/avif'
  return 'image/jpeg'
}

async function uploadRemoteImageToBunny(url, remotePath) {
  const bunnyZone = requireEnv('BUNNY_STORAGE_ZONE_NAME')
  const bunnyAccessKey = requireEnv('BUNNY_ACCESS_KEY')
  const bunnyCdnHostname = requireEnv('BUNNY_CDN_HOSTNAME')
  const bunnyStorageBaseUrl = getBunnyStorageBaseUrl(process.env.BUNNY_STORAGE_REGION || 'de')
  const cdnUrl = `https://${bunnyCdnHostname}/${remotePath}`

  if (process.argv.includes('--reuse-media')) {
    return cdnUrl
  }

  const source = await fetch(url)

  if (!source.ok) {
    throw new Error(`Image fetch failed for ${url}: ${source.status}`)
  }

  const body = Buffer.from(await source.arrayBuffer())
  const response = await fetch(`${bunnyStorageBaseUrl}/${bunnyZone}/${remotePath}`, {
    method: 'PUT',
    headers: {
      AccessKey: bunnyAccessKey,
      'Content-Type': mimeTypeForExt(path.extname(remotePath).toLowerCase()),
    },
    body,
  })

  if (!response.ok) {
    throw new Error(`Bunny upload failed for ${remotePath}: ${response.status} ${await response.text().catch(() => '')}`)
  }

  return cdnUrl
}

function slugAlias(slug) {
  if (slug === 'phone-4a-pro') return 'nothing-4a-pro'
  return slug
}

function discoverCollectionProducts(html) {
  const re = /<a class="group[\s\S]*?href="([^"]+)"[\s\S]*?<img alt="([^"]+)"/g
  const products = new Map()
  let match

  while ((match = re.exec(html))) {
    const href = decodeHtml(match[1])
    const name = decodeHtml(match[2]).replace(/\s+/g, ' ').trim()
    const handle = href.match(/\/products\/([^?"&]+)/)?.[1]
    if (!handle || products.has(handle)) continue

    products.set(handle, {
      name,
      handle,
      specs_url: `https://nothing.tech/products/${handle}${href.includes('?') ? href.slice(href.indexOf('?')) : ''}`,
    })
  }

  return [...products.values()]
}

function buildLocalLookup() {
  const rows = [
    ...readJson('database/mobile.json').map((row) => ({
      related_type: 'mobile',
      related_id: row.id,
      related_slug: row.slug,
      name: row.name,
    })),
    ...readJson('database/prodcuts.json').map((row) => ({
      related_type: 'product',
      related_id: row.id,
      related_slug: row.slug,
      name: row.name,
    })),
  ]

  return new Map(rows.map((row) => [row.related_slug, row]))
}

function buildSeed({ liveProduct, localMatch, template }) {
  if (template) {
    return {
      ...template,
      source_url: liveProduct.specs_url,
      source_handle: liveProduct.handle,
      source_name: liveProduct.name,
      related_type: localMatch.related_type,
      related_id: localMatch.related_id,
      related_slug: localMatch.related_slug,
    }
  }

  return {
    related_type: localMatch?.related_type ?? null,
    related_id: localMatch?.related_id ?? null,
    related_slug: localMatch?.related_slug ?? slugAlias(liveProduct.handle),
    source_handle: liveProduct.handle,
    source_name: liveProduct.name,
    source_url: liveProduct.specs_url,
    screen_title: 'Specs',
    spec_groups: [],
    import_status: localMatch ? 'needs_specs_data' : 'no_local_catalog_match',
  }
}

async function fetchText(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Fetch failed for ${url}: ${response.status}`)
  return response.text()
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
      // Some streamed chunks are not the product graph; ignore those.
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

function blockText(block) {
  if (!block) return ''
  if (typeof block === 'string') return block.trim()
  if (typeof block.text === 'string') return block.text.trim()
  if (Array.isArray(block.children)) {
    return block.children
      .map((child) => child?.text ?? '')
      .join('')
      .trim()
  }

  return ''
}

function extractSanitySpecs(html) {
  for (const array of parseStreamArrays(html)) {
    const root = decodeReactRouterArray(array)
    const routes = root?.loaderData?.['routes/products.$handle']
    const specs = routes?.product?.sanityContent?.specs
    if (Array.isArray(specs)) return specs
  }

  return []
}

async function buildSpecGroupsFromHtml(html, handle, productName) {
  const sanitySpecs = extractSanitySpecs(html)
  const groups = []

  for (const [groupIndex, sourceGroup] of sanitySpecs.entries()) {
    const title = sourceGroup.title?.trim()
    if (!title) continue

    let mediaUrl = null
    let mediaAlt = null
    let currentSection = null
    let sortOrder = 10
    const items = []

    for (const block of sourceGroup.content ?? []) {
      if (block?._type === 'specsMedia') {
        const sourceUrl = block.image?.url
        if (sourceUrl && !mediaUrl) {
          const ext = extensionForUrl(sourceUrl)
          const remotePath = `specs/${handle}-${slugify(title)}${ext}`
          mediaUrl = await uploadRemoteImageToBunny(sourceUrl, remotePath)
          mediaAlt = block.alt || `${productName} ${title}`
        }
        continue
      }

      if (block?._type === 'table') {
        const rows = (block.rows ?? []).map((row) => (row.cells ?? []).map((cell) => String(cell ?? '').trim())).filter((cells) => cells.some(Boolean))
        const singleCellRows = rows.every((cells) => cells.length === 1 || (cells.length > 1 && !cells[0] && cells.slice(1).filter(Boolean).length === 1))
        const section = currentSection || (singleCellRows ? title : null)

        for (const cells of rows) {
          const cleanCells = cells.filter((cell, index) => cell || index === 0)
          let label = null
          let value = ''

          if (cells.length >= 2 && cells[0]) {
            label = cells[0]
            value = cells.slice(1).filter(Boolean).join('\n')
          } else if (cells.length >= 2 && !cells[0]) {
            value = cells.slice(1).filter(Boolean).join('\n')

            const previousItem = items[items.length - 1]
            if (previousItem && previousItem.label && previousItem.section === section) {
              previousItem.value = `${previousItem.value}\n${value}`
              continue
            }
          } else if (singleCellRows && rows.length === 1 && section) {
            label = section
            value = cells.filter(Boolean).join('\n')
          } else {
            value = cleanCells.filter(Boolean).join('\n')
          }

          if (!value) continue

          items.push({
            section,
            label,
            value,
            sort_order: sortOrder,
          })
          sortOrder += 10
        }

        continue
      }

      const text = blockText(block)
      if (text) currentSection = text
    }

    groups.push({
      title,
      icon_key: slugify(title),
      subtitle: null,
      media_url: mediaUrl,
      media_alt: mediaAlt,
      media_type: 'image',
      media_position: 'top',
      default_open: false,
      sort_order: (groupIndex + 1) * 10,
      items,
    })
  }

  return groups
}

async function replaceSpecs(supabase, seed) {
  if (!seed.related_type || !seed.related_id || !Array.isArray(seed.spec_groups) || seed.spec_groups.length === 0) {
    return { insertedGroups: 0, insertedItems: 0, skipped: true }
  }

  const { data: existingGroups, error: findError } = await supabase
    .from('spec_groups')
    .select('id')
    .eq('related_type', seed.related_type)
    .eq('related_id', seed.related_id)

  if (findError) throw findError

  const existingIds = (existingGroups ?? []).map((row) => row.id)
  if (existingIds.length > 0) {
    const { error: itemDeleteError } = await supabase.from('spec_group_items').delete().in('spec_group_id', existingIds)
    if (itemDeleteError) throw itemDeleteError

    const { error: groupDeleteError } = await supabase
      .from('spec_groups')
      .delete()
      .eq('related_type', seed.related_type)
      .eq('related_id', seed.related_id)
    if (groupDeleteError) throw groupDeleteError
  }

  let insertedGroups = 0
  let insertedItems = 0

  for (const group of seed.spec_groups) {
    const groupRow = {
      related_type: seed.related_type,
      related_id: seed.related_id,
      title: group.title,
      subtitle: group.subtitle ?? null,
      icon_key: group.icon_key ?? null,
      media_url: group.media_url ?? null,
      media_alt: group.media_alt ?? null,
      media_type: group.media_type ?? 'image',
      media_position: group.media_position ?? 'top',
      default_open: Boolean(group.default_open),
      sort_order: Number(group.sort_order ?? 0),
      updated_at: new Date().toISOString(),
    }

    const { data: insertedGroup, error: groupError } = await supabase
      .from('spec_groups')
      .insert(groupRow)
      .select('id')
      .single()
    if (groupError) throw groupError

    insertedGroups += 1

    const itemRows = (group.items ?? []).map((item) => ({
      spec_group_id: insertedGroup.id,
      section: item.section ?? null,
      label: item.label ?? '',
      value: item.value ?? '',
      sort_order: Number(item.sort_order ?? 0),
      updated_at: new Date().toISOString(),
    }))

    if (itemRows.length > 0) {
      const { error: itemError } = await supabase.from('spec_group_items').insert(itemRows)
      if (itemError) throw itemError
      insertedItems += itemRows.length
    }
  }

  return { insertedGroups, insertedItems, skipped: false }
}

async function main() {
  loadEnv()
  mkdirSync(OUTPUT_DIR, { recursive: true })

  const collectionHtml = await fetchText(COLLECTION_URL)
  const liveProducts = discoverCollectionProducts(collectionHtml)
  const localLookup = buildLocalLookup()
  const phone4aTemplate = existsSync(PHONE_4A_TEMPLATE) ? JSON.parse(readFileSync(PHONE_4A_TEMPLATE, 'utf8')) : null

  const index = {
    source_url: COLLECTION_URL,
    generated_at: new Date().toISOString(),
    products: [],
    summary: {
      discovered: liveProducts.length,
      matched_local_catalog: 0,
      missing_local_catalog: 0,
      json_files_written: 0,
      ready_for_import: 0,
      needs_specs_data: 0,
    },
  }

  for (const liveProduct of liveProducts) {
    const localMatch = localLookup.get(slugAlias(liveProduct.handle)) ?? null
    const html = await fetchText(liveProduct.specs_url)
    const parsedSpecGroups = await buildSpecGroupsFromHtml(html, liveProduct.handle, liveProduct.name)
    const template = liveProduct.handle === 'phone-4a' && localMatch && parsedSpecGroups.length === 0 ? phone4aTemplate : null
    const seed = buildSeed({ liveProduct, localMatch, template })
    if (parsedSpecGroups.length > 0) {
      seed.spec_groups = parsedSpecGroups
      delete seed.import_status
    }
    const fileName = `${liveProduct.handle}.json`
    const filePath = path.join(OUTPUT_DIR, fileName)

    writeJson(filePath, seed)

    const hasSpecs = Array.isArray(seed.spec_groups) && seed.spec_groups.length > 0
    index.products.push({
      name: liveProduct.name,
      handle: liveProduct.handle,
      specs_url: liveProduct.specs_url,
      related_type: localMatch?.related_type ?? null,
      related_id: localMatch?.related_id ?? null,
      related_slug: localMatch?.related_slug ?? null,
      json_file: `database/specs/${fileName}`,
      status: hasSpecs ? 'ready_for_import' : localMatch ? 'needs_specs_data' : 'no_local_catalog_match',
    })

    if (localMatch) index.summary.matched_local_catalog += 1
    else index.summary.missing_local_catalog += 1
    if (hasSpecs) index.summary.ready_for_import += 1
    else index.summary.needs_specs_data += 1
    index.summary.json_files_written += 1
  }

  writeJson(path.join(OUTPUT_DIR, 'products.json'), index)

  if (process.argv.includes('--import')) {
    const supabaseKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseKeyRole = decodeJwtRole(supabaseKey)
    const supabase = createClient(requireEnv('SUPABASE_URL'), supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const importReport = {
      imported_at: new Date().toISOString(),
      supabase_key_role: supabaseKeyRole,
      imported: [],
      skipped: [],
      failed: [],
    }

    if (supabaseKeyRole !== 'service_role') {
      importReport.skipped.push({
        handle: '*',
        reason: 'SUPABASE_SERVICE_ROLE_KEY is not a service_role JWT; attempting import with current key because Supabase may allow writes through policy.',
      })
    }

    for (const product of index.products) {
      const seed = JSON.parse(readFileSync(path.join(ROOT, product.json_file), 'utf8'))
      try {
        const result = await replaceSpecs(supabase, seed)
        if (result.skipped) {
          importReport.skipped.push({
            handle: product.handle,
            reason: product.status,
          })
        } else {
          importReport.imported.push({
            handle: product.handle,
            related_type: seed.related_type,
            related_id: seed.related_id,
            groups: result.insertedGroups,
            items: result.insertedItems,
          })
        }
      } catch (error) {
        importReport.failed.push({
          handle: product.handle,
          reason: error.message,
        })
      }
    }

    writeJson(path.join(OUTPUT_DIR, 'import-report.json'), importReport)
  }

  console.log(JSON.stringify(index.summary, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
