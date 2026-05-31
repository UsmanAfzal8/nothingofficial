import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CatalogProductTile } from '@/components/CatalogProductTile'
import { HomeFaqTabs } from '@/components/HomeFaqTabs'
import { HomeModelPicker } from '@/components/HomeModelPicker'
import { InterTypographyScope } from '@/components/InterTypographyScope'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import { TrendingPicksSection } from '@/components/TrendingPicksSection'
import { CATALOG_REVALIDATE_SECONDS, getHomePageData } from '@/lib/data/catalog-repository'
import {
  buildOrganizationStructuredData,
  buildWebsiteStructuredData,
  homeFaqCategories,
  homeFeatureHighlights,
  homeSeoFaqs,
  homeUserReviews,
  siteBrandName,
  siteKeywords,
} from '@/lib/data/site-content'
import type { HomeFeatureEntry, HomeReviewEntry } from '@/lib/data/site-content'
import { buildAbsoluteUrl, buildFaqStructuredData, buildSeoKeywords } from '@/lib/utils/seo'

export const revalidate = CATALOG_REVALIDATE_SECONDS
const homeMetaTitle = 'Nothing Pakistan | Phones, CMF, Chargers & Earbuds'
const homeMetaDescription =
  'Shop Nothing and CMF products in Pakistan with live pricing, WhatsApp support, and SECP registered company verification.'

