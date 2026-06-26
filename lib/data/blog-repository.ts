import { unstable_cache } from 'next/cache'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import type { SupabaseBlogRow, SupabaseFaqRow, SupabaseImageRow } from '@/lib/models/supabase-store'
import { blogPosts as fallbackBlogPosts } from '@/lib/data/blog'

export type RuntimeBlogFaq = {
  question: string
  answer: string
}

export type RuntimeBlogPost = {
  id: number | null
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  excerpt: string
  author: string
  authorType: string | null
  updatedAt: string
  publishedAt: string | null
  heroImage: string | null
  contentHtml: string
  faqs: RuntimeBlogFaq[]
}

type BlogSnapshot = {
  posts: RuntimeBlogPost[]
}

async function fetchPagedRows<T>(query: any): Promise<T[]> {
  const rows: T[] = []

  for (let from = 0; ; from += 1000) {
    const { data, error } = await query.range(from, from + 999)

    if (error) {
      throw error
    }

    rows.push(...((data ?? []) as T[]))

    if (!data || data.length < 1000) {
      break
    }
  }

  return rows
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildFallbackHtml(post: (typeof fallbackBlogPosts)[number]) {
  const sectionsHtml = post.sections
    .map(
      (section) => `
        <section>
          <h2>${escapeHtml(section.title)}</h2>
          ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
        </section>
      `,
    )
    .join('')

  const productLinksHtml = post.productLinks.length
    ? `
      <section>
        <h2>Related products</h2>
        <ul>
          ${post.productLinks.map((item) => `<li><a href="${item.href}">${escapeHtml(item.label)}</a></li>`).join('')}
        </ul>
      </section>
    `
    : ''

  const collectionLinksHtml = post.collectionLinks.length
    ? `
      <section>
        <h2>Helpful collections</h2>
        <ul>
          ${post.collectionLinks.map((item) => `<li><a href="${item.href}">${escapeHtml(item.label)}</a></li>`).join('')}
        </ul>
      </section>
    `
    : ''

  return `${sectionsHtml}${productLinksHtml}${collectionLinksHtml}`
}

function normalizeDate(value: string | null | undefined, fallback = new Date().toISOString()): string {
  return value && !Number.isNaN(new Date(value).getTime()) ? value : fallback
}

function mapFallbackPosts(): RuntimeBlogPost[] {
  return fallbackBlogPosts.map((post, index) => ({
    id: -(index + 1),
    slug: post.slug,
    title: post.title,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    excerpt: post.excerpt,
    author: post.author,
    authorType: 'staff',
    updatedAt: normalizeDate(post.updatedDate),
    publishedAt: normalizeDate(post.updatedDate),
    heroImage: post.heroImage,
    contentHtml: buildFallbackHtml(post),
    faqs: post.faqs,
  }))
}

function buildImageMap(images: SupabaseImageRow[]) {
  const imagesByBlogId = new Map<number, SupabaseImageRow[]>()

  for (const image of images) {
    const current = imagesByBlogId.get(image.related_id) ?? []
    current.push(image)
    imagesByBlogId.set(image.related_id, current)
  }

  for (const [blogId, blogImages] of imagesByBlogId) {
    blogImages.sort((left, right) => left.sort_order - right.sort_order || left.id - right.id)
    imagesByBlogId.set(blogId, blogImages)
  }

  return imagesByBlogId
}

function buildFaqMap(faqs: SupabaseFaqRow[]) {
  const faqsByBlogId = new Map<number, RuntimeBlogFaq[]>()

  for (const faq of faqs) {
    const current = faqsByBlogId.get(faq.related_id) ?? []
    current.push({
      question: faq.question,
      answer: faq.answer,
    })
    faqsByBlogId.set(faq.related_id, current)
  }

  return faqsByBlogId
}

async function fetchPublishedBlogSnapshot(): Promise<BlogSnapshot> {
  const supabase = getSupabaseAdminClient()

  if (!supabase) {
    return { posts: mapFallbackPosts() }
  }

  let typedBlogRows: SupabaseBlogRow[]

  try {
    typedBlogRows = await fetchPagedRows<SupabaseBlogRow>(
      supabase
        .from('blogs')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('updated_at', { ascending: false, nullsFirst: false }),
    )
  } catch {
    return { posts: mapFallbackPosts() }
  }

  if (!typedBlogRows.length) {
    return { posts: mapFallbackPosts() }
  }

  const blogIds = typedBlogRows.map((row) => row.id)

  let imageRows: SupabaseImageRow[]
  let faqRows: SupabaseFaqRow[]

  try {
    ;[imageRows, faqRows] = await Promise.all([
      fetchPagedRows<SupabaseImageRow>(
        supabase
          .from('images')
          .select('*')
          .eq('related_type', 'blog')
          .in('related_id', blogIds)
          .order('sort_order', { ascending: true }),
      ),
      fetchPagedRows<SupabaseFaqRow>(
        supabase
          .from('faqs')
          .select('*')
          .eq('related_type', 'blog')
          .in('related_id', blogIds)
          .order('id', { ascending: true }),
      ),
    ])
  } catch {
    return { posts: mapFallbackPosts() }
  }

  const imagesByBlogId = buildImageMap(imageRows)
  const faqsByBlogId = buildFaqMap(faqRows)

  const posts = typedBlogRows.map((row) => {
    const images = imagesByBlogId.get(row.id) ?? []
    const featuredImage = images.find((image) => image.id === row.featured_image_id) ?? images[0] ?? null

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      metaTitle: row.meta_title || row.title,
      metaDescription: row.meta_description || row.excerpt || row.title,
      excerpt: row.excerpt || row.meta_description || row.title,
      author: row.author || 'Nothing Pakistan Team',
      authorType: row.author_type || null,
      updatedAt: normalizeDate(row.updated_at || row.published_at || row.created_at),
      publishedAt: row.published_at || row.created_at,
      heroImage: featuredImage?.url ?? null,
      contentHtml: row.content,
      faqs: faqsByBlogId.get(row.id) ?? [],
    } satisfies RuntimeBlogPost
  })

  return { posts }
}

const getCachedPublishedBlogSnapshot = unstable_cache(fetchPublishedBlogSnapshot, ['published-blog-snapshot-v2'], {
  revalidate: 300,
  tags: ['blogs'],
})

export async function getPublishedBlogs(): Promise<RuntimeBlogPost[]> {
  const snapshot = await getCachedPublishedBlogSnapshot()
  return snapshot.posts
}

export async function getPublishedBlogBySlug(slug: string): Promise<RuntimeBlogPost | null> {
  const posts = await getPublishedBlogs()
  return posts.find((post) => post.slug === slug) ?? null
}
