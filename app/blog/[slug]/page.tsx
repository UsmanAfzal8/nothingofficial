import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import styles from '@/app/blog/blog-content.module.css'
import { getPublishedBlogBySlug, getPublishedBlogs } from '@/lib/data/blog-repository'
import { companyLegalName } from '@/lib/data/company'
import { siteBrandName, siteKeywords } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildFaqStructuredData, buildRobotsMetadata, buildSeoKeywords } from '@/lib/utils/seo'

type BlogPostPageProps = {
  params: {
    slug: string
  }
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

  return {
    title: {
      absolute: post.metaTitle,
    },
    description: post.metaDescription,
    keywords: buildSeoKeywords(siteKeywords, [post.title, post.metaTitle, companyLegalName]),
    alternates: {
      canonical: buildAbsoluteUrl(`/blog/${post.slug}`),
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: buildAbsoluteUrl(`/blog/${post.slug}`),
      type: 'article',
      images: post.heroImage ? [buildAbsoluteUrl(post.heroImage)] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription,
      images: post.heroImage ? [buildAbsoluteUrl(post.heroImage)] : undefined,
    },
    robots: buildRobotsMetadata(),
  }
}

function formatDisplayDate(value: string | null | undefined) {
  if (!value) return null

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null

  return new Intl.DateTimeFormat('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed)
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPublishedBlogBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const faqSchema = post.faqs.length > 0 ? buildFaqStructuredData(post.faqs) : null
  const displayDate = formatDisplayDate(post.updatedAt) ?? post.updatedAt.slice(0, 10)
  const structuredData = [
    buildBreadcrumbStructuredData([
      { label: 'Home', href: '/' },
      { label: 'Blog', href: '/blog' },
      { label: post.title, href: `/blog/${post.slug}` },
    ]),
    faqSchema,
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': buildAbsoluteUrl(`/blog/${post.slug}#article`),
      headline: post.title,
      description: post.metaDescription,
      image: post.heroImage ? buildAbsoluteUrl(post.heroImage) : undefined,
      datePublished: post.publishedAt || post.updatedAt,
      dateModified: post.updatedAt,
      author: {
        '@type': 'Person',
        name: post.author,
        url: buildAbsoluteUrl('/authors/usman-afzal'),
      },
      publisher: {
        '@id': buildAbsoluteUrl('/#organization'),
        name: siteBrandName,
        legalName: companyLegalName,
      },
      mainEntityOfPage: buildAbsoluteUrl(`/blog/${post.slug}`),
    },
  ].filter(Boolean) as Record<string, unknown>[]

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f4f0] text-[#111]">
      <SeoStructuredData data={structuredData} />
      <NothingHeader />

      <main className="px-4 pb-16 pt-28 md:px-8 md:pb-24">
        <article className="mx-auto grid max-w-screen-2xl gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <nav aria-label="Breadcrumb" className="mb-7 flex flex-wrap items-center gap-2 [font-family:var(--font-lettera-regular)] text-[10px] uppercase tracking-[0.22em] text-black/45">
              <Link href="/" className="hover:text-black">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-black">Blog</Link>
              <span>/</span>
              <span>{post.title}</span>
            </nav>

            <header className="max-w-5xl">
              <p className="dot-heading text-[10px] tracking-[0.34em] text-black/45">Updated {displayDate}</p>
              <h1 className="mt-4 [font-family:var(--font-ntype82-headline)] text-[2.8rem] leading-[0.92] tracking-normal text-black sm:text-[4rem] lg:text-[5.1rem]">
                {post.title}
              </h1>
              <p className="mt-5 max-w-3xl [font-family:var(--font-ntype82)] text-base leading-8 text-black/68">{post.excerpt}</p>
              <p className="mt-5 [font-family:var(--font-ntype82)] text-sm leading-7 text-black/58">
                Written by <Link href="/authors/usman-afzal" className="text-black underline-offset-4 hover:underline">{post.author}</Link> for {siteBrandName}.
              </p>
            </header>

            {post.faqs[0] ? (
              <section className="mt-10 rounded-[10px] border border-black/10 bg-white p-5">
                <p className="[font-family:var(--font-lettera-regular)] text-[10px] uppercase tracking-[0.24em] text-black/42">Direct Answer</p>
                <h2 className="mt-3 [font-family:var(--font-ntype82-headline)] text-[1.55rem] leading-tight text-black">{post.faqs[0].question}</h2>
                <p className="mt-3 [font-family:var(--font-ntype82)] text-sm leading-7 text-black/68">{post.faqs[0].answer}</p>
              </section>
            ) : null}

            {post.heroImage ? (
              <div className="mt-10 overflow-hidden rounded-[10px] border border-black/10 bg-white">
                <Image
                  src={post.heroImage}
                  alt={post.title}
                  width={1366}
                  height={768}
                  className="h-auto w-full object-cover"
                />
              </div>
            ) : null}

            <article
              className={`${styles.content} mt-10 rounded-[10px] border border-black/10 bg-white p-5 md:p-7`}
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />

            {post.faqs.length > 0 ? (
              <section className="mt-10 border-t border-black/10 pt-8">
                <h2 className="[font-family:var(--font-ntype82-headline)] text-3xl leading-tight text-black">FAQs</h2>
                <div className="mt-6 divide-y divide-black/10 rounded-[10px] border border-black/10 bg-white">
                  {post.faqs.map((faq) => (
                    <details key={faq.question} className="px-5 py-5">
                      <summary className="[font-family:var(--font-ntype82-headline)] cursor-pointer list-none text-base text-black">{faq.question}</summary>
                      <p className="mt-3 [font-family:var(--font-ntype82)] text-sm leading-7 text-black/68">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-[10px] border border-black/10 bg-white p-5">
              <p className="[font-family:var(--font-lettera-regular)] text-[10px] uppercase tracking-[0.24em] text-black/42">Trust Links</p>
              <div className="mt-4 grid gap-2">
                {[
                  { label: 'Company Verification', href: '/company-verification' },
                  { label: 'Support Centre', href: '/support-centre' },
                  { label: 'Contact Us', href: '/contact-us' },
                  { label: 'Authenticity', href: '/authenticity' },
                  { label: 'Shop All', href: '/collections/shop-all' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-[8px] border border-black/10 px-4 py-3 [font-family:var(--font-ntype82)] text-sm text-black/68 transition-colors hover:bg-black hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </article>
      </main>

      <NothingFooter />
    </div>
  )
}
