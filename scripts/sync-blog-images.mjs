import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

const ROOT = process.cwd()
const CSV_PATH = path.join(ROOT, 'blog-image-map.csv')
const WEBP_DIR = path.join(ROOT, 'assets', 'Nothing Blog', 'webp')
const REPORT_PATH = path.join(ROOT, 'tmp', 'blog-image-sync-report.json')
const CLOUDINARY_FOLDER = 'nothing-official-store-pakistan/blogs/hero-images'
const SITE_NAME = 'Nothing Pakistan'
const SITE_URL = 'https://www.nothingpakistan.pk'

function loadEnv() {
  for (const fileName of ['.env.local', 'env']) {
    const filePath = path.join(ROOT, fileName)
    if (!existsSync(filePath)) continue
    for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const separator = trimmed.indexOf('=')
      if (separator < 1) continue
      const key = trimmed.slice(0, separator).trim()
      const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')
      process.env[key] ||= value
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment value: ${name}`)
  return value
}

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (character === ',' && !quoted) {
      row.push(field)
      field = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      row.push(field)
      if (row.some((value) => value !== '')) rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }

  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }

  const [headers, ...values] = rows
  return values.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])))
}

function csvCell(value) {
  const text = value == null ? '' : String(value)
  return `"${text.replaceAll('"', '""')}"`
}

function writeCsv(rows) {
  const headers = ['display_order', 'blog_number', 'blog_id', 'blog_name', 'slug', 'timestamp', 'updated_at', 'image', 'asset_image']
  const output = [
    headers.map(csvCell).join(','),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(',')),
  ].join('\n')
  writeFileSync(CSV_PATH, `${output}\n`)
}

function cloudinarySignature(params, apiSecret) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
  return createHash('sha1').update(`${payload}${apiSecret}`).digest('hex')
}

function contextValue(value, maxLength = 240) {
  return String(value ?? '')
    .replace(/[|]/g, ' - ')
    .replace(/[=]/g, ':')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function tagValue(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120)
}

async function convertToWebp(sourcePath, slug) {
  if (!existsSync(sourcePath)) throw new Error(`Missing source image: ${sourcePath}`)
  const outputPath = path.join(WEBP_DIR, `${slug}.webp`)
  const result = await sharp(sourcePath)
    .rotate()
    .webp({ quality: 86, effort: 6, smartSubsample: true })
    .toFile(outputPath)
  return { outputPath, ...result }
}

async function uploadToCloudinary({ filePath, blog, altText, description }) {
  const cloudName = requireEnv('CLOUDINARY_CLOUD_NAME')
  const apiKey = requireEnv('CLOUDINARY_API_KEY')
  const apiSecret = requireEnv('CLOUDINARY_API_SECRET')
  const timestamp = Math.floor(Date.now() / 1000)
  const tags = [
    'nothing-pakistan',
    'nothing-pakistan-blog',
    'blog',
    'blog-hero-image',
    tagValue(blog.category),
    /\bcmf\b/i.test(blog.title) ? 'cmf-by-nothing' : 'nothing',
    blog.slug,
  ].filter(Boolean).join(',')
  const context = [
    `title=${contextValue(blog.title, 160)}`,
    `description=${contextValue(description)}`,
    `caption=${contextValue(description)}`,
    `alt=${contextValue(altText)}`,
    `brand=${SITE_NAME}`,
    `site=${SITE_URL}`,
    `blog_id=${blog.id}`,
    'source=Nothing Pakistan blog assets',
  ].join('|')
  const params = {
    context,
    folder: CLOUDINARY_FOLDER,
    invalidate: 'true',
    overwrite: 'true',
    public_id: blog.slug,
    tags,
    timestamp,
  }
  const formData = new FormData()
  formData.set('file', new Blob([readFileSync(filePath)], { type: 'image/webp' }), path.basename(filePath))
  formData.set('api_key', apiKey)
  for (const [key, value] of Object.entries(params)) formData.set(key, String(value))
  formData.set('signature', cloudinarySignature(params, apiSecret))

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(`Cloudinary upload failed for ${blog.slug}: HTTP ${response.status} ${JSON.stringify(body)}`)
  }
  return body
}

