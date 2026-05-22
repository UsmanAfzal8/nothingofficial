import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CompanyTrustBadge } from '@/components/CompanyTrustBadge'
import { CatalogProductTile } from '@/components/CatalogProductTile'
import { InterTypographyScope } from '@/components/InterTypographyScope'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import { CATALOG_REVALIDATE_SECONDS, getCollectionBySlug } from '@/lib/data/catalog-repository'
import { companyIdentifier, companyLegalName } from '@/lib/data/company'
import { collectionSeoFaqs, siteBrandName, siteKeywords, siteTrustLinks } from '@/lib/data/site-content'
import type { Collection } from '@/lib/models/catalog'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildFaqStructuredData, buildRobotsMetadata, buildSeoKeywords } from '@/lib/utils/seo'

type CollectionPageProps = {
  params: {
    slug: string
  }
}

export const revalidate = CATALOG_REVALIDATE_SECONDS
const SHOP_STYLE_SLUGS = new Set(['shop-all', 'phones', 'chargers', 'protectors', 'earbuds', 'offers', 'audio', 'watches', 'accessories', 'cmf'])
const COLLECTION_SUPPORT_SLUGS = new Set(['shop-all', 'phones', 'chargers', 'accessories', 'protectors', 'phone-protectors', 'earbuds', 'cmf'])
const INDEXABLE_CONTENT_COLLECTION_SLUGS = new Set(['offers'])

function uniqueProductsByHandle(products: Collection['products']) {
  const seen = new Set<string>()

  return products.filter((product) => {
    if (seen.has(product.handle)) {
      return false
    }

    seen.add(product.handle)
    return true
  })
}

function buildCollectionLongformSections(collection: Collection) {
  const topProducts = uniqueProductsByHandle(collection.products).slice(0, 4)
  const productNames = topProducts.map((product) => product.name)
  const productSentence = productNames.length > 0 ? productNames.join(', ') : `${collection.title} products`
  const childCollections = collection.childCollections?.map((item) => item.label) ?? []
  const childSentence = childCollections.length > 0 ? childCollections.join(', ') : null

  const intro = `${collection.title} on ${siteBrandName} is built for shoppers in Pakistan who want clearer product discovery, visible PKR pricing, and faster routes into support or ordering.`
  const selection =
    collection.products.length > 0
      ? `This collection currently highlights products such as ${productSentence}, making it easier to compare relevant options without leaving the storefront. Each product card leads into a detail page where buyers can review price in Pakistan, images, delivery guidance, support routes, and related catalog links.`
      : `This collection is ready for indexing and merchandising, even when products are temporarily unavailable.`
  const buying =
    childSentence
      ? `Related sections such as ${childSentence} help users move from broad category discovery to the exact Nothing or CMF product type they need.`
      : `Customers can move from this collection into product pages, support pages, and policy routes without losing context about delivery, compatibility, or ordering.`

  return [
    {
      title: `Direct answer for ${collection.title}`,
      body: `${collection.title} is a dedicated ${siteBrandName} collection for Pakistan shoppers comparing Nothing and CMF products with clearer product details, internal links, support routes, and company verification before ordering.`,
    },
    {
      title: `Why shop ${collection.title} from ${siteBrandName}`,
      body: `${intro} The page is structured for search engines and real buyers: it has an H1, category context, product listings, FAQs, trust links, and connections to policies and support. That makes it easier to understand what the category offers before opening individual product pages.`,
    },
    {
      title: `What shoppers can compare`,
      body: selection,
    },
    {
      title: `Buying guide for ${collection.title}`,
      body: `${buying} Before buying, customers should confirm product model, color or variant, compatibility, price, stock status, payment method, delivery city, and return expectations. If the product is a charger, check wattage and cable needs. If it is an audio product, compare calls, battery, ANC, and comfort. If it is a protector or cover, confirm the exact phone model.`,
    },
    {
      title: 'Authenticity and seller checks',
      body: `Customers should verify seller authenticity before ordering technology products online. ${siteBrandName} links to company verification, contact details, support guidance, and policy pages so shoppers can review the business identity behind the storefront. Company registration verifies the Pakistani business identity and should be considered alongside product checks, packaging expectations, and support communication.`,
    },
    {
      title: 'Delivery, COD, and support',
      body: `Delivery and payment expectations can vary by product value, city, and confirmation timing. Customers can use product pages, checkout, and WhatsApp support to confirm COD or pre-payment availability, delivery range, and order documentation. Keeping order records and support messages helps if a return, replacement, or compatibility question comes up later.`,
    },
  ]
}

