import { createClient } from '@supabase/supabase-js'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const jsonPath = path.join(projectRoot, 'product-detail-assets.json')
const skipSlugs = new Set(['nothing-4a-pro'])

function loadEnv() {
  for (const envPath of ['.env.local', 'env']) {
    const fullPath = path.join(projectRoot, envPath)
    if (!existsSync(fullPath)) continue

    for (const line of readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue

      const separatorIndex = trimmed.indexOf('=')
      const key = trimmed.slice(0, separatorIndex)
      const value = trimmed
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '')

      process.env[key] ||= value
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env value: ${name}`)
  return value
}

function absoluteLocalPath(localPath) {
  return path.isAbsolute(localPath) ? localPath : path.join(projectRoot, localPath)
}

function detectMimeType(localPath) {
  try {
    return execFileSync('file', ['--brief', '--mime-type', localPath], { encoding: 'utf8' }).trim()
  } catch {
    const ext = path.extname(localPath).toLowerCase()
    if (ext === '.svg') return 'image/svg+xml'
    if (ext === '.avif') return 'image/avif'
    if (ext === '.webp') return 'image/webp'
    if (ext === '.png') return 'image/png'
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
    return 'application/octet-stream'
  }
}

function extensionForMime(mimeType, fallbackPath) {
  if (mimeType === 'image/svg+xml') return '.svg'
  if (mimeType === 'image/avif') return '.avif'
  if (mimeType === 'image/webp') return '.webp'
  if (mimeType === 'image/png') return '.png'
  if (mimeType === 'image/jpeg') return '.jpg'
  return path.extname(fallbackPath).toLowerCase() || '.bin'
}

function slugify(value, fallback = 'asset') {
  const slug = value
    .toString()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')

  return slug || fallback
}

function buildFeatureHtml(item) {
  const features = (item.shortDescription?.features ?? []).filter((feature) => feature.text?.trim() && feature.iconCdnUrl?.trim())
  const label = `${item.name} highlights`
  const listItems = features
    .map(
      (feature) =>
        `<li class="np-feature"><img src="${feature.iconCdnUrl}" alt="" loading="lazy" width="16" height="16" /> <span>${feature.text.trim()}</span></li>`,
    )
    .join('')

  return `<ul class="np-feature-list" aria-label="${label}">${listItems}</ul>`
}

function getBunnyStorageBaseUrl(region) {
  return region.toLowerCase() === 'de' ? 'https://storage.bunnycdn.com' : `https://${region}.storage.bunnycdn.com`
}

async function uploadFile({ localPath, remotePath, mimeType, bunnyZone, bunnyAccessKey, bunnyCdnHostname, bunnyStorageBaseUrl }) {
  const response = await fetch(`${bunnyStorageBaseUrl}/${bunnyZone}/${remotePath}`, {
    method: 'PUT',
    headers: {
      AccessKey: bunnyAccessKey,
      'Content-Type': mimeType,
    },
    body: readFileSync(localPath),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Bunny upload failed for ${remotePath}: ${response.status} ${body}`)
  }

  return `https://${bunnyCdnHostname}/${remotePath}`
}

async function upsertDetailImage(supabase, item) {
  const background = item.background
  const slug = `${slugify(background.preferredFileName || `${item.slug}-product-background`)}`
  const row = {
    related_type: background.relationType || (item.entityType === 'mobile' ? 'detail_mobile' : 'detail_product'),
    related_id: background.relationId || item.id,
    color_id: null,
    url: background.cdnUrl,
    alt_text: `${item.name} product background image`,
    title: `${item.name} product background`,
    caption: 'Product background',
    file_name: `${slug}${path.extname(new URL(background.cdnUrl).pathname)}`,
    slug,
    sort_order: 0,
    updated_at: new Date().toISOString(),
  }

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

async function updateShortDescription(supabase, item, html) {
  if (item.entityType === 'mobile') {
    const { error } = await supabase.from('mobiles').update({ description: html, updated_at: new Date().toISOString() }).eq('id', item.id)
    if (error) throw error
    return
  }

  const { error } = await supabase.from('products').update({ short_description: html, updated_at: new Date().toISOString() }).eq('id', item.id)
  if (error) throw error
}

loadEnv()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase credentials')

const bunnyZone = requireEnv('BUNNY_STORAGE_ZONE_NAME')
const bunnyAccessKey = requireEnv('BUNNY_ACCESS_KEY')
const bunnyCdnHostname = requireEnv('BUNNY_CDN_HOSTNAME')
const bunnyStorageBaseUrl = getBunnyStorageBaseUrl(process.env.BUNNY_STORAGE_REGION || 'de')
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } })
const data = JSON.parse(readFileSync(jsonPath, 'utf8'))
const iconUrlByLocalPath = new Map()
const summary = {
  skipped: [],
  synced: [],
  uploadedBackgrounds: 0,
  uploadedIcons: 0,
}

for (const item of data.items) {
  if (skipSlugs.has(item.slug)) {
    summary.skipped.push(item.slug)
    continue
  }

  const backgroundPath = absoluteLocalPath(item.background.localPath)
  if (!existsSync(backgroundPath)) throw new Error(`Missing background file for ${item.slug}: ${item.background.localPath}`)

  for (const feature of item.shortDescription.features ?? []) {
    if (!feature.text?.trim()) continue
    const iconPath = absoluteLocalPath(feature.iconLocalPath)
    if (!existsSync(iconPath)) throw new Error(`Missing icon file for ${item.slug}: ${feature.iconLocalPath}`)

    if (feature.iconCdnUrl?.trim()) {
      iconUrlByLocalPath.set(iconPath, feature.iconCdnUrl)
      continue
    }

    if (iconUrlByLocalPath.has(iconPath)) {
      feature.iconCdnUrl = iconUrlByLocalPath.get(iconPath)
      continue
    }

    const mimeType = detectMimeType(iconPath)
    const ext = extensionForMime(mimeType, iconPath)
    const iconName = slugify(feature.iconPreferredFileName || path.basename(iconPath, path.extname(iconPath)), 'detail-icon')
    const remotePath = `${data.uploadDefaults.iconUploadFolder}/${iconName}${ext}`
    feature.iconCdnUrl = await uploadFile({
      localPath: iconPath,
      remotePath,
      mimeType,
      bunnyZone,
      bunnyAccessKey,
      bunnyCdnHostname,
      bunnyStorageBaseUrl,
    })
    iconUrlByLocalPath.set(iconPath, feature.iconCdnUrl)
    summary.uploadedIcons += 1
  }

  if (!item.background.cdnUrl?.trim()) {
    const mimeType = detectMimeType(backgroundPath)
    const ext = extensionForMime(mimeType, backgroundPath)
    const fileName = `${slugify(item.background.preferredFileName || `${item.slug}-product-background`)}${ext}`
    const remotePath = `${item.background.uploadFolder}/${fileName}`
    item.background.cdnUrl = await uploadFile({
      localPath: backgroundPath,
      remotePath,
      mimeType,
      bunnyZone,
      bunnyAccessKey,
      bunnyCdnHostname,
      bunnyStorageBaseUrl,
    })
    summary.uploadedBackgrounds += 1
  }

  const html = buildFeatureHtml(item)
  item.shortDescription.html = html

  const imageId = await upsertDetailImage(supabase, item)
  await updateShortDescription(supabase, item, html)

  summary.synced.push({
    slug: item.slug,
    entityType: item.entityType,
    imageId,
    background: item.background.cdnUrl,
  })
}

data.generatedAt = new Date().toISOString()
writeFileSync(jsonPath, `${JSON.stringify(data, null, 2)}\n`)
console.log(JSON.stringify(summary, null, 2))
