import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import styles from '@/app/blog/blog-content.module.css'
import { getPublishedBlogBySlug, getPublishedBlogs, type RuntimeBlogPost } from '@/lib/data/blog-repository'
import { companyLegalName } from '@/lib/data/company'
import { siteBrandName } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildFaqStructuredData, buildRobotsMetadata, trimSeoDescription } from '@/lib/utils/seo'

type BlogPostPageProps = {
  params: {
    slug: string
  }
}

function buildBlogMetaTitle(value: string) {
  const baseTitle = value.replace(/\s*\|\s*Nothing Pakistan\s*$/i, '').trim()
  const brandedTitle = `${baseTitle} | Nothing Pakistan`
  return brandedTitle.length <= 68 ? brandedTitle : baseTitle
}

function countWords(html: string) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

function relatedPostsFor(post: RuntimeBlogPost, posts: RuntimeBlogPost[]) {
  const currentTags = new Set(post.tags.map((tag) => tag.toLowerCase()))
  return posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => {
      const sharedTags = candidate.tags.filter((tag) => currentTags.has(tag.toLowerCase())).length
      const categoryMatch = post.category && candidate.category === post.category ? 6 : 0
      const keywordMatch = post.focusKeyword && candidate.title.toLowerCase().includes(post.focusKeyword.toLowerCase()) ? 2 : 0
      return { candidate, score: categoryMatch + sharedTags + keywordMatch }
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score
      return new Date(right.candidate.publishedAt || right.candidate.updatedAt).getTime()
        - new Date(left.candidate.publishedAt || left.candidate.updatedAt).getTime()
    })
    .slice(0, 3)
    .map(({ candidate }) => candidate)
}

