import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CatalogProductTile } from '@/components/CatalogProductTile'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import { getCollectionBySlug } from '@/lib/data/catalog-repository'
import { siteBrandName, siteKeywords } from '@/lib/data/site-content'
import type { Collection, NavigationItem } from '@/lib/models/catalog'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildSeoKeywords } from '@/lib/utils/seo'

type CollectionPageProps = {
  params: {
    slug: string
  }
}

export const revalidate = 900
const SHOP_STYLE_SLUGS = new Set(['shop-all', 'phones', 'offers', 'audio', 'watches', 'accessories', 'cmf'])

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

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: collection.metaTitle || collection.title,
      description: collection.metaDescription || collection.description || `${collection.title} collection at ${siteBrandName}.`,
      url: buildAbsoluteUrl(`/collections/${collection.slug}`),
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
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const collection = await getCollectionBySlug(params.slug)

  if (!collection) {
    return {
      title: 'Collection Not Found',
    }
  }

  const description = collection.metaDescription || collection.description || `Browse the live ${collection.title} catalog from Supabase.`
  const title =
    collection.slug === 'shop-all'
      ? 'All products | Nothing | PK'
      : collection.metaTitle || `${collection.title} Price in Pakistan | ${siteBrandName}`
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
  )

  return {
    title: {
      absolute: title,
    },
    description,
    keywords,
    alternates: {
      canonical: buildAbsoluteUrl(`/collections/${collection.slug}`),
    },
    openGraph: {
      title,
      description,
      url: buildAbsoluteUrl(`/collections/${collection.slug}`),
      type: 'website',
      images: collection.heroImage ? [collection.heroImage] : undefined,
    },
    twitter: {
      card: collection.heroImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: collection.heroImage ? [collection.heroImage] : undefined,
    },
    robots: {
      index: hasProducts,
      follow: true,
    },
  }
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const collection = await getCollectionBySlug(params.slug)

  if (!collection) {
    notFound()
  }

  const contextualCollections =
    collection.childCollections && collection.childCollections.length > 0
      ? collection.childCollections
      : collection.siblingCollections ?? []
  const contextualLabel =
    collection.childCollections && collection.childCollections.length > 0
      ? 'Subcategories'
      : collection.parentCollection
        ? `${collection.parentCollection.label} categories`
        : null
  const breadcrumbItems = buildCollectionBreadcrumbs(collection)
  const isShopStyleCollection = SHOP_STYLE_SLUGS.has(collection.slug)
  const isAccessoriesCollection = collection.slug === 'accessories'
  const isAccessoriesChild = collection.parentCollection?.slug === 'accessories'

  const accessoriesLinks: NavigationItem[] =
    isAccessoriesCollection || isAccessoriesChild
      ? [
          { slug: 'accessories', label: 'Accessories', href: '/collections/accessories' },
          ...(isAccessoriesCollection ? collection.childCollections ?? [] : collection.siblingCollections ?? []),
        ]
      : []
  const activeAccessoriesSlug = isAccessoriesCollection ? 'accessories' : collection.slug

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
                <h1 className="dot-heading text-center text-[2.15rem] leading-[0.95] tracking-[0.2em] text-black sm:text-[2.9rem] lg:text-[3.45rem]">
                  {collection.slug === 'shop-all' ? 'All products' : collection.title}
                </h1>
              </div>
            ) : (
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.34em] text-black/45 md:text-xs">Catalog Collection</p>
                  <h1 className="text-4xl leading-[0.95] tracking-[-0.04em] text-black md:text-6xl">{collection.title}</h1>
                  {collection.description ? <p className="mt-4 max-w-2xl text-sm leading-6 text-black/62 md:text-base">{collection.description}</p> : null}
                </div>

                {collection.products.length > 0 ? (
                  <p className="text-[10px] uppercase tracking-[0.28em] text-black/40">
                    {collection.products.length} product{collection.products.length === 1 ? '' : 's'}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {isAccessoriesCollection && accessoriesLinks.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <div className="flex min-w-max gap-2 pb-1">
                {accessoriesLinks.map((item) => {
                  const isActive = item.slug === activeAccessoriesSlug

                  return (
                    <Link
                      key={item.slug}
                      href={item.href}
                      className={`rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.22em] transition-colors ${
                        isActive ? 'bg-black text-white' : 'border border-black/10 bg-white text-black/58 hover:bg-black hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ) : null}

          {!isShopStyleCollection ? (
            <div className="mt-6 flex flex-col gap-5">
              {contextualLabel && contextualCollections.length > 0 ? (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-black/42">{contextualLabel}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {contextualCollections.map((item) => (
                      <Link
                        key={item.slug}
                        href={item.href}
                        className="rounded-full border border-black/10 bg-white px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-black/56 transition-colors hover:bg-black hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

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
                  priority={index < 4}
                  tone={isShopStyleCollection ? 'shop-all' : 'default'}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-[32px] border border-black/10 bg-white px-6 py-16 text-center shadow-[0_20px_55px_rgba(17,17,17,0.04)]">
              <p className="text-[10px] uppercase tracking-[0.3em] text-black/45">Live Catalog</p>
              <h2 className="collection-product-name mt-4 text-3xl">No items found</h2>
              <p className="mt-3 text-sm text-black/65">This collection is connected to Supabase, but there are no rows to show yet.</p>
            </div>
          )}
        </section>
      </main>

      <NothingFooter />
    </div>
  )
}
