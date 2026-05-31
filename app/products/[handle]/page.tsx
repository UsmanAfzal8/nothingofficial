import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import localFont from 'next/font/local'
import { notFound, redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import orderIcon from '@/assets/icons/order.svg'
import packageIcon from '@/assets/icons/package.svg'
import deliverIcon from '@/assets/icons/deleiver.svg'
import { CatalogProductTile } from '@/components/CatalogProductTile'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { ProductFaqAccordionSection } from '@/components/ProductFaqAccordionSection'
import { ProductDetailHero } from '@/components/ProductDetailHero'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import {
  CATALOG_REVALIDATE_SECONDS,
  getCollectionBySlug,
  getMobileAccessoryGroupsByHandle,
  getProductDetailByHandle,
} from '@/lib/data/catalog-repository'
import { companyIdentifier, companyLegalName } from '@/lib/data/company'
import { siteBrandName, siteKeywords } from '@/lib/data/site-content'
import type { Product } from '@/lib/models/catalog'
import type {
  ProductDetail,
  ProductDetailFaq,
  ProductDetailMedia,
  ProductDetailReview,
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
    return productDetail.gallery.slice(0, 5)
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

function buildProductSeoTitle(productDetail: ProductDetail) {
  if (productDetail.pageTitle && productDetail.pageTitle !== productDetail.name) {
    return productDetail.pageTitle
  }

  if (productDetail.entityType === 'mobile') {
    return `${productDetail.name} Price & Accessories in Pakistan | ${siteBrandName}`
  }

  return `${productDetail.name} Price in Pakistan | ${siteBrandName}`
}

function buildProductSeoDescription(productDetail: ProductDetail) {
  if (productDetail.metaDescription) {
    return productDetail.metaDescription
  }

  if (productDetail.entityType === 'mobile') {
    return `Browse chargers, protectors, earbuds, and related accessories for ${productDetail.name} in Pakistan through ${siteBrandName}.`
  }

  return (
    productDetail.summary ||
    productDetail.description ||
    `Shop ${productDetail.name} in Pakistan with pricing, product details, and ordering support from ${siteBrandName}.`
  )
}

function buildProductStructuredData(productDetail: ProductDetail, relatedProducts: Product[] = []) {
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
      name: productDetail.name,
      description: buildProductSeoDescription(productDetail),
      image: images.length > 0 ? images : undefined,
      sku: productDetail.handle,
      url: productDetail.canonicalUrl,
      brand: {
        '@type': 'Brand',
        name: productDetail.brandName,
      },
      category: 'Smartphone',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: siteBrandName,
        legalName: companyLegalName,
        identifier: companyIdentifier,
      },
      offers:
        typeof productDetail.price === 'number'
          ? {
              '@type': 'Offer',
              priceCurrency: 'PKR',
              price: productDetail.price,
              availability: productDetail.availability,
              url: productDetail.canonicalUrl,
            }
          : undefined,
      additionalProperty:
        productDetail.specs?.slice(0, 8).map((spec) => ({
          '@type': 'PropertyValue',
          name: spec.label,
          value: spec.value,
        })) ?? undefined,
      isRelatedTo:
        relatedProducts.slice(0, 8).map((product) => ({
          '@type': 'Product',
          name: product.name,
          url: buildAbsoluteUrl(product.href),
        })) ?? undefined,
    }

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
    name: productDetail.name,
    description: buildProductSeoDescription(productDetail),
    image: images.length > 0 ? images : undefined,
    sku: productDetail.handle,
    url: productDetail.canonicalUrl,
    category: productDetail.collections.map((collection) => collection.title).join(', ') || undefined,
    brand: {
      '@type': 'Brand',
      name: productDetail.brandName,
    },
    itemCondition: 'https://schema.org/NewCondition',
    seller: {
      '@type': 'Organization',
      name: siteBrandName,
      legalName: companyLegalName,
      identifier: companyIdentifier,
    },
    offers:
      typeof productDetail.price === 'number'
        ? {
            '@type': 'Offer',
            priceCurrency: 'PKR',
            price: productDetail.price,
            availability: productDetail.availability,
            url: productDetail.canonicalUrl,
          }
        : undefined,
  }

  if (productDetail.aggregateRating) {
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: productDetail.aggregateRating.ratingValue,
      reviewCount: productDetail.aggregateRating.reviewCount,
    }
  }

  if (productDetail.reviews && productDetail.reviews.length > 0) {
    productSchema.review = productDetail.reviews.slice(0, 5).map((review) => ({
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

function buildProductSeoNarrative(productDetail: ProductDetail, relatedProductsCount = 0) {
  const collectionTitles = productDetail.collections.map((collection) => collection.title)
  const firstCollection = collectionTitles[0] ?? (productDetail.entityType === 'mobile' ? 'phones' : 'products')
  const priceSentence = productDetail.priceLabel
    ? `${productDetail.name} is currently shown with a live PKR price of ${productDetail.priceLabel}, helping shoppers compare cost before they move into the order flow.`
    : `${productDetail.name} is presented with a contact-first buying flow so customers can confirm the latest price, stock, and delivery details before ordering.`
  const supportSentence =
    relatedProductsCount > 0
      ? `This page also connects buyers to ${relatedProductsCount} related accessories and nearby catalog routes, which strengthens internal linking and helps shoppers discover compatible add-ons from the same storefront.`
      : `This page links naturally into support, ordering, and nearby catalog routes so customers can continue their buying journey without losing context.`

  return [
    `${productDetail.name} sits inside the ${firstCollection.toLowerCase()} section of ${siteBrandName}, where shoppers in Pakistan expect clear product details, original-brand positioning, and a faster route into delivery or support.`,
    priceSentence,
    `The page is designed to answer high-intent searches around ${productDetail.name} price in Pakistan, compatibility, availability, and original product sourcing while keeping the content useful for real customers instead of keyword stuffing.`,
    supportSentence,
  ]
}

function buildRecommendedProducts(productGroups: Product[][], currentHandle: string) {
  const seen = new Set<string>()
  const output: Product[] = []

  for (const products of productGroups) {
    for (const product of products) {
      if (product.handle === currentHandle || seen.has(product.handle)) {
        continue
      }

      seen.add(product.handle)
      output.push(product)

      if (output.length === 8) {
        return output
      }
    }
  }

  return output
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

function DeliveryStep({
  icon,
  label,
  dateLabel,
  active = false,
}: {
  icon: typeof orderIcon
  label: string
  dateLabel: string
  active?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full border-4 sm:h-20 sm:w-20 ${
          active
            ? 'border-white bg-[#fff7ef] shadow-[0_14px_28px_rgba(244,110,30,0.16)]'
            : 'border-[#f2f2f2] bg-[#f8f8f8] shadow-[0_10px_20px_rgba(15,23,42,0.04)]'
        }`}
      >
        <Image src={icon} alt="" aria-hidden="true" className={`h-7 w-7 object-contain ${active ? '' : 'grayscale opacity-55'}`} />
      </div>
      <p className={`mt-3 text-[0.78rem] font-extrabold uppercase tracking-normal ${active ? 'text-[#ff7a00]' : 'text-[#4f5a6c]'}`}>
        {label}
      </p>
      <p className={`mt-1 text-[0.76rem] font-semibold ${active ? 'text-[#71798a]' : 'text-[#9ea6b4]'}`}>
        {dateLabel}
      </p>
    </div>
  )
}

function EstimatedDeliveryPanel({ deliveryTimeline }: { deliveryTimeline: ReturnType<typeof getProductDeliveryTimeline> }) {
  return (
    <section className="rounded-[26px] border border-[#f7d9b7] bg-white/78 px-4 py-5 shadow-[0_18px_42px_rgba(244,110,30,0.08)] backdrop-blur-md sm:px-6 sm:py-7">
      <p className="text-[0.9rem] font-black uppercase tracking-normal text-[#8d8d8d]">Estimated Delivery</p>
      <p className="mt-1 font-sans text-[2.05rem] font-bold leading-none tracking-normal text-[#ff6f00] sm:text-[2.55rem]">
        {deliveryTimeline.deliveryRangeLabel}
      </p>

      <div className="mt-6 border-t border-dashed border-[#f0c89d] pt-6">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(1.4rem,1fr)_minmax(0,1fr)_minmax(1.4rem,1fr)_minmax(0,1fr)] items-start">
          <DeliveryStep icon={orderIcon} label="Order" dateLabel="Today" active />
          <div className="mt-8 h-1 rounded-full bg-[#ff7a00] sm:mt-10" />
          <DeliveryStep icon={packageIcon} label="Process" dateLabel={deliveryTimeline.processDateLabel} active />
          <div className="mt-8 h-1 rounded-full bg-[#edf0f5] sm:mt-10" />
          <DeliveryStep icon={deliverIcon} label="Deliver" dateLabel={deliveryTimeline.deliveryRangeLabel} />
        </div>
      </div>
    </section>
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

function ProductDetailInfoSection({
  detailParagraphs,
  deliveryTimeline,
  seoNarrative,
}: {
  detailParagraphs: string[]
  deliveryTimeline: ReturnType<typeof getProductDeliveryTimeline>
  seoNarrative: string[]
}) {
  return (
    <section className="min-h-screen bg-[#f5f7fb] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div className="space-y-3">
          <DetailAccordion title="Detailed Description">
            <div className="space-y-4">
              {detailParagraphs.length > 0 ? (
                detailParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
              ) : (
                <p>Product details will be added soon.</p>
              )}
            </div>
          </DetailAccordion>
          <DetailAccordion title="Buying Guide" defaultOpen>
            <div className="space-y-4">
              {seoNarrative.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </DetailAccordion>
          <DetailAccordion title="Return Policy">
            If the item arrives damaged, incorrect, or defective, contact support as soon as possible so the team can review a replacement or return request.
          </DetailAccordion>
          <DetailAccordion title="Shipping Information">
            Delivery time and shipping charges depend on your city and order size. Our team confirms the final delivery details during checkout.
          </DetailAccordion>
          <DetailAccordion title="Pre-Payment Policy">
            For the safety and accountability of high-value shipments, we operate exclusively on a pre-payment basis. We do not offer a COD option for these high value items, ensuring every delivery is fully documented and secure.
          </DetailAccordion>
        </div>

        <div className="lg:sticky lg:top-24">
          <EstimatedDeliveryPanel deliveryTimeline={deliveryTimeline} />
        </div>
      </div>
    </section>
  )
}

function ReviewCard({ review }: { review: ProductDetailReview }) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-900">{review.userName}</p>
          {review.createdAt ? <p className="mt-1 text-xs text-slate-500">{review.createdAt}</p> : null}
        </div>
        {typeof review.rating === 'number' ? (
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">{review.rating}/5</span>
        ) : null}
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{review.comment || 'No written review provided.'}</p>
    </article>
  )
}

function RecommendationCard({ product }: { product: Product }) {
  return (
    <Link href={product.href} prefetch={false} className="group block text-center">
      <div className="mx-auto w-full max-w-[220px]">
        {product.image ? (
          <div className="relative aspect-square w-full">
            <Image
              src={product.image}
              alt={`${product.name} original product price in Pakistan from Nothing Pakistan`}
              fill
              loading="lazy"
              fetchPriority="low"
              sizes="(max-width: 768px) 44vw, (max-width: 1200px) 28vw, 18vw"
              className="object-contain object-center transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <div className="flex aspect-square w-full items-center justify-center text-sm text-slate-400">
            No image
          </div>
        )}
      </div>

      <div className="mt-5">
        <h3 className="product-card-name text-[1.05rem] leading-[1.15] text-slate-900 sm:text-[1.18rem]">{product.name}</h3>
        {product.priceLabel ? <p className="mt-2 text-sm text-slate-500">{product.priceLabel}</p> : null}
      </div>
    </Link>
  )
}

function PhoneAccessoriesHero({
  productDetail,
  gallery,
  intro,
  deliveryTimeline,
  specGroups,
  featureSections,
}: {
  productDetail: ProductDetail
  gallery: ProductDetailMedia[]
  intro: string | null
  deliveryTimeline: ReturnType<typeof getProductDeliveryTimeline>
  specGroups: ProductDetailSpecGroup[]
  featureSections: ProductFeatureSection[]
}) {
  const labels = [...new Set([productDetail.variants[0]?.label, ...productDetail.widgets.map((item) => item.text)].filter(Boolean))].slice(0, 4)

  return (
    <ProductDetailHero
      productName={productDetail.name}
      brandLabel={productDetail.productBackgroundImage ? 'NOTHING (R)' : 'Phone Accessories'}
      entityType="mobile"
      gallery={gallery}
      backgroundImage={productDetail.productBackgroundImage}
      intro={intro}
      priceLabel={productDetail.priceLabel}
      canonicalHandle={productDetail.handle}
      labels={labels}
      deliveryTimeline={deliveryTimeline}
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
}: {
  productDetail: ProductDetail
  canonicalHandle: string
  collectionLabel: string
  gallery: ProductDetailMedia[]
  intro: string | null
  deliveryTimeline: ReturnType<typeof getProductDeliveryTimeline>
  specGroups: ProductDetailSpecGroup[]
  featureSections: ProductFeatureSection[]
}) {
  return (
    <ProductDetailHero
      productName={productDetail.name}
      brandLabel={productDetail.brandName || collectionLabel}
      entityType="product"
      gallery={gallery}
      backgroundImage={productDetail.productBackgroundImage}
      intro={intro}
      priceLabel={productDetail.priceLabel}
      canonicalHandle={canonicalHandle}
      labels={productDetail.widgets.map((item) => item.text)}
      deliveryTimeline={deliveryTimeline}
      specGroups={specGroups}
      featureSections={featureSections}
    />
  )
}

export const revalidate = CATALOG_REVALIDATE_SECONDS

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const requestedHandle = toSeoHandle(params.handle)
  const productDetail = await getProductDetailByHandle(requestedHandle)

  if (!productDetail) {
    return {
      title: 'Product Not Found',
    }
  }

  const description = buildProductSeoDescription(productDetail)
  const title = buildProductSeoTitle(productDetail)
  const keywords = buildSeoKeywords(
    siteKeywords,
    [
      productDetail.name,
      `${productDetail.name} price in Pakistan`,
      `${productDetail.name} Pakistan`,
      `buy ${productDetail.name} in Pakistan`,
      `${productDetail.brandName} ${productDetail.name}`,
      `${productDetail.name} ${siteBrandName}`,
      productDetail.entityType === 'mobile' ? `${productDetail.name} accessories Pakistan` : null,
      productDetail.entityType === 'mobile' ? `${productDetail.name} charger Pakistan` : null,
      productDetail.entityType === 'mobile' ? `${productDetail.name} protector Pakistan` : null,
    ],
    productDetail.seoKeywords ?? [],
    productDetail.collections.map((collection) => collection.title),
    productDetail.collections.map((collection) => `${collection.title} Pakistan`),
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

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const requestedHandle = toSeoHandle(params.handle)
  const productDetail = await getProductDetailByHandle(requestedHandle)

  if (!productDetail) {
    notFound()
  }

  const canonicalHandle = toSeoHandle(productDetail.handle)

  if (params.handle !== canonicalHandle) {
    redirect(`/products/${canonicalHandle}`)
  }

  const gallery = buildDisplayGallery(productDetail)
  const detailParagraphs = uniqueStrings([productDetail.summary, productDetail.description]).filter(
    (paragraph) => !isHtmlSnippet(paragraph),
  )
  const breadcrumbItems = buildProductBreadcrumbs(productDetail)
  const collectionLabel = productDetail.collections[0]?.title ?? (productDetail.entityType === 'mobile' ? 'Phones' : 'Catalog')
  const deliveryTimeline = getProductDeliveryTimeline()
  const specGroups = productDetail.specGroups ?? []
  const productFeatureSections = productDetail.productFeatureSections ?? []

  if (productDetail.entityType === 'mobile') {
    const mobileAccessoryGroups = await getMobileAccessoryGroupsByHandle(canonicalHandle)
    const relatedAccessoryProducts = mobileAccessoryGroups.flatMap((group) => group.products)
    const faqs = productDetail.faqs ?? []
    const usesImmersiveHero = Boolean(productDetail.productBackgroundImage)
    const seoNarrative = buildProductSeoNarrative(productDetail, relatedAccessoryProducts.length)

    return (
      <div className={`${detailFont.className} min-h-screen bg-[#f5f7fb] text-slate-900`}>
        <SeoStructuredData data={buildProductStructuredData(productDetail, relatedAccessoryProducts)} />
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
            intro={productDetail.summary ?? detailParagraphs[0] ?? null}
            deliveryTimeline={deliveryTimeline}
            specGroups={specGroups}
            featureSections={productFeatureSections}
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

          {usesImmersiveHero ? (
            <ProductDetailInfoSection
              detailParagraphs={detailParagraphs}
              deliveryTimeline={deliveryTimeline}
              seoNarrative={seoNarrative}
            />
          ) : null}

          <div className={`mt-6 space-y-10 ${usesImmersiveHero ? 'mx-auto max-w-[1360px] px-1 sm:px-2 lg:px-4' : ''}`}>
            {mobileAccessoryGroups.length > 0 ? (
              mobileAccessoryGroups.map((group) => (
                <section key={group.id}>
                  <div className="mb-4">
                    <h2 className="text-[1.35rem] font-medium tracking-[-0.02em] text-slate-900 sm:text-[1.55rem]">{group.title}</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:gap-x-6 md:gap-y-12 lg:grid-cols-5 lg:gap-x-7 lg:gap-y-14">
                    {group.products.map((product) => (
                      <CatalogProductTile key={product.id} product={product} tone="shop-all" />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-7">
                <h2 className="text-[1.35rem] font-medium tracking-[-0.02em] text-slate-900 sm:text-[1.55rem]">Related Accessories</h2>
                <p className="mt-5 text-sm leading-6 text-slate-600">
                  No linked covers, protectors, chargers, or earbuds were found for this phone in the mobile-product connection table yet.
                </p>
              </div>
            )}
          </div>

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
  const [primaryCollection, fallbackCollection] = await Promise.all([
    primaryCollectionSlug ? getCollectionBySlug(primaryCollectionSlug) : Promise.resolve(null),
    primaryCollectionSlug === 'shop-all' ? Promise.resolve(null) : getCollectionBySlug('shop-all'),
  ])
  const recommendations = buildRecommendedProducts(
    [primaryCollection?.products ?? [], fallbackCollection?.products ?? []],
    canonicalHandle,
  )
  const seoNarrative = buildProductSeoNarrative(productDetail, recommendations.length)

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
          intro={productDetail.summary ?? detailParagraphs[0] ?? null}
          deliveryTimeline={deliveryTimeline}
          specGroups={specGroups}
          featureSections={productFeatureSections}
        />

        {usesImmersiveHero ? (
          <ProductDetailInfoSection
            detailParagraphs={detailParagraphs}
            deliveryTimeline={deliveryTimeline}
            seoNarrative={seoNarrative}
          />
        ) : (
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
              <DetailAccordion title="Buying Guide" defaultOpen>
                <div className="space-y-4">
                  {seoNarrative.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </DetailAccordion>
            </div>
          </SectionCard>

          <ProductFeatureSectionsSection sections={productFeatureSections} />

          <SectionCard title="Delivery & Returns">
            <div className="space-y-3">
              <DetailAccordion title="Shipping Information">
                Delivery time and shipping charges depend on your city and order size. The support team confirms the final delivery details during checkout.
              </DetailAccordion>
              <DetailAccordion title="Pre-Payment Policy">
                For the safety and accountability of high-value shipments, we operate exclusively on a pre-payment basis. We do not offer a COD option for these high value items, ensuring every delivery is fully documented and secure.
              </DetailAccordion>
              <DetailAccordion title="Returns & Exchanges">
                If the item arrives damaged, incorrect, or defective, contact support as soon as possible so the team can review a replacement or return request.
              </DetailAccordion>
            </div>
          </SectionCard>

          <SectionCard title="Reviews">
            {reviews.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-600">No reviews yet.</p>
            )}
          </SectionCard>

        </div>
        )}

        {recommendations.length > 0 ? (
          <section className={usesImmersiveHero ? 'mx-auto mt-10 max-w-[1360px] px-4 sm:px-6 lg:px-8' : 'mt-10'}>
            <h2 className="text-[1.7rem] font-medium tracking-[-0.03em] text-slate-900">You may also like</h2>
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-5 lg:gap-x-8 lg:gap-y-12">
              {recommendations.map((product) => (
                <RecommendationCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}

        {faqs.length > 0 ? (
          usesImmersiveHero ? (
            <section className="mx-auto mt-12 max-w-[1180px] px-4 sm:px-6 lg:px-8">
              <ProductFaqAccordionSection faqs={faqs} />
            </section>
          ) : (
            <div className="mt-10">
              <SectionCard title="Product FAQs">
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <DetailAccordion key={faq.id} title={faq.question}>
                      {faq.answer}
                    </DetailAccordion>
                  ))}
                </div>
              </SectionCard>
            </div>
          )
        ) : null}
      </main>

      <NothingFooter />
    </div>
  )
}
