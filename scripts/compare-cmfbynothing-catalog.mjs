import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const ROOT = process.cwd()
const ENV_FILES = ['.env.local', 'env']
const LOCAL_PRODUCTS_PATH = path.join(ROOT, 'database', 'prodcuts.json')
const LOCAL_MOBILES_PATH = path.join(ROOT, 'database', 'mobile.json')
const OUTPUT_DIR = path.join(ROOT, 'output image', 'cmfbynothing-missing-products')
const OUTPUT_JSON = path.join(ROOT, 'database', 'cmfbynothing-missing-products.json')

function loadEnv() {
  for (const fileName of ENV_FILES) {
    const fullPath = path.join(ROOT, fileName)
    if (!fs.existsSync(fullPath)) continue

    const lines = fs.readFileSync(fullPath, 'utf8').split(/\r?\n/)
    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#') || !line.includes('=')) continue
      const index = line.indexOf('=')
      const key = line.slice(0, index).trim()
      const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')
      if (!(key in process.env)) {
        process.env[key] = value
      }
    }
  }
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return []
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sanitizeFileName(value) {
  return String(value || 'item')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function uniqueStrings(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))]
}

function parseMaybeJson(value) {
  if (typeof value !== 'string') return null
  const text = value.trim()
  if (!text) return null
  if (!(text.startsWith('[') || text.startsWith('{'))) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function collectImageUrlsFromValue(value) {
  if (!value) return []

  if (typeof value === 'string') {
    const parsed = parseMaybeJson(value)
    if (parsed) {
      return collectImageUrlsFromValue(parsed)
    }

    if (/^https?:\/\//i.test(value.trim())) {
      return [value.trim()]
    }

    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => /^https?:\/\//i.test(entry))
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectImageUrlsFromValue(entry))
  }

  if (typeof value === 'object') {
    const objectValue = value
    const directKeys = ['url', 'src', 'secure_url', 'image', 'image_url', 'thumbnail', 'thumbnail_url']
    const directMatches = directKeys.flatMap((key) => collectImageUrlsFromValue(objectValue[key]))
    if (directMatches.length > 0) {
      return directMatches
    }

    return Object.values(objectValue).flatMap((entry) => collectImageUrlsFromValue(entry))
  }

  return []
}

function getRecordValue(record, keys) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null && String(record[key]).trim() !== '') {
      return record[key]
    }
  }
  return null
}

function extractItem(record, index) {
  const nameValue = getRecordValue(record, ['name', 'title', 'product_name', 'item_name', 'label'])
  const slugValue = getRecordValue(record, ['slug', 'handle', 'product_slug', 'url_slug'])
  const imageValue = getRecordValue(record, [
    'image',
    'image_url',
    'images',
    'image_urls',
    'gallery',
    'photos',
    'photo',
    'thumbnail',
    'thumbnail_url',
    'featured_image',
    'featuredImage',
    'media',
  ])
  const priceValue = getRecordValue(record, ['price', 'sale_price', 'amount', 'regular_price'])
  const categoryValue = getRecordValue(record, ['category', 'product_type', 'type'])

  const name = String(nameValue || slugValue || `item-${index + 1}`).trim()
  const slug = String(slugValue || slugify(name)).trim()
  const images = uniqueStrings(collectImageUrlsFromValue(imageValue))

  return {
    sourceId: record.id ?? record.uuid ?? null,
    name,
    slug,
    normalizedName: normalizeText(name),
    normalizedSlug: normalizeText(slug),
    price: priceValue ?? null,
    category: categoryValue ? String(categoryValue) : null,
    images,
    source: record,
  }
}

async function fetchAllRows(client, tableName, columns = '*') {
  const rows = []
  const pageSize = 1000

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client.from(tableName).select(columns).range(offset, offset + pageSize - 1)
    if (error) {
      throw error
    }
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < pageSize) break
  }

  return rows
}

