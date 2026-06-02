import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const MOBILE_FILE = path.join(ROOT, 'database', 'mobile.json')

const OFFICIAL_PHONES = [
  {
    handle: 'phone-4a-pro',
    relatedSlug: 'nothing-4a-pro',
    url: 'https://nothing.tech/products/phone-4a-pro?Colour=Silver&Capacity=8%2B128GB',
  },
  {
    handle: 'phone-4a',
    relatedSlug: 'phone-4a',
    url: 'https://nothing.tech/products/phone-4a?Colour=White&Capacity=8%2B128GB',
  },
  {
    handle: 'phone-3',
    relatedSlug: 'phone-3',
    url: 'https://nothing.tech/products/phone-3?Colour=White&Capacity=12%2B256GB',
  },
  {
    handle: 'phone-3a-lite',
    relatedSlug: 'phone-3a-lite',
    url: 'https://nothing.tech/products/phone-3a-lite?Colour=White&Capacity=8%2B128GB',
  },
  {
    handle: 'phone-3a-pro',
    relatedSlug: 'phone-3a-pro',
    url: 'https://nothing.tech/products/phone-3a-pro?Colour=Grey&Capacity=12%2B256GB+%28Pick+up+only%29',
  },
  {
    handle: 'phone-3a',
    relatedSlug: 'phone-3a',
    url: 'https://nothing.tech/products/phone-3a?Colour=Black&Capacity=12%2B256GB',
  },
]

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

function extensionForUrl(url, fallback = '.jpg') {
  const ext = path.extname(new URL(url).pathname).toLowerCase()
  return ext || fallback
}

function mimeTypeForExt(ext) {
  if (ext === '.avif') return 'image/avif'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  return 'application/octet-stream'
}

function getBunnyStorageBaseUrl(region) {
  return region.toLowerCase() === 'de' ? 'https://storage.bunnycdn.com' : `https://${region}.storage.bunnycdn.com`
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'user-agent': 'Mozilla/5.0 NothingPakistan official background sync',
    },
  })

  if (!response.ok) throw new Error(`Fetch failed for ${url}: ${response.status}`)
  return response.text()
}

async function fetchBuffer(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Fetch failed for ${url}: ${response.status}`)
  return Buffer.from(await response.arrayBuffer())
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
      // Some streamed chunks are not the product graph.
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

function findProductRoute(html) {
  for (const array of parseStreamArrays(html)) {
    const root = decodeReactRouterArray(array)
    const route = root?.loaderData?.['routes/products.$handle']
    if (route?.product) return route.product
  }

  return null
}

function findImageUrls(value, urls = []) {
  if (!value) return urls

  if (typeof value === 'string') {
    if (value.startsWith('http') && /\.(avif|gif|jpe?g|png|webp)(\?|$)/i.test(value)) urls.push(value)
    return urls
  }

  if (Array.isArray(value)) {
    for (const item of value) findImageUrls(item, urls)
    return urls
  }

  if (typeof value === 'object') {
    for (const key of ['url', 'src']) {
      if (typeof value[key] === 'string' && value[key].startsWith('http') && /\.(avif|gif|jpe?g|png|webp)(\?|$)/i.test(value[key])) {
        urls.push(value[key])
      }
    }

    if (typeof value.asset?.url === 'string') urls.push(value.asset.url)
    if (typeof value.image?.url === 'string') urls.push(value.image.url)

    for (const item of Object.values(value)) findImageUrls(item, urls)
  }

  return [...new Set(urls)]
}

function compactText(value) {
  if (!value) return ''
  if (typeof value === 'string') return value.replace(/\s+/g, ' ').trim()
  if (Array.isArray(value)) return value.map(compactText).filter(Boolean).join(' ').trim()
  if (typeof value === 'object') {
    if (typeof value.text === 'string') return compactText(value.text)
    if (Array.isArray(value.children)) return compactText(value.children)
    if (value.title) return compactText(value.title)
  }

  return ''
}

function extractSectionBackgrounds(product) {
  const sections = product?.sanityContent?.sections ?? []
  const backgrounds = []
  const seen = new Set()

  for (const [index, section] of sections.entries()) {
    const imageUrl = findImageUrls(section.background)[0]
    if (!imageUrl || seen.has(imageUrl)) continue

    seen.add(imageUrl)
    backgrounds.push({
      sourceUrl: imageUrl,
      title: compactText(section.title) || `Official background ${index + 1}`,
      sortOrder: index,
    })
  }

  return backgrounds
}

function createBunnyClient() {
  const bunnyZone = requireEnv('BUNNY_STORAGE_ZONE_NAME')
  const bunnyAccessKey = requireEnv('BUNNY_ACCESS_KEY')
  const bunnyCdnHostname = requireEnv('BUNNY_CDN_HOSTNAME')
  const bunnyStorageBaseUrl = getBunnyStorageBaseUrl(process.env.BUNNY_STORAGE_REGION || 'de')

  async function uploadRemoteFile(sourceUrl, remotePath) {
    const cdnUrl = `https://${bunnyCdnHostname}/${remotePath}`
    const buffer = await fetchBuffer(sourceUrl)
    const response = await fetch(`${bunnyStorageBaseUrl}/${bunnyZone}/${remotePath}`, {
      method: 'PUT',
      headers: {
        AccessKey: bunnyAccessKey,
        'Content-Type': mimeTypeForExt(path.extname(remotePath).toLowerCase()),
      },
      body: buffer,
    })

    if (!response.ok) {
      throw new Error(`Bunny upload failed for ${remotePath}: ${response.status} ${await response.text().catch(() => '')}`)
    }

    return cdnUrl
  }

  return { uploadRemoteFile }
}

