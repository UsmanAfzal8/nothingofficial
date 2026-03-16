import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { AddToCartButton } from '@/components/AddToCartButton'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import { getProductDetailByHandle } from '@/lib/data/catalog-repository'
import { siteBrandName, siteKeywords } from '@/lib/data/site-content'
import type { ProductDetail, ProductDetailFaq, ProductDetailMedia, ProductDetailRelatedItem, ProductDetailReview } from '@/lib/models/product-detail'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildSeoKeywords, toSeoHandle } from '@/lib/utils/seo'

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

function buildProductMedia(productDetail: ProductDetail) {
  const heroBackground = productDetail.gallery[0]?.url ?? productDetail.heroImages[0] ?? productDetail.ogImage ?? productDetail.primaryImage ?? null
  const centerImage = productDetail.primaryImage ?? productDetail.gallery[0]?.url ?? productDetail.ogImage ?? heroBackground
  const overviewImage =
    productDetail.gallery[1]?.url ?? productDetail.gallery[0]?.url ?? productDetail.ogImage ?? productDetail.primaryImage ?? heroBackground

  return {
    heroBackground,
    centerImage,
    overviewImage,
  }
}

function buildGalleryCards(productDetail: ProductDetail): ProductDetailMedia[] {
  if (productDetail.gallery.length > 0) {
    return productDetail.gallery.slice(0, 6)
  }

  const media = uniqueStrings([productDetail.primaryImage, productDetail.ogImage, ...productDetail.heroImages])

  return media.slice(0, 6).map((image, index) => ({
    id: `media-fallback-${index + 1}`,
    url: image,
    alt: productDetail.name,
    title: productDetail.variants[index]?.label ?? productDetail.name,
    caption: productDetail.collections[index]?.title ?? productDetail.entityType,
  }))
}

function buildRatingLabel(rating: number | null): string | null {
  if (typeof rating !== 'number' || Number.isNaN(rating)) {
    return null
  }

  return `${rating}/5`
}

