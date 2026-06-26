import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import localFont from 'next/font/local'
import { notFound, redirect } from 'next/navigation'
import { Suspense, type ReactNode } from 'react'
import { MobileAccessorySections, MobileAccessorySectionsSkeleton } from '@/components/catalog/MobileAccessorySections'
import { ProductRecommendations, ProductRecommendationsSkeleton } from '@/components/catalog/ProductRecommendations'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { ProductFaqAccordionSection } from '@/components/ProductFaqAccordionSection'
import { ProductDetailHero } from '@/components/ProductDetailHero'
import { ProductReviewsSection } from '@/components/ProductReviewsSection'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import {
  CATALOG_REVALIDATE_SECONDS,
  getProductDetailByHandle,
  getProductStaticHandles,
} from '@/lib/data/catalog-repository'
import { companyIdentifier, companyLegalName } from '@/lib/data/company'
import { siteBrandName, siteContactPhone, siteContactWhatsappUrl, siteKeywords } from '@/lib/data/site-content'
import { getImmediateProductIntro, resolveMigratedHtmlCopy } from '@/lib/data/migrated-html'
import type {
  ProductDetail,
  ProductDetailFaq,
  ProductDetailMedia,
  ProductDetailSpecGroup,
  ProductFeatureSection,
} from '@/lib/models/product-detail'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildFaqStructuredData, buildRobotsMetadata, buildSeoKeywords, toSeoHandle } from '@/lib/utils/seo'

const detailFont = localFont({
  src: [
    { path: '../../../fonts/Inter-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../../fonts/Inter-Medium.otf', weight: '500', style: 'normal' },
  ],
  display: 'swap',
})

type ProductDetailPageProps = {
  params: {
    handle: string
  }
  searchParams?: {
    color?: string | string[]
    media?: string | string[]
  }
}

function normalizeSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0]?.trim() || null
  return value?.trim() || null
}

function buildCanonicalProductPath(handle: string, searchParams: ProductDetailPageProps['searchParams']) {
  const params = new URLSearchParams()
  const color = normalizeSearchParam(searchParams?.color)
  const media = normalizeSearchParam(searchParams?.media)

  if (color) params.set('color', color)
  if (media) params.set('media', media)

  const query = params.toString()
  return `/products/${handle}${query ? `?${query}` : ''}`
}

function getPakistanCalendarDate(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  return {
    year: Number(parts.find((part) => part.type === 'year')?.value ?? date.getUTCFullYear()),
    month: Number(parts.find((part) => part.type === 'month')?.value ?? date.getUTCMonth() + 1),
    day: Number(parts.find((part) => part.type === 'day')?.value ?? date.getUTCDate()),
  }
}

function createUtcDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day))
}

function addUtcDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setUTCDate(nextDate.getUTCDate() + days)
  return nextDate
}