function buildCollectionSeoDescription(collection: Collection) {
  if (collection.metaDescription) {
    return collection.metaDescription
  }

  switch (collection.slug) {
    case 'shop-all':
      return 'Browse the full Nothing Pakistan catalog for chargers, earbuds, protectors, CMF devices, and other compatible accessories.'
    case 'phones':
      return 'Browse Nothing phone model pages and jump into compatible chargers, protectors, earbuds, and support routes in Pakistan.'
    case 'chargers':
      return 'Shop Nothing chargers and charging cables in Pakistan with live product pages, pricing, and ordering support.'
    case 'protectors':
      return 'Browse screen protectors and protective accessories for Nothing devices in Pakistan.'
    case 'earbuds':
      return 'Browse Nothing earbuds and audio accessories in Pakistan with live catalog pages and ordering support.'
    case 'accessories':
      return 'Browse Nothing accessories in Pakistan including chargers, cables, phone cases, screen protectors, and glass for Nothing devices.'
    default:
      return collection.description || `Browse ${collection.title} from ${siteBrandName} with live product pages, pricing, and ordering support in Pakistan.`
  }
}

function buildCollectionBreadcrumbs(collection: Collection) {
  return [
    { label: 'Home', href: '/' },
    ...(collection.parentCollection ? [{ label: collection.parentCollection.label, href: collection.parentCollection.href }] : []),
    { label: collection.title, href: `/collections/${collection.slug}` },
  ]
}

