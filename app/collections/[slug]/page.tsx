import type { Metadata } from 'next'
import { GOVT_TAX_PERCENT } from '@/lib/data/checkout-pricing'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { CatalogProductTile } from '@/components/CatalogProductTile'
import { InterTypographyScope } from '@/components/InterTypographyScope'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { SeoStructuredData } from '@/components/SeoStructuredData'
import { CATALOG_REVALIDATE_SECONDS, getCollectionBySlug } from '@/lib/data/catalog-repository'
import { companyIdentifier, companyLegalName } from '@/lib/data/company'
import { collectionSeoFaqs, siteBrandName, siteKeywords, siteTrustLinks } from '@/lib/data/site-content'
import type { Collection } from '@/lib/models/catalog'
import { buildAbsoluteUrl, buildBreadcrumbStructuredData, buildFaqStructuredData, buildRobotsMetadata, buildSeoKeywords, stripNothingPakistanSlugPrefix } from '@/lib/utils/seo'

type CollectionPageProps = {
  params: {
    slug: string
  }
}

export const revalidate = CATALOG_REVALIDATE_SECONDS
const SHOP_STYLE_SLUGS = new Set(['shop-all', 'phones', 'chargers', 'protectors', 'earbuds', 'offers', 'audio', 'watches', 'accessories', 'cmf'])
const INDEXABLE_CONTENT_COLLECTION_SLUGS = new Set(['offers'])
const COLLECTION_SEO_TITLES: Record<string, string> = {
  'shop-all': `Nothing Products Price in Pakistan | ${siteBrandName}`,
  phones: `Nothing Phone Price in Pakistan | Compare Models`,
  chargers: `Nothing Chargers Price in Pakistan | CMF GaN & USB-C`,
  protectors: `Nothing Screen Protectors Price in Pakistan | Cases & Glass`,
  earbuds: `Nothing Earbuds Price in Pakistan | CMF Buds & Nothing Ear`,
  audio: `Nothing Earbuds Price in Pakistan | Ear, Headphones & CMF Buds`,
  watches: `CMF Watch Price in Pakistan | Nothing Pakistan`,
  accessories: `Nothing Accessories Price in Pakistan | Chargers, Cases & Protectors`,
  cmf: `CMF by Nothing Price in Pakistan | Phones, Buds, Watch & Chargers`,
  offers: `Nothing Pakistan Offers | Phones, CMF, Audio & Accessories`,
}

const COLLECTION_KEYWORDS: Record<string, string[]> = {
  'shop-all': ['Nothing products price in Pakistan', 'Nothing official store Pakistan', 'buy Nothing products Pakistan'],
  phones: ['Nothing mobiles price in Pakistan', 'Nothing Phone specifications', 'CMF phone price in Pakistan'],
  chargers: ['CMF Power 140W GaN price in Pakistan', 'CMF Power 100W GaN Pakistan', 'Nothing charger Pakistan'],
  protectors: ['Nothing screen protector price in Pakistan', 'Nothing phone glass protector Pakistan', 'Nothing phone case Pakistan'],
  earbuds: ['Nothing Ear price in Pakistan', 'Nothing Ear (a) price in Pakistan', 'CMF Buds price in Pakistan'],
  audio: ['Nothing Earbuds price in Pakistan', 'Nothing Headphone price in Pakistan', 'CMF Buds Pro 2 price in Pakistan'],
  watches: ['CMF Watch Pro 2 price in Pakistan', 'CMF Watch 3 Pro price in Pakistan'],
  accessories: ['Nothing accessories price in Pakistan', 'Nothing phone accessories Pakistan', 'CMF accessories Pakistan'],
  cmf: ['CMF by Nothing Pakistan', 'CMF Phone price in Pakistan', 'CMF Buds price in Pakistan'],
  offers: ['Nothing Pakistan offers', 'CMF offers Pakistan', 'Nothing accessories discount Pakistan'],
}

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