function formatShortMonthDay(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function getProductDeliveryTimeline() {
  const pakistanToday = getPakistanCalendarDate(new Date())
  const orderDate = createUtcDate(pakistanToday.year, pakistanToday.month, pakistanToday.day)
  const processDate = addUtcDays(orderDate, 1)
  const deliveryStartDate = addUtcDays(processDate, 2)
  const deliveryEndDate = addUtcDays(processDate, 3)

  return {
    processDateLabel: formatShortMonthDay(processDate),
    deliveryRangeLabel: `${formatShortMonthDay(deliveryStartDate)} - ${formatShortMonthDay(deliveryEndDate)}`,
  }
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>()
  const output: string[] = []

  for (const value of values) {
    if (!value || seen.has(value)) continue
    seen.add(value)
    output.push(value)
  }

  return output
}

function isHtmlSnippet(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

function buildDisplayGallery(productDetail: ProductDetail): ProductDetailMedia[] {
  if (productDetail.gallery.length > 0) {
    return productDetail.gallery
  }

  return uniqueStrings([productDetail.primaryImage, productDetail.ogImage, ...productDetail.heroImages]).slice(0, 5).map((url, index) => ({
    id: `fallback-media-${index + 1}`,
    url,
    alt: productDetail.name,
    title: productDetail.name,
    caption: productDetail.collections[0]?.title ?? productDetail.brandName,
  }))
}

function buildProductBreadcrumbs(productDetail: ProductDetail) {
  return [...productDetail.breadcrumbItems, { label: productDetail.name, href: `/products/${toSeoHandle(productDetail.handle)}` }]
}

function buildProductSeoName(productDetail: ProductDetail) {
  const name = productDetail.name.trim()

  if (/^(nothing|cmf)\b/i.test(name)) {
    return name
  }

  if (/^nothing\b/i.test(productDetail.brandName)) {
    return `Nothing ${name}`
  }

  if (/^cmf\b/i.test(productDetail.brandName)) {
    return `CMF by Nothing ${name}`
  }

  return name
}

function buildProductSeoTitle(productDetail: ProductDetail) {
  const seoName = buildProductSeoName(productDetail)

  if (
    productDetail.pageTitle &&
    productDetail.pageTitle !== productDetail.name &&
    productDetail.pageTitle.toLowerCase().includes(seoName.toLowerCase())
  ) {
    return productDetail.pageTitle
  }

  if (productDetail.entityType === 'mobile') {
    return `${seoName} Price in Pakistan | PTA, Non-PTA & Accessories`
  }

  return `${seoName} Price in Pakistan | Original ${productDetail.brandName}`
}

function buildProductSeoDescription(productDetail: ProductDetail) {
  const seoName = buildProductSeoName(productDetail)
  const pricePhrase = productDetail.priceLabel ? ` at ${productDetail.priceLabel}` : ''

  if (productDetail.entityType === 'mobile') {
    return `${seoName} price in Pakistan${pricePhrase}. Review PTA status, non-PTA price, specs, stock, delivery, warranty support, and compatible Nothing accessories from ${siteBrandName}.`
  }

  if (productDetail.metaDescription && productDetail.metaDescription.toLowerCase().includes(seoName.toLowerCase())) {
    return productDetail.metaDescription
  }

  if (productDetail.priceLabel) {
    return `Buy ${seoName} in Pakistan at ${productDetail.priceLabel}. Check original product details, availability, delivery, warranty support, and WhatsApp ordering from ${siteBrandName}.`
  }

  return (
    productDetail.summary ||
    productDetail.description ||
    `Shop ${seoName} in Pakistan with pricing, product details, availability, delivery, warranty support, and ordering help from ${siteBrandName}.`
  )
}

function getPriceValidUntil() {
  const currentYear = new Date().getUTCFullYear()
  return `${currentYear + 1}-12-31`
}

function buildOfferStructuredData(productDetail: ProductDetail) {
  if (typeof productDetail.price !== 'number') {
    return undefined
  }

  return {
    '@type': 'Offer',
    '@id': `${productDetail.canonicalUrl}#offer`,
    priceCurrency: 'PKR',
    price: productDetail.price,
    priceValidUntil: getPriceValidUntil(),
    availability: productDetail.availability,
    url: productDetail.canonicalUrl,
    itemCondition: 'https://schema.org/NewCondition',
    seller: {
      '@type': 'Organization',
      '@id': buildAbsoluteUrl('/#organization'),
      name: siteBrandName,
      legalName: companyLegalName,
      identifier: companyIdentifier,
      url: buildAbsoluteUrl('/'),
      telephone: siteContactPhone,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: siteContactPhone,
        url: siteContactWhatsappUrl,
        areaServed: 'PK',
        availableLanguage: ['en', 'en-PK'],
      },
    },
    areaServed: {
      '@type': 'Country',
      name: 'Pakistan',
    },
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: 0,
        currency: 'PKR',
      },
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: 'PK',
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: 1,
          maxValue: 1,
          unitCode: 'DAY',
        },
        transitTime: {
          '@type': 'QuantitativeValue',
          minValue: 2,
          maxValue: 3,
          unitCode: 'DAY',
        },
      },
    },
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'PK',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 7,
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/ReturnShippingFees',
    },
  }
}

