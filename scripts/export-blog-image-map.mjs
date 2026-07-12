import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUTPUT_PATH = path.join(ROOT, 'blog-image-map.csv')
const ASSET_DIR = path.join(ROOT, 'assets', 'Nothing Blog')

function loadEnv() {
  const env = {}
  for (const fileName of ['.env.local', 'env']) {
    try {
      for (const line of readFileSync(path.join(ROOT, fileName), 'utf8').split(/\r?\n/)) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const separator = trimmed.indexOf('=')
        if (separator < 1) continue
        const key = trimmed.slice(0, separator)
        if (env[key]) continue
        env[key] = trimmed.slice(separator + 1).replace(/^['"]|['"]$/g, '')
      }
    } catch {
      // The second env file is optional.
    }
  }
  return env
}

function csvCell(value) {
  const text = value == null ? '' : String(value)
  return `"${text.replaceAll('"', '""')}"`
}

async function main() {
  const env = loadEnv()
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }

  const endpoint = new URL('/rest/v1/blogs', env.SUPABASE_URL)
  endpoint.search = new URLSearchParams({
    select: 'id,title,slug,published_at,updated_at,created_at',
    is_published: 'eq.true',
    order: 'published_at.desc.nullslast,updated_at.desc.nullslast',
  }).toString()

  const response = await fetch(endpoint, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  })
  if (!response.ok) throw new Error(`Supabase request failed: HTTP ${response.status}`)

  const posts = await response.json()
  if (!Array.isArray(posts) || posts.length === 0) throw new Error('No published blog posts found')

  const total = posts.length
  const header = ['display_order', 'blog_number', 'blog_id', 'blog_name', 'slug', 'timestamp', 'updated_at', 'image', 'asset_image']
  const rows = posts.map((post, index) => {
    const blogNumber = total - index
    return [
      index + 1,
      blogNumber,
      post.id,
      post.title,
      post.slug,
      post.published_at || post.created_at || '',
      post.updated_at || '',
      '',
      path.join(ASSET_DIR, `${blogNumber}.png`),
    ].map(csvCell).join(',')
  })

  writeFileSync(OUTPUT_PATH, `${header.map(csvCell).join(',')}\n${rows.join('\n')}\n`)
  console.log(`Wrote ${posts.length} rows to ${OUTPUT_PATH}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