function loadMobileBySlug() {
  const mobiles = JSON.parse(readFileSync(MOBILE_FILE, 'utf8'))
  return new Map(mobiles.map((mobile) => [mobile.slug, mobile]))
}

async function upsertImage(supabase, row) {
  const { data: existing, error: findError } = await supabase
    .from('images')
    .select('id')
    .eq('related_type', row.related_type)
    .eq('related_id', row.related_id)
    .eq('slug', row.slug)
    .maybeSingle()

  if (findError) throw findError

  if (existing?.id) {
    const { error } = await supabase.from('images').update(row).eq('id', existing.id)
    if (error) throw error
    return existing.id
  }

  const { data, error } = await supabase.from('images').insert(row).select('id').single()
  if (error) throw error
  return data.id
}

async function main() {
  loadEnv()

  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const bunny = createBunnyClient()
  const mobileBySlug = loadMobileBySlug()
  const summary = {
    products_checked: OFFICIAL_PHONES.length,
    products_synced: 0,
    backgrounds_uploaded: 0,
    backgrounds_upserted: 0,
    failed: [],
  }

  for (const source of OFFICIAL_PHONES) {
    const mobile = mobileBySlug.get(source.relatedSlug)
    if (!mobile) {
      summary.failed.push({ handle: source.handle, error: `No local mobile found for ${source.relatedSlug}` })
      continue
    }

    process.stdout.write(`Syncing ${source.handle} backgrounds... `)

    try {
      const html = await fetchText(source.url)
      const product = findProductRoute(html)
      if (!product) throw new Error('Could not find official product payload')

      const backgrounds = extractSectionBackgrounds(product)

      for (const [index, background] of backgrounds.entries()) {
        const slug = `official-background-${String(index + 1).padStart(2, '0')}-${slugify(background.title)}`
        const ext = extensionForUrl(background.sourceUrl)
        const remotePath = `product-backgrounds/${source.handle}/${slug}${ext}`
        const cdnUrl = await bunny.uploadRemoteFile(background.sourceUrl, remotePath)
        summary.backgrounds_uploaded += 1

        await upsertImage(supabase, {
          related_type: 'detail_mobile',
          related_id: mobile.id,
          color_id: null,
          url: cdnUrl,
          alt_text: `${product.title} official ${background.title} background`,
          title: `${product.title} ${background.title}`,
          caption: 'Official product background',
          file_name: path.basename(remotePath),
          slug,
          sort_order: index,
          updated_at: new Date().toISOString(),
        })
        summary.backgrounds_upserted += 1
      }

      summary.products_synced += 1
      process.stdout.write(`${backgrounds.length} backgrounds\n`)
    } catch (error) {
      summary.failed.push({ handle: source.handle, error: error.message })
      process.stdout.write(`failed: ${error.message}\n`)
    }
  }

  console.log(JSON.stringify(summary, null, 2))

  if (summary.failed.length > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
