import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import localFont from 'next/font/local'
import { notFound, redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { CatalogProductTile } from '@/components/CatalogProductTile'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { ProductDetailHero } from '@/components/ProductDetailHero'
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
      productDetail.schemaJson ?? null,
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
    productDetail.schemaJson ?? productSchema,
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

function PhoneAccessoriesHero({
  productDetail,
  gallery,
  intro,
}: {
  productDetail: ProductDetail
  gallery: ProductDetailMedia[]
  intro: string | null
}) {
  const labels = [...new Set([productDetail.variants[0]?.label, ...productDetail.widgets.map((item) => item.text)].filter(Boolean))].slice(0, 4)

  return (
    <ProductDetailHero
      productName={productDetail.name}
      brandLabel="Phone Accessories"
      entityType="mobile"
      gallery={gallery}
      intro={intro}
      priceLabel={productDetail.priceLabel}
      canonicalHandle={productDetail.handle}
      labels={labels}
    />
  )
}

function PrimaryCatalogPanel({
  productDetail,
  canonicalHandle,
  collectionLabel,
  gallery,
  intro,
}: {
  productDetail: ProductDetail
  canonicalHandle: string
  collectionLabel: string
  gallery: ProductDetailMedia[]
  intro: string | null
}) {
  return (
    <ProductDetailHero
      productName={productDetail.name}
      brandLabel={productDetail.brandName || collectionLabel}
      entityType="product"
      gallery={gallery}
      intro={intro}
      priceLabel={productDetail.priceLabel}
      canonicalHandle={canonicalHandle}
      labels={productDetail.widgets.map((item) => item.text)}
    />
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
            intro={detailParagraphs[0] ?? null}
          />

          <div className="mt-6 space-y-10">
            {mobileAccessoryGroups.length > 0 ? (
              mobileAccessoryGroups.map((group) => (
                <section key={group.id}>
                  <div className="mb-4">
                    <h2 className="text-[1.35rem] font-medium tracking-[-0.02em] text-slate-900 sm:text-[1.55rem]">{group.title}</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:gap-x-6 md:gap-y-12 lg:grid-cols-5 lg:gap-x-7 lg:gap-y-14">
                    {group.products.map((product, index) => (
                      <CatalogProductTile key={product.id} product={product} priority={index < 2} tone="shop-all" />
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