export async function generateStaticParams() {
  const posts = await getPublishedBlogs()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getPublishedBlogBySlug(params.slug)

  if (!post) {
    return {
      title: 'Blog Post Not Found',
    }
  }

  const metaTitle = buildBlogMetaTitle(post.metaTitle || post.title)
  const metaDescription = trimSeoDescription(post.metaDescription || post.excerpt)
  const canonicalUrl = buildAbsoluteUrl(`/blog/${post.slug}`)
  const heroImageUrl = post.heroImage ? buildAbsoluteUrl(post.heroImage) : null
  const heroImageAlt = post.heroImageAlt || `${post.title} | ${siteBrandName}`

  return {
    title: {
      absolute: metaTitle,
    },
    description: metaDescription,
    authors: [{ name: siteBrandName, url: buildAbsoluteUrl('/about-us') }],
    creator: siteBrandName,
    publisher: siteBrandName,
    category: post.category || 'Technology',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      type: 'article',
      siteName: siteBrandName,
      locale: 'en_PK',
      publishedTime: post.publishedAt || post.updatedAt,
      modifiedTime: post.updatedAt,
      authors: [buildAbsoluteUrl('/about-us')],
      section: post.category || undefined,
      tags: post.tags,
      images: heroImageUrl
        ? [{ url: heroImageUrl, width: 800, height: 600, alt: heroImageAlt, type: 'image/webp' }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: heroImageUrl ? [{ url: heroImageUrl, alt: heroImageAlt }] : undefined,
    },
    robots: buildRobotsMetadata(),
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const allPosts = await getPublishedBlogs()
  const post = allPosts.find((candidate) => candidate.slug === params.slug) ?? null

  if (!post) {
    notFound()
  }

  const faqSchema = post.faqs.length > 0 ? buildFaqStructuredData(post.faqs) : null
  const publishedDate = post.publishedAt || post.updatedAt
  const canonicalUrl = buildAbsoluteUrl(`/blog/${post.slug}`)
  const heroImageUrl = post.heroImage ? buildAbsoluteUrl(post.heroImage) : null
  const articleKeywords = [...new Set([post.focusKeyword, ...post.tags].filter((value): value is string => Boolean(value)))]
  const wordCount = countWords(post.contentHtml)
  const relatedPosts = relatedPostsFor(post, allPosts)
  const structuredData = [
    buildBreadcrumbStructuredData([
      { label: 'Home', href: '/' },
      { label: 'Blog', href: '/blog' },
      { label: post.title, href: `/blog/${post.slug}` },
    ]),
    faqSchema,
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${canonicalUrl}#article`,
      url: canonicalUrl,
      headline: post.title,
      description: trimSeoDescription(post.metaDescription || post.excerpt),
      image: heroImageUrl
        ? {
            '@type': 'ImageObject',
            '@id': `${canonicalUrl}#primaryimage`,
            url: heroImageUrl,
            contentUrl: heroImageUrl,
            width: 800,
            height: 600,
            name: post.heroImageTitle || post.title,
            caption: post.heroImageCaption || post.metaDescription,
            representativeOfPage: true,
          }
        : undefined,
      datePublished: publishedDate,
      dateModified: post.updatedAt,
      author: {
        '@id': buildAbsoluteUrl('/#organization'),
        '@type': 'Organization',
        name: siteBrandName,
        url: buildAbsoluteUrl('/about-us'),
      },
      publisher: {
        '@id': buildAbsoluteUrl('/#organization'),
        name: siteBrandName,
        legalName: companyLegalName,
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
      isPartOf: {
        '@id': buildAbsoluteUrl('/blog#blog'),
      },
      inLanguage: 'en-PK',
      articleSection: post.category || undefined,
      keywords: articleKeywords.join(', '),
      wordCount,
      timeRequired: post.readingTime ? `PT${post.readingTime}M` : undefined,
      isAccessibleForFree: true,
      copyrightHolder: {
        '@id': buildAbsoluteUrl('/#organization'),
      },
      copyrightYear: new Date(publishedDate).getFullYear(),
    },
  ].filter(Boolean) as Record<string, unknown>[]

  return (
    <div className="support-centre-official">
      <SeoStructuredData data={structuredData} />
      <NothingHeader />

      <main className="px-4 pb-16 pt-28 md:px-8 md:pb-24">
        <article className="mx-auto max-w-[1180px]">
          <div>
            <nav aria-label="Breadcrumb" className="mx-auto mb-7 flex max-w-[940px] flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-black/45">
              <Link href="/" className="hover:text-black">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-black">Blog</Link>
              <span>/</span>
              <span>{post.title}</span>
            </nav>

            <header className="mx-auto max-w-[940px]">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] uppercase tracking-[0.12em] text-black/45">
                {post.readingTime ? <span>{post.readingTime} min read</span> : null}
                {post.category ? <span>{post.category}</span> : null}
              </div>
              <h1 className="mt-4 text-[2.8rem] leading-[0.92] tracking-normal text-black sm:text-[4rem] lg:text-[5.1rem]">
                {post.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-black/68">{post.excerpt}</p>
              <p className="mt-5 text-sm leading-7 text-black/58">
                Written by <Link href="/about-us" className="text-black underline-offset-4 hover:underline">{siteBrandName}</Link>, operated by {companyLegalName}.
              </p>
            </header>

            {post.faqs[0] ? (
              <section id="direct-answer" className="mx-auto mt-10 max-w-[820px] border-y border-black/10 py-6">
                <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Direct Answer</p>
                <h2 className="mt-3 text-[1.55rem] leading-tight text-black">{post.faqs[0].question}</h2>
                <p className="mt-3 text-sm leading-7 text-black/68">{post.faqs[0].answer}</p>
              </section>
            ) : null}

            <div
              id="article-content"
              className={`${styles.content} mx-auto mt-12 max-w-[820px]`}
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />

            {post.faqs.length > 0 ? (
              <section className="mx-auto mt-12 max-w-[820px] border-t border-black/10 pt-8">
                <h2 className="text-3xl leading-tight text-black">FAQs</h2>
                <div className="mt-6 divide-y divide-black/10 border-y border-black/10">
                  {post.faqs.map((faq) => (
                    <details key={faq.question} className="py-5">
                      <summary className="cursor-pointer list-none text-base text-black">{faq.question}</summary>
                      <p className="mt-3 text-sm leading-7 text-black/68">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ) : null}

            {relatedPosts.length > 0 ? (
              <section className="mt-14 border-t border-black/10 pt-10" aria-labelledby="related-guides-heading">
                <h2 id="related-guides-heading" className="text-3xl leading-tight text-black">Related guides</h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {relatedPosts.map((relatedPost) => (
                    <article key={relatedPost.slug} className="min-w-0 overflow-hidden">
                      {relatedPost.heroImage ? (
                        <Link href={`/blog/${relatedPost.slug}`} className="block aspect-[4/3] overflow-hidden rounded-[8px] bg-black/5">
                          <Image
                            src={relatedPost.heroImage}
                            alt={relatedPost.heroImageAlt || relatedPost.title}
                            width={800}
                            height={600}
                            sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
                            className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-[1.02]"
                          />
                        </Link>
                      ) : null}
                      <div className="pt-4">
                        {relatedPost.category ? <p className="text-[9px] uppercase tracking-[0.15em] text-black/45">{relatedPost.category}</p> : null}
                        <h3 className="mt-3 text-lg leading-[1.08] text-black">
                          <Link href={`/blog/${relatedPost.slug}`} className="transition-opacity hover:opacity-70">
                            {relatedPost.title}
                          </Link>
                        </h3>
                        <Link href={`/blog/${relatedPost.slug}`} className="mt-4 inline-flex text-[10px] uppercase tracking-[0.14em] text-black underline underline-offset-4">
                          Read related guide
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

        </article>
      </main>

      <NothingFooter />
    </div>
  )
}