async function fetchOptionalRows(client, tableName, columns = '*') {
  try {
    return await fetchAllRows(client, tableName, columns)
  } catch (error) {
    const message = error?.message || String(error)
    if (message.includes(`Could not find the table 'public.${tableName}'`)) {
      return null
    }
    throw error
  }
}

async function downloadFile(url, destinationPath) {
  if (fs.existsSync(destinationPath)) {
    return 'skipped'
  }

  const response = await fetch(url, { signal: AbortSignal.timeout(20000) })
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  fs.writeFileSync(destinationPath, Buffer.from(arrayBuffer))
  return 'downloaded'
}

function ensureDir(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true })
}

function extensionFromUrl(url) {
  try {
    const pathname = new URL(url).pathname
    const ext = path.extname(pathname)
    if (ext && ext.length <= 8) return ext
  } catch {}
  return '.jpg'
}

function buildImageLookup(imagesTableRows) {
  const lookup = new Map()

  for (const imageRow of imagesTableRows || []) {
    const urls = uniqueStrings(
      collectImageUrlsFromValue(
        getRecordValue(imageRow, ['url', 'image', 'image_url', 'src', 'secure_url', 'thumbnail', 'thumbnail_url']),
      ),
    )
    if (urls.length === 0) continue

    const relatedId = imageRow.related_id ?? imageRow.product_id ?? imageRow.mobile_id ?? imageRow.item_id ?? imageRow.parent_id
    if (relatedId === undefined || relatedId === null) continue

    const relatedType =
      imageRow.related_type ??
      (imageRow.product_id ? 'product' : null) ??
      (imageRow.mobile_id ? 'mobile' : null) ??
      (imageRow.item_id ? 'item' : null)

    const keys = [String(relatedId)]
    if (relatedType) {
      keys.push(`${relatedType}:${relatedId}`)
    }

    for (const key of keys) {
      const current = lookup.get(key) ?? []
      lookup.set(key, uniqueStrings([...current, ...urls]))
    }
  }

  return lookup
}

