import type { Metadata } from 'next'
import Link from 'next/link'
import { InterTypographyScope } from '@/components/InterTypographyScope'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import { blogPosts } from '@/lib/data/blog'
import { companyLegalName } from '@/lib/data/company'
import { siteBrandName, siteKeywords } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildRobotsMetadata, buildSeoKeywords } from '@/lib/utils/seo'

const title = 'Nothing Pakistan Blog | Buying Guides'
const description =
  'Read Nothing and CMF buying guides for Pakistan covering prices, accessories, authenticity checks, support, and company verification.'

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  keywords: buildSeoKeywords(siteKeywords, ['Nothing Pakistan blog', 'Nothing buying guides Pakistan', companyLegalName]),
  alternates: {
    canonical: buildAbsoluteUrl('/blog'),
  },
  openGraph: {
    title,
    description,
    url: buildAbsoluteUrl('/blog'),
    type: 'website',
    images: [buildAbsoluteUrl('/social/nothing-pakistan-og.jpg')],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [buildAbsoluteUrl('/social/nothing-pakistan-og.jpg')],
  },
  robots: buildRobotsMetadata(),
}

export default function BlogIndexPage() {
  const structuredData = [
    buildBreadcrumbStructuredData([
      { label: 'Home', href: '/' },
      { label: 'Blog', href: '/blog' },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': buildAbsoluteUrl('/blog#blog'),
      name: title,
      url: buildAbsoluteUrl('/blog'),
      description,
      publisher: {
        '@id': buildAbsoluteUrl('/#organization'),
        name: siteBrandName,
      },
      blogPost: blogPosts.map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        url: buildAbsoluteUrl(`/blog/${post.slug}`),
        dateModified: post.updatedDate,
        author: {
          '@type': 'Person',
          name: post.author,
          url: buildAbsoluteUrl(post.authorHref),
        },
      })),
    },
  ]

  return (
    <InterTypographyScope>
      <div className="min-h-screen overflow-x-hidden bg-[#f4f4f0] text-[#111]">
        <SeoStructuredData data={structuredData} />
        <NothingHeader />

        <main className="px-4 pb-16 pt-28 md:px-8 md:pb-24">
          <section className="mx-auto max-w-screen-2xl">
            <div className="max-w-4xl">
              <p className="text-[10px] uppercase tracking-[0.34em] text-black/45">Knowledge Hub</p>
              <h1 className="mt-4 text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-black sm:text-6xl">
                Nothing and CMF buying guides for Pakistan.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-black/68">
                Read practical guides about product prices, compatibility, accessories, authenticity checks, seller verification, support, delivery, and safe online shopping from Nothing Pakistan.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {blogPosts.map((post) => (
                <article key={post.slug} className="rounded-[8px] border border-black/10 bg-white p-5">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-black/42">Updated {post.updatedDate}</p>
                  <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.03em] text-black">{post.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-black/66">{post.excerpt}</p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-5 inline-flex h-10 items-center justify-center rounded-[8px] bg-black px-4 text-[10px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85"
                  >
                    Read Guide
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </main>

        <NothingFooter />
      </div>
    </InterTypographyScope>
  )
}