async function upsertImage(supabase, { blog, cloudinary, altText, description }) {
  const row = {
    related_type: 'blog',
    related_id: blog.id,
    color_id: null,
    url: cloudinary.secure_url,
    alt_text: altText.slice(0, 255),
    title: blog.title.slice(0, 160),
    caption: description,
    file_name: `${blog.slug}.webp`,
    slug: blog.slug,
    sort_order: 0,
    updated_at: new Date().toISOString(),
  }
  const { data: existing, error: lookupError } = await supabase
    .from('images')
    .select('id')
    .eq('related_type', 'blog')
    .eq('related_id', blog.id)
    .eq('slug', blog.slug)
    .maybeSingle()
  if (lookupError) throw new Error(`Image lookup failed for ${blog.slug}: ${lookupError.message}`)

  let image
  if (existing?.id) {
    const { data, error } = await supabase.from('images').update(row).eq('id', existing.id).select('id,url').single()
    if (error) throw new Error(`Image update failed for ${blog.slug}: ${error.message}`)
    image = data
  } else {
    const { data, error } = await supabase.from('images').insert(row).select('id,url').single()
    if (error) throw new Error(`Image insert failed for ${blog.slug}: ${error.message}`)
    image = data
  }

  const { error: featuredError } = await supabase.from('blogs').update({ featured_image_id: image.id }).eq('id', blog.id)
  if (featuredError) throw new Error(`Featured image update failed for ${blog.slug}: ${featuredError.message}`)
  return { ...image, action: existing?.id ? 'updated' : 'inserted' }
}

async function main() {
  loadEnv()
  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const csvRows = parseCsv(readFileSync(CSV_PATH, 'utf8'))
  if (csvRows.length !== 55) throw new Error(`Expected 55 CSV mappings, found ${csvRows.length}`)
  mkdirSync(WEBP_DIR, { recursive: true })
  mkdirSync(path.dirname(REPORT_PATH), { recursive: true })

  const blogIds = csvRows.map((row) => Number(row.blog_id))
  const { data: blogs, error: blogError } = await supabase
    .from('blogs')
    .select('id,title,slug,meta_description,excerpt,category,published_at,updated_at')
    .in('id', blogIds)
  if (blogError) throw new Error(`Blog query failed: ${blogError.message}`)
  const blogsById = new Map((blogs ?? []).map((blog) => [blog.id, blog]))
  if (blogsById.size !== csvRows.length) throw new Error(`Expected ${csvRows.length} blogs, found ${blogsById.size}`)

  const results = []
  for (const [index, mapping] of csvRows.entries()) {
    const blog = blogsById.get(Number(mapping.blog_id))
    if (!blog || blog.slug !== mapping.slug) throw new Error(`CSV mismatch at display row ${mapping.display_order}`)
    const description = contextValue(blog.meta_description || blog.excerpt || blog.title, 500)
    const altText = `${blog.title} hero image for ${SITE_NAME}`
    const converted = await convertToWebp(mapping.asset_image, blog.slug)
    const cloudinary = await uploadToCloudinary({ filePath: converted.outputPath, blog, altText, description })
    const image = await upsertImage(supabase, { blog, cloudinary, altText, description })
    mapping.image = cloudinary.secure_url
    results.push({
      displayOrder: Number(mapping.display_order),
      blogNumber: Number(mapping.blog_number),
      blogId: blog.id,
      title: blog.title,
      slug: blog.slug,
      source: mapping.asset_image,
      webp: converted.outputPath,
      width: converted.width,
      height: converted.height,
      bytes: converted.size,
      cloudinaryUrl: cloudinary.secure_url,
      cloudinaryPublicId: cloudinary.public_id,
      imageId: image.id,
      databaseAction: image.action,
    })
    console.log(`[${index + 1}/${csvRows.length}] ${image.action}: ${blog.slug}`)
  }

  writeCsv(csvRows)
  writeFileSync(REPORT_PATH, `${JSON.stringify({ syncedAt: new Date().toISOString(), cloudinaryFolder: CLOUDINARY_FOLDER, results }, null, 2)}\n`)
  console.log(`Saved report to ${REPORT_PATH}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
