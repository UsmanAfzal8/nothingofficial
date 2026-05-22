import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { InterTypographyScope } from '@/components/InterTypographyScope'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import { blogPosts, getBlogPostBySlug } from '@/lib/data/blog'
import { companyLegalName } from '@/lib/data/company'
import { siteBrandName, siteKeywords } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildFaqStructuredData, buildRobotsMetadata, buildSeoKeywords } from '@/lib/utils/seo'

type BlogPostPageProps = {
  params: {
    slug: string
  }
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getBlogPostBySlug(params.slug)

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
    keywords: buildSeoKeywords(siteKeywords, [post.title, companyLegalName], post.productLinks.map((item) => item.label)),
    alternates: {
      canonical: buildAbsoluteUrl(`/blog/${post.slug}`),
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: buildAbsoluteUrl(`/blog/${post.slug}`),
      type: 'article',
      images: [buildAbsoluteUrl(post.heroImage)],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription,
      images: [buildAbsoluteUrl(post.heroImage)],
    },
    robots: buildRobotsMetadata(),
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const faqSchema = buildFaqStructuredData(post.faqs)
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
      image: buildAbsoluteUrl(post.heroImage),
      datePublished: post.updatedDate,
      dateModified: post.updatedDate,
      author: {
        '@type': 'Person',
        name: post.author,
        url: buildAbsoluteUrl(post.authorHref),
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
    <InterTypographyScope>
      <div className="min-h-screen overflow-x-hidden bg-[#f4f4f0] text-[#111]">
        <SeoStructuredData data={structuredData} />
        <NothingHeader />

        <main className="px-4 pb-16 pt-28 md:px-8 md:pb-24">
          <article className="mx-auto grid max-w-screen-2xl gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <nav aria-label="Breadcrumb" className="mb-7 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-black/45">
                <Link href="/" className="hover:text-black">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-black">Blog</Link>
                <span>/</span>
                <span>{post.title}</span>
              </nav>

              <header className="max-w-4xl">
                <p className="text-[10px] uppercase tracking-[0.34em] text-black/45">Updated {post.updatedDate}</p>
                <h1 className="mt-4 text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-black sm:text-6xl">
                  {post.title}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-black/68">{post.excerpt}</p>
                <p className="mt-5 text-sm leading-7 text-black/58">
                  Written by <Link href={post.authorHref} className="font-medium text-black underline-offset-4 hover:underline">{post.author}</Link> for {siteBrandName}.
                </p>
              </header>

              <section className="mt-10 rounded-[8px] border border-black/10 bg-white p-5">
                <p className="text-[10px] uppercase tracking-[0.26em] text-black/42">Direct Answer</p>
                <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-black">{post.faqs[0]?.question ?? post.title}</h2>
                <p className="mt-3 text-sm leading-7 text-black/68">{post.faqs[0]?.answer ?? post.excerpt}</p>
              </section>

              <div className="mt-10 space-y-10">
                {post.sections.map((section) => (
                  <section key={section.title} className="border-t border-black/10 pt-8">
                    <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">{section.title}</h2>
                    <div className="mt-5 space-y-5 text-sm leading-8 text-black/70">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <section className="mt-10 border-t border-black/10 pt-8">
                <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">Helpful internal links</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[8px] border border-black/10 bg-white p-5">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Products</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.productLinks.map((item) => (
                        <Link key={item.href} href={item.href} className="rounded-[8px] border border-black/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-black/62 transition-colors hover:bg-black hover:text-white">
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[8px] border border-black/10 bg-white p-5">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Collections</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.collectionLinks.map((item) => (
                        <Link key={item.href} href={item.href} className="rounded-[8px] border border-black/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-black/62 transition-colors hover:bg-black hover:text-white">
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-10 border-t border-black/10 pt-8">
                <h2 className="text-3xl font-semibold tracking-[-0.03em] text-black">FAQs</h2>
                <div className="mt-6 divide-y divide-black/10 rounded-[8px] border border-black/10 bg-white">
                  {post.faqs.map((faq) => (
                    <details key={faq.question} className="px-5 py-5">
                      <summary className="cursor-pointer list-none text-base font-medium text-black">{faq.question}</summary>
                      <p className="mt-3 text-sm leading-7 text-black/68">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <section className="rounded-[8px] border border-black/10 bg-white p-5">
                <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Trust Links</p>
                <div className="mt-4 grid gap-2">
                  {[
                    { label: 'Company Verification', href: '/company-verification' },
                    { label: 'Support Centre', href: '/support-centre' },
                    { label: 'Contact Us', href: '/contact-us' },
                    { label: 'Authenticity', href: '/authenticity' },
                    { label: 'Shop All', href: '/collections/shop-all' },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} className="rounded-[8px] border border-black/10 px-4 py-3 text-sm text-black/68 transition-colors hover:bg-black hover:text-white">
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
    </InterTypographyScope>
  )
}