async function main() {
  loadEnv()

  const cmfUrl = process.env.SUPABASE_URL
  const cmfKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
  const cmfTable = process.env.SUPABASE_TABLE || 'items'

  const nothingUrl = process.env.NOTHING_SUPABASE_URL
  const nothingKey = process.env.NOTHING_SUPABASE_SERVICE_ROLE_KEY || process.env.NOTHING_SUPABASE_ANON_KEY

  if (!cmfUrl || !cmfKey) {
    throw new Error('Missing active CMF Supabase credentials in .env.local')
  }

  if (!nothingUrl || !nothingKey) {
    throw new Error('Missing preserved Nothing Supabase credentials in .env.local')
  }

  const cmfClient = createClient(cmfUrl, cmfKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const nothingClient = createClient(nothingUrl, nothingKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const cmfTableCandidates = uniqueStrings([cmfTable, 'products', 'mobiles'])
  const cmfRows = []

  for (const tableName of cmfTableCandidates) {
    console.log(`Checking CMF table: ${tableName}...`)
    const rows = await fetchOptionalRows(cmfClient, tableName, '*')
    if (rows === null) {
      console.log(`Skipping missing CMF table: ${tableName}`)
      continue
    }

    console.log(`Fetched ${rows.length} rows from CMF table: ${tableName}`)
    cmfRows.push(...rows.map((row) => ({ ...row, __sourceTable: tableName })))
  }

  if (cmfRows.length === 0) {
    throw new Error(`No CMF content rows found. Tried tables: ${cmfTableCandidates.join(', ')}`)
  }

  console.log('Checking CMF images table...')
  const cmfImagesTableRows = await fetchOptionalRows(cmfClient, 'images', '*')
  const cmfImageLookup = buildImageLookup(cmfImagesTableRows || [])
  if (cmfImagesTableRows) {
    console.log(`Fetched ${cmfImagesTableRows.length} CMF image rows`)
  } else {
    console.log('CMF images table not found')
  }

  console.log('Fetching Nothing live products...')
  const nothingProducts = await fetchAllRows(nothingClient, 'products', 'id,name,slug')
  console.log(`Fetched ${nothingProducts.length} Nothing products`)

  console.log('Fetching Nothing live mobiles...')
  const nothingMobiles = await fetchAllRows(nothingClient, 'mobiles', 'id,name,slug')
  console.log(`Fetched ${nothingMobiles.length} Nothing mobiles`)

  const localProducts = readJson(LOCAL_PRODUCTS_PATH)
  const localMobiles = readJson(LOCAL_MOBILES_PATH)
  const existingCatalog = [...localProducts, ...localMobiles, ...nothingProducts, ...nothingMobiles]

  const existingSlugSet = new Set(existingCatalog.map((item) => normalizeText(item.slug || slugify(item.name || ''))).filter(Boolean))
  const existingNameSet = new Set(existingCatalog.map((item) => normalizeText(item.name)).filter(Boolean))

  const parsedItems = cmfRows.map((row, index) => {
    const item = extractItem(row, index)
    const sourceTable = row.__sourceTable ? String(row.__sourceTable) : null
    const imageKeys = [String(item.sourceId)]

    if (sourceTable === 'products') imageKeys.push(`product:${item.sourceId}`)
    if (sourceTable === 'mobiles') imageKeys.push(`mobile:${item.sourceId}`)
    if (sourceTable === 'items') imageKeys.push(`item:${item.sourceId}`)

    const fallbackImages = uniqueStrings(imageKeys.flatMap((key) => cmfImageLookup.get(key) ?? []))

    return {
      ...item,
      sourceTable,
      images: item.images.length > 0 ? item.images : fallbackImages,
    }
  })
  const missingItems = parsedItems.filter((item) => !existingSlugSet.has(item.normalizedSlug) && !existingNameSet.has(item.normalizedName))

  ensureDir(OUTPUT_DIR)

  const downloadManifest = []

  for (const item of missingItems) {
    const itemDir = path.join(OUTPUT_DIR, sanitizeFileName(item.slug || item.name))
    ensureDir(itemDir)

    const downloadedImages = []
    for (let index = 0; index < item.images.length; index += 1) {
      const imageUrl = item.images[index]
      const ext = extensionFromUrl(imageUrl)
      const fileName = `${String(index + 1).padStart(2, '0')}${ext}`
      const destinationPath = path.join(itemDir, fileName)

      try {
        const status = await downloadFile(imageUrl, destinationPath)
        downloadedImages.push({
          url: imageUrl,
          path: path.relative(ROOT, destinationPath),
          status,
        })
      } catch (error) {
        downloadedImages.push({
          url: imageUrl,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    downloadManifest.push({
      name: item.name,
      slug: item.slug,
      sourceTable: item.sourceTable,
      imageCount: item.images.length,
      downloadedImages,
    })
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    cmfSite: {
      supabaseUrl: cmfUrl,
      table: cmfTable,
      totalRows: cmfRows.length,
      parsedRows: parsedItems.length,
      sourceTables: uniqueStrings(parsedItems.map((item) => item.sourceTable)),
    },
    nothingSite: {
      supabaseUrl: nothingUrl,
      liveProducts: nothingProducts.length,
      liveMobiles: nothingMobiles.length,
      localProducts: localProducts.length,
      localMobiles: localMobiles.length,
    },
    missingCount: missingItems.length,
    missingItems: missingItems.map((item) => ({
      sourceId: item.sourceId,
      name: item.name,
      slug: item.slug,
      sourceTable: item.sourceTable,
      price: item.price,
      category: item.category,
      imageCount: item.images.length,
      images: item.images,
    })),
    downloads: downloadManifest,
  }

  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(payload, null, 2)}\n`)

  console.log(
    JSON.stringify(
      {
        outputJson: path.relative(ROOT, OUTPUT_JSON),
        outputDir: path.relative(ROOT, OUTPUT_DIR),
        cmfRows: cmfRows.length,
        missingCount: missingItems.length,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error?.stack || error?.message || error)
  if (error?.cause) {
    console.error('Cause:', error.cause)
  }
  process.exit(1)
})
