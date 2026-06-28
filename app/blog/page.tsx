import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import { getPublishedBlogs } from '@/lib/data/blog-repository'
import { companyLegalName } from '@/lib/data/company'
import { siteBrandName, siteKeywords } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildRobotsMetadata, buildSeoKeywords } from '@/lib/utils/seo'

const title = 'Nothing Pakistan Blog | Buying Guides'
const description =
  'Read Nothing and CMF buying guides for Pakistan covering prices, accessories, authenticity checks, support, and buying decisions.'

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

export default async function BlogIndexPage() {
  const blogPosts = await getPublishedBlogs()
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
        dateModified: post.updatedAt,
        author: {
          '@type': 'Person',
          name: post.author,
          url: buildAbsoluteUrl('/authors/usman-afzal'),
        },
      })),
    },
  ]

  return (
    <div className="support-centre-official">
      <SeoStructuredData data={structuredData} />
      <NothingHeader />

      <main className="px-4 pb-16 pt-28 md:px-8 md:pb-24">
        <section className="mx-auto max-w-screen-2xl">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-end">
            <div className="max-w-5xl">
              <p className="text-[0.74rem] uppercase tracking-[0.12em] text-black/50">Knowledge Hub</p>
              <h1 className="mt-4 text-[2.8rem] leading-[0.92] tracking-normal text-black sm:text-[4rem] lg:text-[5.2rem]">
                Nothing and CMF buying guides for Pakistan.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-black/68">
                Read practical guides about product prices, PTA questions, accessories, authenticity checks, seller verification, delivery, and safe online shopping from Nothing Pakistan.
              </p>
            </div>

            <div className="rounded-[10px] border border-black/10 bg-white/80 p-5 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-black/46">
                SEO Snapshot
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-3xl leading-none text-black">{blogPosts.length}</p>
                  <p className="mt-1 text-xs leading-5 text-black/58">Published posts</p>
                </div>
                <div>
                  <p className="text-3xl leading-none text-black">20</p>
                  <p className="mt-1 text-xs leading-5 text-black/58">Indexed slugs expected</p>
                </div>
                <div>
                  <p className="text-3xl leading-none text-black">PK</p>
                  <p className="mt-1 text-xs leading-5 text-black/58">Pakistan search intent</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {blogPosts.map((post) => (
              <article key={post.slug} className="overflow-hidden rounded-[10px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.05)]">
                {post.heroImage ? (
                  <Link href={`/blog/${post.slug}`} className="block">
                    <Image
                      src={post.heroImage}
                      alt={post.title}
                      width={1366}
                      height={768}
                      className="h-[220px] w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                    />
                  </Link>
                ) : null}

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-black/45">
                      Updated {new Date(post.updatedAt).toISOString().slice(0, 10)}
                    </p>
                    <span className="h-1 w-1 rounded-full bg-black/25" />
                    <p className="text-[10px] uppercase tracking-[0.18em] text-black/45">
                      {post.publishedAt ? `${Math.max(1, Math.round((Date.now() - new Date(post.publishedAt).getTime()) / 86400000))}d old` : 'Published'}
                    </p>
                  </div>

                  <h2 className="mt-4 text-[1.7rem] leading-[0.96] text-black">
                    <Link href={`/blog/${post.slug}`} className="transition-opacity hover:opacity-75">
                      {post.title}
                    </Link>
                  </h2>

                  <p className="mt-4 text-[0.96rem] leading-7 text-black/66">
                    {post.excerpt}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <p className="text-xs text-black/50">
                      By {post.author}
                    </p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex h-10 items-center justify-center rounded-[6px] bg-black px-4 text-[10px] uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-85"
                    >
                      Read Article
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <NothingFooter />
    </div>
  )
}
