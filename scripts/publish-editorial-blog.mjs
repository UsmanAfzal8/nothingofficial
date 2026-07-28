import { createClient } from '@supabase/supabase-js'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const APPLY = process.argv.includes('--apply')
const articleArgument = process.argv.find((value) => value.startsWith('--article='))
const articleDirectory = articleArgument?.slice('--article='.length)

function loadEnv() {
  for (const fileName of ['.env.local', 'env']) {
    const filePath = path.join(ROOT, fileName)
    if (!existsSync(filePath)) continue

    for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
      const separator = trimmed.indexOf('=')
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

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function stripHtml(value) {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:amp|quot|apos|lt|gt|nbsp|#39);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function wordCount(value) {
  const text = stripHtml(value)
  return text ? text.split(/\s+/).filter(Boolean).length : 0
}

function extractLinks(html) {
  return [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map((match) => ({
    href: match[1],
    text: stripHtml(match[2]),
  }))
}

function validateMetadata(metadata) {
  const required = [
    'queue_number',
    'title',
    'slug',
    'meta_title',
    'meta_description',
    'excerpt',
    'focus_keyword',
    'category',
    'content_type',
    'hero_image_url',
    'hero_image_alt',
    'hero_image_caption',
  ]

  for (const field of required) {
    if (!metadata[field]) throw new Error(`Missing article metadata field: ${field}`)
  }

  if (!Array.isArray(metadata.tags) || metadata.tags.length < 5) {
    throw new Error('Article metadata must contain at least five tags')
  }

  if (!Array.isArray(metadata.faqs) || metadata.faqs.length < 8) {
    throw new Error('Article metadata must contain at least eight FAQs')
  }

  if (metadata.meta_title.length > 68) {
    throw new Error(`Meta title is ${metadata.meta_title.length} characters; maximum is 68`)
  }

  if (metadata.meta_description.length < 120 || metadata.meta_description.length > 160) {
    throw new Error(`Meta description is ${metadata.meta_description.length} characters; expected 120-160`)
  }
}

async function validateProductLinks(supabase, links) {
  const productLinks = links.filter((link) => /^\/products\/[a-z0-9-]+(?:[?#].*)?$/i.test(link.href))
  if (productLinks.length < 2) throw new Error(`Expected at least two internal product links, found ${productLinks.length}`)

  const slugs = [...new Set(productLinks.map((link) => link.href.match(/^\/products\/([^?#]+)/)?.[1]).filter(Boolean))]
  const [{ data: products, error: productError }, { data: mobiles, error: mobileError }] = await Promise.all([
    supabase.from('products').select('slug').in('slug', slugs),
    supabase.from('mobiles').select('slug').in('slug', slugs),
  ])
  if (productError) throw productError
  if (mobileError) throw mobileError

  const existing = new Set([...(products ?? []), ...(mobiles ?? [])].map((row) => row.slug))
  const missing = slugs.filter((slug) => !existing.has(slug))
  if (missing.length > 0) throw new Error(`Article contains missing product links: ${missing.join(', ')}`)

  for (const link of productLinks) {
    if (!link.text || /^(click here|learn more|product)$/i.test(link.text)) {
      throw new Error(`Product link has weak anchor text: ${link.href}`)
    }
  }

  return { productLinks: productLinks.length, uniqueProductSlugs: slugs }
}

async function validateHeroImage(metadata) {
  const response = await fetch(metadata.hero_image_url, { method: 'HEAD' })
  if (!response.ok) throw new Error(`Hero image returned HTTP ${response.status}`)
  return {
    status: response.status,
    contentType: response.headers.get('content-type'),
    contentLength: Number(response.headers.get('content-length') || 0),
  }
}

async function upsertArticle(supabase, metadata, contentHtml, metrics) {
  const now = new Date().toISOString()
  const { data: existing, error: existingError } = await supabase
    .from('blogs')
    .select('id,published_at')
    .eq('slug', metadata.slug)
    .maybeSingle()
  if (existingError) throw existingError

  const row = {
    title: metadata.title,
    slug: metadata.slug,
    content: contentHtml,
    meta_title: metadata.meta_title,
    meta_description: metadata.meta_description,
    excerpt: metadata.excerpt,
    focus_keyword: metadata.focus_keyword,
    category: metadata.category,
    tags: metadata.tags,
    author: metadata.author || 'Nothing Pakistan',
    author_type: metadata.author_type || 'brand',
    content_type: metadata.content_type,
    reading_time: Math.ceil(metrics.words / 220),
    is_published: true,
    published_at: existing?.published_at || now,
    updated_at: now,
  }

  const query = existing?.id
    ? supabase.from('blogs').update(row).eq('id', existing.id)
    : supabase.from('blogs').insert(row)
  const { data: blog, error: blogError } = await query.select('id,slug,title,published_at').single()
  if (blogError) throw blogError

  const imageRow = {
    related_type: 'blog',
    related_id: blog.id,
    color_id: null,
    url: metadata.hero_image_url,
    alt_text: metadata.hero_image_alt.slice(0, 255),
    title: metadata.title.slice(0, 160),
    caption: metadata.hero_image_caption,
    file_name: `${metadata.slug}.webp`,
    slug: `hero-${metadata.slug}`,
    sort_order: 0,
    updated_at: now,
  }

  const { data: existingImage, error: imageLookupError } = await supabase
    .from('images')
    .select('id')
    .eq('related_type', 'blog')
    .eq('related_id', blog.id)
    .eq('slug', imageRow.slug)
    .maybeSingle()
  if (imageLookupError) throw imageLookupError

  const imageQuery = existingImage?.id
    ? supabase.from('images').update(imageRow).eq('id', existingImage.id)
    : supabase.from('images').insert(imageRow)
  const { data: image, error: imageError } = await imageQuery.select('id,url').single()
  if (imageError) throw imageError

  const { error: faqDeleteError } = await supabase
    .from('faqs')
    .delete()
    .eq('related_type', 'blog')
    .eq('related_id', blog.id)
  if (faqDeleteError) throw faqDeleteError

  const faqRows = metadata.faqs.map((faq) => ({
    related_type: 'blog',
    related_id: blog.id,
    question: faq.question,
    answer: faq.answer,
    updated_at: now,
  }))
  const { error: faqInsertError } = await supabase.from('faqs').insert(faqRows)
  if (faqInsertError) throw faqInsertError

  const { error: featuredError } = await supabase
    .from('blogs')
    .update({ featured_image_id: image.id, updated_at: now })
    .eq('id', blog.id)
  if (featuredError) throw featuredError

  return {
    action: existing?.id ? 'updated' : 'inserted',
    blogId: blog.id,
    imageId: image.id,
    publishedAt: blog.published_at,
    faqCount: faqRows.length,
  }
}

async function main() {
  loadEnv()
  if (!articleDirectory) throw new Error('Use --article=database/blog-editorial/articles/<directory>')

  const fullDirectory = path.resolve(ROOT, articleDirectory)
  const metadataPath = path.join(fullDirectory, 'metadata.json')
  const contentPath = path.join(fullDirectory, 'content.html')
  const reportPath = path.join(fullDirectory, 'publish-report.json')
  const metadata = readJson(metadataPath)
  const contentHtml = readFileSync(contentPath, 'utf8')
  const words = wordCount(contentHtml)
  const links = extractLinks(contentHtml)
  const headings = [...contentHtml.matchAll(/<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((match) => stripHtml(match[2]))

  validateMetadata(metadata)
  if (words < 3000 || words > 3600) throw new Error(`Article has ${words} words; expected 3000-3600`)
  if (headings.length < 12) throw new Error(`Article has ${headings.length} subheadings; expected at least 12`)
  if (!contentHtml.includes(metadata.focus_keyword)) {
    throw new Error('The exact focus keyword does not appear in the article content')
  }

  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const productLinkMetrics = await validateProductLinks(supabase, links)
  const heroImage = await validateHeroImage(metadata)
  const metrics = {
    words,
    headings: headings.length,
    links: links.length,
    ...productLinkMetrics,
    heroImage,
  }

  const report = {
    checkedAt: new Date().toISOString(),
    apply: APPLY,
    article: {
      queueNumber: metadata.queue_number,
      slug: metadata.slug,
      title: metadata.title,
    },
    metrics,
    database: null,
  }

  if (APPLY) report.database = await upsertArticle(supabase, metadata, contentHtml, metrics)

  mkdirSync(fullDirectory, { recursive: true })
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