function buildCollectionSeoDescription(collection: Collection) {
  const collectionSeoKey = stripNothingPakistanSlugPrefix(collection.slug)

  if (collection.metaDescription) {
    return collection.metaDescription
  }

  switch (collectionSeoKey) {
    case 'shop-all':
      return 'Browse the full Nothing Pakistan catalog for chargers, earbuds, protectors, CMF devices, and other compatible accessories.'
    case 'phones':
      return 'Compare Nothing Phone and CMF Phone prices in Pakistan with colour, capacity, specifications, current availability, and compatible accessories.'
    case 'chargers':
      return 'Compare Nothing and CMF chargers in Pakistan including CMF Power GaN chargers, USB-C cables, live pricing, and ordering support.'
    case 'protectors':
      return 'Browse Nothing screen protectors, glass, covers, and phone cases in Pakistan with model compatibility and live product pages.'
    case 'earbuds':
      return 'Browse Nothing earbuds and audio accessories in Pakistan with live catalog pages and ordering support.'
    case 'audio':
      return 'Compare Nothing Ear, Nothing Headphone, CMF Buds, and CMF audio prices in Pakistan with stock, colours, and support routes.'
    case 'watches':
      return 'Browse CMF Watch prices in Pakistan with current availability, colours, product details, and Nothing Pakistan ordering support.'
    case 'accessories':
      return 'Browse Nothing accessories in Pakistan including chargers, cables, phone cases, screen protectors, and glass for Nothing devices.'
    case 'cmf':
      return 'Browse CMF by Nothing products in Pakistan including CMF Phone, CMF Buds, CMF Watch, and CMF Power chargers with live pricing.'
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
  const collectionSeoKey = stripNothingPakistanSlugPrefix(collection.slug)
  const faqStructuredData = buildFaqStructuredData(collectionSeoFaqs[collectionSeoKey] ?? [])

  const structuredData: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${collection.canonicalUrl || buildAbsoluteUrl(`/collections/${collection.slug}`)}#collection-page`,
      name: collection.metaTitle || collection.title,
      description: buildCollectionSeoDescription(collection),
      url: collection.canonicalUrl || buildAbsoluteUrl(`/collections/${collection.slug}`),
      image: collection.heroImage ? [collection.heroImage] : undefined,
      keywords: collection.seoKeywords?.join(', ') || undefined,
      inLanguage: 'en-PK',
      audience: {
        '@type': 'PeopleAudience',
        geographicArea: {
          '@type': 'Country',
          name: 'Pakistan',
        },
      },
      publisher: {
        '@type': 'Organization',
        '@id': buildAbsoluteUrl('/#organization'),
        name: siteBrandName,
        legalName: companyLegalName,
        identifier: companyIdentifier,
      },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: topProducts.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: buildAbsoluteUrl(product.href),
        })),
      },
    },
    buildBreadcrumbStructuredData(breadcrumbItems),
  ]

  if (faqStructuredData) {
    structuredData.push(faqStructuredData)
  }

  if (collection.schemaJson) {
    structuredData.push(collection.schemaJson)
  }

  return structuredData
}

function buildCollectionAnswerSections(collection: Collection, seoDescription: string) {
  const topProducts = uniqueProductsByHandle(collection.products).slice(0, 4)
  const productNames = topProducts.map((product) => product.name).join(', ')
  const title = collection.title === 'Shop all' ? 'Shop All' : collection.title

  return [
    {
      eyebrow: `Why shop ${title}`,
      title: `${title} for Pakistan buyers`,
      body:
        `${title} on ${siteBrandName} is built for shoppers in Pakistan who want product pages with visible PKR pricing, model information, support routes, and clear ordering context. ${seoDescription}`,
    },
    {
      eyebrow: `Compare ${title}`,
      title: `What shoppers can compare`,
      body: productNames
        ? `This collection highlights products such as ${productNames}, helping shoppers compare relevant Nothing and CMF options without leaving the storefront.`
        : `This collection is structured so product listings, support routes, and policy pages can be connected as soon as live catalog items are available.`,
    },
    {
      eyebrow: 'Buying intent',
      title: 'How this collection supports ordering',
      body:
        'Customers can move from this collection into product pages, support pages, company verification, delivery information, return policy, and the order flow without losing product context.',
    },
  ]
}