function attachReviewStructuredData(productSchema: Record<string, unknown>, productDetail: ProductDetail) {
  const genuineReviews = (productDetail.reviews ?? []).filter((review) => !review.userName.endsWith('(Sample review)'))
  const genuineRatings = genuineReviews
    .map((review) => review.rating)
    .filter((rating): rating is number => typeof rating === 'number')

  if (genuineRatings.length > 0) {
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number((genuineRatings.reduce((total, rating) => total + rating, 0) / genuineRatings.length).toFixed(1)),
      reviewCount: genuineRatings.length,
    }
  }

  if (genuineReviews.length > 0) {
    productSchema.review = genuineReviews.slice(0, 5).map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.userName,
      },
      reviewBody: review.comment || undefined,
      reviewRating:
        typeof review.rating === 'number'
          ? {
              '@type': 'Rating',
              ratingValue: review.rating,
              bestRating: 5,
              worstRating: 1,
            }
          : undefined,
    }))
  }
}

function buildProductStructuredData(productDetail: ProductDetail) {
  const images = uniqueStrings(productDetail.gallery.map((item) => item.url))
  const faqStructuredData = buildFaqStructuredData(
    (productDetail.faqs ?? []).map((faq: ProductDetailFaq) => ({
      question: faq.question,
      answer: faq.answer,
    })),
  )

  if (productDetail.entityType === 'mobile') {
    const mobileProductSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${productDetail.canonicalUrl}#product`,
      name: buildProductSeoName(productDetail),
      description: buildProductSeoDescription(productDetail),
      image: images.length > 0 ? images : undefined,
      sku: productDetail.handle,
      mpn: productDetail.handle,
      url: productDetail.canonicalUrl,
      brand: {
        '@type': 'Brand',
        name: productDetail.brandName,
      },
      category: 'Smartphone',
      itemCondition: 'https://schema.org/NewCondition',
      offers: buildOfferStructuredData(productDetail),
      additionalProperty:
        productDetail.specs?.slice(0, 8).map((spec) => ({
          '@type': 'PropertyValue',
          name: spec.label,
          value: spec.value,
        })) ?? undefined,
    }

    attachReviewStructuredData(mobileProductSchema, productDetail)

    const mobileEntries: Array<Record<string, unknown> | null> = [
      mobileProductSchema,
      buildBreadcrumbStructuredData(buildProductBreadcrumbs(productDetail)),
      faqStructuredData,
    ]

    return mobileEntries.filter((entry): entry is Record<string, unknown> => Boolean(entry))
  }

  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productDetail.canonicalUrl}#product`,
    name: buildProductSeoName(productDetail),
    description: buildProductSeoDescription(productDetail),
    image: images.length > 0 ? images : undefined,
    sku: productDetail.handle,
    mpn: productDetail.handle,
    url: productDetail.canonicalUrl,
    category: productDetail.collections.map((collection) => collection.title).join(', ') || undefined,
    brand: {
      '@type': 'Brand',
      name: productDetail.brandName,
    },
    itemCondition: 'https://schema.org/NewCondition',
    offers: buildOfferStructuredData(productDetail),
  }

  attachReviewStructuredData(productSchema, productDetail)

  if (productDetail.specs && productDetail.specs.length > 0) {
    productSchema.additionalProperty = productDetail.specs.slice(0, 10).map((spec) => ({
      '@type': 'PropertyValue',
      name: spec.label,
      value: spec.value,
    }))
  }

  const productEntries: Array<Record<string, unknown> | null> = [
    productSchema,
    buildBreadcrumbStructuredData(buildProductBreadcrumbs(productDetail)),
    faqStructuredData,
  ]

  return productEntries.filter((entry): entry is Record<string, unknown> => Boolean(entry))
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-7">
      <h2 className="text-[1.35rem] font-medium tracking-[-0.02em] text-slate-900 sm:text-[1.55rem]">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function DetailAccordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  return (
    <details
      open={defaultOpen}
      className="rounded-[20px] border border-slate-200 bg-white/70 px-4 py-4 shadow-[0_8px_22px_rgba(15,23,42,0.03)] backdrop-blur-sm [&[open]_.accordion-minus]:flex [&[open]_.accordion-plus]:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-slate-900">
        <span>{title}</span>
        <span className="accordion-plus flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-base text-slate-500">
          +
        </span>
        <span className="accordion-minus hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-base text-slate-500">
          -
        </span>
      </summary>
      <div className="pt-3 text-sm leading-6 text-slate-600">{children}</div>
    </details>
  )
}