export const metadata: Metadata = {
  title: {
    absolute: homeMetaTitle,
  },
  description: homeMetaDescription,
  keywords: buildSeoKeywords(siteKeywords, [
    `${siteBrandName} homepage`,
    'Nothing phone accessories Pakistan',
    'Nothing Pakistan accessories',
    'Nothing Pakistan chargers',
    'Nothing Pakistan phones',
    'Nothing audio Pakistan',
  ]),
  alternates: {
    canonical: buildAbsoluteUrl('/'),
  },
  openGraph: {
    title: homeMetaTitle,
    description: homeMetaDescription,
    url: buildAbsoluteUrl('/'),
    type: 'website',
    images: [
      {
        url: buildAbsoluteUrl('/opengraph-image'),
        width: 1200,
        height: 630,
        alt: homeMetaTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: homeMetaTitle,
    description: homeMetaDescription,
    images: [buildAbsoluteUrl('/twitter-image')],
  },
}

function FeatureIcon({ icon }: { icon: HomeFeatureEntry['icon'] }) {
  const commonProps = {
    width: 26,
    height: 26,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  if (icon === 'return') {
    return (
      <svg {...commonProps}>
        <path d="M9 14 4 9l5-5" />
        <path d="M4 9h10a6 6 0 1 1 0 12h-3" />
      </svg>
    )
  }

  if (icon === 'delivery') {
    return (
      <svg {...commonProps}>
        <path d="M3 7h11v9H3z" />
        <path d="M14 10h4l3 3v3h-7" />
        <path d="M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </svg>
    )
  }

  if (icon === 'cod') {
    return (
      <svg {...commonProps}>
        <path d="M4 7h16v10H4z" />
        <path d="M8 12h.01" />
        <path d="M16 12h.01" />
        <path d="M12 15a3 3 0 0 0 0-6 3 3 0 0 0 0 6Z" />
      </svg>
    )
  }

  if (icon === 'support') {
    return (
      <svg {...commonProps}>
        <path d="M4 12a8 8 0 0 1 16 0" />
        <path d="M4 12v4a2 2 0 0 0 2 2h1v-7H6a2 2 0 0 0-2 2Z" />
        <path d="M20 12v4a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2Z" />
        <path d="M15 20h-3" />
      </svg>
    )
  }

  return (
    <svg {...commonProps}>
      <path d="m12 3 7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </svg>
  )
}

function VerifiedMark() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#1d9bf0] text-white" aria-label="Verified buyer">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="m3 6.2 2 2L9.2 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function PeopleIcon() {
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-[#f5f5f1] text-black/62" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 12a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M20 19c0-1.7-1-3.1-2.5-3.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M17.2 6.2a2.8 2.8 0 0 1 0 5.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  )
}

function ReviewCard({ review }: { review: HomeReviewEntry }) {
  return (
    <article className="min-w-[calc((100%_-_1rem)/2)] snap-start border border-black/10 bg-white p-5 shadow-[0_18px_45px_rgba(17,17,17,0.04)] lg:min-w-[calc((100%_-_4rem)/5)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <PeopleIcon />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="collection-product-name text-lg leading-tight text-black">{review.buyerName}</h3>
              <VerifiedMark />
            </div>
            <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-black/42">{review.city}</p>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] text-black/42">5.0</span>
      </div>
      <p className="mt-5 min-h-[112px] font-sans text-sm leading-7 text-black/72">{review.comment}</p>
      <p className="mt-5 border-t border-black/10 pt-4 text-[11px] uppercase tracking-[0.2em] text-black/46">{review.product}</p>
    </article>
  )
}

export default async function Home() {
  const { phoneModels, shopAllProducts, trendingPicks } = await getHomePageData()
  const faqEntries = homeFaqCategories.flatMap((category) => category.items)
  const homeStructuredData: Record<string, unknown>[] = [buildOrganizationStructuredData(), buildWebsiteStructuredData()]
  const homeFaqStructuredData = buildFaqStructuredData([...homeSeoFaqs, ...faqEntries])

  if (homeFaqStructuredData) {
    homeStructuredData.push(homeFaqStructuredData)
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-[#111]">
      <SeoStructuredData data={homeStructuredData} />
      <NothingHeader />

      <main>
        <section className="relative flex h-screen min-h-[640px] max-h-[100svh] items-end overflow-hidden border-b border-black/10">
          <Image
            src="https://nothingshop.b-cdn.net/banner/nothing_pakistan.avif"
            alt="Nothing Phone 3 hero background"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-center"
          />

          <div className="relative z-10 flex h-full w-full px-4 pb-7 pt-24 sm:px-6 sm:pb-9 sm:pt-28 md:px-8 lg:pb-6 lg:pt-32">
            <div className="mx-auto flex h-full max-w-screen-2xl items-end">
              <div className="max-w-3xl text-black lg:max-w-2xl">
                <h1 className="dot-heading text-[1.18rem] leading-[0.98] tracking-[0.1em] text-black sm:text-[1.7rem] lg:text-[1.9rem]">
                  Nothing & CMF Products in Pakistan
                </h1>
                <p className="mt-3 max-w-xl font-sans text-[0.82rem] leading-6 text-black sm:mt-3 sm:max-w-xl sm:text-[0.95rem] sm:leading-6 lg:max-w-xl lg:text-[0.88rem] lg:leading-5">
                  Shop Nothing and CMF phones, earbuds, chargers, cables, and accessories with live pricing, product details, and WhatsApp support through Nothing Pakistan.
                </p>
              </div>
            </div>
          </div>
        </section>

        <TrendingPicksSection products={trendingPicks} />

        <HomeModelPicker models={phoneModels} />

        <section className="border-b border-black/10 px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto max-w-screen-2xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-black/42">Shop All</p>
                <h2 className="collection-product-name mt-3 text-4xl leading-none text-black sm:text-5xl">Products</h2>
              </div>
              <Link href="/collections/shop-all" className="text-[10px] uppercase tracking-[0.24em] text-black/52 hover:text-black">
                View All
              </Link>
            </div>

            {shopAllProducts.length > 0 ? (
              <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 md:gap-x-6 md:gap-y-12 lg:grid-cols-5 lg:gap-x-7 lg:gap-y-14">
                {shopAllProducts.map((product) => (
                  <CatalogProductTile key={product.id} product={product} tone="shop-all" />
                ))}
              </div>
            ) : (
              <div className="mt-8 border border-black/10 bg-[#f8f8f4] px-6 py-14 text-center">
                <p className="text-sm text-black/64">Products will appear here when the live catalog has Shop All items.</p>
              </div>
            )}
          </div>
        </section>

        <section className="border-b border-black/10 px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto max-w-screen-2xl">
            <div className="max-w-3xl">
              <p className="text-[10px] uppercase tracking-[0.3em] text-black/42">User Reviews</p>
              <h2 className="collection-product-name mt-3 text-4xl leading-none text-black sm:text-5xl">What buyers say</h2>
              <p className="mt-4 font-sans text-[15px] leading-7 text-black/70">
                Feedback from verified buyers across Pakistan who shop Nothing and CMF products online.
              </p>
            </div>

            <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
              {homeUserReviews.map((review) => (
                <ReviewCard key={`${review.buyerName}-${review.product}`} review={review} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-black/10 px-4 py-12 md:px-8 md:py-16">
          <InterTypographyScope>
            <div className="mx-auto max-w-screen-2xl">
              <div className="max-w-3xl">
                <p className="text-[10px] uppercase tracking-[0.3em] text-black/42">Store Benefits</p>
                <h2 className="mt-3 text-3xl leading-tight text-black sm:text-4xl">Why people order from Nothing Pakistan</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-black/64 sm:text-[15px]">
                  Clear pricing, fast replies, and simple help for choosing the right Nothing and CMF accessories in Pakistan.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
                {homeFeatureHighlights.map((feature) => (
                  <article key={feature.title} className="rounded-[8px] border border-black/8 bg-white p-4 sm:p-5">
                    <div className="flex h-10 w-10 items-center justify-center text-black/82">
                      <FeatureIcon icon={feature.icon} />
                    </div>
                    <h3 className="mt-4 text-[15px] leading-6 text-black sm:text-base">{feature.title}</h3>
                    <p className="mt-2 text-[12px] leading-6 text-black/62 sm:text-[13px]">{feature.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </InterTypographyScope>
        </section>

        <section className="px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto max-w-screen-2xl">
            <div className="max-w-4xl">
              <p className="text-[10px] uppercase tracking-[0.3em] text-black/42">Nothing Pakistan FAQs</p>
              <h2 className="collection-product-name mt-3 text-4xl leading-none text-black sm:text-5xl">
                Frequently asked questions
              </h2>
              <p className="mt-4 font-sans text-[15px] leading-7 text-black/70">
                Quick answers about shopping Nothing accessories, CMF earbuds, chargers, protectors, orders, delivery,
                returns, and support in Pakistan.
              </p>
            </div>

            <HomeFaqTabs categories={homeFaqCategories} />
          </div>
        </section>
      </main>

      <NothingFooter />
    </div>
  )
}
