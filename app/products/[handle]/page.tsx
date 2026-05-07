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
import { siteBrandName, siteKeywords } from '@/lib/data/site-content'
import type { Product } from '@/lib/models/catalog'
import type { ProductDetail, ProductDetailFaq, ProductDetailMedia, ProductDetailReview } from '@/lib/models/product-detail'
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
    const itemList = relatedProducts.slice(0, 12).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: buildAbsoluteUrl(product.href),
      name: product.name,
    }))

    const mobileEntries: Array<Record<string, unknown> | null> = [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${productDetail.name} accessories`,
        description: buildProductSeoDescription(productDetail),
        url: productDetail.canonicalUrl,
        image: images,
        about: {
          '@type': 'Product',
          name: productDetail.name,
          brand: {
            '@type': 'Brand',
            name: productDetail.brandName,
          },
        },
        mainEntity:
          itemList.length > 0
            ? {
                '@type': 'ItemList',
                itemListElement: itemList,
              }
            : undefined,
      },
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
    image: images,
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

  const productEntries: Array<Record<string, unknown> | null> = [
    productSchema,
    buildBreadcrumbStructuredData(buildProductBreadcrumbs(productDetail)),
    faqStructuredData,
  ]

  return productEntries.filter((entry): entry is Record<string, unknown> => Boolean(entry))
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

function ProductDetailInfoSection({
  productDetail,
  detailParagraphs,
  deliveryTimeline,
}: {
  productDetail: ProductDetail
  detailParagraphs: string[]
  deliveryTimeline: ReturnType<typeof getProductDeliveryTimeline>
}) {
  const faqs = productDetail.faqs ?? []

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
          <DetailAccordion title="Return Policy">
            If the item arrives damaged, incorrect, or defective, contact support as soon as possible so the team can review a replacement or return request.
          </DetailAccordion>
          <DetailAccordion title="Shipping Information">
            Delivery time and shipping charges depend on your city and order size. Our team confirms the final delivery details during checkout.
          </DetailAccordion>
        </div>

        <div className="lg:sticky lg:top-24">
          <EstimatedDeliveryPanel deliveryTimeline={deliveryTimeline} />
        </div>
      </div>

      {faqs.length > 0 ? (
        <div className="mx-auto mt-12 max-w-[1180px] lg:mt-16">
          <ProductFaqAccordionSection faqs={faqs} />
        </div>
      ) : null}
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
              alt={product.name}
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
        <h3 className="text-[1.05rem] leading-[1.15] tracking-[-0.02em] text-slate-900 sm:text-[1.18rem]">{product.name}</h3>
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
}: {
  productDetail: ProductDetail
  gallery: ProductDetailMedia[]
  intro: string | null
  deliveryTimeline: ReturnType<typeof getProductDeliveryTimeline>
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
}: {
  productDetail: ProductDetail
  canonicalHandle: string
  collectionLabel: string
  gallery: ProductDetailMedia[]
  intro: string | null
  deliveryTimeline: ReturnType<typeof getProductDeliveryTimeline>
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
  const detailParagraphs = uniqueStrings([buildProductSeoDescription(productDetail), productDetail.description]).filter(
    (paragraph) => !isHtmlSnippet(paragraph),
  )
  const breadcrumbItems = buildProductBreadcrumbs(productDetail)
  const collectionLabel = productDetail.collections[0]?.title ?? (productDetail.entityType === 'mobile' ? 'Phones' : 'Catalog')
  const deliveryTimeline = getProductDeliveryTimeline()

  if (productDetail.entityType === 'mobile') {
    const mobileAccessoryGroups = await getMobileAccessoryGroupsByHandle(canonicalHandle)
    const relatedAccessoryProducts = mobileAccessoryGroups.flatMap((group) => group.products)
    const usesImmersiveHero = Boolean(productDetail.productBackgroundImage)

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
          />

          {usesImmersiveHero ? (
            <ProductDetailInfoSection
              productDetail={productDetail}
              detailParagraphs={detailParagraphs}
              deliveryTimeline={deliveryTimeline}
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
                  No linked protectors, chargers, or earbuds were found for this phone in the mobile-product connection table yet.
                </p>
              </div>
            )}
          </div>
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
        />

        {usesImmersiveHero ? (
          <ProductDetailInfoSection
            productDetail={productDetail}
            detailParagraphs={detailParagraphs}
            deliveryTimeline={deliveryTimeline}
          />
        ) : (
        <div className="mt-6 grid gap-6">
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

          <SectionCard title="Delivery & Returns">
            <div className="space-y-3">
              <DetailAccordion title="Shipping Information">
                Delivery time and shipping charges depend on your city and order size. The support team confirms the final delivery details during checkout.
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

          <SectionCard title="Product FAQs">
            {faqs.length > 0 ? (
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <DetailAccordion key={faq.id} title={faq.question}>
                    {faq.answer}
                  </DetailAccordion>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-600">No FAQs yet.</p>
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
      </main>

      <NothingFooter />
    </div>
  )
}