function SpecsMarkIcon() {
  const dots = [
    [2, 8],
    [6, 8],
    [10, 8],
    [14, 8],
    [18, 8],
    [22, 8],
    [26, 8],
    [6, 12],
    [10, 12],
    [14, 12],
    [18, 12],
    [22, 12],
    [10, 16],
    [14, 16],
    [18, 16],
    [14, 20],
  ]

  return (
    <svg width="34" height="28" viewBox="0 0 34 28" fill="none" aria-hidden="true">
      {dots.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.85" fill="currentColor" />
      ))}
      <circle cx="6" cy="4" r="1.85" fill="currentColor" />
      <circle cx="6" cy="20" r="1.85" fill="currentColor" />
    </svg>
  )
}

function ProductSpecGroupsSection({ groups }: { groups: ProductDetailSpecGroup[] }) {
  if (groups.length === 0) {
    return null
  }

  return (
    <section className="overflow-hidden rounded-[28px] bg-[#f1f1ee] px-4 py-10 text-black sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-[112px] w-[112px] flex-col items-center justify-center rounded-[18px] bg-white text-black shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
            <SpecsMarkIcon />
            <span className="mt-3 text-[13px] leading-none text-black/82">Specs</span>
          </div>
        </div>

        <div className="mt-8 grid gap-3 lg:grid-cols-2">
          {groups.map((group) => (
            <DetailAccordion key={group.id} title={group.title} defaultOpen={group.defaultOpen}>
              <div className="space-y-4">
                {group.subtitle ? <p>{group.subtitle}</p> : null}
                {group.mediaUrl ? (
                  <div className="relative overflow-hidden rounded-[8px] border border-slate-100 bg-slate-50">
                    <Image
                      src={group.mediaUrl}
                      alt={group.mediaAlt || group.title}
                      width={900}
                      height={650}
                      loading="lazy"
                      fetchPriority="low"
                      sizes="(max-width: 768px) 100vw, 900px"
                      className="h-auto w-full object-contain"
                    />
                  </div>
                ) : null}
                {group.specs.length > 0 ? (
                  <dl className="divide-y divide-slate-200 rounded-[14px] border border-slate-200 bg-white">
                    {group.specs.map((spec) => (
                      <div key={spec.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-5">
                        <dt className="font-medium text-slate-900">{spec.label}</dt>
                        <dd>{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
            </DetailAccordion>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureMedia({
  imageUrl,
  videoUrl,
  thumbnailUrl,
  title,
  className = '',
}: {
  imageUrl?: string | null
  videoUrl?: string | null
  thumbnailUrl?: string | null
  title: string
  className?: string
}) {
  if (videoUrl) {
    return (
      <video
        className={`h-full w-full object-cover ${className}`}
        src={videoUrl}
        poster={thumbnailUrl || imageUrl || undefined}
        aria-label={title}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
    )
  }

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={title}
        fill
        loading="lazy"
        fetchPriority="low"
        sizes="(max-width: 768px) 92vw, 980px"
        className={`object-cover ${className}`}
      />
    )
  }

  if (thumbnailUrl) {
    return (
      <Image
        src={thumbnailUrl}
        alt={title}
        fill
        loading="lazy"
        fetchPriority="low"
        sizes="(max-width: 768px) 92vw, 980px"
        className={`object-cover ${className}`}
      />
    )
  }

  return <div className="flex h-full w-full items-center justify-center bg-white text-sm text-black/40">{title}</div>
}

function ProductFeatureSectionsSection({ sections }: { sections: ProductFeatureSection[] }) {
  if (sections.length === 0) {
    return null
  }

  return (
    <div className="space-y-8">
      {sections.map((section) => {
        const coverSlide = section.slides[0]
        const coverImageUrl = section.coverImageUrl || coverSlide?.imageUrl || coverSlide?.thumbnailUrl || null
        const coverVideoUrl = section.coverVideoUrl || coverSlide?.videoUrl || null
        const coverThumbnailUrl = section.coverThumbnailUrl || coverSlide?.thumbnailUrl || coverSlide?.imageUrl || null

        return (
          <section key={section.id} className="overflow-hidden rounded-[28px] bg-[#f3f3f1] px-4 py-10 text-black sm:px-6 lg:px-8 lg:py-14">
            <div className="mx-auto max-w-[1180px]">
              <div className="text-center">
                <p
                  className="text-[13px] font-normal uppercase leading-none tracking-[0.18em] text-black"
                  style={{ fontFamily: 'var(--font-ndot55-caps), sans-serif' }}
                >
                  {section.featureTitle}
                  {section.featureVersion ? ` ${section.featureVersion}` : ''}
                </p>
                <h2 className="mx-auto mt-5 max-w-2xl text-[2.15rem] leading-[1.02] text-black sm:text-[3rem]">
                  {section.title}
                </h2>
              </div>

              {coverImageUrl || coverVideoUrl || coverThumbnailUrl ? (
                <div className="relative mx-auto mt-8 aspect-[16/10] max-w-[920px] overflow-hidden rounded-[16px] bg-white shadow-[0_22px_80px_rgba(17,17,17,0.08)] sm:aspect-[16/9]">
                  <FeatureMedia
                    imageUrl={coverImageUrl}
                    videoUrl={coverVideoUrl}
                    thumbnailUrl={coverThumbnailUrl}
                    title={section.title}
                  />
                </div>
              ) : null}

              {section.slides.length > 0 ? (
                <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
                  {section.slides.map((slide) => (
                    <article
                      key={slide.id}
                      className="min-w-[82%] snap-start overflow-hidden rounded-[16px] bg-white shadow-[0_18px_54px_rgba(17,17,17,0.06)] sm:min-w-[380px] lg:min-w-[420px]"
                    >
                      <div className="relative aspect-[4/3] bg-[#eeeeea]">
                        <FeatureMedia
                          imageUrl={slide.imageUrl}
                          videoUrl={slide.videoUrl}
                          thumbnailUrl={slide.thumbnailUrl}
                          title={slide.title}
                        />
                      </div>
                      <div className="px-5 py-5 sm:px-6 sm:py-6">
                        <h3 className="text-[1.5rem] leading-tight text-black">{slide.title}</h3>
                        {slide.body ? <p className="mt-4 text-sm leading-7 text-black/68">{slide.body}</p> : null}
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function PhoneAccessoriesHero({
  productDetail,
  gallery,
  intro,
  deliveryTimeline,
  specGroups,
  featureSections,
  initialColor,
  initialMediaId,
}: {
  productDetail: ProductDetail
  gallery: ProductDetailMedia[]
  intro: string | null
  deliveryTimeline: ReturnType<typeof getProductDeliveryTimeline>
  specGroups: ProductDetailSpecGroup[]
  featureSections: ProductFeatureSection[]
  initialColor?: string | null
  initialMediaId?: string | null
}) {
  const labels = [...new Set([productDetail.variants[0]?.label, ...productDetail.widgets.map((item) => item.text)].filter(Boolean))].slice(0, 4)
  const hasSpecs = specGroups.length > 0

  return (
    <ProductDetailHero
      productName={productDetail.name}
      brandLabel={productDetail.productBackgroundImage ? 'NOTHING (R)' : 'Phone Accessories'}
      entityType="mobile"
      gallery={gallery}
      backgroundImage={productDetail.productBackgroundImage}
      backgroundImages={productDetail.productBackgroundImages}
      intro={intro}
      priceLabel={productDetail.priceLabel}
      canonicalHandle={productDetail.handle}
      initialColor={initialColor}
      initialMediaId={initialMediaId}
      labels={labels}
      deliveryTimeline={deliveryTimeline}
      hasSpecs={hasSpecs}
      specGroups={specGroups}
      featureSections={featureSections}
    />
  )
}

function PrimaryCatalogPanel({
  productDetail,
  canonicalHandle,
  collectionLabel,
  gallery,
  intro,
  deliveryTimeline,
  specGroups,
  featureSections,
  initialColor,
  initialMediaId,
}: {
  productDetail: ProductDetail
  canonicalHandle: string
  collectionLabel: string
  gallery: ProductDetailMedia[]
  intro: string | null
  deliveryTimeline: ReturnType<typeof getProductDeliveryTimeline>
  specGroups: ProductDetailSpecGroup[]
  featureSections: ProductFeatureSection[]
  initialColor?: string | null
  initialMediaId?: string | null
}) {
  const hasSpecs = specGroups.length > 0

  return (
    <ProductDetailHero
      productName={productDetail.name}
      brandLabel={productDetail.brandName || collectionLabel}
      entityType="product"
      gallery={gallery}
      backgroundImage={productDetail.productBackgroundImage}
      backgroundImages={productDetail.productBackgroundImages}
      intro={intro}
      priceLabel={productDetail.priceLabel}
      canonicalHandle={canonicalHandle}
      initialColor={initialColor}
      initialMediaId={initialMediaId}
      labels={productDetail.widgets.map((item) => item.text)}
      deliveryTimeline={deliveryTimeline}
      hasSpecs={hasSpecs}
      specGroups={specGroups}
      featureSections={featureSections}
    />
  )
}

export const revalidate = CATALOG_REVALIDATE_SECONDS

export async function generateStaticParams() {
  const handles = await getProductStaticHandles()

  return handles.map((handle) => ({ handle }))
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const requestedHandle = toSeoHandle(params.handle)
  const productDetail = await getProductDetailByHandle(requestedHandle, false)

  if (!productDetail) {
    return {
      title: 'Product Not Found',
    }
  }

  const description = buildProductSeoDescription(productDetail)
  const title = buildProductSeoTitle(productDetail)
  const keywords = buildSeoKeywords(
    siteKeywords,
    productDetail.seoKeywords ?? [],
    productDetail.collections.map((collection) => collection.title),
    productDetail.collections.map((collection) => `${collection.title} Pakistan`),
    [
      buildProductSeoName(productDetail),
      `${buildProductSeoName(productDetail)} price in Pakistan`,
      `${buildProductSeoName(productDetail)} Pakistan`,
      `buy ${buildProductSeoName(productDetail)} in Pakistan`,
      `${buildProductSeoName(productDetail)} official store Pakistan`,
      `${buildProductSeoName(productDetail)} ${siteBrandName}`,
      productDetail.entityType === 'mobile' ? `${buildProductSeoName(productDetail)} PTA approved Pakistan` : null,
      productDetail.entityType === 'mobile' ? `${buildProductSeoName(productDetail)} non PTA price Pakistan` : null,
      productDetail.entityType === 'mobile' ? `${buildProductSeoName(productDetail)} accessories Pakistan` : null,
      productDetail.entityType === 'mobile' ? `${buildProductSeoName(productDetail)} charger Pakistan` : null,
      productDetail.entityType === 'mobile' ? `${buildProductSeoName(productDetail)} protector Pakistan` : null,
    ],
  )

  return {
    title: {
      absolute: title,
    },
    description,
    keywords,
    alternates: {
      canonical: productDetail.canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: productDetail.canonicalUrl,
      type: 'website',
      images: productDetail.ogImage ? [productDetail.ogImage] : undefined,
    },
    twitter: {
      card: productDetail.ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: productDetail.ogImage ? [productDetail.ogImage] : undefined,
    },
    robots: buildRobotsMetadata(),
  }
}

export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
  const requestedHandle = toSeoHandle(params.handle)
  const productDetail = await getProductDetailByHandle(requestedHandle, true)

  if (!productDetail) {
    notFound()
  }

  const canonicalHandle = toSeoHandle(productDetail.handle)

  if (params.handle !== canonicalHandle) {
    redirect(buildCanonicalProductPath(canonicalHandle, searchParams))
  }

  const gallery = buildDisplayGallery(productDetail)
  const immediateIntro = getImmediateProductIntro(productDetail.summary, productDetail.description)
  const resolvedSummary = immediateIntro ? null : await resolveMigratedHtmlCopy(productDetail.summary)
  const detailParagraphs = uniqueStrings([resolvedSummary, productDetail.summary, productDetail.description]).filter(
    (paragraph) => paragraph && !isHtmlSnippet(paragraph),
  )
  const intro = immediateIntro ?? resolvedSummary ?? detailParagraphs[0] ?? null
  const breadcrumbItems = buildProductBreadcrumbs(productDetail)
  const collectionLabel = productDetail.collections[0]?.title ?? (productDetail.entityType === 'mobile' ? 'Phones' : 'Catalog')
  const deliveryTimeline = getProductDeliveryTimeline()
  const specGroups = productDetail.specGroups ?? []
  const productFeatureSections = productDetail.productFeatureSections ?? []
  const initialColor = normalizeSearchParam(searchParams?.color)
  const initialMediaId = normalizeSearchParam(searchParams?.media)

  if (productDetail.entityType === 'mobile') {
    const faqs = productDetail.faqs ?? []
    const reviews = productDetail.reviews ?? []
    const usesImmersiveHero = Boolean(productDetail.productBackgroundImage)
    return (
      <div className={`${detailFont.className} min-h-screen bg-[#f5f7fb] text-slate-900`}>
        <SeoStructuredData data={buildProductStructuredData(productDetail)} />
        <NothingHeader />

        <main
          className={
            usesImmersiveHero
              ? 'pb-16'
              : 'mx-auto max-w-[1360px] px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-28'
          }
        >
          {!usesImmersiveHero ? (
            <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              {breadcrumbItems.map((item, index) =>
                index === breadcrumbItems.length - 1 ? (
                  <span key={item.href} className="text-slate-700">
                    {item.label}
                  </span>
                ) : (
                  <div key={item.href} className="flex items-center gap-2">
                    <Link href={item.href} className="transition-colors hover:text-slate-900">
                      {item.label}
                    </Link>
                    <span>/</span>
                  </div>
                ),
              )}
            </nav>
          ) : null}

          <PhoneAccessoriesHero
            productDetail={productDetail}
            gallery={gallery}
            intro={intro}
            deliveryTimeline={deliveryTimeline}
            specGroups={specGroups}
            featureSections={productFeatureSections}
            initialColor={initialColor}
            initialMediaId={initialMediaId}
          />

          {!usesImmersiveHero ? (
            <div className="mt-6">
              <ProductSpecGroupsSection groups={specGroups} />
            </div>
          ) : null}

          {!usesImmersiveHero && productFeatureSections.length > 0 ? (
            <div className={usesImmersiveHero ? 'mx-auto mt-10 max-w-[1180px] px-1 sm:px-2 lg:px-4' : 'mt-6'}>
              <ProductFeatureSectionsSection sections={productFeatureSections} />
            </div>
          ) : null}

          <div className={`mt-6 space-y-10 ${usesImmersiveHero ? 'mx-auto max-w-[1360px] px-1 sm:px-2 lg:px-4' : ''}`}>
            <Suspense fallback={<MobileAccessorySectionsSkeleton />}>
              <MobileAccessorySections handle={canonicalHandle} />
            </Suspense>
          </div>

          <ProductReviewsSection
            reviews={reviews}
            aggregateRating={productDetail.aggregateRating}
            productHandle={canonicalHandle}
            productImage={gallery[0]?.url ?? productDetail.primaryImage ?? productDetail.ogImage}
            productName={productDetail.name}
            className={usesImmersiveHero ? 'mx-auto mt-12 max-w-[1280px]' : 'mt-12'}
          />

          {faqs.length > 0 ? (
            <section className={usesImmersiveHero ? 'mx-auto mt-12 max-w-[1180px] px-1 sm:px-2 lg:px-4' : 'mt-12'}>
              <ProductFaqAccordionSection faqs={faqs} />
            </section>
          ) : null}
        </main>

        <NothingFooter />
      </div>
    )
  }

  const faqs = productDetail.faqs ?? []
  const reviews = productDetail.reviews ?? []
  const usesImmersiveHero = Boolean(productDetail.productBackgroundImage)
  const primaryCollectionSlug = productDetail.collections[0]?.slug ?? null
  return (
    <div className={`${detailFont.className} min-h-screen bg-[#f5f7fb] text-slate-900`}>
      <SeoStructuredData data={buildProductStructuredData(productDetail)} />
      <NothingHeader />

      <main className={usesImmersiveHero ? 'pb-16' : 'mx-auto max-w-[1360px] px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-28'}>
        {!usesImmersiveHero ? (
          <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            {breadcrumbItems.map((item, index) =>
              index === breadcrumbItems.length - 1 ? (
                <span key={item.href} className="text-slate-700">
                  {item.label}
                </span>
              ) : (
                <div key={item.href} className="flex items-center gap-2">
                  <Link href={item.href} className="transition-colors hover:text-slate-900">
                    {item.label}
                  </Link>
                  <span>/</span>
                </div>
              ),
            )}
          </nav>
        ) : null}

        <PrimaryCatalogPanel
          productDetail={productDetail}
          canonicalHandle={canonicalHandle}
          collectionLabel={collectionLabel}
          gallery={gallery}
          intro={intro}
          deliveryTimeline={deliveryTimeline}
          specGroups={specGroups}
          featureSections={productFeatureSections}
          initialColor={initialColor}
          initialMediaId={initialMediaId}
        />

        {!usesImmersiveHero ? (
        <div className="mt-6 grid gap-6">
          <ProductSpecGroupsSection groups={specGroups} />

          <SectionCard title="Product Details">
            <div className="space-y-3">
              <DetailAccordion title="Overview">
                <div className="space-y-4">
                  {detailParagraphs.length > 0 ? (
                    detailParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                  ) : (
                    <p>Product details will be added soon.</p>
                  )}
                </div>
              </DetailAccordion>
            </div>
          </SectionCard>

          <ProductFeatureSectionsSection sections={productFeatureSections} />

        </div>
        ) : null}

        <ProductReviewsSection
          reviews={reviews}
          aggregateRating={productDetail.aggregateRating}
          productHandle={canonicalHandle}
          productImage={gallery[0]?.url ?? productDetail.primaryImage ?? productDetail.ogImage}
          productName={productDetail.name}
          className={usesImmersiveHero ? 'mx-auto mt-12 max-w-[1280px] px-0' : 'mt-10'}
        />

        {faqs.length > 0 ? (
          <section className={usesImmersiveHero ? 'mx-auto mt-12 max-w-[1180px] px-4 sm:px-6 lg:px-8' : 'mt-10'}>
            <ProductFaqAccordionSection faqs={faqs} />
          </section>
        ) : null}

        <Suspense fallback={<ProductRecommendationsSkeleton immersive={usesImmersiveHero} />}>
          <ProductRecommendations handle={canonicalHandle} primaryCollectionSlug={primaryCollectionSlug} immersive={usesImmersiveHero} />
        </Suspense>
      </main>

      <NothingFooter />
    </div>
  )
}