function CollectionAeoSection({ collection, seoDescription }: { collection: Collection; seoDescription: string }) {
  const answerSections = buildCollectionAnswerSections(collection, seoDescription)
  const collectionSeoKey = stripNothingPakistanSlugPrefix(collection.slug)
  const faqs = collectionSeoFaqs[collectionSeoKey] ?? []

  return (
    <section className="mt-12 border-t border-dotted border-black/45 pt-10 [font-family:var(--font-ntype82)]">
      <div className="grid gap-5 lg:grid-cols-3">
        {answerSections.map((section) => (
          <article key={section.eyebrow} className="border-t border-dotted border-black/35 pt-5">
            <p className="[font-family:var(--font-ntype82-headline)] text-[11px] uppercase tracking-[0.18em] text-black/48">{section.eyebrow}</p>
            <h2 className="mt-4 [font-family:var(--font-ntype82-headline)] text-xl leading-tight tracking-normal text-black">{section.title}</h2>
            <p className="mt-4 text-[15px] leading-[1.55] text-black/68">{section.body}</p>
          </article>
        ))}
      </div>

      {faqs.length > 0 ? (
        <div className="mt-14 grid gap-6 border-t border-dotted border-black/45 pt-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
          <div>
            <p className="[font-family:var(--font-ntype82-headline)] text-[11px] uppercase tracking-[0.18em] text-black/48">Collection Answers</p>
            <h2 className="mt-4 [font-family:var(--font-ntype82-headline)] text-2xl leading-tight tracking-normal text-black">Direct answers for {collection.title}</h2>
          </div>
          <div className="divide-y divide-dotted divide-black/35 border-y border-dotted border-black/35">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [font-family:var(--font-ntype82-headline)] text-sm text-black">
                  {faq.question}
                  <span className="[font-family:var(--font-ntype82-headline)] text-lg leading-none text-black/38 group-open:hidden">+</span>
                  <span className="hidden [font-family:var(--font-ntype82-headline)] text-lg leading-none text-black/38 group-open:block">-</span>
                </summary>
                <p className="mt-3 text-[15px] leading-[1.55] text-black/68">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-14 border-t border-dotted border-black/45 pt-10">
        <p className="[font-family:var(--font-ntype82-headline)] text-[11px] uppercase tracking-[0.18em] text-black/48">Support Routes</p>
        <h2 className="mt-4 [font-family:var(--font-ntype82-headline)] text-2xl leading-tight tracking-normal text-black">Need help before ordering?</h2>
        <div className="mt-6 grid border-t border-dotted border-black/35 sm:grid-cols-2 lg:grid-cols-5">
          {siteTrustLinks.slice(0, 5).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b border-dotted border-black/35 py-5 pr-5 transition-opacity hover:opacity-55 sm:[&:nth-child(even)]:pl-5 lg:[&:not(:first-child)]:pl-5"
            >
              <span className="block [font-family:var(--font-ntype82-headline)] text-sm">{link.title}</span>
              <span className="mt-2 block text-sm leading-[1.5] opacity-65">{link.description}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const collection = await getCollectionBySlug(params.slug)

  if (!collection) {
    return {
      title: 'Collection Not Found',
    }
  }

  const description = buildCollectionSeoDescription(collection)
  const collectionSeoKey = stripNothingPakistanSlugPrefix(collection.slug)
  const title = collection.metaTitle || COLLECTION_SEO_TITLES[collectionSeoKey] || `${collection.title} in Pakistan | ${siteBrandName}`
  const hasIndexableContent = collection.products.length > 0 || INDEXABLE_CONTENT_COLLECTION_SLUGS.has(collectionSeoKey)
  const keywords = buildSeoKeywords(
    siteKeywords,
    collection.childCollections?.map((item) => item.label) ?? [],
    collection.childCollections?.map((item) => `Nothing ${item.label} Pakistan`) ?? [],
    collection.seoKeywords ?? [],
    collection.products.slice(0, 8).flatMap((product) => [product.name, `${product.name} price in Pakistan`]),
    [
      collection.title,
      `${collection.title} Pakistan`,
      `${collection.title} price in Pakistan`,
      `${collection.title} ${siteBrandName}`,
      `Nothing ${collection.title}`,
    ],
    COLLECTION_KEYWORDS[collectionSeoKey] ?? [],
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

  if (params.slug !== collection.slug) {
    redirect(`/collections/${collection.slug}`)
  }

  const breadcrumbItems = buildCollectionBreadcrumbs(collection)
  const collectionSeoKey = stripNothingPakistanSlugPrefix(collection.slug)
  const isShopStyleCollection = SHOP_STYLE_SLUGS.has(collectionSeoKey)
  const isOffersCollection = collectionSeoKey === 'offers'
  const seoDescription = buildCollectionSeoDescription(collection)
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
              <h1 className="[font-family:var(--font-ntype82-headline)] text-[1.45rem] font-medium leading-[0.94] tracking-normal text-white sm:text-[2rem] lg:text-[2.8rem]">
                OFFERS
              </h1>
            </div>

            <div className="mx-auto flex w-full max-w-[960px] flex-col items-center gap-4">
              <article className="w-full max-w-[720px] rounded-[22px] bg-[#3f3f3f] px-4 py-4 shadow-[0_28px_80px_rgba(0,0,0,0.36)] sm:px-5 sm:py-5 lg:max-w-[680px] lg:px-6 lg:py-6">
                <div className="max-w-[560px]">
                  <p className="[font-family:var(--font-ntype82-headline)] text-[1.8rem] font-medium leading-[0.95] tracking-normal text-white sm:text-[2.2rem] lg:text-[2.7rem]">
                    Non COD offer
                  </p>
                  <InterTypographyScope className="mt-4 space-y-1.5 text-[0.92rem] leading-7 text-white/92 sm:text-[1rem] lg:mt-5 lg:text-[1.02rem] lg:leading-8">
                    <p>Free Delivery ✅</p>
                    <p>No Govt Tax ✅</p>
                    <p>We pay your {GOVT_TAX_PERCENT}% Govt Tax when you pay online.</p>
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
                  <h1 className="text-center [font-family:var(--font-ntype82-headline)] text-[2.15rem] font-medium leading-[0.95] tracking-normal text-black sm:text-[2.9rem] lg:text-[3.45rem]">
                    {collectionSeoKey === 'shop-all' ? 'All products' : collection.title}
                  </h1>
                  <p className="mx-auto mt-4 max-w-3xl [font-family:var(--font-ntype82)] text-sm leading-7 text-black/62 md:text-base">{seoDescription}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="mb-3 [font-family:var(--font-ntype82-headline)] text-[10px] uppercase tracking-[0.18em] text-black/45 md:text-xs">Catalog Collection</p>
                  <h1 className="[font-family:var(--font-ntype82-headline)] text-4xl font-medium leading-[0.95] tracking-normal text-black md:text-6xl">{collection.title}</h1>
                  <p className="mt-4 max-w-2xl [font-family:var(--font-ntype82)] text-sm leading-6 text-black/62 md:text-base">{seoDescription}</p>
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
                  priority={index < (isShopStyleCollection ? 5 : 2)}
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

          <CollectionAeoSection collection={collection} seoDescription={seoDescription} />
        </section>
      </main>

      <NothingFooter />
    </div>
  )
}
