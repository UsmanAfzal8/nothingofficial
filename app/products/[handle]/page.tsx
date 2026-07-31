import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { buildCloudinaryImageUrl, buildCloudinaryVideoUrl } from '@/lib/cloudinary-image-loader'
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
import { companyCuin, companyIdentifier, companyLegalName } from '@/lib/data/company'
import { siteBrandName, siteContactPhone, siteContactWhatsappUrl } from '@/lib/data/site-content'
import { getImmediateProductIntro, resolveMigratedHtmlCopy } from '@/lib/data/migrated-html'
import type {
  ProductDetail,
  ProductDetailFaq,
  ProductDetailMedia,
  ProductDetailSpecGroup,
  ProductFeatureSection,
} from '@/lib/models/product-detail'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildFaqStructuredData, buildRobotsMetadata, buildSeoKeywords, toSeoHandle } from '@/lib/utils/seo'

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
    return `${seoName} Price in Pakistan | ${siteBrandName}`
  }

  return `${seoName} Price in Pakistan | ${siteBrandName}`
}

function buildProductSeoHeading(productDetail: ProductDetail) {
  const price = typeof productDetail.price === 'number'
    ? `Rs ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(productDetail.price)}`
    : 'Contact for price'

  return `${buildProductSeoName(productDetail)} — Price in Pakistan | ${price}`
}

function buildProductSeoDescription(productDetail: ProductDetail) {
  const seoName = buildProductSeoName(productDetail)
  const pricePhrase = productDetail.priceLabel ? ` at ${productDetail.priceLabel}` : ''

  if (productDetail.metaDescription && productDetail.metaDescription.toLowerCase().includes(seoName.toLowerCase())) {
    return productDetail.metaDescription
  }

  if (productDetail.entityType === 'mobile') {
    return `${seoName} price in Pakistan${pricePhrase}. Review specifications, colours, variants, current availability, delivery, and compatible accessories from ${siteBrandName}.`
  }

  if (productDetail.priceLabel) {
    return `Explore ${seoName} in Pakistan at ${productDetail.priceLabel}. Check product details, compatibility, current availability, delivery, and ordering support from ${siteBrandName}.`
  }

  return (
    productDetail.summary ||
    productDetail.description ||
    `Shop ${seoName} in Pakistan with pricing, product details, availability, delivery, warranty support, and ordering help from ${siteBrandName}.`
  )
}

function buildProductSchemaDescription(productDetail: ProductDetail) {
  if (productDetail.description && !isHtmlSnippet(productDetail.description)) {
    return productDetail.description
  }

  if (productDetail.summary && !isHtmlSnippet(productDetail.summary)) {
    return productDetail.summary
  }

  return buildProductSeoDescription(productDetail)
}

function getFaqIntent(question: string) {
  const normalized = question.toLowerCase()

  if (normalized.includes('price')) return 'price'
  if (normalized.includes('where') && (normalized.includes('buy') || normalized.includes('order'))) return 'buy'
  if (normalized.includes('deliver')) return 'delivery'
  if (normalized.includes('verify') || normalized.includes('authentic')) return 'verification'
  if (normalized.includes('cash on delivery') || normalized.includes('cod')) return 'cod'

  return null
}

