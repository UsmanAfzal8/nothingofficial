import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import { getPublishedBlogs } from '@/lib/data/blog-repository'
import { siteBrandName } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildRobotsMetadata } from '@/lib/utils/seo'

const title = 'Nothing Pakistan Blog | Phone & CMF Guides'
const description =
  'Read Nothing Pakistan guides about Nothing and CMF phones, prices, PTA questions, earbuds, accessories, software, comparisons, and local support.'
const socialImageUrl = buildAbsoluteUrl('/social/nothing-pakistan-og.jpg')

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  authors: [{ name: siteBrandName, url: buildAbsoluteUrl('/about-us') }],
  creator: siteBrandName,
  publisher: siteBrandName,
  alternates: {
    canonical: buildAbsoluteUrl('/blog'),
  },
  openGraph: {
    title,
    description,
    url: buildAbsoluteUrl('/blog'),
    type: 'website',
    siteName: siteBrandName,
    locale: 'en_PK',
    images: [{ url: socialImageUrl, width: 1200, height: 630, alt: 'Nothing Pakistan blog and buying guides' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [{ url: socialImageUrl, alt: 'Nothing Pakistan blog and buying guides' }],
  },
  robots: buildRobotsMetadata(),
}

export default async function BlogIndexPage() {
  const blogPosts = await getPublishedBlogs()
  const [featuredPost, ...remainingPosts] = blogPosts
  const structuredData = [
    buildBreadcrumbStructuredData([
      { label: 'Home', href: '/' },
      { label: 'Blog', href: '/blog' },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': buildAbsoluteUrl('/blog#webpage'),
      name: title,
      description,
      url: buildAbsoluteUrl('/blog'),
      inLanguage: 'en-PK',
      isPartOf: {
        '@id': buildAbsoluteUrl('/#website'),
      },
      mainEntity: {
        '@id': buildAbsoluteUrl('/blog#blog'),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': buildAbsoluteUrl('/blog#blog'),
      name: 'Nothing Pakistan Blog',
      url: buildAbsoluteUrl('/blog'),
      description,
      inLanguage: 'en-PK',
      publisher: {
        '@id': buildAbsoluteUrl('/#organization'),
        name: siteBrandName,
      },
      blogPost: blogPosts.map((post) => ({
        '@type': 'BlogPosting',
        '@id': buildAbsoluteUrl(`/blog/${post.slug}#article`),
        headline: post.title,
        url: buildAbsoluteUrl(`/blog/${post.slug}`),
        description: post.metaDescription,
        image: post.heroImage
          ? {
              '@type': 'ImageObject',
              url: buildAbsoluteUrl(post.heroImage),
              contentUrl: buildAbsoluteUrl(post.heroImage),
              width: 800,
              height: 600,
              caption: post.heroImageCaption || post.title,
            }
          : undefined,
        datePublished: post.publishedAt || post.updatedAt,
        dateModified: post.updatedAt,
        author: {
          '@id': buildAbsoluteUrl('/#organization'),
          '@type': 'Organization',
          name: siteBrandName,
          url: buildAbsoluteUrl('/about-us'),
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
          <header className="max-w-5xl border-b border-black/15 pb-10 md:pb-14">
            <h1 className="text-[2.8rem] leading-[0.92] tracking-normal text-black sm:text-[4rem] lg:text-[5.2rem]">
              Nothing Pakistan blog
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-black/68">
              Clear guides, comparisons, updates, and practical answers about Nothing and CMF products for people in Pakistan.
            </p>
          </header>

          {featuredPost ? (
            <article className="grid gap-6 border-b border-black/15 py-10 md:py-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] lg:items-center lg:gap-12">
              {featuredPost.heroImage ? (
                <Link href={`/blog/${featuredPost.slug}`} className="block overflow-hidden rounded-[8px]">
                  <Image
                    src={featuredPost.heroImage}
                    alt={featuredPost.heroImageAlt || featuredPost.title}
                    width={800}
                    height={600}
                    priority
                    sizes="(max-width: 1023px) 100vw, 65vw"
                    className="block aspect-[4/3] h-auto w-full object-cover object-center transition-transform duration-300 hover:scale-[1.015]"
                  />
                </Link>
              ) : null}
              <div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-black/45">
                  {featuredPost.category ? <span>{featuredPost.category}</span> : null}
                  {featuredPost.category ? <span aria-hidden="true">/</span> : null}
                  <time dateTime={featuredPost.updatedAt}>Updated {new Date(featuredPost.updatedAt).toISOString().slice(0, 10)}</time>
                </div>
                <h2 className="mt-4 text-[2.15rem] leading-[0.96] text-black sm:text-[3rem] lg:text-[3.5rem]">
                  <Link href={`/blog/${featuredPost.slug}`} className="transition-opacity hover:opacity-70">
                    {featuredPost.title}
                  </Link>
                </h2>
                <p className="mt-5 text-base leading-8 text-black/66">{featuredPost.excerpt}</p>
                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-black/50">
                  <span>By {featuredPost.author}</span>
                  {featuredPost.readingTime ? <span>{featuredPost.readingTime} min read</span> : null}
                  <Link href={`/blog/${featuredPost.slug}`} className="text-black underline underline-offset-4 transition-opacity hover:opacity-65">
                    Read featured article
                  </Link>
                </div>
              </div>
            </article>
          ) : null}

          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {remainingPosts.map((post) => (
              <article key={post.slug} className="flex min-w-0 flex-col">
                {post.heroImage ? (
                  <Link href={`/blog/${post.slug}`} className="block overflow-hidden rounded-[8px]">
                    <Image
                      src={post.heroImage}
                      alt={post.heroImageAlt || post.title}
                      width={800}
                      height={600}
                      sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                      className="block aspect-[4/3] h-auto w-full object-cover object-center transition-transform duration-300 hover:scale-[1.015]"
                    />
                  </Link>
                ) : null}

                <div className="flex flex-1 flex-col pt-4">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-black/45">
                    {post.category ? <span>{post.category}</span> : null}
                    {post.category ? <span aria-hidden="true">/</span> : null}
                    <time dateTime={post.updatedAt}>
                      Updated {new Date(post.updatedAt).toISOString().slice(0, 10)}
                    </time>
                  </div>

                  <h2 className="mt-3 text-[1.65rem] leading-[1.02] text-black">
                    <Link href={`/blog/${post.slug}`} className="transition-opacity hover:opacity-75">
                      {post.title}
                    </Link>
                  </h2>

                  <p className="mt-4 overflow-hidden text-[0.95rem] leading-7 text-black/64 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-4 pt-5">
                    <span className="text-xs text-black/50">{post.readingTime ? `${post.readingTime} min read` : `By ${post.author}`}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-[10px] uppercase tracking-[0.16em] text-black underline underline-offset-4 transition-opacity hover:opacity-65"
                    >
                      Read more
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
