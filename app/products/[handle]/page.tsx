import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import localFont from 'next/font/local'
import { notFound, redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import {
  getAllProductHandles,
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
    return `${productDetail.name} Accessories in Pakistan | ${siteBrandName}`
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
      className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 shadow-[0_8px_22px_rgba(15,23,42,0.03)]"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-slate-900">
        <span>{title}</span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-base text-slate-500">
          +
        </span>
      </summary>
      <div className="pt-3 text-sm leading-6 text-slate-600">{children}</div>
    </details>
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
    <Link href={product.href} className="group block text-center">
      <div className="mx-auto w-full max-w-[220px]">
        {product.image ? (
          <div className="relative aspect-square w-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
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

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.2C7.14 3.2 3.2 7.14 3.2 12C3.2 13.73 3.7 15.41 4.65 16.86L3.6 20.4L7.24 19.38C8.63 20.26 10.23 20.8 12 20.8C16.86 20.8 20.8 16.86 20.8 12C20.8 7.14 16.86 3.2 12 3.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.08 8.82C8.78 8.82 8.52 8.97 8.37 9.23C8.05 9.76 7.94 10.4 8.1 10.99C8.42 12.15 9.21 13.29 10.28 14.35C11.35 15.42 12.49 16.21 13.65 16.53C14.24 16.69 14.88 16.58 15.41 16.27C15.68 16.11 15.83 15.85 15.83 15.54V14.72C15.83 14.48 15.67 14.27 15.44 14.2L13.7 13.68C13.5 13.62 13.28 13.68 13.13 13.84L12.61 14.39C12.53 14.47 12.41 14.5 12.3 14.47C11.64 14.24 10.56 13.38 10.18 12.69C10.12 12.59 10.14 12.46 10.22 12.38L10.77 11.87C10.93 11.71 10.99 11.49 10.93 11.29L10.41 9.55C10.34 9.31 10.13 9.15 9.89 9.15H9.08V8.82Z"
        fill="currentColor"
      />
    </svg>
  )
}

function PhoneAccessoryTile({ product }: { product: Product }) {
  return (
    <Link href={product.href} className="group block">
      <article className="flex h-full flex-col">
        <div className="relative aspect-[4/5] overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 48vw, 24vw"
              className="object-contain object-center transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.22em] text-slate-400">
              No image
            </div>
          )}
        </div>

        <div className="mt-3 text-center">
          <h3 className="text-[0.98rem] leading-[1.12] tracking-[-0.015em] text-slate-900 sm:text-[1.04rem]">{product.name}</h3>
          {product.priceLabel ? <p className="mt-1 text-[11px] text-slate-500">{product.priceLabel}</p> : null}
        </div>
      </article>
    </Link>
  )
}