function buildCoreProductFaqs(productDetail: ProductDetail): ProductDetailFaq[] {
  const name = buildProductSeoName(productDetail)
  const priceAnswer = productDetail.priceLabel
    ? `${name} is listed at ${productDetail.priceLabel} in Pakistan on ${siteBrandName}. The price is read from the live catalog and may change when stock or variants change.`
    : `The current Pakistan price for ${name} is shown on this page when available. Contact ${siteBrandName} on WhatsApp for the latest price and stock.`
  const sharedFaqs: ProductDetailFaq[] = [
    {
      id: 'core-price',
      question: `What is the price of ${name} in Pakistan?`,
      answer: priceAnswer,
    },
    {
      id: 'core-buy',
      question: `Where can I buy ${name} in Pakistan?`,
      answer: `${name} can be ordered from nothingpakistan.pk, operated by ${companyLegalName} (${companyIdentifier}), with online ordering, WhatsApp support, nationwide delivery, and confirmed pickup in Garden Town, Lahore.`,
    },
  ]

  sharedFaqs.push(
    {
      id: 'core-delivery',
      question: `Does ${siteBrandName} deliver ${name} across Pakistan?`,
      answer: `Yes. ${siteBrandName} supports delivery of ${name} to Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, and other covered cities in Pakistan. Delivery and cash-on-delivery eligibility are confirmed during checkout.`,
    },
    {
      id: 'core-verification',
      question: `How can I verify the ${name} listing?`,
      answer: `Review the model name, specifications, images, current price, and company details published on this site. ${siteBrandName} is operated by ${companyLegalName} (${companyIdentifier}); confirm any stock-batch or warranty detail with support before payment.`,
    },
  )

  if (productDetail.entityType !== 'mobile') {
    sharedFaqs.push({
      id: 'core-cod',
      question: `Is cash on delivery available for ${name}?`,
      answer: `Cash on delivery may be available for ${name} in supported locations. The final delivery charge, tax, and eligibility are shown or confirmed when the order is processed.`,
    })
  }

  return sharedFaqs
}

function buildSupplementalProductFaqs(productDetail: ProductDetail): ProductDetailFaq[] {
  const name = buildProductSeoName(productDetail)

  return [
    {
      id: 'fallback-stock',
      question: `How do I confirm current stock for ${name}?`,
      answer: `Use the order button or WhatsApp support to confirm the current ${name} stock, color, and variant before completing your order.`,
    },
    {
      id: 'fallback-whatsapp',
      question: `Can I order ${name} on WhatsApp?`,
      answer: `Yes. Contact ${siteBrandName} on WhatsApp at ${siteContactPhone} to ask about ${name} pricing, stock, delivery, and order details.`,
    },
    {
      id: 'fallback-cities',
      question: `Which cities can receive ${name} delivery?`,
      answer: `${name} can be delivered to supported locations in Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, and other cities across Pakistan.`,
    },
    {
      id: 'fallback-time',
      question: `How long does delivery take for ${name}?`,
      answer: `The estimated delivery window is shown on the product page. Actual timing depends on order confirmation, the destination city, courier coverage, and holidays.`,
    },
    {
      id: 'fallback-features',
      question: `What are the key features of ${name}?`,
      answer: buildProductSchemaDescription(productDetail),
    },
    {
      id: 'fallback-support',
      question: `Does ${name} include local order support?`,
      answer: `${siteBrandName} provides local order and delivery support for ${name}. Confirm the current warranty and after-sales terms before purchase because coverage can vary by item and stock batch.`,
    },
    {
      id: 'fallback-return',
      question: `Can I return or exchange ${name}?`,
      answer: `If ${name} arrives damaged, incorrect, or defective, contact support promptly with your order details and evidence so the request can be reviewed under the current return policy.`,
    },
    {
      id: 'fallback-fees',
      question: `Does the ${name} price include delivery charges?`,
      answer: `The displayed amount is the product price. Any delivery charge or tax is calculated during checkout or confirmed before the order is finalized.`,
    },
    {
      id: 'fallback-online',
      question: `Can I buy ${name} online from ${siteBrandName}?`,
      answer: `Yes. Open the order flow from this page or use WhatsApp support to place an online order for ${name}.`,
    },
    {
      id: 'fallback-before-order',
      question: `What should I check before ordering ${name}?`,
      answer: `Confirm the current price, stock, color or variant, compatibility, delivery city, payment method, and applicable warranty or return terms before ordering ${name}.`,
    },
    {
      id: 'fallback-images',
      question: `Are ${name} product images available on this page?`,
      answer: `Yes. Available gallery images show the ${name} design and color options. Confirm the exact in-stock color or variant before ordering.`,
    },
    {
      id: 'fallback-price-update',
      question: `How often is the ${name} price updated?`,
      answer: `The ${name} price is read from the live Supabase catalog and can update when the store changes pricing or stock information.`,
    },
    {
      id: 'fallback-pickup',
      question: `Can I collect ${name} from Lahore?`,
      answer: `Garden Town, Lahore pickup can be requested for ${name}. Confirm stock and the collection time with WhatsApp support before visiting.`,
    },
    {
      id: 'fallback-payment',
      question: `Which payment methods are available for ${name}?`,
      answer: `The order flow shows the available payment methods for ${name}, including cash on delivery where eligible and bank transfer. Final eligibility depends on the order and delivery location.`,
    },
    {
      id: 'fallback-verification',
      question: `How can I verify the seller of ${name}?`,
      answer: `${siteBrandName} is operated by ${companyLegalName} (${companyIdentifier}). You can review the company details and official website information from the Company Verification page before ordering.`,
    },
  ]
}