function buildFaqStructuredData(faqs: ProductDetailFaq[]) {
  if (faqs.length === 0) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

function buildProductBreadcrumbs(productDetail: ProductDetail) {
  return [...productDetail.breadcrumbItems, { label: productDetail.name, href: `/products/${toSeoHandle(productDetail.handle)}` }]
}

function buildProductStructuredData(productDetail: ProductDetail) {
  const images = uniqueStrings(productDetail.gallery.map((item) => item.url))
  const faqStructuredData = buildFaqStructuredData(productDetail.faqs ?? [])
  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productDetail.name,
    description: productDetail.metaDescription || productDetail.summary || productDetail.description || productDetail.name,
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

  return [productSchema, buildBreadcrumbStructuredData(buildProductBreadcrumbs(productDetail)), faqStructuredData].filter(
    (entry): entry is Record<string, unknown> => Boolean(entry),
  )
}

function ProductSummaryCard({
  productDetail,
  canonicalHandle,
}: {
  productDetail: ProductDetail
  canonicalHandle: string
}) {
  const widgetTexts = productDetail.widgets.slice(0, 3).map((item) => item.text)
  const thumbnailImage = productDetail.ogImage ?? productDetail.primaryImage
  const collectionLabel = productDetail.collections[0]?.title ?? (productDetail.entityType === 'mobile' ? 'Phones' : 'Catalog')

  return (
    <div className="rounded-[26px] border border-white/70 bg-[rgba(255,255,255,0.92)] p-3 shadow-[0_28px_80px_rgba(17,17,17,0.12)] backdrop-blur-xl">
      <div className="grid grid-cols-[1fr,76px] items-start gap-3 md:grid-cols-[1fr,88px]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-black/38">{collectionLabel}</p>
          <h2 className="collection-product-name mt-1 text-[1.9rem] leading-[0.95] md:text-[2.2rem]">{productDetail.name}</h2>
          {productDetail.priceLabel ? (
            <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-black/55">{productDetail.priceLabel}</p>
          ) : null}
        </div>

        {thumbnailImage ? (
          <div className="rounded-[18px] border border-black/10 bg-[#f1f1ef] p-2">
            <div className="relative h-14 w-full md:h-16">
              <Image src={thumbnailImage} alt={productDetail.name} fill sizes="88px" className="object-contain" />
            </div>
          </div>
        ) : null}
      </div>

      {widgetTexts.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {widgetTexts.map((text) => (
            <li
              key={text}
              className="flex items-center gap-2 rounded-full border border-black/10 bg-[#f6f6f4] px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-black/60"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-black/55" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {productDetail.variants[0] ? (
        <div className="mt-3 rounded-full border border-black/10 bg-[#efefec] px-3 py-2 text-center text-[10px] uppercase tracking-[0.26em] text-black/58">
          {productDetail.variants[0].label}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {productDetail.collections.slice(0, 4).map((collection) => (
          <Link
            key={collection.slug}
            href={`/collections/${collection.slug}`}
            className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[9px] uppercase tracking-[0.22em] text-black/52 transition-opacity hover:opacity-70"
          >
            {collection.title}
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-2">
        <Link
          href={`/order/${canonicalHandle}`}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-3 text-[10px] uppercase tracking-[0.24em] text-white transition-opacity hover:opacity-85"
        >
          {productDetail.priceLabel ? `${productDetail.priceLabel} • Take Order` : 'Take Order'}
        </Link>
        <AddToCartButton
          item={{
            handle: canonicalHandle,
            name: productDetail.name,
            image: productDetail.primaryImage ?? productDetail.ogImage,
            price: productDetail.price ?? null,
            priceLabel: productDetail.priceLabel ?? null,
            subtitle: collectionLabel,
            entityType: productDetail.entityType,
          }}
        />
        {productDetail.collections[0] ? (
          <Link
            href={`/collections/${productDetail.collections[0].slug}`}
            className="text-center text-[10px] uppercase tracking-[0.22em] text-black/48 transition-opacity hover:opacity-75"
          >
            View Collection
          </Link>
        ) : null}
      </div>
    </div>
  )
}

function GalleryCardPanel({ media }: { media: ProductDetailMedia }) {
  return (
    <article className="rounded-[24px] border border-white/75 bg-[rgba(255,255,255,0.88)] p-2 shadow-[0_20px_60px_rgba(17,17,17,0.08)] backdrop-blur-xl">
      <div className="relative overflow-hidden rounded-[18px] border border-black/6 bg-[#f3f3f1] p-2">
        <div className="dot-mesh-background absolute inset-0 opacity-30" />
        <div className="relative h-24 w-full md:h-28">
          <Image src={media.url} alt={media.alt} fill sizes="(max-width: 768px) 50vw, 16vw" className="object-contain" />
        </div>
      </div>

      <div className="px-1 pb-1 pt-2">
        {media.colorName || media.caption ? (
          <p className="text-[9px] uppercase tracking-[0.22em] text-black/28 md:text-[10px]">
            {media.colorName || media.caption}
          </p>
        ) : null}
        <h3 className="collection-product-name mt-1 text-[1.05rem] leading-tight text-black/92 md:text-[1.2rem]">
          {media.title || media.caption || media.colorName || 'Gallery image'}
        </h3>
      </div>
    </article>
  )
}

function RelatedMobileCard({ mobile }: { mobile: ProductDetailRelatedItem }) {
  return (
    <Link
      href={`/products/${mobile.slug}`}
      className="rounded-[24px] border border-white/75 bg-[rgba(255,255,255,0.9)] p-3 shadow-[0_20px_50px_rgba(17,17,17,0.06)] transition-transform hover:-translate-y-0.5"
    >
      <div className="relative overflow-hidden rounded-[18px] border border-black/8 bg-[#f3f3f1] p-3">
        <div className="dot-mesh-background absolute inset-0 opacity-25" />
        {mobile.image ? (
          <div className="relative h-32 w-full">
            <Image src={mobile.image} alt={mobile.name} fill sizes="(max-width: 768px) 70vw, 20vw" className="object-contain" />
          </div>
        ) : (
          <div className="relative flex h-32 items-center justify-center text-[10px] uppercase tracking-[0.24em] text-black/30">
            No image
          </div>
        )}
      </div>

      <div className="px-1 pb-1 pt-3">
        <p className="text-[9px] uppercase tracking-[0.22em] text-black/30">{mobile.subtitle || 'Linked mobile'}</p>
        <h3 className="collection-product-name mt-1 text-[1.15rem] leading-tight text-black/92">{mobile.name}</h3>
        {mobile.priceLabel ? <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-black/55">{mobile.priceLabel}</p> : null}
      </div>
    </Link>
  )
}

function ReviewPanel({ review }: { review: ProductDetailReview }) {
  const ratingLabel = buildRatingLabel(review.rating)

  return (
    <article className="rounded-[24px] border border-black/10 bg-[#f8f8f6] px-5 py-4 shadow-[0_14px_28px_rgba(17,17,17,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-black/40">{review.userName}</p>
          {review.createdAt ? <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-black/28">{review.createdAt}</p> : null}
        </div>
        {ratingLabel ? (
          <div className="rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-black/58">
            {ratingLabel}
          </div>
        ) : null}
      </div>
      {review.comment ? <p className="mt-4 text-sm leading-6 text-black/68">{review.comment}</p> : null}
    </article>
  )
}

export const revalidate = 900

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const requestedHandle = toSeoHandle(params.handle)
  const productDetail = await getProductDetailByHandle(requestedHandle)

  if (!productDetail) {
    return {
      title: 'Product Not Found',
    }
  }

  const description =
    productDetail.metaDescription || productDetail.summary || productDetail.description || `Detailed view for ${productDetail.name}.`
  const title = productDetail.pageTitle
  const keywords = buildSeoKeywords(
    siteKeywords,
    [
      productDetail.name,
      `${productDetail.name} price in Pakistan`,
      `${productDetail.brandName} ${productDetail.name}`,
      `${productDetail.name} ${siteBrandName}`,
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

  const { heroBackground, centerImage, overviewImage } = buildProductMedia(productDetail)
  const galleryCards = buildGalleryCards(productDetail)
  const columnSplitIndex = Math.ceil(galleryCards.length / 2)
  const leftGalleryCards = galleryCards.slice(0, columnSplitIndex)
  const rightGalleryCards = galleryCards.slice(columnSplitIndex)
  const faqs = productDetail.faqs ?? []
  const reviews = productDetail.reviews ?? []
  const specs = productDetail.specs ?? []
  const relatedMobiles = productDetail.relatedMobiles ?? []
  const breadcrumbItems = buildProductBreadcrumbs(productDetail)

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#ececea] text-[#111]">
      <SeoStructuredData data={buildProductStructuredData(productDetail)} />
      <NothingHeader />

      <main className="pt-20">
        <section className="relative overflow-hidden bg-[#ececea]">
          <div className="dot-mesh-background absolute inset-0 opacity-45" />

          <div className="relative mx-auto max-w-screen-2xl px-4 pb-12 pt-24 md:px-8 md:pb-20 md:pt-28">
            <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-black/45">
              {breadcrumbItems.map((item, index) =>
                index === breadcrumbItems.length - 1 ? (
                  <span key={item.href}>{item.label}</span>
                ) : (
                  <div key={item.href} className="flex items-center gap-2">
                    <Link href={item.href} className="transition-opacity hover:opacity-65">
                      {item.label}
                    </Link>
                    <span>/</span>
                  </div>
                ),
              )}
            </nav>

            <div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(0,1.45fr)_minmax(220px,1fr)] lg:items-center">
              <div className="hidden gap-4 lg:grid">
                {leftGalleryCards.map((media) => (
                  <GalleryCardPanel key={media.id} media={media} />
                ))}
              </div>

              <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(240,240,237,0.9))] px-4 py-8 shadow-[0_35px_90px_rgba(17,17,17,0.08)] sm:min-h-[440px] md:px-8 md:py-12 lg:min-h-[560px]">
                <div className="dot-mesh-background absolute inset-0 opacity-30" />
                {heroBackground ? (
                  <Image
                    src={heroBackground}
                    alt={productDetail.name}
                    fill
                    sizes="100vw"
                    className="object-cover opacity-[0.08]"
                  />
                ) : null}
                {centerImage ? (
                  <div className="relative h-[250px] w-full max-w-[82vw] sm:h-[320px] md:h-[420px] lg:h-[470px]">
                    <Image
                      src={centerImage}
                      alt={productDetail.name}
                      fill
                      sizes="(max-width: 1024px) 82vw, 40vw"
                      className="object-contain drop-shadow-[0_26px_60px_rgba(0,0,0,0.2)]"
                    />
                  </div>
                ) : (
                  <div className="relative flex h-[320px] w-full max-w-[520px] items-center justify-center rounded-[28px] border border-dashed border-black/10 bg-white/50 text-[11px] uppercase tracking-[0.24em] text-black/35">
                    No image available
                  </div>
                )}
              </div>

              <div className="hidden gap-4 lg:grid">
                {rightGalleryCards.map((media) => (
                  <GalleryCardPanel key={media.id} media={media} />
                ))}
              </div>
            </div>

            {galleryCards.length > 0 ? (
              <section className="mt-5 lg:hidden">
                <div className="flex snap-x gap-3 overflow-x-auto pb-1">
                  {galleryCards.map((media) => (
                    <div key={`mobile-${media.id}`} className="w-[210px] shrink-0 snap-start">
                      <GalleryCardPanel media={media} />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#dfe0dd] px-4 py-10 md:px-8 md:py-16">
          <div className="dot-mesh-background absolute inset-0 opacity-35" />

          <div className="relative mx-auto grid max-w-screen-2xl gap-6 lg:grid-cols-[minmax(0,1.3fr)_420px]">
            <div className="relative overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(237,237,234,0.92))] px-4 pb-10 pt-10 shadow-[0_32px_90px_rgba(17,17,17,0.08)] sm:px-8 md:px-10 md:pb-14 md:pt-14">
              <div className="dot-mesh-background absolute inset-0 opacity-32" />
              {overviewImage ? (
                <div className="relative mx-auto h-[280px] w-full max-w-[720px] sm:h-[360px] md:mt-6 md:h-[470px]">
                  <Image
                    src={overviewImage}
                    alt={`${productDetail.name} overview`}
                    fill
                    sizes="(max-width: 1024px) 90vw, 50vw"
                    className="object-contain drop-shadow-[0_22px_48px_rgba(0,0,0,0.18)]"
                  />
                </div>
              ) : null}

              <div className="relative mt-8 max-w-3xl">
                <p className="text-[10px] uppercase tracking-[0.28em] text-black/38">
                  {productDetail.entityType === 'mobile' ? 'Mobile Detail' : 'Product Detail'}
                </p>
                <h1 className="collection-product-name mt-3 text-4xl leading-tight md:text-5xl">{productDetail.name}</h1>
                {productDetail.summary ? <p className="mt-4 text-base text-black/70">{productDetail.summary}</p> : null}
                {productDetail.description ? <p className="mt-4 text-sm leading-6 text-black/65 md:text-base">{productDetail.description}</p> : null}
              </div>
            </div>

            <div className="lg:sticky lg:top-28 lg:self-start">
              <ProductSummaryCard productDetail={productDetail} canonicalHandle={canonicalHandle} />
            </div>
          </div>
        </section>

        {specs.length > 0 || productDetail.gallery.length > 0 ? (
          <section className="px-4 pb-6 pt-4 md:px-8 md:pb-10">
            <div className="mx-auto grid max-w-screen-2xl gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
              {specs.length > 0 ? (
                <div className="rounded-[30px] border border-black/10 bg-white/75 p-6 shadow-[0_22px_50px_rgba(17,17,17,0.05)] backdrop-blur-xl md:p-7">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-black/42">Live Specs</p>
                  <h2 className="collection-product-name mt-3 text-3xl md:text-[2.2rem]">Pulled from Supabase</h2>

                  <div className="mt-7 space-y-3">
                    {specs.map((spec) => (
                      <div key={spec.id} className="rounded-[20px] border border-black/8 bg-[#f8f8f6] px-4 py-3">
                        <p className="text-[9px] uppercase tracking-[0.22em] text-black/34">{spec.label}</p>
                        <p className="mt-2 text-sm leading-6 text-black/76">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {productDetail.gallery.length > 0 ? (
                <div className="rounded-[30px] border border-black/10 bg-white/75 p-6 shadow-[0_22px_50px_rgba(17,17,17,0.05)] backdrop-blur-xl md:p-7">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-black/42">Gallery</p>
                  <h2 className="collection-product-name mt-3 text-3xl md:text-[2.2rem]">Images from the live catalog</h2>

                  <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {productDetail.gallery.map((media) => (
                      <article key={media.id} className="rounded-[22px] border border-black/8 bg-[#f8f8f6] p-3">
                        <div className="relative overflow-hidden rounded-[16px] border border-black/6 bg-[#f1f1ef] p-3">
                          <div className="dot-mesh-background absolute inset-0 opacity-25" />
                          <div className="relative h-36 w-full">
                            <Image
                              src={media.url}
                              alt={media.alt}
                              fill
                              sizes="(max-width: 768px) 80vw, (max-width: 1280px) 32vw, 20vw"
                              className="object-contain"
                            />
                          </div>
                        </div>
                        <div className="px-1 pb-1 pt-3">
                          <p className="text-[9px] uppercase tracking-[0.22em] text-black/30">
                            {media.colorName || media.caption || media.slug || 'Supabase image'}
                          </p>
                          <h3 className="collection-product-name mt-1 text-[1.08rem] leading-tight text-black/92">
                            {media.title || media.caption || productDetail.name}
                          </h3>
                          {media.caption && media.title !== media.caption ? (
                            <p className="mt-2 text-sm leading-6 text-black/62">{media.caption}</p>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {relatedMobiles.length > 0 ? (
          <section className="px-4 pb-6 pt-4 md:px-8 md:pb-10">
            <div className="mx-auto max-w-screen-2xl rounded-[34px] border border-black/10 bg-white/72 p-6 shadow-[0_24px_60px_rgba(17,17,17,0.06)] backdrop-blur-xl md:p-8">
              <p className="text-[10px] uppercase tracking-[0.28em] text-black/42">Compatible Mobiles</p>
              <h2 className="collection-product-name mt-3 text-3xl md:text-4xl">Linked devices from Supabase</h2>

              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {relatedMobiles.map((mobile) => (
                  <RelatedMobileCard key={mobile.id} mobile={mobile} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {reviews.length > 0 ? (
          <section className="px-4 pb-6 pt-4 md:px-8 md:pb-10">
            <div className="mx-auto max-w-screen-2xl rounded-[34px] border border-black/10 bg-white/72 p-6 shadow-[0_24px_60px_rgba(17,17,17,0.06)] backdrop-blur-xl md:p-8">
              <p className="text-[10px] uppercase tracking-[0.28em] text-black/42">Reviews</p>
              <h2 className="collection-product-name mt-3 text-3xl md:text-4xl">What customers have posted</h2>

              <div className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {reviews.map((review) => (
                  <ReviewPanel key={review.id} review={review} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {faqs.length > 0 ? (
          <section className="px-4 pb-16 pt-4 md:px-8 md:pb-24">
            <div className="mx-auto max-w-screen-2xl rounded-[34px] border border-black/10 bg-white/70 p-6 shadow-[0_24px_60px_rgba(17,17,17,0.06)] backdrop-blur-xl md:p-8">
              <p className="text-[10px] uppercase tracking-[0.28em] text-black/42">FAQs</p>
              <h2 className="collection-product-name mt-3 text-3xl md:text-4xl">Questions from the live catalog</h2>

              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {faqs.map((faq) => (
                  <details
                    key={faq.id}
                    className="rounded-[24px] border border-black/10 bg-[#f8f8f6] px-5 py-4 shadow-[0_14px_28px_rgba(17,17,17,0.04)]"
                  >
                    <summary className="cursor-pointer list-none text-sm font-medium text-black/90">{faq.question}</summary>
                    <p className="mt-3 text-sm leading-6 text-black/68">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <NothingFooter />
    </div>
  )
}
