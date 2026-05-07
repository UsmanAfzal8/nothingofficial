import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CatalogProductTile } from '@/components/CatalogProductTile'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import { CATALOG_REVALIDATE_SECONDS, getCollectionBySlug } from '@/lib/data/catalog-repository'
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
      return 'Browse Nothing accessories in Pakistan including chargers, protectors, earbuds, and everyday add-ons for Nothing devices.'
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
  const topProducts = collection.products.slice(0, 12)
  const faqStructuredData = buildFaqStructuredData(collectionSeoFaqs[collection.slug] ?? [])

  const structuredData: Record<string, unknown>[] = [
    ...(collection.schemaJson ? [collection.schemaJson] : []),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: collection.metaTitle || collection.title,
      description: buildCollectionSeoDescription(collection),
      url: collection.canonicalUrl || buildAbsoluteUrl(`/collections/${collection.slug}`),
      image: collection.heroImage ? [collection.heroImage] : undefined,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: topProducts.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: buildAbsoluteUrl(product.href),
          name: product.name,
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
  const hasProducts = collection.products.length > 0
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
    robots: buildRobotsMetadata({ index: hasProducts }),
  }
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const collection = await getCollectionBySlug(params.slug)

  if (!collection) {
    notFound()
  }

  const breadcrumbItems = buildCollectionBreadcrumbs(collection)
  const isShopStyleCollection = SHOP_STYLE_SLUGS.has(collection.slug)
  const seoDescription = buildCollectionSeoDescription(collection)
  const collectionFaqEntries = collectionSeoFaqs[collection.slug] ?? []
  const shouldShowTrustLinks = COLLECTION_SUPPORT_SLUGS.has(collection.slug)

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