function buildProductPageFaqs(productDetail: ProductDetail) {
  const coreFaqs = buildCoreProductFaqs(productDetail)
  const coveredIntents = new Set(coreFaqs.map((faq) => getFaqIntent(faq.question)).filter(Boolean))
  const seenQuestions = new Set(coreFaqs.map((faq) => faq.question.trim().toLowerCase()))
  const mergedFaqs = [...coreFaqs]

  for (const faq of productDetail.faqs ?? []) {
    const normalizedQuestion = faq.question.trim().toLowerCase()
    const intent = getFaqIntent(faq.question)

    if (seenQuestions.has(normalizedQuestion) || (intent && coveredIntents.has(intent))) {
      continue
    }

    seenQuestions.add(normalizedQuestion)
    mergedFaqs.push(faq)

    if (mergedFaqs.length >= 20) {
      break
    }
  }

  for (const faq of buildSupplementalProductFaqs(productDetail)) {
    if (mergedFaqs.length >= 20) {
      break
    }

    const normalizedQuestion = faq.question.trim().toLowerCase()
    if (seenQuestions.has(normalizedQuestion)) {
      continue
    }

    seenQuestions.add(normalizedQuestion)
    mergedFaqs.push(faq)
  }

  return mergedFaqs
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
    availability: productDetail.availability,
    url: productDetail.canonicalUrl,
    seller: {
      '@type': 'Organization',
      '@id': buildAbsoluteUrl('/#organization'),
      name: siteBrandName,
      legalName: companyLegalName,
      identifier: {
        '@type': 'PropertyValue',
        name: 'Company ID',
        value: companyCuin,
      },
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

function buildProductStructuredData(productDetail: ProductDetail, faqs: ProductDetailFaq[]) {
  const images = uniqueStrings(productDetail.gallery.map((item) => item.url))
  const faqStructuredData = buildFaqStructuredData(
    faqs.map((faq: ProductDetailFaq) => ({
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
      description: buildProductSchemaDescription(productDetail),
      image: images.length > 0 ? images : undefined,
      url: productDetail.canonicalUrl,
      brand: {
        '@type': 'Brand',
        name: productDetail.brandName,
      },
      category: 'Smartphone',
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

    return {
      '@context': 'https://schema.org',
      '@graph': mobileEntries
        .filter((entry): entry is Record<string, unknown> => Boolean(entry))
        .map(({ ['@context']: _context, ...entry }) => entry),
    }
  }

  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productDetail.canonicalUrl}#product`,
    name: buildProductSeoName(productDetail),
    description: buildProductSchemaDescription(productDetail),
    image: images.length > 0 ? images : undefined,
    url: productDetail.canonicalUrl,
    category: productDetail.collections.map((collection) => collection.title).join(', ') || undefined,
    brand: {
      '@type': 'Brand',
      name: productDetail.brandName,
    },
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

  return {
    '@context': 'https://schema.org',
    '@graph': productEntries
      .filter((entry): entry is Record<string, unknown> => Boolean(entry))
      .map(({ ['@context']: _context, ...entry }) => entry),
  }
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
        src={buildCloudinaryVideoUrl(videoUrl)}
        poster={thumbnailUrl || imageUrl ? buildCloudinaryImageUrl(thumbnailUrl || imageUrl || '', { width: 1200 }) : undefined}
        aria-label={title}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
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
      seoHeading={buildProductSeoHeading(productDetail)}
      brandLabel={productDetail.productBackgroundImage ? 'NOTHING (R)' : 'Phone Accessories'}
      entityType="mobile"
      gallery={gallery}
      backgroundImage={productDetail.productBackgroundImage}
      backgroundImages={productDetail.productBackgroundImages}
      intro={intro}
      priceLabel={productDetail.priceLabel}
      originalPriceLabel={productDetail.originalPriceLabel}
      warrantyYears={productDetail.warrantyYears}
      warrantyMonths={productDetail.warrantyMonths}
      warrantyPriceLabel={productDetail.warrantyPriceLabel}
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
      seoHeading={buildProductSeoHeading(productDetail)}
      brandLabel={productDetail.brandName || collectionLabel}
      entityType="product"
      gallery={gallery}
      backgroundImage={productDetail.productBackgroundImage}
      backgroundImages={productDetail.productBackgroundImages}
      intro={intro}
      priceLabel={productDetail.priceLabel}
      originalPriceLabel={productDetail.originalPriceLabel}
      warrantyMonths={productDetail.warrantyMonths}
      warrantyPriceLabel={productDetail.warrantyPriceLabel}
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

function CompareProductLink({
  productDetail,
  immersive,
}: {
  productDetail: ProductDetail
  immersive: boolean
}) {
  if (!productDetail.comparisonFamily) return null

  const params = new URLSearchParams({
    family: productDetail.comparisonFamily,
    left: productDetail.handle,
  })

  return (
    <div className={immersive ? 'mx-auto mt-6 max-w-[1280px] px-4 sm:px-6 lg:px-8' : 'mt-6'}>
      <Link
        href={`/compare?${params.toString()}`}
        className="group flex items-center justify-between gap-5 rounded-[22px] border border-black/10 bg-black px-5 py-5 text-white shadow-[0_18px_45px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:bg-[#1c1c1c] sm:px-7"
      >
        <span>
          <span className="block text-xs uppercase tracking-[0.18em] text-white/48">Side-by-side comparison</span>
          <span className="mt-2 block text-lg sm:text-2xl">Compare {productDetail.name}</span>
        </span>
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl text-black transition-transform group-hover:translate-x-1">
          →
        </span>
      </Link>
    </div>
  )
}

export const revalidate = CATALOG_REVALIDATE_SECONDS

export async function generateStaticParams() {
  const handles = await getProductStaticHandles()

  return handles.map((handle) => ({ handle }))
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const requestedHandle = toSeoHandle(params.handle)
  const productDetail = await getProductDetailByHandle(requestedHandle, true)

  if (!productDetail) {
    return {
      title: 'Product Not Found',
    }
  }

  const description = buildProductSeoDescription(productDetail)
  const title = buildProductSeoTitle(productDetail)
  const keywords = buildSeoKeywords(
    productDetail.seoKeywords ?? [],
    productDetail.collections.map((collection) => collection.title),
    productDetail.collections.map((collection) => `${collection.title} Pakistan`),
    [
      buildProductSeoName(productDetail),
      `${buildProductSeoName(productDetail)} price in Pakistan`,
      `${buildProductSeoName(productDetail)} Pakistan`,
      `buy ${buildProductSeoName(productDetail)} in Pakistan`,
      `${buildProductSeoName(productDetail)} ${siteBrandName}`,
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
  const faqs = buildProductPageFaqs(productDetail)

  if (productDetail.entityType === 'mobile') {
    const reviews = productDetail.reviews ?? []
    const usesImmersiveHero = Boolean(productDetail.productBackgroundImage)
    return (
      <div className="min-h-screen bg-[#f5f7fb] font-sans text-slate-900">
        <SeoStructuredData data={buildProductStructuredData(productDetail, faqs)} />
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

          <CompareProductLink productDetail={productDetail} immersive={usesImmersiveHero} />

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

  const reviews = productDetail.reviews ?? []
  const usesImmersiveHero = Boolean(productDetail.productBackgroundImage)
  const primaryCollectionSlug = productDetail.collections[0]?.slug ?? null
  return (
    <div className="min-h-screen bg-[#f5f7fb] font-sans text-slate-900">
      <SeoStructuredData data={buildProductStructuredData(productDetail, faqs)} />
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

        <CompareProductLink productDetail={productDetail} immersive={usesImmersiveHero} />

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