function buildCollectionStructuredData(collection: Collection) {
  const breadcrumbItems = buildCollectionBreadcrumbs(collection)
  const topProducts = uniqueProductsByHandle(collection.products).slice(0, 12)
  const faqStructuredData = buildFaqStructuredData(collectionSeoFaqs[collection.slug] ?? [])

  const structuredData: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: collection.metaTitle || collection.title,
      description: buildCollectionSeoDescription(collection),
      url: collection.canonicalUrl || buildAbsoluteUrl(`/collections/${collection.slug}`),
      image: collection.heroImage ? [collection.heroImage] : undefined,
      publisher: {
        '@type': 'Organization',
        name: siteBrandName,
        legalName: companyLegalName,
        identifier: companyIdentifier,
      },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: topProducts.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: product.name,
            url: buildAbsoluteUrl(product.href),
          },
        })),
      },
    },
    buildBreadcrumbStructuredData(breadcrumbItems),
  ]

  if (faqStructuredData) {
    structuredData.push(faqStructuredData)
  }

  return structuredData
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const collection = await getCollectionBySlug(params.slug)

  if (!collection) {
    return {
      title: 'Collection Not Found',
    }
  }

  const description = buildCollectionSeoDescription(collection)
  const title = collection.metaTitle || `${collection.title} in Pakistan | ${siteBrandName}`
  const hasIndexableContent = collection.products.length > 0 || INDEXABLE_CONTENT_COLLECTION_SLUGS.has(collection.slug)
  const keywords = buildSeoKeywords(
    siteKeywords,
    [
      collection.title,
      `${collection.title} Pakistan`,
      `${collection.title} price in Pakistan`,
      `${collection.title} ${siteBrandName}`,
      `Nothing ${collection.title}`,
    ],
    collection.childCollections?.map((item) => item.label) ?? [],
    collection.childCollections?.map((item) => `Nothing ${item.label} Pakistan`) ?? [],
    collection.seoKeywords ?? [],
    collection.products.slice(0, 8).flatMap((product) => [product.name, `${product.name} price in Pakistan`]),
  )

  return {
    title: {
      absolute: title,
    },
    description,
    keywords,
    alternates: {
      canonical: collection.canonicalUrl || buildAbsoluteUrl(`/collections/${collection.slug}`),
    },
    openGraph: {
      title,
      description,
      url: collection.canonicalUrl || buildAbsoluteUrl(`/collections/${collection.slug}`),
      type: 'website',
      images: collection.heroImage ? [collection.heroImage] : undefined,
    },
    twitter: {
      card: collection.heroImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: collection.heroImage ? [collection.heroImage] : undefined,
    },
    robots: buildRobotsMetadata({ index: hasIndexableContent }),
  }
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const collection = await getCollectionBySlug(params.slug)

  if (!collection) {
    notFound()
  }

  const breadcrumbItems = buildCollectionBreadcrumbs(collection)
  const isShopStyleCollection = SHOP_STYLE_SLUGS.has(collection.slug)
  const isOffersCollection = collection.slug === 'offers'
  const seoDescription = buildCollectionSeoDescription(collection)
  const collectionFaqEntries = collectionSeoFaqs[collection.slug] ?? []
  const shouldShowTrustLinks = COLLECTION_SUPPORT_SLUGS.has(collection.slug)
  const collectionLongformSections = buildCollectionLongformSections(collection)
  const relatedCollectionLinks = collection.childCollections?.length ? collection.childCollections : []

  if (isOffersCollection) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-black text-white">
        <SeoStructuredData data={buildCollectionStructuredData(collection)} />
        <NothingHeader />

        <main className="relative min-h-screen px-4 pb-24 pt-24 md:px-8 md:pb-32">
          <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.9)_1.2px,transparent_1.3px)] [background-position:1.9rem_2.1rem] [background-size:5.5rem_5.5rem] sm:[background-size:9rem_9rem]" />

          <section className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-[1360px] flex-col justify-center">
            <div className="mx-auto max-w-[960px] py-6 text-center md:py-8">
              <h1 className="dot-heading text-[1.45rem] leading-[0.94] tracking-[0.2em] text-white sm:text-[2rem] lg:text-[2.8rem]">
                OFFERS
              </h1>
            </div>

            <div className="mx-auto flex w-full max-w-[960px] flex-col items-center gap-4">
              <article className="w-full max-w-[720px] rounded-[22px] bg-[#3f3f3f] px-4 py-4 shadow-[0_28px_80px_rgba(0,0,0,0.36)] sm:px-5 sm:py-5 lg:max-w-[680px] lg:px-6 lg:py-6">
                <div className="max-w-[560px]">
                  <p className="dot-heading text-[1.8rem] leading-[0.95] tracking-[0.08em] text-white sm:text-[2.2rem] lg:text-[2.7rem]">
                    Non COD offer
                  </p>
                  <InterTypographyScope className="mt-4 space-y-1.5 text-[0.92rem] leading-7 text-white/92 sm:text-[1rem] lg:mt-5 lg:text-[1.02rem] lg:leading-8">
                    <p>Free Delivery ✅</p>
                    <p>No Govt Tax ✅</p>
                    <p>We pay your 4% Govt Tax when you pay online.</p>
                  </InterTypographyScope>
                  <div className="mt-5 lg:mt-6">
                    <Link
                      href="/collections/shop-all"
                      className="inline-flex h-9 items-center justify-center rounded-full bg-[#5b5b5b] px-4 text-[10px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-black"
                    >
                      Claim offer
                    </Link>
                  </div>
                </div>
              </article>

              <article className="w-full max-w-[720px] rounded-[22px] bg-[#3f3f3f] px-4 py-4 shadow-[0_28px_80px_rgba(0,0,0,0.36)] sm:px-5 sm:py-5 lg:max-w-[680px] lg:px-6 lg:py-6">
                <div className="max-w-[600px]">
                  <p className="dot-heading text-[1.8rem] leading-[0.95] tracking-[0.08em] text-white sm:text-[2.2rem] lg:text-[2.7rem]">
                    Student program
                  </p>
                  <InterTypographyScope className="mt-4 space-y-1.5 text-[0.92rem] leading-7 text-white/92 sm:text-[1rem] lg:mt-5 lg:text-[1.02rem] lg:leading-8">
                    <p>Enjoy 5% off phones, audio and wearable products with the Nothing Student Program.</p>
                    <p>To apply, send your valid student card for verification.</p>
                  </InterTypographyScope>
                  <div className="mt-5 lg:mt-6">
                    <Link
                      href="/collections/shop-all"
                      className="inline-flex h-9 items-center justify-center rounded-full bg-[#5b5b5b] px-4 text-[10px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-black"
                    >
                      Apply now
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </main>

        <NothingFooter />
      </div>
    )
  }

  return (
    <div className={`min-h-screen overflow-x-hidden text-[#111] ${isShopStyleCollection ? 'bg-white' : 'bg-[#f4f4f0]'}`}>
      <SeoStructuredData data={buildCollectionStructuredData(collection)} />
      <NothingHeader />

      <main className="px-4 pb-16 pt-24 md:px-8 md:pb-24">
        <section className="mx-auto max-w-[1680px]">
          <div className={isShopStyleCollection ? 'pb-4 md:pb-6' : 'border-b border-black/8 pb-8 md:pb-10'}>
            {!isShopStyleCollection ? (
              <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-black/45">
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
            ) : null}

            {isShopStyleCollection ? (
              <div className="flex items-center justify-center py-2 sm:py-4">
                <div className="max-w-4xl text-center">
                  <h1 className="dot-heading text-center text-[2.15rem] leading-[0.95] tracking-[0.2em] text-black sm:text-[2.9rem] lg:text-[3.45rem]">
                    {collection.slug === 'shop-all' ? 'All products' : collection.title}
                  </h1>
                  <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-black/62 md:text-base">{seoDescription}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.34em] text-black/45 md:text-xs">Catalog Collection</p>
                  <h1 className="text-4xl leading-[0.95] tracking-[-0.04em] text-black md:text-6xl">{collection.title}</h1>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-black/62 md:text-base">{seoDescription}</p>
                </div>

                {collection.products.length > 0 ? (
                  <p className="text-[10px] uppercase tracking-[0.28em] text-black/40">
                    {collection.products.length} product{collection.products.length === 1 ? '' : 's'}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {collection.products.length > 0 ? (
            <div
              className={`grid grid-cols-2 ${
                isShopStyleCollection
                  ? 'mt-8 gap-x-4 gap-y-9 md:gap-x-6 md:gap-y-12 lg:grid-cols-5 lg:gap-x-7 lg:gap-y-14'
                  : 'mt-10 gap-x-5 gap-y-10 lg:grid-cols-5 lg:gap-x-8 lg:gap-y-14'
              }`}
            >
              {collection.products.map((product, index) => (
                <CatalogProductTile
                  key={product.id}
                  product={product}
                  priority={index < 2}
                  tone={isShopStyleCollection ? 'shop-all' : 'default'}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-[32px] border border-black/10 bg-white px-6 py-16 text-center shadow-[0_20px_55px_rgba(17,17,17,0.04)]">
              <p className="text-[10px] uppercase tracking-[0.3em] text-black/45">Live Catalog</p>
              <h2 className="collection-product-name mt-4 text-3xl">No items found</h2>
              <p className="mt-3 text-sm text-black/65">This page is ready for search indexing, but there are no live products in this collection yet.</p>
            </div>
          )}

          <section className="mt-12 grid gap-4 lg:grid-cols-3">
            {collectionLongformSections.map((section) => (
              <article key={section.title} className="rounded-[30px] border border-black/10 bg-white/78 p-6 shadow-[0_18px_50px_rgba(17,17,17,0.05)] backdrop-blur-xl">
                <p className="text-[10px] uppercase tracking-[0.22em] text-black/42">{section.title}</p>
                <p className="mt-4 text-sm leading-7 text-black/68">{section.body}</p>
              </article>
            ))}
          </section>

          {relatedCollectionLinks.length > 0 ? (
            <section className="mt-8 rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_20px_55px_rgba(17,17,17,0.04)] md:p-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-black/42">Related Categories</p>
              <h2 className="collection-product-name mt-4 text-3xl leading-[0.96] sm:text-4xl">Continue into a more specific category</h2>
              <div className="mt-6 flex flex-wrap gap-3">
                {relatedCollectionLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-black/10 bg-[#f8f8f4] px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-black/65 transition-colors hover:bg-black hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {collectionFaqEntries.length > 0 || shouldShowTrustLinks ? (
            <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_360px]">
              {collectionFaqEntries.length > 0 ? (
                <section className="rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_20px_55px_rgba(17,17,17,0.04)] md:p-8">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-black/42">Collection Answers</p>
                  <h2 className="collection-product-name mt-4 text-3xl leading-[0.96] sm:text-4xl">
                    Direct answers for {collection.title}
                  </h2>

                  <div className="mt-8 border-t border-black/10">
                    {collectionFaqEntries.map((item) => (
                      <details key={item.question} className="border-b border-black/10 py-5">
                        <summary className="cursor-pointer list-none text-sm leading-6 text-black/84 md:text-base">
                          {item.question}
                        </summary>
                        <p className="mt-4 max-w-3xl text-sm leading-7 text-black/68">{item.answer}</p>
                      </details>
                    ))}
                  </div>
                </section>
              ) : null}

              {shouldShowTrustLinks ? (
                <aside className="rounded-[32px] border border-black/10 bg-[#f8f8f4] p-6 shadow-[0_20px_55px_rgba(17,17,17,0.04)] md:p-8">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-black/42">Support Routes</p>
                  <h2 className="collection-product-name mt-4 text-3xl leading-[0.96] sm:text-4xl">
                    Need help before ordering?
                  </h2>
                  <CompanyTrustBadge compact className="mt-6" />
                  <div className="mt-6 space-y-3">
                    {siteTrustLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block rounded-[22px] border border-black/10 bg-white px-4 py-4 transition-colors hover:bg-black hover:text-white"
                      >
                        <p className="text-[10px] uppercase tracking-[0.2em] text-black/46 transition-colors hover:text-white">
                          {item.title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-black/68 transition-colors hover:text-white">
                          {item.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </aside>
              ) : null}
            </div>
          ) : null}
        </section>
      </main>

      <NothingFooter />
    </div>
  )
}