function PhoneAccessoriesHero({
  productDetail,
  gallery,
  mainImage,
  intro,
}: {
  productDetail: ProductDetail
  gallery: ProductDetailMedia[]
  mainImage: string | null
  intro: string | null
}) {
  const labels = [...new Set([productDetail.variants[0]?.label, ...productDetail.widgets.map((item) => item.text)].filter(Boolean))].slice(0, 4)

  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
        <div>
          <div className="rounded-[26px] border border-slate-200 bg-[#f8fafc] p-5 sm:p-7">
            {mainImage ? (
              <div className="relative h-[300px] w-full sm:h-[420px] lg:h-[540px]">
                <Image
                  src={mainImage}
                  alt={productDetail.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 56vw"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center rounded-[18px] border border-dashed border-slate-300 text-sm text-slate-400 sm:h-[420px] lg:h-[540px]">
                No image available
              </div>
            )}
          </div>

          {gallery.length > 1 ? (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {gallery.map((media, index) => (
                <div
                  key={media.id}
                  className={`rounded-[18px] border p-3 ${index === 0 ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'}`}
                >
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24">
                    <Image src={media.url} alt={media.alt} fill sizes="96px" className="object-contain" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="lg:sticky lg:top-28">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">Phone Accessories</p>
          <h1 className="mt-3 text-[2rem] font-medium leading-tight tracking-[-0.03em] text-slate-900 sm:text-[2.6rem]">
            {productDetail.name}
          </h1>

          <p className="mt-4 rounded-[22px] border border-sky-100 bg-sky-50 px-4 py-4 text-sm leading-6 text-sky-900">
            We do not sell this phone here. This page only shows the chargers, protectors, earbuds, and other accessories linked to it.
          </p>

          {intro ? <p className="mt-5 text-base leading-7 text-slate-600">{intro}</p> : null}

          {labels.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {labels.map((label) => (
                <span key={label} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
                  {label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function PrimaryCatalogPanel({
  productDetail,
  canonicalHandle,
  collectionLabel,
  gallery,
  mainImage,
  intro,
}: {
  productDetail: ProductDetail
  canonicalHandle: string
  collectionLabel: string
  gallery: ProductDetailMedia[]
  mainImage: string | null
  intro: string | null
}) {
  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
        <div>
          <div className="rounded-[26px] border border-slate-200 bg-[#f8fafc] p-5 sm:p-7">
            {mainImage ? (
              <div className="relative h-[300px] w-full sm:h-[420px] lg:h-[540px]">
                <Image
                  src={mainImage}
                  alt={productDetail.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 56vw"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center rounded-[18px] border border-dashed border-slate-300 text-sm text-slate-400 sm:h-[420px] lg:h-[540px]">
                No image available
              </div>
            )}
          </div>

          {gallery.length > 1 ? (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {gallery.map((media, index) => (
                <div
                  key={media.id}
                  className={`rounded-[18px] border p-3 ${index === 0 ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'}`}
                >
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24">
                    <Image src={media.url} alt={media.alt} fill sizes="96px" className="object-contain" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="lg:sticky lg:top-28">
          <p className="text-sm font-medium text-slate-500">{productDetail.brandName || collectionLabel}</p>
          <h1 className="mt-2 text-[2rem] font-medium leading-tight tracking-[-0.03em] text-slate-900 sm:text-[2.6rem]">
            {productDetail.name}
          </h1>

          {intro ? <p className="mt-4 text-base leading-7 text-slate-600">{intro}</p> : null}

          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Price</p>
                <p className="mt-2 text-[1.9rem] font-medium leading-none tracking-[-0.03em] text-slate-900">
                  {productDetail.priceLabel || 'Contact for price'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/order/${canonicalHandle}`}
              className="inline-flex h-12 items-center justify-center rounded-[16px] bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Buy Now
            </Link>
            <Link
              href="https://wa.me/923424476070"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] border border-[#b7f0cb] bg-[#e9fff1] px-5 text-sm font-medium text-[#118a45] transition-colors hover:bg-[#dcffea]"
            >
              <WhatsAppIcon />
              <span>Contact on WhatsApp</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export const revalidate = 900

export async function generateStaticParams() {
  const handles = await getAllProductHandles()

  return handles.map((handle) => ({ handle }))
}

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
      `${productDetail.brandName} ${productDetail.name}`,
      `${productDetail.name} ${siteBrandName}`,
      productDetail.entityType === 'mobile' ? `${productDetail.name} accessories Pakistan` : null,
    ],
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
      canonical: buildAbsoluteUrl(`/products/${toSeoHandle(productDetail.handle)}`),
    },
    openGraph: {
      title,
      description,
      url: buildAbsoluteUrl(`/products/${toSeoHandle(productDetail.handle)}`),
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
  const mainImage = gallery[0]?.url ?? null
  const detailParagraphs = uniqueStrings([productDetail.summary, buildProductSeoDescription(productDetail), productDetail.description])
  const breadcrumbItems = buildProductBreadcrumbs(productDetail)
  const collectionLabel = productDetail.collections[0]?.title ?? (productDetail.entityType === 'mobile' ? 'Phones' : 'Catalog')

  if (productDetail.entityType === 'mobile') {
    const mobileAccessoryGroups = await getMobileAccessoryGroupsByHandle(canonicalHandle)
    const relatedAccessoryProducts = mobileAccessoryGroups.flatMap((group) => group.products)

    return (
      <div className={`${detailFont.className} min-h-screen bg-[#f5f7fb] text-slate-900`}>
        <SeoStructuredData data={buildProductStructuredData(productDetail, relatedAccessoryProducts)} />
        <NothingHeader />

        <main className="mx-auto max-w-[1360px] px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-28">
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

          <PhoneAccessoriesHero
            productDetail={productDetail}
            gallery={gallery}
            mainImage={mainImage}
            intro={detailParagraphs[0] ?? null}
          />

          <div className="mt-6 grid gap-6">
            {mobileAccessoryGroups.length > 0 ? (
              mobileAccessoryGroups.map((group) => (
                <SectionCard key={group.id} title={group.title}>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                    {group.products.map((product) => (
                      <PhoneAccessoryTile
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>
                </SectionCard>
              ))
            ) : (
              <SectionCard title="Related Accessories">
                <p className="text-sm leading-6 text-slate-600">
                  No linked protectors, chargers, or earbuds were found for this phone in the mobile-product connection table yet.
                </p>
              </SectionCard>
            )}
          </div>
        </main>

        <NothingFooter />
      </div>
    )
  }

  const faqs = productDetail.faqs ?? []
  const reviews = productDetail.reviews ?? []
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

      <main className="mx-auto max-w-[1360px] px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-28">
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

        <PrimaryCatalogPanel
          productDetail={productDetail}
          canonicalHandle={canonicalHandle}
          collectionLabel={collectionLabel}
          gallery={gallery}
          mainImage={mainImage}
          intro={detailParagraphs[0] ?? null}
        />

        <div className="mt-6 grid gap-6">
          <SectionCard title="Product Details">
            <div className="space-y-4 text-sm leading-7 text-slate-600">
              {detailParagraphs.length > 0 ? (
                detailParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
              ) : (
                <p>Product details will be added soon.</p>
              )}
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
                {faqs.map((faq, index) => (
                  <DetailAccordion key={faq.id} title={faq.question} defaultOpen={index === 0}>
                    {faq.answer}
                  </DetailAccordion>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-600">No FAQs yet.</p>
            )}
          </SectionCard>
        </div>

        {recommendations.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-[1.7rem] font-medium tracking-[-0.03em] text-slate-900">You may also like</h2>
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 xl:grid-cols-5 xl:gap-x-8 xl:gap-y-12">
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
